import { api } from "./axios";

import type { DashboardResponse } from "../types/dashboard";

export const dashboardProductSearchKey = async (
  start_date: string | null,
  end_date: string | null,
) => {
  const params = new URLSearchParams();

  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);

  const res = await api.get<DashboardResponse>(
    `/dashboard/product/search-keywords/?${params.toString()}`,
  );

  return res.data;
};
