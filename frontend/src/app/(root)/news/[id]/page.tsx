"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import * as images from "@/constants/images";
import { timeSincePosted } from "@/utils/helpers";
import LogoHeader from "@/components/LogoHeader";

const tempNewsData = {
    id: "jeiogjioesakfjifshjg",
    title: "Something terrible happened to the olympic games attender this year in France 2024",
    description: "Nisi, sagittis aliquet sit rutrum. Nunc, id vestibulum quam ornare adipiscing. Pellentesque sed turpis nunc gravida pharetra, sit nec vivamus pharetra. Velit, dui, egestas nisi, elementum mattis mauris, magnis. Massa tortor nibh nulla condimentum imperdiet scelerisque",
    image: images.login,
    timePosted: new Date("2024-12-10T07:00:00"),
}

function NewsByIdPage() {
    const { id } = useParams();
    const router = useRouter();

    if (!id) {
        return <p>Loading...</p>;
    }

    return (
        <div className="w-full h-full bg-primary-100 flex flex-col items-center">
            <div className="flex flex-row items-center justify-between w-full mt-5">
                <LogoHeader
                logo={images.logo}
                title="Olympus"
                />

                <div className="flex flex-row items-center mr-5">
                <button
                    className="bg-gradient-to-r from-gradientGreen-100 to-gradientGreen-200 bg-clip-text text-transparent font-jakarta font-bold text-[20px]"
                    onClick={() => router.back()}
                >
                    Go back
                </button>
                </div>
            </div>
            
            <div className="w-[90%] mt-5 flex flex-col">
                <h1 className="text-white font-jakarta font-bold text- text-left mb-10
                    xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                ">
                    {tempNewsData.title}
                </h1>

                <Image
                    src={tempNewsData.image}
                    alt="Logo"
                    className="rounded-2xl w-full mr-2 object-cover aspect-[3/1]"
                />

                <p className="text-right mt-5 font-normal text-[#949494]
                    xs:text-sm sm:text-sm md:text-lg lg:text-lg
                ">
                    {timeSincePosted(tempNewsData.timePosted)}
                </p>

                <p className="text-left mt-5 font-semibold text-white
                    xs:text-sm sm:text-lg md:text-lg lg:text-xl
                ">
                    {tempNewsData.description}
                </p>
            </div>
        </div>
    );
}

export default NewsByIdPage;