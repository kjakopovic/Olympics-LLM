import React, { useState } from "react";
import Image from "next/image";

import * as icons from "@/constants/icons";

interface CarouselProps {
    images: NewsPicture[];
    strapiPictures?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
    images,
    strapiPictures = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL ?? "http://localhost:1337";

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Items Container */}
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images &&
          images.map((image: NewsPicture) => (
            <div
              key={image.documentId}
              className="flex-shrink-0 w-full text-white flex 
                    text-lg font-bold items-center justify-center
                    xs:min-h-[150px] sm:min-h-[200px] md:min-h-[300px] lg:min-h-[350px]
                    xs:max-h-[250px] sm:max-h-[300px] md:max-h-[400px] lg:max-h-[700px]
                "
            >
              <Image
                src={strapiPictures ? `${strapiBaseUrl}${image.url}` : image.url}
                alt="News Image"
                width={image.width}
                height={image.height}
                className="object-cover rounded-2xl max-h-[90%]"
              />
            </div>
          ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 h-full transform -translate-y-1/2 text-white p-2 rounded-2xl"
      >
        <Image 
            src={icons.arrowDown} 
            alt="Arrow Left" 
            className="rotate-90"
        />
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

export default Carousel;
