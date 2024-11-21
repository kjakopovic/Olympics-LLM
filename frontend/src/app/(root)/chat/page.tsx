import ChatBar from "@/components/ChatBar";
import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";
import React from "react";

function Chat() {
  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex-row flex">
      <SideBar />
      <div className="w-4/5 flex flex-col items-center justify-between">
        <NavBar />
        <ChatBar />
      </div>
    </div>
  );
}

export default Chat;
