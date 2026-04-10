import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { RangeType } from "../types/dashboard";
import { dashboardProductSearchKey } from "../api/dashboard";

export default function SearchDashboard() {
  const [range, setRange] = useState<RangeType>("all");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["search-dashboard", range],
    queryFn: () => dashboardProductSearchKey(range),
    staleTime: 30_000,
  });

  const kpiCard = (
    title: string,
    value: string | number,
    sub?: string,
    color?: string,
  ) => (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>

        {/* RANGE FILTER */}
        <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border">
          {(["all", "day", "week", "month"] as RangeType[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md transition cursor-pointer ${
                range === r
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
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
          {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {kpiCard("Total Searches", data.total_searches)}
            {kpiCard("Unique Searches", data.unique_searches)}
            {kpiCard(
              "Successful Searches",
              data.successful_searches,
              `${(
                (data.successful_searches / data.total_searches) * 100 || 0
              ).toFixed(1)}% success`,
              "text-green-600",
            )}
            {kpiCard(
              "Zero Result Searches",
              data.zero_result_searches,
              `${data.failure_rate_percent}% failure`,
              "text-red-500",
            )}
            {kpiCard(
              "Avg Results/Search",
              data.avg_results_per_search.toFixed(1),
            )}
            {kpiCard(
              "Unique Success Keywords",
              data.unique_successful_keywords,
            )}
            {kpiCard("Unique Failed Keywords", data.unique_failed_keywords)}
          </div>

          {/* TOP KEYWORD CARD */}
          {/* <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-md">
            <p className="text-sm opacity-80">Top Keyword</p>
            <p className="text-2xl font-bold mt-1">
              {data.top_keyword?.q || "N/A"}
            </p>
            <p className="text-sm mt-1 opacity-90">
              Searches: {data.top_keyword?.count || 0}
            </p>
          </div> */}

          {/* SUMMARY SECTION */}
          {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border">
              <h3 className="font-semibold mb-2">Performance</h3>
              <p className="text-sm text-gray-600">
                Failure Rate:{" "}
                <span className="font-bold text-red-500">
                  {data.failure_rate_percent}%
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Success Rate:{" "}
                <span className="font-bold text-green-600">
                  {(100 - data.failure_rate_percent).toFixed(1)}%
                </span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border">
              <h3 className="font-semibold mb-2">Insight</h3>
              <p className="text-sm text-gray-600">
                {data.zero_result_searches > data.unique_failed_keywords
                  ? "Multiple repeated zero-result queries detected. Consider improving search indexing."
                  : "Search quality is stable."}
              </p>
            </div>
          </div> */}

          {/* REFRESH INDICATOR */}
          {isFetching && (
            <p className="text-xs text-gray-400 mt-4">Updating...</p>
          )}
        </>
      )}
    </div>
  );
}
