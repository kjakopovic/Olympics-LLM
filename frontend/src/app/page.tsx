"use client";

import { useRouter } from "next/navigation";
import React from "react";

import * as images from "@/constants/images";
import LogoHeader from "@/components/LogoHeader";
import Carousel from "@/components/Carousel";
import NewsCard from "@/components/news/NewsCard";
import TopicTitle from "@/components/news/TopicTitle";

function NewsPage() {
  const router = useRouter();
  const isLoggedIn = true;

  const tempNewsData = [
    {
      id: "jeiogjioesakfjifshjg",
      title: "Something terrible happened to the olympic games attender this year in France 2024",
      description: "Nisi, sagittis aliquet sit rutrum. Nunc, id vestibulum quam ornare adipiscing. Pellentesque sed turpis nunc gravida pharetra, sit nec vivamus pharetra. Velit, dui, egestas nisi, elementum mattis mauris, magnis. Massa tortor nibh nulla condimentum imperdiet scelerisque",
      image: images.login,
      timePosted: new Date("2024-12-10T07:00:00"),
    },
    {
      id: "akdsadaadsd",
      title: "Nikon",
      description: "Nisi, sagittis aliquet sit rutrum. Nunc, id vestibulum quam ornare adipiscing. Pellentesque sed turpis nunc gravida pharetra, sit nec vivamus pharetra. Velit, dui, egestas nisi, elementum mattis mauris, magnis. Massa tortor nibh nulla condimentum imperdiet scelerisque",
      image: images.login,
      timePosted: new Date("2023-12-10T15:00:00"),
    }
  ]

  return (
    <div className="w-full h-full bg-primary-100 flex flex-col items-center">
      <div className="flex flex-row items-center justify-between w-full mt-5">
        <LogoHeader
          logo={images.logo}
          title="Olympus"
        />

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
        <TopicTitle
          title="Hot topics"
        />

        <Carousel
          newsData={tempNewsData}
          carouselDataLength={tempNewsData.length}
        />
      </div>

      <div className="w-full flex flex-col justify-center items-center mt-20">
        <TopicTitle
          title={isLoggedIn ? "Your feed" : "Latest news"}
        />

        <div className="grid w-[85%] items-center justify-center
          xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tempNewsData.map((news) => (
            <NewsCard
              key={news.id}
              title={news.title}
              image={news.image}
              timePosted={news.timePosted}
              openNews={() => router.push(`/news/${news.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
