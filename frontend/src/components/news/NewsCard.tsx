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
            <div className={`${fullscreenView ? 
                "w-full relative" : 
                "w-[90%]"}
            `}>
                <Image
                    src={(imageUrl ? imageUrl : image) ?? images.login}
                    alt="Logo"
                    width={imageWidth ?? undefined}
                    height={imageHeight ?? undefined}
                    className={`rounded-xl w-full mr-2 object-cover ${fullscreenView ? "aspect-[3/1]" : "aspect-[2/1]"}`}
                />

                {fullscreenView && (
                    <div className="absolute bottom-0 left-0 w-[80%] pl-3 pb-3">
                        <h1 className="text-white font-jakarta font-bold leading-tight
                            xs:text-[10px] sm:text-[13px] md:text-[16px] lg:text-[20px]
                        ">
                            {title}
                        </h1>
                    </div>
                )}
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
