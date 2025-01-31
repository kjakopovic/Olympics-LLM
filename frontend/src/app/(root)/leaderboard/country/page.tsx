"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

import LeaderBoard from "@/components/LeaderBoard";
import Podium from "@/components/Podium";
import SideBar from "@/components/SideBar";
import FiltersModal, { Filters } from "@/components/FilterModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { handleLogout } from "@/utils/helpers";

function CountryLeaderboard() {
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    startYear: 2000,
    endYear: 2024,
    sport: "",
  });

  const [countries, setCountries] = useState<CountryLeaderboardProps[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_SPORTS_API_URL || "";
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refresh-token");

      try {
        const response = await fetch(
          `${API_URL}/countries?page=1&limit=100&min_year=${filters.startYear}&max_year=${filters.endYear}&list_of_sports=${filters.sport}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "x-refresh-token": refreshToken || "",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout(router, true);
            return;
          }

          const errorData = await response.json();
          router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while fetching data."}`);
        }

        const data = await response.json();

        setCountries(data.items);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        router.push(`/error?code=500&message=${err.message || "An unexpected error occurred."}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleApplyFilters = async (selectedFilters: Filters) => {
    setFilters(selectedFilters);
  };

  return (
    <div className="h-full bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex">
      {/* SideBar */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex h-screen flex-col w-4/5 p-5 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-accent mb-4">Leaderboard</h1>
          <button
            onClick={handleOpenModal}
            className="bg-gradient-to-r from-primary-500 to-primary-500/80 text-white px-6 py-2 mx-5 rounded-lg hover:from-primary-600 hover:to-primary-600/80 transition-colors duration-300"
          >
            Filters
          </button>
        </div>

        {/* Podium */}
        {!loading && countries.length > 0 && <Podium data={countries} />}

        {/* Loading Indicator */}
        {loading && <LoadingSpinner />}

        {/* Scrollable LeaderBoard */}
        {!loading && (
          <div className="mt-4">
            <LeaderBoard data={countries} />
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApply={handleApplyFilters}
      />
    </div>
  );
}

export default CountryLeaderboard;
