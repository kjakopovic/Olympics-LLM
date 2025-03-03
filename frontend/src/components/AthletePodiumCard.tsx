import React from "react";
import Image from "next/image";

import * as images from "@/constants/images";

const AthletePodiumCard: React.FC<AthletePodiumCardProps> = ({
  data,
  position,
}) => {
  if (position === 1) {
    return (
      <div className="bg-primary-50/50 rounded-lg h-80 w-72 mt-12 shadow-goldglow p-5 flex flex-col items-center justify-center">
        <Image
          src={images.goldGlow}
          alt="Gold Medal"
          width={350}
          height={384}
          className="absolute top-[-60px] z-40"
        />
        {/* <Image
          src={data.data.image}
          alt="Country Flag"
          width={70}
          height={70}
          className="absolute top-11 z-50"
        /> */}
        <div className="flex flex-col items-center justify-center w-full mx-5 mt-16">
          <h1 className="text-3xl font-jakarta text-center text-wrap font-bold text-primary-600">
            {data.team}
          </h1>
          <h2 className="text-2xl font-jakarta font-bold text-white mb-2 mt-8">
            {data.name}
          </h2>
          <h2 className="text-xl font-jakarta text-center font-medium text-primary-600">
            {data.event}
          </h2>
          <h2 className="text-xl font-jakarta text-center font-semibold text-primary-600">
            {data.year}
          </h2>
        </div>
      </div>
    );
  } else
    return (
      <div
        className={`bg-primary-50/50 w-52 h-60 rounded-lg ${
          position === 2 ? "shadow-silverglow" : "shadow-bronzeglow"
        } flex items-center justify-center relative px-4`}
      >
        <Image
          src={position === 2 ? images.silverGlow : images.bronzeGlow}
          alt="Silver Medal"
          width={position === 2 ? 272 : 184}
          height={position === 2 ? 280 : 194}
          className={`absolute ${
            position === 2 ? "top-[-75px]" : "top-[-75px]"
          } z-40`}
        />
        {/* <Image
          src={data.data.image}
          alt="Country Flag"
          width={data.data.position === 2 ? 45 : 45}
          height={data.data.position === 2 ? 45 : 45}
          className={`absolute ${
            data.data.position === 2 ? "top-[-15px]" : "top-[-19px]"
          } z-50`}
        /> */}
        <div className="flex flex-col items-center">
          <h1
            className={`text-xl font-bold font-jakarta text-primary-600 ${
              position === 2 ? "mt-8" : "mt-16"
            }`}
          >
            {data.team}
          </h1>
          <h2 className="text-xl font-bold text-center font-jakarta text-white mt-5">
            {data.name}
          </h2>
          <h2 className="text-sm font-medium font-jakarta text-center h-30 w-40 truncate text-ellipsis text-primary-600 mt-1">
            {data.event}
          </h2>
          <h2 className="text-sm font-semibold font-jakarta text-center h-30 w-40 truncate text-ellipsis text-primary-600 mt-1">
            {data.year}
          </h2>
        </div>
      </div>
    );
};

export default AthletePodiumCard;
