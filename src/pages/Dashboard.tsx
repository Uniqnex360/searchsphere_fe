import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { dashboardProductSearchKey } from "../api/dashboard";

export default function SearchDashboard() {
  const navigate = useNavigate();

  // URL state
  const [searchParams, setSearchParams] = useSearchParams();

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["search-dashboard", startDate, endDate],
    queryFn: () =>
      dashboardProductSearchKey(startDate || null, endDate || null),
  });

  // helper to update params
  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) newParams.set(key, value);
    else newParams.delete(key);

    setSearchParams(newParams, { replace: true });
  };

  // ✅ ONLY FIX: normalize URL before adding dates
  const kpiCard = (
    title: string,
    value: string | number,
    sub?: string,
    color?: string,
    navigateStr?: string,
  ) => (
    <div
      className="bg-white cursor-pointer rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition"
      onClick={() => {
        if (navigateStr) {
          const [path, existingQuery] = navigateStr.split("?");

          const params = new URLSearchParams(existingQuery || "");

          if (startDate) params.set("startDate", startDate);
          if (endDate) params.set("endDate", endDate);

          const queryString = params.toString();

          navigate(queryString ? `${path}?${queryString}` : path);
        }
      }}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-gray-900"}`}>
        {value ?? 0}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Search Dashboard</h1>

        {/* DATE FILTER */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Start Date</label>
            <input
              type="date"
              value={startDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => updateParam("startDate", e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500">End Date</label>
            <input
              type="date"
              value={endDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => updateParam("endDate", e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            />
          </div>

          <button
            onClick={() => setSearchParams({}, { replace: true })}
            className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Failed to load dashboard data
          <button
            onClick={() => refetch()}
            className="ml-3 underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* CONTENT */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {kpiCard(
              "Total Searches",
              data.total_searches,
              undefined,
              undefined,
              "/product/search/keyword",
            )}

            {kpiCard(
              "Unique Searches",
              data.unique_searches,
              undefined,
              undefined,
              "/product/search/keyword",
            )}

            {kpiCard(
              "Successful Searches",
              data.successful_searches,
              `${
                data.total_searches
                  ? (
                      (data.successful_searches / data.total_searches) *
                      100
                    ).toFixed(1)
                  : "0.0"
              }% success`,
              "text-green-600",
              "/product/search/keyword?type=non_zero",
            )}

            {kpiCard(
              "Zero Result Searches",
              data.zero_result_searches,
              `${data.failure_rate_percent}% failure`,
              "text-red-500",
              "/product/search/keyword?type=zero",
            )}

            {kpiCard(
              "Avg Results/Search",
              data.avg_results_per_search.toFixed(1),
            )}

            {kpiCard(
              "Unique Success Keywords",
              data.unique_successful_keywords,
              undefined,
              undefined,
              "/product/search/keyword?type=non_zero",
            )}

            {kpiCard(
              "Zero Result Keywords",
              data.unique_failed_keywords,
              undefined,
              undefined,
              "/product/search/keyword?type=zero",
            )}
          </div>

          {isFetching && (
            <p className="text-xs text-gray-400 mt-4">Updating...</p>
          )}
        </>
      )}
    </div>
  );
}
