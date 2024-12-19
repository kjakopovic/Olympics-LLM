import * as images from "@/constants/images";
import LogoHeader from "@/components/LogoHeader";

function NotFoundPage() {
    return (
        <main className="w-full h-screen bg-primary-100 flex flex-col items-center">
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
                    404
                </h1>

                <h1 className="font-jakarta text-center font-bold text-primary-300
                    xs:text-[10px] sm:text-[15px] md:text-[20px] lg:text-[30px]
                ">
                    Page not found, but we found a cute cat GIF instead.
                </h1>

                <img
                    src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTh6Y2RoejI1YTI5dGNhODk4ampycGZpZjhodTc3cXBnbTR2amZmMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tBxyh2hbwMiqc/giphy.gif"
                    className=" rounded-2xl
                        xs:max-h-[20%] sm:max-h-[25%] md:max-h-[30%] lg:max-h-[35%]
                        xs:mt-[80px] sm:mt-[100px] md:mt-[120px] lg:mt-[150px]
                    "
                />
            </div>
        </main>
    );
}

export default NotFoundPage;