import { useState, useEffect } from "react";
import { List, LayoutGrid, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DollarSign, ArrowDownUp } from "lucide-react";
import { AutoComplete } from "../components/AutoComplete";
import { MultiSelect } from "../components/MultiSelect";
import {
  fetchProducts,
  fetchProductsFilterMeta,
  fetchAutosuggestV6,
} from "../api/product";
import AppPagination from "../components/AppPagination";
import AppTable from "../components/AppTable";
import type { ProductType } from "../types/product";

export default function Search() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const [gridView, setGridView] = useState(false);
  // ===============================
  // URL STATE (source of truth)
  // ===============================
  const filters = {
    q: params.q || "",
    brands: params.brands ? params.brands.split(",") : [],
    product_type: params.product_type ? params.product_type.split(",") : [],
    category: params.category ? params.category.split(",") : [],
    price: params.price ? [params.price] : [],
    sortBy: params.sortBy || "",
    sortDirection: params.sortDirection || "",
  };

  const page = Number(params.page) || 1;
  const size = 50;
  const isKeyword = searchParams.get("isKeyword") === "true";

  // ===============================
  // LOCAL INPUT STATE (for typing only)
  // ===============================
  const [searchInput, setSearchInput] = useState(filters.q);

  // sync URL → input
  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  // ===============================
  // FILTER META
  // ===============================
  //@ts-ignore
  const [brands, setBrands] = useState<string[]>([]);
  //@ts-ignore
  const [category, setCategory] = useState<string[]>([]);
  const [priceRanges, setPriceRanges] = useState<
    { min: number; max: number; label: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const res = await fetchProductsFilterMeta();
      setBrands(res?.brands || []);
      setCategory(res?.categories || []);

      const priceOpts =
        res?.price_ranges?.map((r: any) => ({
          ...r,
          label: `$${r.min.toLocaleString()} - $${r.max.toLocaleString()}`,
        })) || [];

      setPriceRanges(priceOpts);
    })();
  }, []);

  // ===============================
  // SUGGESTIONS (debounced input only)
  // ===============================

  useEffect(() => {
    if (!searchInput) {
      setSearchParams({});
    }
    const t = setTimeout(() => {
      fetchSuggestions(); // ✅ fetch when typing
    }, 200);

    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: suggestions,
    refetch: fetchSuggestions,
    isLoading: suggestionLoading,
  } = useQuery({
    queryKey: ["suggestions", searchInput],
    queryFn: () =>
      fetchAutosuggestV6({
        q: searchInput,
      }),
    enabled: false, // ❌ Don't fetch on mount
  });

  const {
    data: productList,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "products",
      filters.q,
      filters.brands,
      filters.product_type,
      filters.category,
      filters.price,
      filters.sortBy,
      filters.sortDirection,
      page,
    ],
    queryFn: () =>
      fetchProducts({
        ...filters,
        q: filters.q,
        //@ts-ignore
        price: filters.price,
        page,
      }),
  });

  // ===============================
  // UPDATE URL helper
  // ===============================
  const updateParams = (newParams: Record<string, any>) => {
    setSearchParams({
      ...params,
      ...newParams,
    });
  };

  const handleSort = (key: string) => {
    const currentSortBy = filters.sortBy;
    const currentSortDir = filters.sortDirection || "asc";

    let newSortDir: "asc" | "desc" = "asc";

    if (currentSortBy === key) {
      newSortDir = currentSortDir === "asc" ? "desc" : "asc";
    }

    updateParams({
      sortBy: key,
      sortDirection: newSortDir,
      page: "1",
    });
  };

  // ===============================
  // SEARCH TRIGGER (ENTER / SELECT)
  // ===============================
  const triggerSearch = (value: string) => {
    updateParams({ q: value, page: "1" });
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      width: "100px",
      render: (_: any, row: ProductType) => {
        const imageUrl =
          Array.isArray(row?.images) && row.images.length > 0
            ? row.images[0]
            : null;

        if (imageUrl) {
          return (
            <img
              //@ts-ignore
              src={imageUrl}
              alt={row.product_name || "Asset Image"}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          );
        }

        return "--";
      },
    },
    {
      key: "name",
      label: "Name",
      render: (_: any, row: ProductType) => {
        //@ts-ignore
        const name = row?.name || "--";

        return (
          <div
            className="whitespace-normal break-words text-sm text-gray-900"
            style={{
              maxWidth: 300, // controls wrapping width
              lineHeight: "1.4",
            }}
            title={name}
          >
            {name}
          </div>
        );
      },
    },
    { key: "brand", label: "Brand", width: "150px", sortable: true },
    { key: "product_type", label: "Product Type", width: "150px", sortable: true },
    { key: "category", label: "Category", width: "150px", sortable: true },
    {key: "search_popularity", label: "Search Popularity", width: "150px", sortable: true},
    {key: "view_count", label: "View Popularity", width: "150px", sortable: true},
    {
      key: "actions",
      label: "Actions",
      width: "100px",
      sortable: false,
      render: (_: any, row: ProductType) => (
        <div
          onClick={() => navigate(`/product/detail/${row.id}`)}
          className="flex items-center gap-2 cursor-pointer justify-center"
        >
          <button
            className="p-1 hover:bg-gray-100 text-gray-600 rounded transition-colors cursor-pointer"
            title="View"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="h-[65px] flex items-center justify-between px-5 gap-4">
          {/* LEFT SECTION (Back + Search) */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isKeyword && (
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg shadow-sm transition whitespace-nowrap"
              >
                ← Back
              </button>
            )}

            <div className="flex-1 min-w-0">
              <AutoComplete
                data={suggestions?.results || []}
                value={searchInput}
                onChange={setSearchInput}
                onSelect={triggerSearch}
                placeholder="Search products..."
                loading={suggestionLoading}
              />
            </div>
          </div>

          {/* RIGHT SECTION (View Toggle) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGridView(false)}
              className={`p-2 rounded flex items-center justify-center transition-colors ${
                !gridView
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <List size={20} />
            </button>

            <button
              onClick={() => setGridView(true)}
              className={`p-2 rounded flex items-center justify-center transition-colors ${
                gridView
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-5 pb-4 items-center">
          {/* Normal Filters */}
          <MultiSelect
            options={productList?.data?.facets?.brands || []}
            value={filters.brands}
            onChange={(v) => updateParams({ brands: v.join(","), page: "1" })}
            placeholder="Filter by Brands"
          />

          <MultiSelect
            options={productList?.data?.facets?.product_type || []}
            value={filters.product_type}
            onChange={(v) =>
              updateParams({ product_type: v.join(","), page: "1" })
            }
            placeholder="Filter by Product Type"
          />

          <MultiSelect
            options={productList?.data?.facets?.categories || []}
            value={filters.category}
            onChange={(v) => updateParams({ category: v.join(","), page: "1" })}
            placeholder="Filter by category"
          />

          {/* ICON FILTER WRAPPER */}
          <div className="flex items-center gap-1 w-fit justify-self-start">
            {/* Price */}
            <div className="flex items-center justify-center border border-gray-200 rounded-lg p-2 h-[42px] w-[42px]">
              <MultiSelect
                options={priceRanges.map((r) => r.label)}
                value={filters.price}
                onChange={(v) =>
                  updateParams({ price: v.join(","), page: "1" })
                }
                singleSelect
                triggerType="icon"
                icon={<DollarSign size={18} />}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center justify-center border border-gray-200 rounded-lg p-2 h-[42px] w-[42px]">
              <MultiSelect
                options={[
                  "Product Name (A → Z)",
                  "Product Name (Z → A)",
                  "Price (Low → High)",
                  "Price (High → Low)",
                ]}
                value={filters.sortBy ? [filters.sortBy] : []}
                onChange={(v) =>
                  updateParams({
                    sortBy: v[0] || "",
                    page: "1",
                  })
                }
                singleSelect
                triggerType="icon"
                icon={<ArrowDownUp size={18} />}
              />
            </div>
          </div>
        </div>
        {/* PAGINATION */}
        <div className="flex justify-end mr-4 p-2">
          <AppPagination
            total={productList?.data?.total_docs_after_filter || 0}
            page={page}
            size={size}
            onPageChange={(p) => {
              updateParams({ page: String(p) });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          <p className="italic text-sm text-gray-400 px-3 py-1">
            Total: {productList?.data?.total_docs_after_filter || 0}
          </p>
        </div>

        {/* CLEAR ALL (RESTORED EXACT LOGIC) */}
        {(searchInput ||
          filters.q ||
          filters.brands.length > 0 ||
          filters.category.length > 0 ||
          filters.price.length > 0 ||
          filters.product_type.length > 0 ||
          filters.sortBy) && (
          <div className="flex justify-end mr-4">
            <button
              className="ml-auto px-3 py-1 text-[12px] text-red-700 hover:text-red-900 rounded transition cursor-pointer"
              onClick={() => {
                setSearchParams({});
                setSearchInput("");
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* PRODUCTS */}

      {gridView ? (
        <>
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading && <div>Loading...</div>}
            {isError && <div>Failed to load</div>}

            <div className="grid grid-cols-4 gap-4 mt-4">
              {productList?.data?.results?.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-xl cursor-pointer"
                  onClick={() => navigate(`/product/detail/${p.id}`)}
                >
                  <img
                    src={p.images?.[0]}
                    className="h-48 w-full object-cover rounded"
                  />
                  <div className="mt-2 font-semibold">{p.name}</div>
                  <div className="text-lg text-green-700">
                    {" "}
                    $ {p.base_price || "--"}
                  </div>
                  <div className="text-sm text-gray-500">{p.brand}</div>
                  <div className="text-sm text-gray-500">{p.category}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-5">
            <AppTable
              columns={columns}
              data={productList?.data?.results}
              isLoading={isLoading}
              sortKey={filters.sortBy}
              //@ts-ignore
              sortDirection={filters.sortDirection}
              onSort={handleSort}
            />
          </div>
        </>
      )}
    </div>
  );
}
