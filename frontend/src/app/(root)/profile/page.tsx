"use client";

import React from "react";

import SideBar from "@/components/SideBar";
import * as icons from "@/constants/icons";
import Image from "next/image";

function Profile() {
  const [activeSetting, setActiveSetting] = React.useState("Personal info");

  const user = {
    name: "John Doe",
    email: "john@doe.com",
    phone: "+1234567890",
  };

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

  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex overflow-hidden">
      <SideBar />

      <div className="flex flex-col w-4/5 p-5 overflow-hidden">
        <h1 className="text-4xl font-bold text-accent mt-4">Your Profile</h1>

        <div className="flex flex-row items-start justify-between w-full h-screen">
          <div className="flex flex-col w-1/3 h-screen items-start justify-start mt-10">
            {settings.map((setting, index) => (
              <div
                onClick={() => setActiveSetting(setting.title)}
                key={index}
                className={`w-full h-auto flex flex-col items-start justify-start p-5 bg-primary-50 rounded-xl mb-6 hover:shadow-accentglow hover:cursor-pointer ${
                  activeSetting === setting.title ? "shadow-accentglow" : ""
                } `}
              >
                <Image src={setting.icon} alt="icon" className="w-8 h-8" />
                <div className="w-full h-auto flex flex-col items-start justify-start mt-5">
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
          {activeSetting === "Personal info" && (
            <div className="flex flex-col w-2/3 h-auto rounded-xl p-5 ml-10">
              <h1 className="text-2xl font-semibold text-white">
                {activeSetting}
              </h1>
              <div className="flex flex-row w-full h-auto items-center justify-between mt-5">
                <p className="text-base font-jakarta text-white">Legal Name</p>
                <a
                  href="#"
                  className="text-base font-jakarta font-semibold text-white underline"
                >
                  Edit
                </a>
              </div>
              <input
                value={user.name}
                readOnly
                className="w-full h-12 focus:outline-none bg-transparent border-b border-accent text-primary-600 py-4 mt-2"
              />
              <div className="flex flex-row w-full h-auto items-center justify-between mt-5">
                <p className="text-base font-jakarta text-white">
                  Email Address
                </p>
                <a
                  href="#"
                  className="text-base font-jakarta font-semibold text-white underline"
                >
                  Edit
                </a>
              </div>
              <input
                value={user.email}
                readOnly
                className="w-full h-12 focus:outline-none bg-transparent border-b border-accent text-primary-600 py-4 mt-2"
              />
              <div className="flex flex-row w-full h-auto items-center justify-between mt-5">
                <p className="text-base font-jakarta text-white">
                  Phone Number
                </p>
                <a
                  href="#"
                  className="text-base font-jakarta font-semibold text-white underline"
                >
                  Edit
                </a>
              </div>
              <input
                value={user.phone}
                readOnly
                className="w-full h-12 focus:outline-none bg-transparent border-b border-accent text-primary-600 py-4 mt-2"
              />
              <div className="flex flex-row w-full h-auto items-center justify-end mt-5 gap-x-4">
                <button className="p-3 hover:shadow-silver2glow px-6 bg-primary-500 rounded-xl text-white font-jakarta font-semibold ml-4">
                  Cancel
                </button>
                <button className="p-3 px-6 hover:shadow-accentglow bg-accent rounded-xl text-black font-jakarta font-semibold">
                  Save Changes
                </button>
              </div>
            </div>
          )}
          {activeSetting === "Login & Security" && (
            <div className="flex flex-col w-2/3 h-auto rounded-xl p-5">
              <h1 className="text-2xl font-semibold text-white">
                {activeSetting}
              </h1>
            </div>
          )}
          {activeSetting === "Global Preferences" && (
            <div className="flex flex-col w-2/3 h-auto rounded-xl p-5">
              <h1 className="text-2xl font-semibold text-white">
                {activeSetting}
              </h1>
              <p className="text-sm font-normal text-primary-300 mt-2">
                {
                  settings.find((setting) => setting.title === activeSetting)
                    ?.description
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
