import React from "react";
import PodiumCard from "./PodiumCard";

function Podium({ data }: { data: CountryLeaderboardProps[] }) {
  return (
    <div className="h-auto w-full flex flex-row items-end justify-between px-14">
      <PodiumCard data={data[2]} position={3} />
      <PodiumCard data={data[0]} position={1} />
      <PodiumCard data={data[1]} position={2} />
    </div>
  );
}

export default Podium;
