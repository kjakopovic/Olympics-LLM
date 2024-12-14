import React from "react";
import AthletePodiumCard from "./AthletePodiumCard";

function AthletePodium({ data }: { data: SportsmanData[] }) {
  return (
    <div className="h-auto w-full flex flex-row items-end justify-between px-14">
      <AthletePodiumCard data={data[2]} position={3} />
      <AthletePodiumCard data={data[0]} position={1} />
      <AthletePodiumCard data={data[1]} position={2} />
    </div>
  );
}

export default AthletePodium;
