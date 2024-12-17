"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import * as icons from "@/constants/icons"; // Assuming you have icons for user and bot
import * as images from "@/constants/images"; // Assuming you have images for user and bot

interface MessagesProps {
  messages: Message[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 w-[98%] mr-4 overflow-auto p-4 bg-primary-50 rounded-xl">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex mb-4 ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.sender === "bot" && (
            <Image
              src={icons.botAvatar} // Replace with your bot avatar path
              alt="Bot Avatar"
              className="mr-2 w-10 h-10 self-end"
            />
          )}
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.sender === "user"
                ? "bg-accent text-primary-100"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            <p className="text-sm">{msg.text}</p>
            <span className="text-xs text-primary-300 block text-right mt-1">
              {msg.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {msg.sender === "user" && (
            <Image
              src={images.avatar} // Replace with your user avatar path
              alt="User Avatar"
              className="ml-2 w-10 h-10 self-end"
            />
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
