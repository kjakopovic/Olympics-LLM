import SideBar from "@/components/SideBar";
import React from "react";

function Chat() {
  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex-row flex">
      <SideBar />
      <h1>Chat</h1>
    </div>
  );
}

export default Chat;
