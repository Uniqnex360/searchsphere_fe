import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function AppSelect({ options, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300"
      >
        <ArrowUpDown size={16} className="text-gray-500" />

        <span className="text-sm text-gray-700">{value || "Sort By"}</span>

        <ChevronDown size={16} className="text-gray-400" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-65 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[1000]">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                value === option ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
