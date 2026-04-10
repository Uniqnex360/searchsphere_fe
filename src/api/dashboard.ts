import { api } from "./axios";

import type { DashboardResponse, RangeType } from "../types/dashboard";

export const dashboardProductSearchKey = async (range: RangeType) => {
  const res = await api.get<DashboardResponse>(
    `/dashboard/product/search-keywords/?range=${range}`,
  );
  return res.data;
};
