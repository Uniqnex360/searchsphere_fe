import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AutoComplete } from "../components/AutoComplete";
import { MultiSelect } from "../components/MultiSelect";
import { fetchProducts, fetchProductsFilterMeta } from "../api/product";
import AppPagination from "../components/AppPagination";

export default function Search() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  // ===============================
  // URL STATE (source of truth)
  // ===============================
  const filters = {
    q: params.q || "",
    brands: params.brands ? params.brands.split(",") : [],
    category: params.category ? params.category.split(",") : [],
    price: params.price ? params.price.split(",") : [],
    sortBy: params.sortBy || "",
  };

  const page = Number(params.page) || 1;
  const size = 50;

  // ===============================
  // LOCAL INPUT STATE (for typing only)
  // ===============================
  const [searchInput, setSearchInput] = useState(filters.q);
  const [searchQuery, setSearchQuery] = useState(filters.q); // 🔥 triggers API

  // sync URL → input
  useEffect(() => {
    setSearchInput(filters.q);
    setSearchQuery(filters.q);
  }, [filters.q]);

  // ===============================
  // FILTER META
  // ===============================
  const [brands, setBrands] = useState<string[]>([]);
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
  const [debouncedInput, setDebouncedInput] = useState(searchInput);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedInput(searchInput);
    }, 200);

    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", debouncedInput],
    enabled: !!debouncedInput,
    queryFn: () => fetchProducts({ q: debouncedInput }),
  });

  // ===============================
  // PRICE TRANSFORM
  // ===============================
  const apiPriceFilter =
    filters.price.length > 0
      ? filters.price
          .map((label) => {
            const r = priceRanges.find((x) => x.label === label);
            return r ? { price_min: r.min, price_max: r.max } : null;
          })
          .filter(Boolean)
      : [];

  // ===============================
  // PRODUCT LIST (ONLY searchQuery triggers it)
  // ===============================
  const {
    data: productList,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", searchQuery, filters, page],
    queryFn: () =>
      fetchProducts({
        ...filters,
        q: searchQuery,
        //@ts-ignore
        price: apiPriceFilter,
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

  // ===============================
  // SEARCH TRIGGER (ENTER / SELECT)
  // ===============================
  const triggerSearch = (value: string) => {
    updateParams({ q: value, page: "1" });
    setSearchQuery(value); // 🔥 THIS triggers product API
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="h-[65px] flex items-center px-5">
          <div className="w-full md:w-3/4">
            <AutoComplete
              data={suggestions?.data?.results || []}
              value={searchInput}
              onChange={(val) => {
                setSearchInput(val); // only typing
              }}
              onSelect={(item) => {
                setSearchInput(item.name);
                triggerSearch(item.name);
              }}
              placeholder="Search products..."
              inputClassName="rounded-lg text-lg"
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-4 px-5 pb-4">
          <MultiSelect
            options={brands}
            value={filters.brands}
            onChange={(v) => updateParams({ brands: v.join(","), page: "1" })}
            placeholder="Filter by brands"
          />

          <MultiSelect
            options={category}
            value={filters.category}
            onChange={(v) => updateParams({ category: v.join(","), page: "1" })}
            placeholder="Filter by category"
          />

          <MultiSelect
            options={priceRanges.map((r) => r.label)}
            value={filters.price}
            onChange={(v) => updateParams({ price: v.join(","), page: "1" })}
            placeholder="Filter by price"
            singleSelect
          />

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
            placeholder="Sort by"
            singleSelect
          />
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
              <div className="text-sm text-gray-500">{p.brand}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
