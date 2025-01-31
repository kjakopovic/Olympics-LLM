import React from "react";
import Image from "next/image";

import * as images from "@/constants/images";

const PodiumCard: React.FC<PodiumCardProps> = ({ data, position }) => {
  console.log(position);
  if (position === 1) {
    return (
      <div className="bg-primary-50/50 rounded-lg h-80 w-72 mt-12 shadow-goldglow p-5 flex flex-col items-center justify-center">
        <Image
          src={images.goldGlow}
          alt="Gold Medal"
          className="-mb-[70px] -mt-[150px]"
        />
        
        <div className="flex flex-col items-center justify-center w-full mx-5 mt-16">
          <h1 className="text-2xl font-jakarta text-center text-wrap font-bold text-primary-600">
            {data.country}
          </h1>
          <h2 className="text-3xl font-jakarta font-bold text-white mb-2 mt-8">
            {data.gold + data.silver + data.bronze}
          </h2>
          <h2 className="text-xl font-jakarta font-bold text-primary-600">
            Medals
          </h2>
        </div>
      </div>
    );
  } else
    return (
      <div
        className={`bg-primary-50/50 w-52 h-60 rounded-lg ${
          position === 2 ? "shadow-silverglow" : "shadow-bronzeglow"
        } flex flex-col items-center justify-center relative`}
      >
        <Image
          src={position === 2 ? images.silverGlow : images.bronzeGlow}
          alt="Silver Medal"
          width={position === 2 ? 272 : 184}
          height={position === 2 ? 280 : 194}
          className="-mb-[70px] -mt-[150px]"
        />
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold font-jakarta text-primary-600 mt-8">
            {data.country}
          </h1>
          <h2 className="text-3xl font-bold font-jakarta text-white mt-8">
            {data.gold + data.silver + data.bronze}
          </h2>
          <h2 className="text-xl font-bold font-jakarta text-primary-600 mt-1">
            Medals
          </h2>
        </div>
      </div>
    );
};

export default PodiumCard;
