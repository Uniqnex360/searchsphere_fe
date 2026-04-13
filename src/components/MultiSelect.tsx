import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  selectAllLabel?: string;
  singleSelect?: boolean;

  triggerType?: "box" | "icon";
  icon?: ReactNode;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = true,
  selectAllLabel = "Select All",
  singleSelect = false,
  triggerType = "box",
  icon,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tempValue, setTempValue] = useState<string[]>(value);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const filteredOptions = searchable
    ? options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    : options;

  const allSelected = options.length > 0 && tempValue.length === options.length;

  const toggleOption = (option: string) => {
    if (singleSelect) {
      onChange([option]);
      setIsOpen(false);
      return;
    }

    if (tempValue.includes(option)) {
      setTempValue(tempValue.filter((v) => v !== option));
    } else {
      setTempValue([...tempValue, option]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setTempValue([]);
    } else {
      setTempValue(options);
    }
  };

  const applySelection = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setTempValue(value);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const visibleValues = value.slice(0, 2);
  const remainingCount = value.length - 2;
  const isAll = options.length > 0 && value.length === options.length;

  return (
    <div className="relative inline-block w-full" ref={wrapperRef}>
      {/* TRIGGER */}
      {triggerType === "icon" ? (
        <div
          className="cursor-pointer text-gray-600"
          onClick={() => setIsOpen((p) => !p)}
        >
          {icon || <ChevronDown size={20} />}
        </div>
      ) : (
        <div
          className="flex items-center gap-1 w-full px-3 py-2 border border-gray-200 rounded-lg cursor-pointer bg-white"
          onClick={() => setIsOpen((p) => !p)}
        >
          {value.length === 0 && (
            <span className="text-sm text-gray-400 truncate">
              {placeholder}
            </span>
          )}

          {/* ALL PILL */}
          {isAll && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              All
            </span>
          )}

          {/* NORMAL PILLS */}
          {!isAll && (
            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
              {visibleValues.map((val) => (
                <span
                  key={val}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded max-w-[120px] truncate"
                >
                  <span className="truncate">{val}</span>
                  {!singleSelect && (
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = tempValue.filter((v) => v !== val);
                        setTempValue(updated);
                        onChange(updated);
                      }}
                    />
                  )}
                </span>
              ))}

              {remainingCount > 0 && (
                <span className="text-xs text-gray-500">
                  +{remainingCount} more
                </span>
              )}
            </div>
          )}

          <ChevronDown size={18} className="ml-auto text-gray-400" />
        </div>
      )}

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute z-[1000] mt-1 w-[260px] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[450px] flex flex-col">
          {/* STICKY HEADER */}
          <div className="sticky top-0 bg-white border-b z-10">
            {searchable && (
              <div className="p-2">
                <input
                  type="text"
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}

            {!singleSelect && (
              <div className="px-2 pb-2 flex justify-end">
                <button
                  onClick={applySelection}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          {/* OPTIONS */}
          <div className="flex-1 overflow-y-auto">
            {!singleSelect && (
              <div
                className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center gap-2 border-b"
                onClick={toggleSelectAll}
              >
                <input type="checkbox" readOnly checked={allSelected} />
                {selectAllLabel}
              </div>
            )}

            {filteredOptions.map((option) => (
              <div
                key={option}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center gap-2"
                onClick={() => toggleOption(option)}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={tempValue.includes(option)}
                />
                <span className="truncate">{option}</span>
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
