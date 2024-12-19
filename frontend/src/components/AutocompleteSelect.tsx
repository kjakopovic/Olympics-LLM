import { useState } from "react";

interface AutocompleteSelectProps {
    suggestionsList: string[];
    inputBoxName?: string;
    placeholder?: string;
    selectedItem: string;
    setSelectedItem: (selected: string) => void;
}

const AutocompleteSelect: React.FC<AutocompleteSelectProps> = ({
    suggestionsList,
    selectedItem,
    setSelectedItem,
    inputBoxName = "input-box",
    placeholder = "Start typing...",
}) => {
    // State to manage the input value and filtered suggestions
    // const [inputValue, setInputValue] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestionsList);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

    // Handle input change
    const handleInputChange = (e: any) => {
        const value = e.target.value;
        setSelectedItem(value);

        // Filter suggestions
        if (value.trim() === "") {
            setFilteredSuggestions(suggestionsList);
        } else {
            const filtered = suggestionsList.filter((suggestion) =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            );

            setFilteredSuggestions(filtered);
        }

        setIsSuggestionsVisible(true);
    };

    const handleSuggestionClick = (suggestion: any) => {
        setSelectedItem(suggestion);
        setIsSuggestionsVisible(false);
    };

    return (
        <div className="w-full">
            {/* Input Field */}
            <input
                type="text"
                name={inputBoxName}
                value={selectedItem}
                onChange={handleInputChange}
                onClick={() => setIsSuggestionsVisible(true)}
                onBlur={() => {
                    setTimeout(() => setIsSuggestionsVisible(false), 250);
                }}
                placeholder={placeholder}
                className="w-full p-[8px] rounded-lg bg-primary-200 text-white focus:outline-none"
            />

            {/* Suggestions List */}
            {isSuggestionsVisible && filteredSuggestions.length > 0 && (
                <ul
                    className="max-h-[150px] overflow-y-auto rounded-lg bg-primary-200 p-0"
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-[8px] cursor-pointer hover:bg-primary-200 bg-primary-100 text-white"
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}

            {/* No suggestions */}
            {isSuggestionsVisible && filteredSuggestions.length === 0 && (
                <div className="mt-[5px] text-[#888888] font-[14px]">
                    No suggestions found.
                </div>
            )}
        </div>
    );
};

export default AutocompleteSelect;