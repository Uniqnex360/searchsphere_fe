import { useState, useEffect, useRef } from "react";
import { SearchIcon } from "lucide-react";

type Item = {
  text: string; // API returns { text: "..." }
};

type AutoCompleteProps = {
  data: Item[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  itemClassName?: string;
  loading?: boolean;
};

export function AutoComplete({
  data,
  value,
  onChange,
  onSelect,
  placeholder = "Search...",
  inputClassName = "",
  dropdownClassName = "",
  itemClassName = "",
  loading = false,
}: AutoCompleteProps) {
  const [open, setOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false); // 🔥 new
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 Open dropdown ONLY when user types (not on initial load)
  useEffect(() => {
    if (value && isUserTyping) {
      setOpen(true);
    }
  }, [value, isUserTyping]);

  // 🔥 shared handler
  const triggerSearch = (val: string) => {
    if (val.trim()) {
      onSelect(val);
    }
    setOpen(false);
    setIsUserTyping(false); // reset
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch(value);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setIsUserTyping(true); // 🔥 detect typing
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (isUserTyping && value) setOpen(true); // 🔥 prevent auto-open on navigation
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-md pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#F1F5F9] ${inputClassName}`}
        />
      </div>

      {/* Dropdown */}
      {open && value && (
        <div
          className={`absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Loading...</div>
          ) : data.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No results</div>
          ) : (
            data.map((item) => (
              <div
                key={item.text}
                // OLD CODE (kept)
                // onClick={() => {
                //   onChange(item.text);
                //   onSelect(item.text);
                //   setOpen(false);
                // }}

                // 🔥 FIXED
                onMouseDown={(e) => {
                  e.preventDefault();

                  const selectedValue = item.text;
                  onChange(selectedValue);
                  triggerSearch(selectedValue);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${itemClassName}`}
              >
                {item.text}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
