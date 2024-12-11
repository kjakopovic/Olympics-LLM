import Image from "next/image";
import React from "react";

import * as icons from "@/constants/icons";

function ChatBar() {
  return (
    <div className="w-[98%] rounded-xl bg-primary-50 m-3 ml-0 flex flex-row items-center justify-between p-2 px-4">
      <input
        type="text"
        placeholder="You can ask me anything! I am here to help."
        className="flex-1 bg-primary-50 text-white p-3 rounded-xl focus:outline-none placeholder-primary-500"
      />
      <div className="flex flex-row items-center justify-between ml-3 gap-x-3">
        <button className="w-auto h-10 text-white font-bold">
          <Image src={icons.clip} alt="Plus" width={24} height={24} />
        </button>
        <button className="w-11 h-11 text-white bg-primary-200 rounded-lg items-center justify-center flex flex-row font-bold">
          <Image src={icons.send} alt="Send" width={24} height={24} />
        </button>
      </div>
    </div>
  );
}

export default ChatBar;
