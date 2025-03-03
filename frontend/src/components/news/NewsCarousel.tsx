import React, { useState } from "react";
import Image from "next/image";

import * as icons from "@/constants/icons";
import NewsCard from "./NewsCard";

const NewsCarousel: React.FC<NewsCarouselProps> = ({
  newsData,
  carouselDataLength,
}) => {
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL ?? "http://localhost:1337";

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselDataLength - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselDataLength - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-[90%] overflow-hidden">
      {/* Items Container */}
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {newsData &&
          newsData.map((news: NewsData) => (
            <div
              key={news.id}
              className="flex-shrink-0 w-full text-white flex 
                    text-lg font-bold items-center justify-center
                    xs:min-h-[150px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[350px]
                "
            >
              <div
                className="flex items-start justify-center
                    xs:flex-col sm:flex-col md:flex-col lg:flex-row
                "
              >
                <NewsCard
                  key={news.id + "card"}
                  title={news.title}
                  imageUrl={`${strapiBaseUrl}${news.pictures[0].url}`}
                  imageWidth={news.pictures[0].width}
                  imageHeight={news.pictures[0].height}
                  timePosted={new Date(news.publishedAt)}
                  openNews={() => {}}
                  fullscreenView={true}
                />

                <div
                  key={news.id + "description-div"}
                  className="flex flex-col justify-start ml-10 mr-10
                            xs:max-w-[90%] sm:max-w-[90%] md:max-w-[90%] lg:max-w-[20%] lg:min-w-[15%]
                            xs:items-center sm:items-center md:items-center lg:items-start
                            xs:text-sm sm:text-lg md:text-lg lg:text-lg
                    "
                >
                  <p
                    key={news.id + "description"}
                    className="break-words font-semibold"
                  >
                    {news.description.length > 100
                      ? `${news.description.slice(0, 255)}`
                      : news.description}
                  </p>

                  <a
                    key={news.id + "read-more"}
                    href={`/news/${news.documentId}`}
                    className="text-[#949494] cursor-pointer hover:underline"
                  >
                    ... Read more
                  </a>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 h-full transform -translate-y-1/2 text-white p-2 rounded-2xl"
      >
        <Image src={icons.arrowDown} alt="Arrow Left" className="rotate-90" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 h-full transform -translate-y-1/2 text-white p-2 rounded-full"
      >
        <Image
          src={icons.arrowUp}
          alt="Arrow Right"
          className="rotate-90 fill-gradientGreen-200"
        />
      </button>
    </div>
  );
};

export default NewsCarousel;
