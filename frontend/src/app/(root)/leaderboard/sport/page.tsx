"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";

import SideBar from "@/components/SideBar";
import SportsLeaderBoard from "@/components/SportsmanLeaderboard";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/AthleteFilterModal";
import FilterForm from "@/components/FilterForm";

function SportLeaderboard() {
  const [filters, setFilters] = useState<SportFilters>({
    medal: "",
    name: "",
    sex: "",
    sport: "",
    event_name: "",
    country: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [sportsmanData, setSportsmanData] = useState<SportsmanData[]>([]);
  const [error, setError] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Debounced filter setter to prevent excessive API calls
  const debouncedSetFilters = useMemo(
    () =>
      debounce((newFilters: SportFilters) => {
        setFilters(newFilters);
      }, 500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetFilters.cancel();
    };
  }, [debouncedSetFilters]);

  // Function to construct query parameters
  const constructQueryParams = (filters: SportFilters): string => {
    const params = new URLSearchParams();

    // Mandatory parameters
    params.append("page", "1");
    params.append("limit", "100");

    // Optional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim() !== "") {
        // Map keys if API expects different parameter names
        const paramKey = key === "name" ? "sportsman_name" : key;
        params.append(paramKey, value.trim());
      }
    });

    return params.toString();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      setError(""); // Reset previous errors

      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refresh-token");
      const API_URL = process.env.NEXT_PUBLIC_SPORTS_API_URL; // Ensure this is correctly defined

      if (!API_URL) {
        setError("API URL is not defined.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      // Construct query parameters by appending only non-empty filters
      const queryString = constructQueryParams(filters);

      try {
        const response = await fetch(`${API_URL}/?${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-refresh-token": refreshToken || "",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          setError(
            errorData.message || "An error occurred while fetching data."
          );
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Fetched Data:", data);
        setSportsmanData(data.items); // Adjust based on your API response structure
      } catch (error: any) {
        console.error("Fetch Error:", error);
        setError("A network error occurred. Please try again.");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();
  }, [filters]); // Re-run effect when filters change

  // Handlers to open and close the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handler to update filters based on modal submission
  const handleFilterSubmit = (updatedFilters: SportFilters) => {
    setFilters(updatedFilters);
    setIsModalOpen(false);
  };

  return (
    <div className="h-screen bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex overflow-hidden">
      {/* SideBar */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex flex-col w-4/5 p-5 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-accent mb-4">Leaderboard</h1>
          <button
            onClick={handleOpenModal}
            disabled={loading} // Disable button while loading
            className={`bg-gradient-to-r from-primary-500 to-primary-500/80 text-white px-6 py-2 mx-5 rounded-lg transition-colors duration-300 ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-primary-600 hover:to-primary-600/80"
            }`}
          >
            {loading ? "Loading..." : "Filters"}
          </button>
        </div>

        {loading && <LoadingSpinner />}

        {/* Scrollable LeaderBoard */}
        {!loading && !error && (
          <div className="flex-1 overflow-auto mt-4">
            <SportsLeaderBoard data={sportsmanData} />
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Set Filters"
      >
        <FilterForm initialFilters={filters} onSubmit={handleFilterSubmit} />
      </Modal>
    </div>
  );
}

export default SportLeaderboard;
