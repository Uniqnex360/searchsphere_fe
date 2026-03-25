import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface AppPaginationProps {
  total: number; // total items
  page: number; // current page (1-indexed)
  size: number; // items per page
  onPageChange: (page: number) => void; // callback when page changes
}

const AppPagination: React.FC<AppPaginationProps> = ({
  total,
  page,
  size,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / size);
  const [inputPage, setInputPage] = useState<string>("");

  if (totalPages <= 1) return null;

  const handleGoToPage = () => {
    const pageNum = Number(inputPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setInputPage(""); // reset input after go
    } else {
      toast.error(
        `Please enter a valid page number between 1 and ${totalPages}`,
      );
      setInputPage("");
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      {/* First page button */}
      <button
        title="First Page"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 cursor-pointer"
      >
        <ChevronsLeft size={16} />
      </button>

      {/* Previous page */}
      <button
        title="Previous page"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-2 py-1 rounded border border-gray-300  disabled:opacity-50 cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      {/* Next page */}
      <button
        title="Next page"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-2 py-1 rounded border border-gray-300  disabled:opacity-50 cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>

      {/* Last page button */}
      <button
        title="Last page"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className="px-2 py-1 rounded border border-gray-300  disabled:opacity-50 cursor-pointer"
      >
        <ChevronsRight size={16} />
      </button>

      {/* Go-to page input */}
      <div className="flex items-center gap-1 w-50">
        <input
          type="number"
          min={1}
          max={totalPages}
          placeholder="Go to page"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="w-[110px] px-2 py-1 border border-gray-300  rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGoToPage();
          }}
        />
        <button
          onClick={handleGoToPage}
          className="px-2 py-1 rounded border border-gray-300  bg-gray-100 hover:bg-gray-200 cursor-pointer"
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default AppPagination;
