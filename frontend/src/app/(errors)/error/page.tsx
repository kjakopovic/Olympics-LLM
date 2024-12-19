"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";

import * as images from "@/constants/images";
import LogoHeader from "@/components/LogoHeader";

function ErrorPage() {
    const searchParams = useSearchParams();

    const message = searchParams.get("message") || "An error occurred";
    const code = searchParams.get("code") || "500";

    return (
        <div className="w-full h-screen bg-primary-100 flex flex-col items-center">
            <div className="w-full flex flex-col items-center justify-center">
                <div className="
                    xs:mb-4 sm:mb-5 md:mb-7 lg:mb-10
                ">
                    <LogoHeader 
                        logo={images.logo} 
                        title="Olympus"
                        centered
                        customImageProps="
                            xs:h-[30px] sm:h-[40px] md:h-[65px] lg:h-[100px]
                            xs:w-[30px] sm:w-[40px] md:w-[65px] lg:w-[100px]
                        "
                        customTitleProps="
                            xs:text-[15px] sm:text-[20px] md:text-[30px] lg:text-[50px]
                        "
                    />
                </div>

                <h1 className="font-jakarta text-center font-bold text-accent
                    xs:text-[25px] sm:text-[35px] md:text-[45px] lg:text-[70px]
                    xs:mb-4 sm:mb-5 md:mb-7 lg:mb-10
                ">
                    {code}
                </h1>

                <h1 className="font-jakarta text-center font-bold text-primary-300
                    xs:text-[10px] sm:text-[15px] md:text-[20px] lg:text-[30px]
                ">
                    {message}
                </h1>

                <Image
                    src={images.alert}
                    alt="Error alert image from Olympus"
                    className="max-w-[20%]
                        xs:mt-[20px] sm:mt-[30px] md:mt-[40px] lg:mt-[50px]
                    "
                />
            </div>
        </div>
    );
}

export default ErrorPage;