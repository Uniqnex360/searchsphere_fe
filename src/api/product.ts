// src/api/products.ts
import { api } from "./axios";

export const fetchProducts = async (filters: {
  q?: string;
  brands?: string[];
  category?: string[];
  price?: { price_min: number; price_max: number }[];
}) => {
  const params: any = {};
  if (filters.q) params.q = filters.q;
  if (filters.brands?.length) params.brand = filters.brands;
  if (filters.category?.length) params.category = filters.category;

  // Support multiple price ranges in API
  // if (filters.price?.length) {
  //   filters.price.forEach((range, idx) => {
  //     params[`price_min[${idx}]`] = range.price_min;
  //     params[`price_max[${idx}]`] = range.price_max;
  //   });
  // }
  if (filters.price?.length) {
    const selectedRange = filters.price[0]; // take the first selected range
    params.price_min = selectedRange.price_min;
    params.price_max = selectedRange.price_max;
  }

  const res = await api.get("/product/vector/auto-complete/", { params });
  return res.data;
};

export const fetchProductsFilterMeta = async () => {
  const res = await api.get("/product/filter-meta/");
  return res.data;
};
