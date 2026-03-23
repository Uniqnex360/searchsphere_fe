// src/api/products.ts
import { api } from "./axios";

export const fetchProducts = async (filters: {
  q?: string;
  brands?: string[];
  category?: string[];
  price?: { price_min: number; price_max: number }[];
  sortBy?: string;
}) => {
  const params: any = {};
  if (filters.q) params.q = filters.q;
  if (filters.brands?.length) params.brand = filters.brands;
  if (filters.category?.length) params.category = filters.category;

  if (filters.price?.length) {
    const selectedRange = filters.price[0]; // take the first selected range
    params.price_min = selectedRange.price_min;
    params.price_max = selectedRange.price_max;
  }

  // -----------------------------
  // Sort map
  // -----------------------------
  const sortMap: Record<string, { sort_by: string; sort_order: string }> = {
    "Product Name (A → Z)": { sort_by: "product_name", sort_order: "asc" },
    "Product Name (Z → A)": { sort_by: "product_name", sort_order: "desc" },
    "Price (Low → High)": { sort_by: "base_price", sort_order: "asc" },
    "Price (High → Low)": { sort_by: "base_price", sort_order: "desc" },
  };

  if (filters.sortBy && sortMap[filters.sortBy]) {
    params.sort_by = sortMap[filters.sortBy].sort_by;
    params.sort_order = sortMap[filters.sortBy].sort_order;
  } else {
    params.sort_by = "relevance";
    params.sort_order = "desc";
  }

  const res = await api.get("/product/vector/auto-complete/", { params });
  return res.data;
};

export const fetchProductsFilterMeta = async () => {
  const res = await api.get("/product/filter-meta/");
  return res.data;
};

export const fetchProductDetail = async (id: number | string) => {
  const res = await api.get(`product/detail/${id}/`);
  return res.data;
};
