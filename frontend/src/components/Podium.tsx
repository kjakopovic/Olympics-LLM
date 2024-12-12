import React from "react";
import PodiumCard from "./PodiumCard";

import * as images from "@/constants/images";

const podiumData = [
  {
    position: 1,
    name: "United States of America",
    medals: 1440,
    image: images.america,
  },
  {
    position: 2,
    name: "UK",
    medals: 90,
    image: images.america,
  },
  {
    position: 3,
    name: "Japan",
    medals: 80,
    image: images.america,
  },
];

function Podium() {
  return (
    <div className="h-auto w-full flex flex-row items-end justify-between px-14">
      <PodiumCard data={podiumData[2]} />
      <PodiumCard data={podiumData[0]} />
      <PodiumCard data={podiumData[1]} />
    </div>
  );
}

export default Podium;
