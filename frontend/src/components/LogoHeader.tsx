import Image, { StaticImageData } from "next/image";
import React from "react";

interface LogoHeaderProps {
    title?: string;
    logo: StaticImageData;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ title, logo }) => {
  return (
    <div className="flex flex-row items-center ml-5">
        <Image
            src={logo}
            alt="Logo"
            className="h-14 w-14 mr-2"
        />

        {title && (
            <h1 className="text-white font-jakarta font-bold text-[24px]">
                Olympus
            </h1>
        )}
    </div>
  );
}

export default LogoHeader;
