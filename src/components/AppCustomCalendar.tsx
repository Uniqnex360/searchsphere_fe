import { useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  key: string;
};

const OPTIONS: Option[] = [
  { label: "Today", key: "today" },
  { label: "Yesterday", key: "yesterday" },
  { label: "This Week", key: "this_week" },
  { label: "Last Week", key: "last_week" },
  { label: "Last 7 Days", key: "last_7_days" },
  { label: "Last 14 Days", key: "last_14_days" },
  { label: "Last 30 Days", key: "last_30_days" },
  { label: "Last 60 Days", key: "last_60_days" },
  { label: "Last 90 Days", key: "last_90_days" },
  { label: "This Month", key: "this_month" },
  { label: "Last Month", key: "last_month" },
  { label: "This Quarter", key: "this_quarter" },
  { label: "Last Quarter", key: "last_quarter" },
  { label: "This Year", key: "this_year" },
  { label: "Last Year", key: "last_year" },
];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]; // ✅ YYYY-MM-DD only
}

function getDateRange(key: string) {
  const now = new Date();

  const start = new Date(now);
  const end = new Date(now);

  switch (key) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "yesterday":
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case "this_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "last_week": {
      const day = now.getDay();
      const diff = now.getDate() - day - 6;
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(diff + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "last_7_days":
      start.setDate(now.getDate() - 7);
      break;

    case "last_14_days":
      start.setDate(now.getDate() - 14);
      break;

    case "last_30_days":
      start.setDate(now.getDate() - 30);
      break;

    case "last_60_days":
      start.setDate(now.getDate() - 60);
      break;

    case "last_90_days":
      start.setDate(now.getDate() - 90);
      break;

    case "this_month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;

    case "last_month":
      start.setMonth(now.getMonth() - 1, 1);
      end.setMonth(now.getMonth(), 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3);
      start.setMonth(q * 3, 1);
      start.setHours(0, 0, 0, 0);
      break;
    }

    case "last_quarter": {
      const q = Math.floor(now.getMonth() / 3) - 1;
      start.setMonth(q * 3, 1);
      end.setMonth(q * 3 + 3, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "this_year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;

    case "last_year":
      start.setFullYear(now.getFullYear() - 1, 0, 1);
      end.setFullYear(now.getFullYear() - 1, 11, 31);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

export default function AppCustomCalendar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selected, setSelected] = useState<Option | null>(null); // ✅ FIX
  const [open, setOpen] = useState(false); // ✅ FIX
  const ref = useRef<HTMLDivElement>(null); // ✅ FIX

  const handleChange = (opt: Option) => {
    setSelected(opt);

    const { startDate, endDate } = getDateRange(opt.key);

    const params = Object.fromEntries(searchParams.entries());

    params.startDate = startDate;
    params.endDate = endDate;
    params.page = "1";

    setSearchParams(params);
    setOpen(false);
  };

  // ✅ close outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative w-64" ref={ref}>
      {/* TRIGGER */}
      <div
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:border-gray-300 transition"
      >
        <span className="text-sm text-gray-700 truncate">
          {selected ? selected.label : "Select Date Range"}
        </span>

        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {OPTIONS.map((opt) => (
            <div
              key={opt.key}
              onClick={() => handleChange(opt)}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition ${
                selected?.key === opt.key
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
