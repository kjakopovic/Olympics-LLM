"use client";
import React from "react";

const LeaderBoard: React.FC<LeaderBoardProps> = ({ data }) => {
  // Example click handler
  const handleRowClick = (country: CountryLeaderboardProps) => {
    // Implement your logic here, e.g., navigate to user details
    console.log(`Clicked on ${country.country}`);
    // For example, navigate to a user detail page:
    // router.push(`/users/${user.id}`);
  };

  return (
    <div className="bg-primary-50 rounded-2xl p-4 mt-8 mr-5 ml-2">
      {/* Scrollable Container */}
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full border-separate border-spacing-y-4">
          <tbody>
            {data.slice(3).map((country, index) => (
              <tr key={index}>
                <td colSpan={5} className="p-0">
                  {/* Interactive Button */}
                  <button
                    onClick={() => handleRowClick(country)}
                    className="bg-primary-500 w-full text-left px-6 py-3 flex items-center justify-between hover:border border-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent rounded-2xl"
                  >
                    {/* Left Container: User Name */}
                    <span className="font-jakarta font-semibold text-white">
                      {index + 4}.{" "}
                      <span className="font-normal ml-2">
                        {country.country}
                      </span>
                    </span>

                    {/* Right Container: Medal Counts */}
                    <div className="flex space-x-6">
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        🥇 {country.gold}
                      </span>
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        🥈 {country.silver}
                      </span>
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        🥉 {country.bronze}
                      </span>
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        Total:{" "}
                        <span className="font-extrabold ml-2">
                          {country.gold + country.silver + country.bronze}
                        </span>
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

export default LeaderBoard;
