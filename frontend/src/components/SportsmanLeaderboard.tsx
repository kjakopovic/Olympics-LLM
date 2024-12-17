"use client";
import React from "react";

const SportsLeaderBoard: React.FC<AthleteLeaderboardProps> = ({ data }) => {
  // Example click handler
  const handleRowClick = (athlete: SportsmanData) => {
    // Implement your logic here, e.g., navigate to user details
    console.log(`Clicked on ${athlete.name}`);
    // For example, navigate to a user detail page:
    // router.push(`/users/${user.id}`);
  };

  return (
    <div className="bg-primary-50 rounded-2xl p-4 mt-8 mr-5 ml-2">
      {/* Scrollable Container */}
      <div className="max-h-screen overflow-y-auto">
        <table className="w-full border-separate border-spacing-y-4 px-1">
          <tbody>
            {data.map((athlete, index) => (
              <tr key={index}>
                <td colSpan={5} className="p-0">
                  {/* Interactive Button */}
                  <button
                    onClick={() => handleRowClick(athlete)}
                    className="bg-primary-500 w-full text-left px-6 py-3 flex items-center justify-between hover:border border-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent rounded-2xl"
                  >
                    {/* Left Container: User Name */}
                    <div className="flex items-center space-x-3">
                      <span className="font-jakarta font-extrabold text-accent">
                        {index + 1}.{" "}
                        <span className="font-bold ml-2 text-white">
                          {athlete.name}
                        </span>
                      </span>
                      <span className="font-jakarta font-normal text-white flex items-center">
                        From: {athlete.team}
                      </span>
                    </div>

                    {/* Right Container: Medal Counts */}
                    <div className="flex space-x-6">
                      <span className="font-jakarta font-semibold text-accent flex items-center">
                        {athlete.sport}
                      </span>
                      <span className="font-jakarta font-normal text-white flex items-center">
                        {athlete.event}:
                        <span className="font-semibold ml-1">
                          {athlete.year}
                        </span>
                      </span>
                      <span className="font-jakarta font-semibold text-xl text-white flex items-center">
                        {athlete.medal === "Gold"
                          ? "🥇"
                          : athlete.medal === "Silver"
                          ? "🥈"
                          : athlete.medal === "Bronze"
                          ? "🥉"
                          : "N/A"}
                      </span>
                    </div>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SportsLeaderBoard;
