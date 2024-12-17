"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import * as images from "@/constants/images";
import LogoHeader from "@/components/LogoHeader";
import Carousel from "@/components/Carousel";
import NewsCard from "@/components/news/NewsCard";
import TopicTitle from "@/components/news/TopicTitle";
import LoadingSpinner from "@/components/LoadingSpinner";

function NewsPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Cookies.get("token") ? true : false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [newsData, setNewsData] = useState<NewsData[]>([]);

  const fetchNewsData = async (token: string | undefined, refreshToken: string | undefined, apiUrl: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (refreshToken) {
      headers["x-refresh-token"] = refreshToken;
    }
    
    const response = await fetch(`${apiUrl}/`, {
      method: "GET",
      headers,
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
    setNewsData(data.items);
  }

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

        if (isLoggedIn) {
          const token = Cookies.get("token");
          const refreshToken = Cookies.get("refresh-token");

          if (!token) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
          }

          fetchNewsData(token, refreshToken, API_URL);
        } else {
          fetchNewsData(undefined, undefined, API_URL);
        }
      } catch (error: any) {
        console.error("Fetch Error:", error);
        setError("A network error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || newsData.length === 0) {
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
        <LogoHeader logo={images.logo} title="Olympus" />

        <div className="flex flex-row items-center mr-5">
          {isLoggedIn ? (
            <button
              className="bg-gradient-to-r from-gradientGreen-100 to-gradientGreen-200 bg-clip-text text-transparent font-jakarta font-bold text-[20px]"
              onClick={() => router.push("/chat")}
            >
              Ask AI
            </button>
          ) : (
            <button
              className="bg-gradient-to-r from-gradientGreen-100 to-gradientGreen-200 bg-clip-text text-transparent font-jakarta font-bold text-[20px]"
              onClick={() => router.push("/login")}
            >
              Log in
            </button>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col justify-center items-center mt-20">
        <TopicTitle title="Hot topics" />

        <Carousel
          newsData={newsData}
          carouselDataLength={newsData.length}
        />
      </div>

      <div className="w-full flex flex-col justify-center items-center mt-20">
        <TopicTitle title={isLoggedIn ? "Your feed" : "Latest news"} />

        <div
          className="grid w-[85%] items-center justify-center
          xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {newsData && newsData.map((news) => (
            <NewsCard
              key={news.id}
              title={news.title}
              imageUrl={news.pictures_url && news.pictures_url.length > 0 ? news.pictures_url[0].url : undefined}
              timePosted={new Date(news.published_at)}
              openNews={() => router.push(`/news/${news.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
