"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import * as images from "@/constants/images";
import * as icons from "@/constants/icons";
import LoadingSpinner from "./ButtonSpinner";

function SideBar() {
  const [user, setUser] = React.useState({
    name: "",
    email: "",
  });
  const [selected, setSelected] = React.useState("");
  const [selectedLeaderboard, setSelectedLeaderboard] = React.useState("");
  const [dropdown, setDropdown] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refresh-token");

      try {
        const response = await fetch(`${API_URL}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken || "",
          },
        });

        const data = await response.json();

        setUser({
          name: data.info.legal_name,
          email: data.info.email,
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const pages = [
    {
      title: "Chat Bot",
      route: "/chat",
    },
    {
      title: "Trends",
      route: "/trends",
    },
  ];

  return (
    <div className="w-1/5 h-auto flex flex-col items-start justify-start bg-primary-50 m-3 rounded-xl">
      <div className="w-full h-auto flex flex-row items-center justify-start px-4 py-2 border-b border-primary-500/80">
        <Image
          src={images.logo}
          alt="logo"
          width={50}
          height={50}
          className="hover:cursor-pointer"
        />
        <h1 className="text-base font-semibold font-jakarta text-white ml-2 hover:cursor-pointer">
          Olympus
        </h1>
      </div>
      <div className="w-full h-auto flex flex-col items-start justify-start p-4">
        <h1 className="text-xs font-semibold font-jakarta text-primary-300">
          GENRAL
        </h1>
        <div className="w-full h-auto flex flex-col items-start justify-start mt-2">
          {pages.map((page, index) => (
            <button
              onClick={() => {
                setSelected(page.title);
                router.push(page.route);
              }}
              key={index}
              className="relative w-full h-auto flex flex-row items-center justify-start p-2 rounded-xl group mt-2"
            >
              {/* Background Overlay */}
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 ${
                  selected === page.title
                    ? "opacity-16"
                    : "opacity-0 group-hover:opacity-16 transition-opacity duration-300"
                } pointer-events-none`}
              ></div>

              {/* Button Text */}
              <span className="relative text-white/80">{page.title}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setSelected("Leaderboard");
              setDropdown(!dropdown);
              setSelectedLeaderboard("");
            }}
            className="relative w-full h-auto flex flex-row items-center justify-start p-2 rounded-xl group mt-2"
          >
            {/* Background Overlay */}
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 ${
                selected === "Leaderboard"
                  ? "opacity-16"
                  : "opacity-0 group-hover:opacity-16 transition-opacity duration-300"
              } pointer-events-none`}
            ></div>

            {/* Button Text */}
            <span className="relative text-white/80 flex flex-row justify-between w-full">
              Leaderboard{" "}
              {dropdown ? (
                <Image
                  src={icons.arrowUp}
                  alt="arrowUp"
                  width={18}
                  height={10}
                />
              ) : (
                <Image
                  src={icons.arrowDown}
                  alt="arrowDown"
                  width={18}
                  height={10}
                />
              )}
            </span>
          </button>
          {dropdown && (
            <div className="w-full h-auto flex flex-col items-start justify-start mt-2">
              <button
                onClick={() => {
                  setSelectedLeaderboard("Country");
                  router.push("/leaderboard/country");
                }}
                className="relative w-full h-auto flex flex-row items-center justify-start p-2 rounded-xl group mt-2"
              >
                {/* Background Overlay */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 ${
                    selectedLeaderboard === "Country"
                      ? "opacity-16"
                      : "opacity-0 group-hover:opacity-16 transition-opacity duration-300"
                  } pointer-events-none`}
                ></div>

                {/* Button Text */}
                <span className="relative text-primary-400 flex flex-row justify-between w-full">
                  Country
                </span>
              </button>
              <button
                onClick={() => {
                  setSelectedLeaderboard("Sport");
                  router.push("/leaderboard/sport");
                }}
                className="relative w-full h-auto flex flex-row items-center justify-start p-2 rounded-xl group mt-2"
              >
                {/* Background Overlay */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 ${
                    selectedLeaderboard === "Sport"
                      ? "opacity-16"
                      : "opacity-0 group-hover:opacity-16 transition-opacity duration-300"
                  } pointer-events-none`}
                ></div>

                {/* Button Text */}
                <span className="relative text-primary-400 flex flex-row justify-between w-full">
                  Sport
                </span>
              </button>
            </div>
          )}
        </div>
        <div
          onClick={() => {
            router.push("/profile");
          }}
          className="w-[18%] absolute h-auto flex flex-row items-center justify-between bottom-7 left-6 p-2 hover:cursor-pointer"
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 opacity-16 pointer-events-none"></div>

          <div className="flex flex-row items-center justify-start relative z-10">
            <Image
              src={images.avatar}
              alt="add"
              width={48}
              height={48}
              className="mb-2"
            />
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="w-full h-auto flex flex-col items-start justify-start ml-1">
                <h1 className="text-base font-semibold font-jakarta text-white">
                  {user.name}
                </h1>
                <span className="text-[10px] font-medium font-jakarta text-accent">
                  {user.email}
                </span>
              </div>
            )}
          </div>

          <button className="flex flex-row items-center justify-center relative z-10">
            <Image src={icons.cog} alt="add" width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
