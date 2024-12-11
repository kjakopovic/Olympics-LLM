import Podium from "@/components/Podium";
import SideBar from "@/components/SideBar";
import React from "react";

function CountryLeaderboard() {
  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex-row flex">
      <SideBar />
      <div className="flex flex-col w-4/5 min-h-screen mt-5">
        <Podium />
      </div>
    </div>
  );
}

export default CountryLeaderboard;
