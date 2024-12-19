import Image, { StaticImageData } from "next/image";
import React from "react";

interface LogoHeaderProps {
    title?: string;
    logo: StaticImageData;
    centered?: boolean;
    customImageProps?: string;
    customTitleProps?: string;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ title, logo, customImageProps, customTitleProps, centered = false }) => {
  return (
    <div className={`flex flex-row items-center ${!centered && "ml-5"}`}>
        <Image
            src={logo}
            alt="Logo"
            className={`h-14 w-14 mr-2 ${customImageProps}`}
        />

        {title && (
            <h1 className={`text-white font-jakarta font-bold text-[24px] ${customTitleProps}`}>
                Olympus
            </h1>
        )}
    </div>
  );
}

export default LogoHeader;
