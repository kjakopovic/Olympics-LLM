"use client";

import React, { useState } from "react";
import { olympicSports } from "@/constants/olympicSports";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
}

export interface Filters {
  startYear: number | 2000;
  endYear: number | 2024;
  sport: string;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<Filters>({
    startYear: 2000,
    endYear: 2024,
    sport: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name.includes("Year")
        ? value === ""
          ? ""
          : parseInt(value)
        : value,
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleCancel = () => {
    setFilters({
      startYear: 2000,
      endYear: 2024,
      sport: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-primary-100 border-accent rounded-xl w-11/12 max-w-md p-6">
        <h2 className="text-2xl text-white font-jakarta font-semibold mb-4">
          Filters
        </h2>

        {/* Starting Year */}
        <div className="mb-4">
          <label htmlFor="startYear" className="block text-gray-500 mb-2">
            Starting Year
          </label>
          <input
            type="number"
            id="startYear"
            name="startYear"
            value={filters.startYear}
            onChange={handleChange}
            min="1896" // First modern Olympics year
            max={currentYear}
            placeholder="e.g., 2000"
            className="w-full border placeholder:text-primary-500 bg-primary-400 text-white border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Ending Year */}
        <div className="mb-4">
          <label htmlFor="endYear" className="block text-gray-500 mb-2">
            Ending Year
          </label>
          <input
            type="number"
            id="endYear"
            name="endYear"
            value={filters.endYear}
            onChange={handleChange}
            min="1896"
            max={currentYear}
            placeholder="e.g., 2020"
            className="w-full border placeholder:text-primary-500 bg-primary-400 text-white border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Sport Selection */}
        <div className="mb-6">
          <label htmlFor="sport" className="block text-gray-500 mb-2">
            Sport
          </label>
          <select
            id="sport"
            name="sport"
            value={filters.sport}
            onChange={handleChange}
            className="w-full border placeholder:text-primary-500 bg-primary-400 text-white border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent"
          >
            <option value="">Select a sport</option>
            {olympicSports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 hover:shadow-silver2glow bg-primary-500 text-white rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 hover:shadow-accentglow bg-accent text-black rounded-xl"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
