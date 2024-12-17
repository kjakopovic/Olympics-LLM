"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import * as images from "@/constants/images";
import { timeSincePosted } from "@/utils/helpers";
import LogoHeader from "@/components/LogoHeader";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

function NewsByIdPage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [newsData, setNewsData] = useState<NewsData | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          setError("");
    
          try {
            const API_URL = process.env.NEXT_PUBLIC_NEWS_API_URL;
    
            if (!API_URL) {
              setError("API URL is not defined.");
              setLoading(false);
              return;
            }
              
            const response = await fetch(`${API_URL}/${id}`, {
                method: "GET",
                headers:{
                    "Content-Type": "application/json",
                }
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
            
                setError(
                    errorData.message || "An error occurred while fetching data."
                );

                setLoading(false);
                return;
            }
        
            const data = await response.json();
            console.log("Fetched Data:", data);
            setNewsData(data.info);
          } catch (error: any) {
            console.error("Fetch Error:", error);
            setError("A network error occurred. Please try again.");
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

    if (!loading && error) {
        return (
          <div className="w-full h-full bg-primary-100 flex flex-col items-center">
            <LogoHeader logo={images.logo} title="Olympus" />
    
            <div className="w-full h-full flex flex-col items-center justify-center">
              <h1 className="font-jakarta text-[30px] font-bold text-primary-300">
                {error}
              </h1>
            </div>
          </div>
        );
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

            {newsData && (
                <div className="w-[90%] mt-5 flex flex-col">
                    <h1 className="text-white font-jakarta font-bold text- text-left mb-10
                        xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                    ">
                        {newsData.title}
                    </h1>

                    {newsData.pictures_url && newsData.pictures_url.length > 0 ? (
                        newsData.pictures_url.map((picture: NewsPicture) => (
                            <Image
                                key={picture.key}
                                src={picture.url}
                                alt="Logo"
                                className="rounded-2xl w-full mr-2 object-cover aspect-[3/1]"
                            />
                        ))
                    ) : (
                        <Image
                            src={images.login}
                            alt="Logo"
                            className="rounded-2xl w-full mr-2 object-cover aspect-[3/1]"
                        />
                    )}

                    <p className="text-right mt-5 font-normal text-[#949494]
                        xs:text-sm sm:text-sm md:text-lg lg:text-lg
                    ">
                        {timeSincePosted(new Date(newsData.published_at))}
                    </p>

                    <p className="text-left mt-5 font-semibold text-white
                        xs:text-sm sm:text-lg md:text-lg lg:text-xl
                    ">
                        {newsData.description}
                    </p>
                </div>
            )}
        </div>
    );
}

export default NewsByIdPage;