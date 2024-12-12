"use client";
import React from "react";

interface User {
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

const LeaderBoard: React.FC = () => {
  // Example click handler
  const handleRowClick = (user: User) => {
    // Implement your logic here, e.g., navigate to user details
    console.log(`Clicked on ${user.name}`);
    // For example, navigate to a user detail page:
    // router.push(`/users/${user.id}`);
  };

  // Sample data
  const users: User[] = [
    { name: "John Doe", gold: 3, silver: 2, bronze: 1, total: 6 },
    { name: "Jane Smith", gold: 2, silver: 3, bronze: 4, total: 9 },
    { name: "Alice Johnson", gold: 5, silver: 1, bronze: 2, total: 8 },
    { name: "Bob Brown", gold: 1, silver: 4, bronze: 3, total: 8 },
    { name: "Charlie White", gold: 4, silver: 5, bronze: 5, total: 14 },
    { name: "John Doe", gold: 3, silver: 2, bronze: 1, total: 6 },
    { name: "Jane Smith", gold: 2, silver: 3, bronze: 4, total: 9 },
    { name: "Alice Johnson", gold: 5, silver: 1, bronze: 2, total: 8 },
    { name: "Bob Brown", gold: 1, silver: 4, bronze: 3, total: 8 },
    { name: "Charlie White", gold: 4, silver: 5, bronze: 5, total: 14 },
    // Add more users as needed
  ];

  return (
    <div className="bg-primary-50 rounded-2xl p-4 mt-8 mr-5 ml-2">
      {/* Scrollable Container */}
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full border-separate border-spacing-y-4">
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td colSpan={5} className="p-0">
                  {/* Interactive Button */}
                  <button
                    onClick={() => handleRowClick(user)}
                    className="bg-primary-500 w-full text-left px-6 py-3 flex items-center justify-between hover:border border-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent rounded-2xl"
                  >
                    {/* Left Container: User Name */}
                    <span className="font-jakarta font-semibold text-white">
                      {index + 4}.{" "}
                      <span className="font-normal ml-2">{user.name}</span>
                    </span>

                    {/* Right Container: Medal Counts */}
                    <div className="flex space-x-6">
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        🥇 {user.gold}
                      </span>
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        🥈 {user.silver}
                      </span>
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        🥉 {user.bronze}
                      </span>
                      <span className="font-jakarta font-semibold text-white flex items-center">
                        Total:{" "}
                        <span className="font-extrabold ml-2">
                          {user.total}
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
