"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import SideBar from "@/components/SideBar";
import TagInput from "@/components/TagInput";
import * as icons from "@/constants/icons";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/utils/helpers";

function Profile() {
  const [activeSetting, setActiveSetting] = useState("Personal info");
  const [tagsSaving, setTagsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();

  const [passwordChangeInputs, setPasswordChangeInputs] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

  const [user, setUser] = useState({
    legal_name: "",
    email: "",
    phone_number: "",
    tags: [] as string[],
  });

  const [editedUser, setEditedUser] = useState({
    legal_name: "",
    email: "",
    phone_number: "",
    tags: [] as string[],
  });

  const [editingFields, setEditingFields] = useState({
    legal_name: false,
    email: false,
    phone_number: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refresh-token");
      
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken || "",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
              handleLogout(router, true);
              return;
          }

          router.push(`/error?code=${response.status}&message=An error occurred. Please try again.`);
          return;
        }

        const data = await response.json();
        console.log(data);

        setUser(data.info);
        setEditedUser(data.info);
        setLoading(false);
      } catch (error) {
        router.push(`/error?code=500&message=An error occurred while fetching user data.`);
      }
    };

    fetchUser();
  }, [API_URL]);

  // Check for changes between user and editedUser
  useEffect(() => {
    const isChanged =
      user.legal_name !== editedUser.legal_name ||
      user.email !== editedUser.email ||
      user.phone_number !== editedUser.phone_number ||
      JSON.stringify(user.tags) !== JSON.stringify(editedUser.tags);
    setHasChanges(isChanged);
  }, [user, editedUser]);

  const settings = [
    {
      title: "Personal info",
      description: "Provide personal details and how we can reach you",
      icon: icons.account,
    },
    {
      title: "Login & Security",
      description: "Update your password and secure your account",
      icon: icons.shield,
    },
    {
      title: "Global Preferences",
      description: "Personalize your feed, language, default country, etc.",
      icon: icons.toggle,
    },
  ];

  const handleEditClick = (field: string) => {
    setEditingFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = async () => {
    setChangingPassword(true);
    if (
      !passwordChangeInputs.currentPassword ||
      !passwordChangeInputs.newPassword ||
      !passwordChangeInputs.confirmNewPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }
    if (
      passwordChangeInputs.newPassword !==
      passwordChangeInputs.confirmNewPassword
    ) {
      alert("New passwords do not match.");
      return;
    }
    if (
      passwordChangeInputs.newPassword === passwordChangeInputs.currentPassword
    ) {
      alert("New password cannot be the same as current password.");
      return;
    }

    const token = Cookies.get("token");
    const refreshToken = Cookies.get("refresh-token");
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/password/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-refresh-token": refreshToken || "",
        },
        body: JSON.stringify({
          email: user.email,
          password: passwordChangeInputs.currentPassword,
          new_password: passwordChangeInputs.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while changing password."}`);

        return;
      }

      const data = await response.json();
      console.log("Password changed:", data);
      alert("Password changed successfully!");
      setChangingPassword(false);
      setPasswordChangeInputs({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      router.push(`/error?code=500&message=An error occurred while changing password.`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const token = Cookies.get("token");
    const refreshToken = Cookies.get("refresh-token");
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    const parts = editedUser.legal_name.split(" ");
    const first_name = parts[0];
    const last_name = parts.slice(1).join(" ");

    const apiBody = tagsSaving
      ? { tags: editedUser.tags }
      : {
          first_name,
          last_name,
          phone_number: editedUser.phone_number,
        };

    console.log("Saving profile:", apiBody);

    try {
      const response = await fetch(`${API_URL}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-refresh-token": refreshToken || "",
        },
        body: JSON.stringify(apiBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while saving changes."}`);
        return;
      }

      const data = await response.json();
      console.log("Profile updated:", data);
      setEditingFields({
        legal_name: false,
        email: false,
        phone_number: false,
      });
      setSaving(false);
      alert("Profile updated successfully!");
      window.location.reload();
    } catch (error) {
      router.push(`/error?code=500&message=An error occurred while saving changes.`);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setEditingFields({
      legal_name: false,
      email: false,
      phone_number: false,
    });
  };

  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex overflow-hidden">
      <SideBar />

      <div className="flex flex-col w-4/5 p-5 overflow-hidden">
        <h1 className="text-4xl font-bold text-accent mt-4">Your Profile</h1>

        <div className="flex flex-row items-start justify-between w-full flex-1 mt-10 relative">
          {/* Settings Sidebar */}
          <div className="flex flex-col w-1/3 items-start justify-start">
            {settings.map((setting, index) => (
              <div
                onClick={() => setActiveSetting(setting.title)}
                key={index}
                className={`w-full flex flex-col items-start justify-start p-5 bg-primary-50 rounded-xl mb-6 hover:shadow-accentglow hover:cursor-pointer ${
                  activeSetting === setting.title ? "shadow-accentglow" : ""
                }`}
              >
                <Image src={setting.icon} alt="icon" className="w-8 h-8" />
                <div className="w-full flex flex-col items-start justify-start mt-5">
                  <h1 className="text-lg font-semibold text-white">
                    {setting.title}
                  </h1>
                  <p className="text-sm font-normal text-primary-300">
                    {setting.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Settings Content */}
          {activeSetting === "Personal info" &&
            (loading ? (
              <div className="flex flex-col w-2/3 rounded-xl p-5 ml-10">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="flex flex-col w-2/3 rounded-xl p-5 ml-10">
                <h1 className="text-2xl font-semibold text-white">
                  {activeSetting}
                </h1>

                {/* Legal Name */}
                <div className="flex flex-row items-center justify-between mt-5">
                  <p className="text-base font-jakarta text-white">
                    Legal Name
                  </p>
                  <button
                    onClick={() => handleEditClick("legal_name")}
                    className="text-base font-jakarta font-semibold text-white underline hover:text-accent"
                    disabled={editingFields.legal_name}
                  >
                    Edit
                  </button>
                </div>
                <input
                  value={editedUser.legal_name}
                  onChange={(e) =>
                    handleInputChange("legal_name", e.target.value)
                  }
                  readOnly={!editingFields.legal_name}
                  className={`w-full h-12 focus:outline-none ${
                    editingFields.legal_name
                      ? "bg-transparent pl-2 border rounded-2xl border-accent text-primary-600"
                      : "bg-transparent border-b border-accent text-primary-600 py-4 mt-2"
                  } transition-all duration-200 mt-1`}
                />

                {/* Email Address */}
                <div className="flex flex-row items-center justify-between mt-5">
                  <p className="text-base font-jakarta text-white">
                    Email Address
                  </p>
                  <button
                    onClick={() => handleEditClick("email")}
                    className="text-base font-jakarta font-semibold text-white underline hover:text-accent"
                    disabled={editingFields.email}
                  >
                    Edit
                  </button>
                </div>
                <input
                  value={editedUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  readOnly={!editingFields.email}
                  className={`w-full h-12 focus:outline-none ${
                    editingFields.email
                      ? "bg-transparent pl-2 border rounded-2xl border-accent text-primary-600"
                      : "bg-transparent border-b border-accent text-primary-600 py-4 mt-2"
                  } transition-all duration-200 mt-1`}
                />

                {/* Phone Number */}
                <div className="flex flex-row items-center justify-between mt-5">
                  <p className="text-base font-jakarta text-white">
                    Phone Number
                  </p>
                  <button
                    onClick={() => handleEditClick("phone_number")}
                    className="text-base font-jakarta font-semibold text-white underline hover:text-accent"
                    disabled={editingFields.phone_number}
                  >
                    Edit
                  </button>
                </div>
                <input
                  value={editedUser.phone_number}
                  onChange={(e) =>
                    handleInputChange("phone_number", e.target.value)
                  }
                  readOnly={!editingFields.phone_number}
                  className={`w-full h-12 focus:outline-none ${
                    editingFields.phone_number
                      ? "bg-transparent pl-2 border rounded-2xl border-accent text-primary-600"
                      : "bg-transparent border-b border-accent text-primary-600 py-4 mt-2"
                  } transition-all duration-200 mt-1`}
                />

                {/* Save and Cancel Buttons */}
                <div className="flex flex-row items-center justify-end mt-5 gap-x-4">
                  <button
                    onClick={handleCancel}
                    disabled={!hasChanges}
                    className={`p-3 px-6 rounded-xl font-jakarta font-semibold ${
                      hasChanges
                        ? "hover:shadow-silver2glow bg-primary-500 text-white"
                        : "bg-primary-500/50 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`p-3 px-6 rounded-xl font-jakarta font-semibold ${
                      hasChanges
                        ? "hover:shadow-accentglow bg-accent text-black"
                        : "bg-accent/50 text-black/80 cursor-not-allowed"
                    }`}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ))}

          {activeSetting === "Login & Security" && (
            <div className="flex flex-col w-2/3 h-auto rounded-xl p-5 ml-10">
              <div className="flex flex-row items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">
                  {activeSetting}
                </h1>
                <button
                  onClick={() => handleLogout(router, true)}
                  className="text-base font-jakarta font-semibold text-accent underline hover:text-accent"
                >
                  Log out
                </button>
              </div>
              <p className="text-sm font-normal text-primary-300 mt-2">
                Manage your login credentials and security settings.
              </p>

              <div className="mt-5">
                <label className="block text-base font-jakarta text-white mb-2">
                  Change Password
                </label>
                <input
                  type="password"
                  onChange={(e) => {
                    setPasswordChangeInputs((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }));
                  }}
                  placeholder="Current Password"
                  className="w-full h-12 mb-3 focus:outline-none bg-transparent pl-2 border rounded-2xl border-accent text-primary-600 transition-all duration-200 mt-1"
                />
                <input
                  type="password"
                  onChange={(e) => {
                    setPasswordChangeInputs((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }));
                  }}
                  placeholder="New Password"
                  className="w-full my-3 h-12 focus:outline-none bg-transparent pl-2 border rounded-2xl border-accent text-primary-600 transition-all duration-200 mt-1"
                />
                <input
                  type="password"
                  onChange={(e) => {
                    setPasswordChangeInputs((prev) => ({
                      ...prev,
                      confirmNewPassword: e.target.value,
                    }));
                  }}
                  placeholder="Confirm New Password"
                  className="w-full h-12 focus:outline-none bg-transparent pl-2 border rounded-2xl border-accent text-primary-600 transition-all duration-200 mt-1"
                />
                <button
                  onClick={handlePasswordChange}
                  className="mt-5 p-3 px-6 rounded-xl bg-accent text-black font-jakarta font-semibold hover:shadow-accentglow"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          )}
          {activeSetting === "Global Preferences" && (
            <div className="flex flex-col w-2/3 h-auto rounded-xl p-5 ml-10">
              <h1 className="text-2xl font-semibold text-white">
                {activeSetting}
              </h1>
              <p className="text-sm font-normal text-primary-300 mt-2">
                Personalize your feed, language, default country, and more.
              </p>

              {/* Tags Input */}
              <div className="mt-5">
                <label className="block text-base font-jakarta text-white mb-2">
                  Select Your Preferred Sports
                </label>
                <TagInput
                  tags={editedUser.tags}
                  setTags={(newTags) =>
                    setEditedUser((prev) => ({ ...prev, tags: newTags }))
                  }
                />
                <button
                  onClick={() => {
                    setTagsSaving(true);
                    handleSave();
                  }}
                  disabled={!hasChanges}
                  className="disabled:bg-accent/70 disabled:cursor-not-allowed mt-5 p-3 px-6 rounded-xl bg-accent text-black font-jakarta font-semibold hover:shadow-accentglow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
