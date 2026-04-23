import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, SearchIcon, X } from "lucide-react";

import AppTable from "../../components/AppTable";
import AppPagination from "../../components/AppPagination";
import AppModal from "../../components/AppModal";
import { fetchProductSearchKeyword } from "../../api/product";
import DateRangePicker from "../../components/DateRangePicker";

const ProductSearchKeyword = () => {
  const navigate = useNavigate();
  const [viewModal, setViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const searchQuery = params.search || "";
  const page = Number(params.page) || 1;
  const type = params.type || "all";

  // These are now driven by the URL (via DateRangePicker)
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";
  const isKeyword = searchParams.get("fromDashboard") === "true";

  const {
    data: listData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "search-keywords",
      page,
      sortKey,
      sortDirection,
      searchQuery,
      startDate,
      endDate,
    ],
    queryFn: () =>
      fetchProductSearchKeyword({
        page,
        sort_by: sortKey,
        order: sortDirection,
        search: searchQuery,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        nonZero:
          type === "non_zero" ? true : type === "zero" ? false : undefined,
      }),
  });

  // Simplified updateParams (only handles non-date filters like Search and Page)
  const updateParams = (newParams: Record<string, string>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) updated.set(key, value);
      else updated.delete(key);
    });
    setSearchParams(updated);
  };

  const handleOpenModal = (row: any) => {
    if (!row) return;
    setSelectedRow(row);
    setViewModal(true);
  };

  const handleCloseModal = () => {
    setViewModal(false);
    setSelectedRow(null);
  };

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const columns = [
    {
      key: "q",
      label: "Search Keywords",
      sortable: true,
      render: (_: any, row: any) => {
        const value = row?.q;
        if (!value) return "--";
        const trimmed = value.trim();
        const cleanValue =
          trimmed.startsWith('"') && trimmed.endsWith('"')
            ? trimmed.slice(1, -1)
            : trimmed;

        return (
          <div
            className="whitespace-pre-wrap wrap-break-word text-sm text-gray-900"
            title={cleanValue}
          >
            {cleanValue}
          </div>
        );
      },
    },
    {
      key: "url",
      label: "URL",
      render: (_: any, row: any) => {
        if (!row?.url) return "--";
        return (
          <button
            onClick={() => {
              try {
                const urlObj = new URL(row.url);
                const urlParams = new URLSearchParams(urlObj.search);
                urlParams.delete("isKeyword");
                if (startDate) urlParams.set("startDate", startDate);
                if (endDate) urlParams.set("endDate", endDate);
                navigate(`/product?${urlParams.toString()}&isKeyword=true`);
              } catch (e) {
                console.error("Invalid URL:", row.url);
              }
            }}
            className="text-blue-600 underline cursor-pointer"
          >
            Open
          </button>
        );
      },
    },
    {
      key: "search_count",
      sortable: true,
      label: "No of search",
    },
    {
      key: "total_result",
      sortable: true,
      label: "No of Result",
      render: (_: any, row: any) => row?.total_result ?? "--",
    },
    {
      key: "actions",
      label: "Actions",
      width: "100px",
      sortable: false,
      render: (_: any, row: any) => (
        <div
          onClick={() => handleOpenModal(row)}
          className="flex items-center justify-center cursor-pointer"
        >
          <button className="p-1 hover:bg-gray-100 text-gray-600 rounded transition-colors">
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50">
        {/* Header */}
        <div className="px-8 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {isKeyword && (
              <button
                onClick={() => navigate(-1)}
                className="px-3 cursor-pointer py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg shadow-sm transition whitespace-nowrap"
              >
                ← Back
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Product Search Keywords
              </h1>
              <p className="text-sm text-gray-500">
                Track user search queries and results
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-end gap-4">
            {/* ✅ REUSABLE DATE FILTER COMPONENT */}
            <DateRangePicker />

            <div className="bg-white p-3 rounded-xl ">
              <p className="text-sm text-gray-700">
                Search Keywords: {listData?.meta?.total ?? 0}
              </p>
              <p className="text-sm text-gray-700">
                Unique Keywords: {listData?.meta?.unique ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 pt-6">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                updateParams({ search: e.target.value, page: "1" })
              }
              placeholder="Search keywords"
              className="w-full rounded-md pl-10 pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#F1F5F9]"
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => updateParams({ search: "", page: "1" })}
              />
            )}
          </div>
        </div>

        {/* Clear All */}
        {(params.search || sortKey || startDate || endDate) && (
          <div className="flex justify-end mr-8 mt-2">
            <button
              className="px-3 py-1 text-[12px] text-red-700 hover:text-red-900 rounded transition cursor-pointer"
              onClick={() => {
                setSearchParams({});
                setSortKey("");
                setSortDirection("asc");
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-8 space-y-4">
          <div className="flex justify-end">
            <AppPagination
              total={listData?.meta?.unique || 0}
              page={page}
              size={50}
              onPageChange={(p) => {
                updateParams({ page: String(p) });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          {isError && (
            <div className="text-red-500 text-sm">Failed to load data.</div>
          )}

          <AppTable
            columns={columns}
            data={Array.isArray(listData?.data) ? listData.data : []}
            isLoading={isLoading}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          <div className="flex justify-end">
            <AppPagination
              total={listData?.meta?.unique || 0}
              page={page}
              size={50}
              onPageChange={(p) => {
                updateParams({ page: String(p) });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          {!isLoading && !listData?.data?.length && (
            <div className="text-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      <AppModal
        isOpen={viewModal}
        onClose={handleCloseModal}
        title="Search Keyword (Tokens)"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <pre className="bg-black text-green-400 p-4 text-xs overflow-auto">
            {JSON.stringify(selectedRow?.query ?? {}, null, 2)}
          </pre>
        </div>
      </AppModal>
    </>
  );
};

export default ProductSearchKeyword;
