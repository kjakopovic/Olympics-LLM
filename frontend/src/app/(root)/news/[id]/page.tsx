"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import * as images from "@/constants/images";
import { timeSincePosted } from "@/utils/helpers";
import LogoHeader from "@/components/LogoHeader";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Carousel from "@/components/Carousel";
import Footer from "@/components/Footer";

function NewsByIdPage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [newsData, setNewsData] = useState<NewsData | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
    
          try {
            const API_URL = process.env.NEXT_PUBLIC_STRAPI_NEWS_URL;
    
            if (!API_URL) {
                router.push(`/error?code=500&message=API URL is not defined.`);
                return;
            }
              
            const response = await fetch(`${API_URL}/${id}?populate=*`, {
                method: "GET"
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                
                router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while fetching data."}`);
                return;
            }
        
            const data = await response.json();
            console.log("Fetched Data:", data);
            setNewsData(data.data);
          } catch (error: any) {
            router.push(`/error?code=500&message=A network error occurred. Please try again.`);
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, []);

    if (!id || loading) {
        return (
            <LoadingSpinner />
        )
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

            {newsData ? (
                <div className="w-[90%] mt-5 flex flex-col mb-5">
                    <h1 className="text-white font-jakarta font-bold text- text-left mb-10
                        xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                    ">
                        {newsData.title}
                    </h1>

                    {newsData.pictures && newsData.pictures.length > 0 ? (
                        <Carousel
                            images={newsData.pictures}
                            strapiPictures={true}
                        />
                    ) : (
                        <Image
                            src={images.login}
                            alt="Olympic News image"
                            className="rounded-2xl w-full mr-2 object-cover aspect-[3/1]"
                        />
                    )}

                    <p className="text-right mt-5 font-normal text-[#949494]
                        xs:text-sm sm:text-sm md:text-lg lg:text-lg
                    ">
                        {timeSincePosted(new Date(newsData.publishedAt))}
                    </p>

                    <pre className="whitespace-pre-wrap text-left mt-5 font-semibold text-white
                        xs:text-sm sm:text-lg md:text-lg lg:text-xl
                    ">
                        {newsData.description}
                    </pre>
                </div>
            ) : (
                <h1 className="text-white font-jakarta font-bold text- text-center mt-10
                    xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                ">
                    News not found.
                </h1>
            )}

            <Footer />
        </div>
    );
}

export default NewsByIdPage;