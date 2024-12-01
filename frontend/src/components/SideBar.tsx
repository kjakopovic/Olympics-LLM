import React from "react";
import Image from "next/image";

import * as images from "@/constants/images";
import * as icons from "@/constants/icons";

function SideBar() {
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
          CHATS
        </h1>
        <div className="w-full h-auto flex flex-col items-start justify-start mt-2">
          <button className="relative w-full h-auto flex flex-row items-center justify-start p-2 rounded-xl group mt-2">
            {/* Background Overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 opacity-0 group-hover:opacity-16 transition-opacity duration-300 pointer-events-none"></div>

            {/* Button Text */}
            <span className="relative text-white/80">General</span>
          </button>
          <button className="relative w-full h-auto flex flex-row items-center justify-start p-2 rounded-xl group mt-2">
            {/* Background Overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 opacity-0 group-hover:opacity-16 transition-opacity duration-300 pointer-events-none"></div>

            {/* Button Text */}
            <span className="relative text-white/80">Food prediction</span>
          </button>
          <button className="relative w-full h-auto flex flex-row items-center justify-start p-2 rounded-xl group mt-2">
            {/* Background Overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-glass-100 to-glass-200/0 opacity-0 group-hover:opacity-16 transition-opacity duration-300 pointer-events-none"></div>

            {/* Button Text */}
            <span className="relative text-start text-white/80 line-clamp-1">
              Trends following 2025 Olympics
            </span>
          </button>
        </div>
        <div className="w-[18%] absolute h-auto flex flex-row items-center justify-between bottom-7 left-6 p-2 hover:cursor-pointer">
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
            <div className="w-full h-auto flex flex-col items-start justify-start ml-1">
              <h1 className="text-base font-semibold font-jakarta text-white">
                Jon Doe
              </h1>
              <span className="text-xs font-medium font-jakarta text-accent">
                jon@doe.com
              </span>
            </div>
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
