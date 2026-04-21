// src/api/products.ts
import { api } from "./axios";

export const fetchProducts = async (filters: {
  q?: string;
  brand?: string; // Changed from brands to brand to match backend expected key
  category?: string;
  product_type?: string;
  price_min?: number | null;
  price_max?: number | null;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  attr_filters?: Record<string, string[]>; // The dynamic attributes dictionary
}) => {
  const params: any = {};

  // 1. Basic Search and Pagination
  if (filters.q) params.q = filters.q;
  if (filters.page) params.page = filters.page;

  // 2. Standard Filters (passing as strings/comma-separated as per URL state)
  if (filters.brand) params.brand = filters.brand;
  if (filters.product_type) params.product_type = filters.product_type;
  if (filters.category) params.category = filters.category;

  // 3. Price Filters
  if (filters.price_min !== null && filters.price_min !== undefined) {
    params.price_min = filters.price_min;
  }
  if (filters.price_max !== null && filters.price_max !== undefined) {
    params.price_max = filters.price_max;
  }

  // 4. Handle Dynamic Attribute Filters
  // Converts { Color: ["Red", "Blue"] } -> { attr_Color: "Red,Blue" }
  if (filters.attr_filters) {
    Object.entries(filters.attr_filters).forEach(([key, values]) => {
      if (values.length > 0) {
        params[`attr_${key}`] = values.join(",");
      }
    });
  }

  // 5. Sorting Logic
  const sortMap: Record<string, { sort_by: string; sort_order: string }> = {
    "Sort by Views": { sort_by: "view_count", sort_order: "desc" },
    "Sort by Search Popularity": {
      sort_by: "search_popularity",
      sort_order: "desc",
    },
    "Product Name (A → Z)": { sort_by: "product_name", sort_order: "asc" },
    "Product Name (Z → A)": { sort_by: "product_name", sort_order: "desc" },
    "Price (Low → High)": { sort_by: "base_price", sort_order: "asc" },
    "Price (High → Low)": { sort_by: "base_price", sort_order: "desc" },
  };

  // Check if it's a raw key (from table headers) or a label (from dropdown)
  const rawSortKeys = [
    "brand",
    "category",
    "product_type",
    "search_popularity",
    "view_count",
  ];

  if (filters.sortBy && rawSortKeys.includes(filters.sortBy)) {
    params.sort_by =
      filters.sortBy === "view_count" ? "view_count" : filters.sortBy;
    params.sort_order = filters.sortDirection || "desc";
  } else if (filters.sortBy && sortMap[filters.sortBy]) {
    params.sort_by = sortMap[filters.sortBy].sort_by;
    params.sort_order = sortMap[filters.sortBy].sort_order;
  } else {
    params.sort_by = "relevance";
    params.sort_order = "desc";
  }

  // 6. API Call
  try {
    const res = await api.get("product/v6/list/", {
      params,
      timeout: 0,
      headers: {
        "X-FE-URL": window.location.href,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchAutosuggestV6 = async (filters: { q?: string }) => {
  const params: any = {};
  if (filters.q) params.q = filters.q;
  const res = await api.get("product/v6/auto-complete/", {
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
  const res = await api.get(`product/detail/${id}/`, { timeout: 0 });
  return res.data;
};

export const fetchProductSearchKeyword = async (filters: {
  page?: number;
  sort_by?: string;
  order?: string;
  search?: string;
  nonZero?: boolean;
  start_date?: string;
  end_date?: string;
}) => {
  const { nonZero, ...rest } = filters;

  let result_type = "all";

  if (nonZero === true) result_type = "non_zero";
  else if (nonZero === false) result_type = "zero";

  const res = await api.get("product/search/keywords/", {
    params: {
      ...rest,
      result_type,
    },
  });

  console.log("response", res.data);
  return res.data;
};

export const productImport = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/import/product/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0,
  });

  return response.data;
};

export const fetchImportList = async () => {
  const res = await api.get("import/list/");
  return res.data;
};
