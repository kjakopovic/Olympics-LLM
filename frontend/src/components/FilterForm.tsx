"use client";

import React, { useState } from "react";
import { olympicSports, olympicEvents, olympicTeams } from "@/constants/olympicStaticData";
import AutocompleteSelect from "./AutocompleteSelect";

interface SportFilters {
  medal: string;
  name: string;
  sex: string;
  sport: string;
  event: string;
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
      event: "",
      country: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Medal Filter */}
      <div>
        <label
          htmlFor="medal"
          className="block text-gray-500 mb-2"
        >
          Medal
        </label>
        <select
          id="medal"
          name="medal"
          value={formFilters.medal}
          onChange={handleChange}
          className="mt-1 block w-full bg-primary-200 text-white rounded-lg p-2 focus:outline-none pr-5 custom-select"
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
          className="block text-gray-500 mb-2"
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
          className="mt-1 block w-full bg-primary-200 rounded-lg p-2 focus:outline-none text-white"
        />
      </div>

      {/* Sex Filter */}
      <div>
        <label
          htmlFor="sex"
          className="block text-gray-500 mb-2"
        >
          Sex
        </label>
        <select
          id="sex"
          name="sex"
          value={formFilters.sex}
          onChange={handleChange}
          className="mt-1 block w-full bg-primary-200 text-white rounded-lg p-2 focus:outline-none pr-5 custom-select"
        >
          <option value="">All Sexes</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>

      {/* Sport Filter with Suggestions */}
      <div>
        <label htmlFor="sport" className="block text-gray-500 mb-2">
          Sport
        </label>

        <AutocompleteSelect
          suggestionsList={olympicSports}
          inputBoxName="sport"
          placeholder="Select a sport"
          selectedItem={formFilters.sport}
          setSelectedItem={(value) => {
            setFormFilters((prev) => ({
              ...prev,
              sport: value,
            }));
          }}
        />
      </div>

      {/* Event Name Filter */}
      <div>
        <label
          htmlFor="event_name"
          className="block text-gray-500 mb-2"
        >
          Event Name
        </label>

        <AutocompleteSelect
          suggestionsList={olympicEvents}
          inputBoxName="event_name"
          placeholder="Enter event name"
          selectedItem={formFilters.event}
          setSelectedItem={(value) => {
            setFormFilters((prev) => ({
              ...prev,
              event: value,
            }));
          }}
        />
      </div>

      {/* Country/Team Filter */}
      <div>
        <label
          htmlFor="country"
          className="block text-gray-500 mb-2"
        >
          Country/Team
        </label>

        <AutocompleteSelect
          suggestionsList={olympicTeams}
          inputBoxName="country"
          placeholder="Enter country"
          selectedItem={formFilters.country}
          setSelectedItem={(value) => {
            setFormFilters((prev) => ({
              ...prev,
              country: value,
            }));
          }}
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
