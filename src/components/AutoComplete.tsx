import { useState, useEffect, useRef } from "react";
import { SearchIcon } from "lucide-react";

type Item = {
  id: string;
  name: string;
  brand?: string;
  category?: string;
};

type AutoCompleteProps = {
  data: Item[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: Item) => void;
  placeholder?: string;

  // 🎨 Custom styling
  inputClassName?: string;
  dropdownClassName?: string;
  itemClassName?: string;
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
}: AutoCompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open dropdown when typing
  useEffect(() => {
    if (value) {
      setOpen(true);
      setHighlightedIndex(0);
    }
  }, [value]);

  // Reset highlight when closed
  useEffect(() => {
    if (!open) setHighlightedIndex(-1);
  }, [open]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (data[highlightedIndex]) {
        onSelect(data[highlightedIndex]);
        setOpen(false);
      } else if (value.trim()) {
        console.log("Entered value:", value);
        setOpen(false);
      }
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
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-md pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#F1F5F9] ${inputClassName}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {data.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">Search Products</div>
          ) : (
            data.map((item, index) => (
              <div
                key={item.id}
                //@ts-ignore
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer transition-all duration-150
                  ${
                    index === highlightedIndex
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }
                  active:bg-blue-200
                  ${itemClassName}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">
                    {item.brand} • {item.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
