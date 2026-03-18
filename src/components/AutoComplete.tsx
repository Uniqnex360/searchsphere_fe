import { useState, useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (value) setOpen(true);
  }, [value]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${inputClassName}`}
      />

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {data.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No results found.</div>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${itemClassName}`}
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
