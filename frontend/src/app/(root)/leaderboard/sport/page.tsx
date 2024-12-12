"use client";
import React from "react";

import SideBar from "@/components/SideBar";
import LeaderBoard from "@/components/LeaderBoard";
import Podium from "@/components/Podium";

function SportLeaderboard() {
  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex overflow-hidden">
      {/* SideBar */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex flex-col w-4/5 p-5 overflow-hidden">
        {/* Header */}
        <h1 className="text-4xl font-bold text-accent mb-4">Leaderboard</h1>

        {/* Podium */}
        <Podium />

        {/* Scrollable LeaderBoard */}
        <div className="flex-1 overflow-auto mt-4">
          <LeaderBoard />
        </div>
      </div>
    </div>
  );
}

export default SportLeaderboard;
