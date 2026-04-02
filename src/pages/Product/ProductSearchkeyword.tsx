import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Eye, SearchIcon } from "lucide-react";

import AppTable from "../../components/AppTable";
import AppPagination from "../../components/AppPagination";
import AppModal from "../../components/AppModal";
import { fetchProductSearchKeyword } from "../../api/product";

const ProductSearchKeyword = () => {
  const [viewModal, setViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [searchParams, setSearchParams] = useSearchParams();

  const params = Object.fromEntries(searchParams.entries());
  const searchQuery = params.search || "";
  const page = Number(params.page) || 1;
  const size = 50;

  const {
    data: listData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search-keywords", page, sortKey, sortDirection, searchQuery],
    queryFn: () =>
      fetchProductSearchKeyword({
        page,
        sort_by: sortKey,
        order: sortDirection,
        search: searchQuery,
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
      // toggle direction
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

        // Remove surrounding quotes if present
        const trimmed = value.trim();
        const cleanValue =
          trimmed.startsWith('"') && trimmed.endsWith('"')
            ? trimmed.slice(1, -1)
            : trimmed;

        // Split by line breaks or just return wrapped div
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
          <>
            <a href={row.url} className="text-blue-600 underline">
              Open
            </a>
          </>
          // <a
          //   href={row.url}
          //   target="_blank"
          //   rel="noopener noreferrer"
          //   className="text-blue-600 underline"
          // >
          //   Open
          // </a>
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
          <button
            className="p-1 hover:bg-gray-100 text-gray-600 rounded transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  const tokens = selectedRow?.query?.tokens || {};

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50">
        {/* Header */}
        <div className="px-8 pt-6 flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Product Search Keywords
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track user search queries and results
            </p>
          </div>
          <div className="mt-auto">
            <p className="text-sm text-gray-600">
              Total search count: {listData?.meta?.total}
            </p>
            <p className="text-sm text-gray-600">
              Total unique count: {listData?.meta?.unique}
            </p>
          </div>
        </div>
        <div className="px-8 pt-6">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type="text"
              value={searchQuery} // controlled by URL param
              onChange={(e) => {
                updateParams({ search: e.target.value, page: "1" }); // reset page to 1 on new search
              }}
              placeholder="Search keywords"
              className={`w-full rounded-md pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-[#F1F5F9]`}
            />
          </div>
        </div>
        {(params.search || sortKey) && (
          <div className="flex justify-end mr-4">
            <button
              className="ml-auto px-3 py-1 text-[12px] text-red-700 hover:text-red-900 rounded transition cursor-pointer"
              onClick={() => {
                setSearchParams({});
                setSortKey("");
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-8 space-y-4">
          {/* Pagination */}
          <div className="flex justify-end">
            <AppPagination
              total={listData?.meta?.unique || 0}
              page={page}
              size={size}
              onPageChange={(p) => {
                updateParams({ page: String(p) });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          {/* Error State */}
          {isError && (
            <div className="text-red-500 text-sm">Failed to load data.</div>
          )}

          {/* Table */}
          <AppTable
            columns={columns}
            data={Array.isArray(listData?.data) ? listData.data : []}
            isLoading={isLoading}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {/* Empty State */}
          {!isLoading && !listData?.data?.length && (
            <div className="text-center text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AppModal
        isOpen={viewModal}
        onClose={handleCloseModal}
        title="Search Keyword (Tokens)"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {!selectedRow ? (
            <div className="text-gray-500 text-sm">No data selected</div>
          ) : (
            <div className="space-y-6 text-sm">
              {/* Query */}
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Search Query
                </p>
                <p className="text-gray-800 font-medium mt-1">
                  {selectedRow?.query?.q || "--"}
                </p>
              </div>

              {/* URL */}
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  URL
                </p>
                {selectedRow?.url ? (
                  <a
                    href={selectedRow.url}
                    target="_blank"
                    className="text-blue-600 underline break-all mt-1 inline-block"
                  >
                    {selectedRow.url}
                  </a>
                ) : (
                  <p className="text-gray-500 mt-1">--</p>
                )}
              </div>

              {/* Tokens */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Tokens Breakdown
                </p>

                {Object.keys(tokens).length === 0 ? (
                  <p className="text-gray-500">No token data</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(tokens).map(([key, value]: any) => (
                      <div
                        key={key}
                        className="p-4 border rounded-lg bg-gray-50 space-y-2"
                      >
                        <p className="font-semibold text-gray-800">{key}</p>

                        <div className="text-gray-600">
                          <span className="font-medium">Tokenizer:</span>{" "}
                          {value?.tokenizer?.length
                            ? value.tokenizer.join(", ")
                            : "--"}
                        </div>

                        <div className="text-gray-600">
                          <span className="font-medium">Lowercase:</span>{" "}
                          {value?.filters?.lowercase?.length
                            ? value.filters.lowercase.join(", ")
                            : "--"}
                        </div>

                        <div className="text-gray-600">
                          <span className="font-medium">Ascii Folding:</span>{" "}
                          {value?.filters?.asciifolding?.length
                            ? value.filters.asciifolding.join(", ")
                            : "--"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Debug JSON */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Raw Data
                </p>
                <pre className="bg-black text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(selectedRow?.query ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </AppModal>
    </>
  );
};

export default ProductSearchKeyword;
