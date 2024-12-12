import React from "react";

interface TopicTitleProps {
    title: string;
}

const TopicTitle: React.FC<TopicTitleProps> = ({ title }) => {
    return (
        <div className="w-[90%] justify-center items-center mb-10">
            <h1 className="text-gradientGreen-200 text-[30px] font-jakarta font-bold text-left">
                {title}
            </h1>
        </div>
    );
}

export default TopicTitle;
