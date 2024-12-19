"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { handleLogout } from "@/utils/helpers";

import * as images from "@/constants/images";
import LogoHeader from "@/components/LogoHeader";
import NewsCarousel from "@/components/news/NewsCarousel";
import NewsCard from "@/components/news/NewsCard";
import TopicTitle from "@/components/news/TopicTitle";
import LoadingSpinner from "@/components/LoadingSpinner";

function NewsPage() {
  const router = useRouter();
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL ?? "http://localhost:1337";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Cookies.get("token") ? true : false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [newsData, setNewsData] = useState<NewsData[]>([]);
  const [mostPopularNewsData, setMostPopularNewsData] = useState<NewsData[]>([]);

  const fetchTagsFromUserInfo = async (token: string | undefined, refreshToken: string | undefined, apiUrl: string) => {
    const response = await fetch(`${apiUrl}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-refresh-token": refreshToken || ""
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleLogout(router);
        return [];
      }

      const errorData = await response.json();
      console.error("API Error:", errorData);

      setError(
        errorData.message || errorData.error || "An error occurred while fetching data."
      );
      setLoading(false);
      return [];
    }

    const data = await response.json();
    console.log("Fetched Data:", data);
    
    return data.info.tags
  }

  const fetchNewsData = async (apiUrl: string, query: string, page: number = 1): Promise<NewsData[]> => {
    const response = await fetch(`${apiUrl}?pagination[page]=${page}&pagination[pageSize]=10&populate=*&${query}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);

      setError(
        errorData.message || "An error occurred while fetching data."
      );
      setLoading(false);
      return [];
    }

    const data = await response.json();
    console.log("Fetched Data:", data);

    return data.data;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const NEWS_API_URL = process.env.NEXT_PUBLIC_STRAPI_NEWS_URL;

        if (!NEWS_API_URL) {
          setError("API URL is not defined.");
          setLoading(false);
          return;
        }

        const newsData = await fetchNewsData(NEWS_API_URL, "");

        if (isLoggedIn) {
          const token = Cookies.get("token");
          const refreshToken = Cookies.get("refresh-token");

          if (!token) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
          }

          const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL ?? "";
          const tags = await fetchTagsFromUserInfo(token, refreshToken, USER_API_URL);

          // If no tags found fetch all news
          if (!tags || tags.length <= 0) {
            setNewsData([...newsData]);
          } else {
            var query = tags.map((tag: string) => `filters[tags][$contains]=${tag}`).join("&");

            const personalizedNewsData = await fetchNewsData(NEWS_API_URL, query);

            // If no personalized news found fetch all news
            if (personalizedNewsData.length <= 0) {
              setNewsData([...newsData]);
            } else {
              setNewsData(personalizedNewsData);
            }
          }
        } else {
          setNewsData([...newsData]);
        }

        setMostPopularNewsData([...newsData]);
      } catch (error: any) {
        console.error("Fetch Error:", error);
        setError("A network error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || mostPopularNewsData.length === 0) {
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
            <div className="flex flex-row items-center space-x-5">
              <button
                className="bg-gradient-to-r from-gradientGreen-100 to-gradientGreen-200 bg-clip-text text-transparent font-jakarta font-bold text-[20px]"
                onClick={() => router.push("/chat")}
              >
                Ask AI
              </button>

              <button
                className="bg-gradient-to-r from-gradientGreen-100 to-gradientGreen-200 bg-clip-text text-transparent font-jakarta font-bold text-[20px]"
                onClick={() => handleLogout(router)}
              >
                Log out
              </button>
            </div>
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

        <NewsCarousel
          newsData={mostPopularNewsData.slice(0, 10)}
          carouselDataLength={mostPopularNewsData.slice(0, 10).length}
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
              imageUrl={`${strapiBaseUrl}${news.pictures[0].url}`}
              imageWidth={news.pictures[0].width}
              imageHeight={news.pictures[0].height}
              timePosted={new Date(news.publishedAt)}
              openNews={() => router.push(`/news/${news.documentId}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
