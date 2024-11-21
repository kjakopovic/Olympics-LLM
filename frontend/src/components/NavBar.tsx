"use client";

import Image from "next/image";
import React from "react";

import * as icons from "@/constants/icons";

function NavBar() {
  const [activeTab, setActiveTab] = React.useState("Chat");

  return (
    <div className="w-[98%] h-16 bg-primary-50 flex m-3 ml-0 flex-row rounded-xl items-center justify-start px-4">
      <button
        onClick={() => setActiveTab("Chat")}
        className={`mr-6 pr-3 ${
          activeTab === "Chat" ? "border-b border-accent" : ""
        }`}
      >
        <div className="flex flex-row items-center justify-center">
          <Image
            src={icons.chat}
            alt="Chat"
            width={32}
            height={32}
            className="mt-3.5"
          />
          <p
            className={`${
              activeTab === "Chat" ? "text-white" : "text-primary-400"
            } font-semibold font-jakarta text-sm`}
          >
            Chat
          </p>
        </div>
      </button>
      <button
        onClick={() => setActiveTab("Files")}
        className={`mr-6 pr-3 ${
          activeTab === "Files" ? "border-b border-accent" : ""
        }`}
      >
        <div className="flex flex-row items-center justify-center">
          <Image
            src={icons.folder}
            alt="Chat"
            width={32}
            height={32}
            className="mt-3.5"
          />
          <p
            className={`${
              activeTab === "Files" ? "text-white" : "text-primary-400"
            } font-semibold font-jakarta text-sm`}
          >
            Files
          </p>
        </div>
      </button>
    </div>
  );
}

export default NavBar;
