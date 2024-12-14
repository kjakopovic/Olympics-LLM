// /components/TagInput.tsx

"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import { olympicSports } from "@/constants/olympicSports";
import Image from "next/image";
import * as icons from "@/constants/icons"; // Assuming you have a close icon

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [input, setInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (input) {
      const filteredSuggestions = olympicSports.filter(
        (sport) =>
          sport.toLowerCase().includes(input.toLowerCase()) &&
          !tags.includes(sport)
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input, tags]);

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      const formattedInput = input.trim();
      if (
        olympicSports.includes(formattedInput) &&
        !tags.includes(formattedInput)
      ) {
        handleAddTag(formattedInput);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-accent text-primary-50 px-3 py-1 rounded-full"
          >
            <span className="mr-2">{tag}</span>
            <button onClick={() => handleRemoveTag(tag)}>
              <Image
                src={icons.cog} // Replace with your close icon path
                alt="Remove tag"
                width={16}
                height={16}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click
        onFocus={() => {
          if (input) setShowSuggestions(true);
        }}
        placeholder="Add a sport..."
        className="w-full border bg-transparent text-white border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-accent"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="border border-accent rounded-lg mt-1 max-h-40 overflow-y-auto bg-primary-500 z-10 absolute w-1/2">
          {suggestions.map((sport) => (
            <li
              key={sport}
              onClick={() => handleAddTag(sport)}
              className="px-4 py-2 hover:bg-accent text-white hover:text-primary-50 cursor-pointer"
            >
              {sport}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
