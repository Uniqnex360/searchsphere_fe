// src/api/products.ts
import { api } from "./axios";

export const fetchProducts = async (query: string) => {
  if (!query) return [];
  console.log("query", query, "i am working")
  const res = await api.get("/product/vector/auto-complete/", {
    params: { q: query },
  });

  return res.data;
};
