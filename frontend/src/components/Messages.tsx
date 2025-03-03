"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import * as icons from "@/constants/icons";
import * as images from "@/constants/images";

interface MessagesProps {
  messages: Message[];
  isThinking: boolean;
}

const Messages: React.FC<MessagesProps> = ({ messages, isThinking }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

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
              src={icons.botAvatar}
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
              src={images.avatar}
              alt="User Avatar"
              className="ml-2 w-10 h-10 self-end"
            />
          )}
        </div>
      ))}
      {isThinking && (
        <div className="flex justify-start mb-4">
          <Image
            src={icons.botAvatar}
            alt="Bot Avatar"
            className="mr-2 w-10 h-10 self-end"
          />
          <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-300 text-gray-800">
            <p className="text-sm italic">Thinking...</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
