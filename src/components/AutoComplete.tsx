import { useState, useEffect, useRef } from "react";
import { SearchIcon, X } from "lucide-react";

type Item = {
  text: string;
};

type AutoCompleteProps = {
  primaryData: Item[];
  fallbackData: Item[];
  fallbackType?: "did_you_mean" | "top_brands" | null; // 🔥 NEW
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
  primaryData,
  fallbackData,
  fallbackType, // 🔥 NEW
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
  const [isUserTyping, setIsUserTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value && isUserTyping) {
      setOpen(true);
    }
  }, [value, isUserTyping]);

  const triggerSearch = (val: string) => {
    if (val.trim()) {
      onSelect(val);
    }
    setOpen(false);
    setIsUserTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch(value);
    }
  };

  // 🔥 Decide which data to show
  const showPrimary = primaryData.length > 0;
  const showFallback = !showPrimary && fallbackData.length > 0;

  // 🔥 Dynamic label
  const getFallbackLabel = () => {
    if (fallbackType === "did_you_mean") return "Did you mean";
    if (fallbackType === "top_brands") return "Top brands you can explore";
    return "Suggestions";
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
            setIsUserTyping(true);
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (isUserTyping && value) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-md pl-10 pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#F1F5F9] ${inputClassName}`}
        />

        {/* Clear button */}
        {value && (
          <X
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={() => {
              onChange("");
              setOpen(false);
              setIsUserTyping(false);
            }}
          />
        )}
      </div>

      {/* Dropdown */}
      {open && value && (
        <div
          className={`absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Loading...</div>
          ) : showPrimary ? (
            // ✅ PRIMARY RESULTS
            primaryData.map((item) => (
              <div
                key={item.text}
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
          ) : showFallback ? (
            <>
              {/* 🔥 DYNAMIC FALLBACK LABEL */}
              <div className="px-3 py-1 text-sm text-gray-400 border-b">
                {getFallbackLabel()}
              </div>

              {fallbackData.map((item) => (
                <div
                  key={item.text}
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
              ))}
            </>
          ) : (
            <div className="p-2 text-sm text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
