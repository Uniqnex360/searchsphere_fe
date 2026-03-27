// src/api/products.ts
import { api } from "./axios";

export const fetchProducts = async (filters: {
  q?: string;
  brands?: string[];
  category?: string[];
  price?: string[]; // now accepts labels like "$50 - $12,837.5"
  sortBy?: string;
  page?: number;
}) => {
  console.log("price", filters.price);

  const params: any = {};
  if (filters.q) params.q = filters.q;
  if (filters.brands?.length) params.brand = filters.brands;
  if (filters.category?.length) params.category = filters.category;
  if (filters.page) params.page = filters.page;

  // ===============================
  // HANDLE PRICE LABELS
  // ===============================
  if (filters.price?.length) {
    // Take the first selected price label (singleSelect)
    const label = filters.price[0];

    // Parse numbers from string
    // Example: "$50 - $12,837.5" -> ["50", "12837.5"]
    const numbers = label
      .match(/[\d,.]+/g)
      ?.map((n) => Number(n.replace(/,/g, "")));

    if (numbers && numbers.length === 2) {
      params.price_min = numbers[0];
      params.price_max = numbers[1];
    }
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

  const res = await api.get("product/v4/auto-complete/", {
    params,
    headers: {
      "X-FE-URL": window.location.href,
    },
  });
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
