import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

interface DateRangePickerProps {
  // Optional: override styling if needed
  containerClass?: string;
}

export default function DateRangePicker({
  containerClass = "",
}: DateRangePickerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const endDateRef = useRef<HTMLInputElement>(null);

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (key === "startDate") {
      // Logic: If new start date is after current end date, clear end date
      if (endDate && value > endDate) {
        newParams.delete("endDate");
      }
      newParams.set(key, value);
      setSearchParams(newParams, { replace: true });

      // Auto-open the end date calendar
      setTimeout(() => {
        if (endDateRef.current) {
          endDateRef.current.showPicker();
        }
      }, 100);
    } else if (key === "endDate") {
      // Validation: Block end dates earlier than start dates
      if (startDate && value < startDate) {
        toast.error("End date cannot be earlier than start date");
        return;
      }
      newParams.set(key, value);
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleReset = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("startDate");
    newParams.delete("endDate");
    setSearchParams(newParams, { replace: true });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className={`flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200 ${containerClass}`}
    >
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 font-medium">Start Date</label>
        <input
          type="date"
          value={startDate}
          max={today}
          onChange={(e) => updateParam("startDate", e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-gray-500 font-medium">End Date</label>
        <input
          type="date"
          ref={endDateRef}
          value={endDate}
          min={startDate}
          max={today}
          onChange={(e) => updateParam("endDate", e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
        />
      </div>

      <button
        onClick={handleReset}
        className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition self-end cursor-pointer"
      >
        Reset
      </button>
    </div>
  );
}
