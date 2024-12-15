"use client";

import React, { useState } from "react";
import { olympicSports } from "@/constants/olympicSports";

interface SportFilters {
  medal: string;
  name: string;
  sex: string;
  sport: string;
  event_name: string;
  country: string;
}

interface FilterFormProps {
  initialFilters: SportFilters;
  onSubmit: (filters: SportFilters) => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  initialFilters,
  onSubmit,
}) => {
  const [formFilters, setFormFilters] = useState<SportFilters>(initialFilters);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formFilters);
  };

  const handleReset = () => {
    setFormFilters({
      medal: "",
      name: "",
      sex: "",
      sport: "",
      event_name: "",
      country: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Medal Filter */}
      <div>
        <label
          htmlFor="medal"
          className="block text-sm font-medium text-white/90"
        >
          Medal
        </label>
        <select
          id="medal"
          name="medal"
          value={formFilters.medal}
          onChange={handleChange}
          className="mt-1 block w-full bg-transparent border border-accent text-white rounded-md shadow-sm p-2 focus:ring-accent focus:outline-none pr-5"
        >
          <option value="">All Medals</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
        </select>
      </div>

      {/* Name Filter */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-white/90"
        >
          Sportsman Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formFilters.name}
          onChange={handleChange}
          placeholder="Enter sportsman name"
          className="mt-1 block w-full border bg-transparent border-accent rounded-md shadow-sm p-2 focus:outline-none text-white"
        />
      </div>

      {/* Sex Filter */}
      <div>
        <label
          htmlFor="sex"
          className="block text-sm font-medium text-white/90"
        >
          Sex
        </label>
        <select
          id="sex"
          name="sex"
          value={formFilters.sex}
          onChange={handleChange}
          className="mt-1 block w-full bg-transparent border border-accent text-white rounded-md shadow-sm p-2 focus:ring-accent focus:outline-none pr-5"
        >
          <option value="">All Sexes</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>

      {/* Sport Filter with Suggestions */}
      <div>
        <label
          htmlFor="sport"
          className="block text-sm font-medium text-white/90"
        >
          Sport
        </label>
        <input
          type="text"
          name="sport"
          id="sport"
          value={formFilters.sport}
          onChange={handleChange}
          placeholder="Enter sport"
          list="olympic-sports"
          className="mt-1 block w-full border bg-transparent border-accent rounded-md shadow-sm p-2 focus:outline-none text-white"
        />
        <datalist id="olympic-sports">
          {olympicSports.map((sport, index) => (
            <option value={sport} key={index} />
          ))}
        </datalist>
      </div>

      {/* Event Name Filter */}
      <div>
        <label
          htmlFor="event_name"
          className="block text-sm font-medium text-white/90"
        >
          Event Name
        </label>
        <input
          type="text"
          name="event_name"
          id="event_name"
          value={formFilters.event_name}
          onChange={handleChange}
          placeholder="Enter event name"
          className="mt-1 block w-full border bg-transparent border-accent rounded-md shadow-sm p-2 focus:outline-none text-white"
        />
      </div>

      {/* Country Filter */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-white/90"
        >
          Country
        </label>
        <input
          type="text"
          name="country"
          id="country"
          value={formFilters.country}
          onChange={handleChange}
          placeholder="Enter country"
          className="mt-1 block w-full border bg-transparent border-accent rounded-md shadow-sm p-2 focus:outline-none text-white"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-primary-300 text-white/90 rounded-md hover:shadow-silver2glow transition-colors duration-200"
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-primary-50 rounded-md hover:shadow-accentglow transition-colors duration-200"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};

export default FilterForm;
