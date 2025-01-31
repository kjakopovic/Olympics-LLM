"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

import ChatBar from "@/components/ChatBar";
import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";
import Messages from "@/components/Messages";

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const handleSendMessage = async (text: string) => {
    if (text.trim() === "") return;

    const userMessage: Message = {
      id: uuidv4(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    const token = Cookies.get("token");
    const refreshToken = Cookies.get("refresh-token");

    if (!token || !refreshToken) {
      console.log("Token or refresh token not found");
      setIsThinking(false);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_BOT_API;

    try {
      const response = await fetch(
        `${API_URL}?question=${encodeURIComponent(text)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: uuidv4(),
          sender: "bot",
          text: data.generated_text,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        const error = await response.json();
        console.log(error);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    }

    setIsThinking(false);
  };

  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex-row flex">
      <SideBar />
      <div className="w-4/5 flex flex-col items-center justify-between">
        <NavBar />
        <Messages messages={messages} isThinking={isThinking} />
        <ChatBar onSend={handleSendMessage} />
      </div>
    </div>
  );
}

export default Chat;
