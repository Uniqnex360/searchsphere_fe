export type RangeType = "all" | "day" | "week" | "month";

export type DashboardResponse = {
  range: string;
  total_searches: number;
  unique_searches: number;
  zero_result_searches: number;
  successful_searches: number;
  avg_results_per_search: number;
  failure_rate_percent: number;
  unique_successful_keywords: number;
  unique_failed_keywords: number;
  top_keyword: {
    q: string | null;
    count: number;
  };
};
