import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SearchIcon, X } from "lucide-react";

import AppTable from "../../components/AppTable";
// import AppPagination from "../../components/AppPagination";
import AppModal from "../../components/AppModal";
import { fetchProductSearchKeyword } from "../../api/product";
import DateRangePicker from "../../components/DateRangePicker";
import AppCustomCalendar from "../../components/AppCustomCalendar";
import { MultiSelect } from "../../components/MultiSelect";

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

  const startDate = params.startDate || "";
  const endDate = params.endDate || "";

  // ✅ FIX: read filters from URL
  const brands = params.brand || "";
  const categories = params.category || "";
  const productTypes = params.product_type || "";

  const isKeyword = searchParams.get("fromDashboard") === "true";

  // ✅ FIXED API CALL (ONLY CHANGE HERE)
  const { data: listData, isLoading } = useQuery({
    queryKey: [
      "search-keywords",
      page,
      sortKey,
      sortDirection,
      searchQuery,
      startDate,
      endDate,
      brands,
      categories,
      productTypes,
    ],
    queryFn: () =>
      fetchProductSearchKeyword({
        page,
        sort_by: sortKey,
        order: sortDirection,
        search: searchQuery,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        brand: brands || undefined,
        category: categories || undefined,
        product_type: productTypes || undefined,

        nonZero:
          type === "non_zero" ? true : type === "zero" ? false : undefined,
      }),
  });

  const updateParams = (newParams: Record<string, string>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) updated.set(key, value);
      else updated.delete(key);
    });
    setSearchParams(updated);
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

                navigate(
                  `/product?${urlParams.toString()}&isKeyword=true&end_date=${row?.created_at}`,
                );
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
      key: "created_at",
      label: "Created At",
      width: "180px",
      render: (_: any, row: any) => {
        if (!row?.created_at) return "--";

        const date = new Date(row.created_at);

        return (
          <span className="text-sm text-gray-700">
            {date.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50">
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
            <div className="flex justify-center items-center gap-6">
              <AppCustomCalendar />
              <DateRangePicker />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 pt-6">
          <MultiSelect
            options={listData?.meta?.facets?.brand || []}
            value={brands.split(",").filter(Boolean)}
            onChange={(v) => updateParams({ brand: v.join(","), page: "1" })}
            placeholder="Filter by Brands"
          />

          <MultiSelect
            options={listData?.meta?.facets?.product_type || []}
            value={productTypes.split(",").filter(Boolean)}
            onChange={(v) =>
              updateParams({ product_type: v.join(","), page: "1" })
            }
            placeholder="Filter by Product Type"
          />

          <MultiSelect
            options={listData?.meta?.facets?.category || []}
            value={categories.split(",").filter(Boolean)}
            onChange={(v) => updateParams({ category: v.join(","), page: "1" })}
            placeholder="Filter by category"
          />

          {/* 🔥 CLEAR ALL BUTTON */}
          {(brands ||
            categories ||
            productTypes ||
            searchQuery ||
            startDate ||
            endDate) && (
            <button
              onClick={() => {
                setSearchParams({});
                setSortKey("");
                setSortDirection("asc");
              }}
              className="px-2 py-1 text-sm text-red-600 hover:text-red-800 font-medium transition-colors underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        {/* SEARCH */}
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

        {/* TABLE */}
        <div className="p-8 space-y-4">
          <AppTable
            columns={columns}
            data={Array.isArray(listData?.data) ? listData.data : []}
            isLoading={isLoading}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </div>

      <AppModal
        isOpen={viewModal}
        onClose={handleCloseModal}
        title="Search Keyword (Tokens)"
      >
        <pre className="bg-black text-green-400 p-4 text-xs overflow-auto">
          {JSON.stringify(selectedRow?.query ?? {}, null, 2)}
        </pre>
      </AppModal>
    </>
  );
};

export default ProductSearchKeyword;
