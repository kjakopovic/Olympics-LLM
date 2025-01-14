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
import Footer from "@/components/Footer";

function NewsPage() {
  const router = useRouter();
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL ?? "http://localhost:1337";
  const NEWS_API_URL = process.env.NEXT_PUBLIC_STRAPI_NEWS_URL;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Cookies.get("token") ? true : false);
  const [loading, setLoading] = useState<boolean>(true);

  const [newsData, setNewsData] = useState<NewsData[]>([]);
  const [personalizedNewsData, setPersonalizedNewsData] = useState<NewsData[]>([]);
  const [pageData, setPageData] = useState<Pagination | undefined>(undefined);
  const [personalizedPageData, setPersonalizedPageData] = useState<Pagination | undefined>(undefined);

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

      router.push(`/error?code=${response.status}&message=${errorData.message || errorData.error || "An error occurred while fetching data."}`);
      return [];
    }

    const data = await response.json();
    console.log("Fetched Data:", data);
    
    return data.info.tags
  }

  const fetchNewsData = async (apiUrl: string, query: string, page: number = 1, isPersonalizedNewsData: boolean = false): Promise<NewsData[]> => {
    const response = await fetch(`${apiUrl}?pagination[page]=${page}&pagination[pageSize]=10&populate=*&${query}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);

      router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while fetching data."}`);
      return [];
    }

    const data = await response.json();
    console.log("Fetched Data:", data);

    if (isPersonalizedNewsData) {
      setPersonalizedPageData(data.meta.pagination);
    } else {
      setPageData(data.meta.pagination);
    }
    
    return data.data;
  }

  const handleLoadMoreNews = async (loadPersonalized = false) => {
    if ((!loadPersonalized && !pageData) || (loadPersonalized && !personalizedPageData)) {
      return;
    }

    if (!NEWS_API_URL) {
      router.push("/error?code=500&message=API URL is not defined.");
      return;
    }

    if (loadPersonalized) {
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refresh-token");

      if (!token || !refreshToken) {
        setIsLoggedIn(false);
        return;
      }

      const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL ?? "";
      const tags = await fetchTagsFromUserInfo(token, refreshToken, USER_API_URL);

      if (tags && tags.length > 0) {
        var query = tags.map((tag: string) => `filters[tags][$contains]=${tag}`).join("&");

        const personalizedNewsData = await fetchNewsData(NEWS_API_URL, query, personalizedPageData!.page + 1, true);

        if (personalizedNewsData.length > 0) {
          setPersonalizedNewsData(prevData => [...prevData, ...personalizedNewsData]);
        }
      }
    } else {
      const newsData = await fetchNewsData(NEWS_API_URL, "", pageData!.page + 1);
      setNewsData(prevNewsData => [...prevNewsData, ...newsData]);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        if (!NEWS_API_URL) {
          router.push("/error?code=500&message=API URL is not defined.");
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

          if (tags && tags.length > 0) {
            var query = tags.map((tag: string) => `filters[tags][$contains]=${tag}`).join("&");
            console.log("Query:", query);

            const personalizedNewsData = await fetchNewsData(NEWS_API_URL, query, 1, true);

            if (personalizedNewsData.length > 0) {
              setPersonalizedNewsData([...personalizedNewsData]);
            }
          }
        }

        setNewsData([...newsData]);
      } catch (error: any) {
        console.error("Fetch Error:", error);
        router.push(`/error?code=500&message=A network error occurred. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !newsData) {
    return (
      <LoadingSpinner />
    )
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
                Dashboard
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
          newsData={newsData.slice(0, 10)}
          carouselDataLength={newsData.slice(0, 10).length}
        />
      </div>

      {isLoggedIn && personalizedNewsData && personalizedNewsData.length > 0 &&
        <div className="w-full flex flex-col justify-center items-center mt-20">
          <TopicTitle title="Your feed" />

          <div
            className="grid w-[85%] items-center justify-center
            xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {personalizedNewsData.map((news) => (
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

          {(personalizedPageData?.page ?? 0) < (personalizedPageData?.pageCount ?? 0) && (
            <h1
              className="bg-accent bg-clip-text text-transparent hover:cursor-pointer font-jakarta font-bold text-[20px] mb-5"
              onClick={() => handleLoadMoreNews(true)}
            >
              Load more...
            </h1>
          )}
        </div>
      }

      <div className="w-full flex flex-col justify-center items-center mt-20">
        <TopicTitle title="Latest news" />

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

        {(pageData?.page ?? 0) < (pageData?.pageCount ?? 0) && (
          <h1
            className="bg-accent bg-clip-text text-transparent hover:cursor-pointer font-jakarta font-bold text-[20px] mb-5"
            onClick={() => handleLoadMoreNews()}
          >
            Load more...
          </h1>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default NewsPage;
