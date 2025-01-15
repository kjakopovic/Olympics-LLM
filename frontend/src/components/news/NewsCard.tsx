import Image, { StaticImageData } from "next/image";
import React from "react";

import { timeSincePosted } from "@/utils/helpers";
import * as images from "@/constants/images";

interface NewsCardProps {
    title: string;
    timePosted: Date;
    imageUrl?: string;
    image?: StaticImageData;
    imageWidth?: number;
    imageHeight?: number;
    fullscreenView?: boolean;
    openNews: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, image, imageUrl, imageWidth, imageHeight, timePosted, openNews, fullscreenView = false }) => {
    return (
        <div 
            className={`flex flex-col items-center justify-center ${!fullscreenView ? "mb-10" : ""}`}
        >
            <div className={`${fullscreenView ? "w-full relative" : "w-[90%]"}`}>
                <div className="group relative w-full h-full">
                    <Image
                    src={(imageUrl ? imageUrl : image) ?? images.login}
                    alt="Logo"
                    width={imageWidth ?? 3000}
                    height={imageHeight ?? 3000}
                    className={`rounded-xl w-full mr-2 object-cover ${fullscreenView ? "aspect-[3/1]" : "aspect-[2/1]"}`}
                    />

                    {fullscreenView && (
                    <div className="absolute bottom-0 left-0 w-full min-h-[30%] rounded-b-xl pl-3 pb-3 
                        bg-gradient-to-t from-black/60 to-black/0 via-black/60 via-opacity-60
                        transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out
                    ">
                        <h1 className="text-white font-jakarta font-bold leading-tight w-[80%]
                            xs:text-[10px] sm:text-[13px] md:text-[16px] lg:text-[20px] absolute text-base
                            xs:bottom-0 sm:bottom-1 md:bottom-3 lg:bottom-5
                        ">
                        {title}
                        </h1>
                    </div>
                    )}
                </div>
            </div>

            {!fullscreenView && (
                <>
                    <div className="flex items-start w-[90%] mt-3 max-h-[150px] min-h-[150px]">
                        <h1 className="text-white font-jakarta font-bold text-[20px]">
                        {title.length > 70 
                            ? `${title.slice(0, 70)}...` 
                            : title}
                        </h1>
                    </div>
                    
                    <div className="flex flex-row w-[90%]">
                        <p className="flex w-full font-normal text-[#949494]">
                            {timeSincePosted(timePosted)}
                        </p>

                        <button className="flex justify-end w-full font-normal text-gradientGreen-200"
                            onClick={openNews}
                        >
                            Open
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default NewsCard;
