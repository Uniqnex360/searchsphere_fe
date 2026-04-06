import { useState, useEffect } from "react";
import { List, LayoutGrid, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    if (!searchInput) return;
    const t = setTimeout(() => {
      fetchSuggestions(); // ✅ fetch when typing
    }, 200);

    return () => clearTimeout(t);
  }, [searchInput]);

  // const { data: suggestions } = useQuery({
  //   queryKey: [
  //     "suggestions",
  //     debouncedInput,
  //     filters.brands,
  //     filters.category,
  //     filters.product_type,
  //   ],
  //   enabled: true,
  //   // enabled: !!debouncedInput,
  //   queryFn: () =>
  //     fetchProducts({
  //       q: debouncedInput,
  //       brands: filters.brands,
  //       category: filters.category,
  //       product_type: filters.product_type,
  //       //@ts-ignore
  //       price: filters.price,
  //     }),
  // });

  const { data: suggestions, refetch: fetchSuggestions, isLoading: suggestionLoading } = useQuery({
    queryKey: ["suggestions", searchInput],
    queryFn: () =>
      fetchAutosuggestV6({
        q: searchInput,
        // brands: filters.brands,
        // category: filters.category,
        // product_type: filters.product_type,
        // price: filters.price,
      }),
    enabled: false, // ❌ Don't fetch on mount
  });
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

  // ===============================
  // SEARCH TRIGGER (ENTER / SELECT)
  // ===============================
  const triggerSearch = (value: string) => {
    updateParams({ q: value, page: "1" });
    setSearchQuery(value); // 🔥 THIS triggers product API
  };

  const columns = [
    // {
    //   key: "selection",
    //   label: (
    //     <input
    //       type="checkbox"
    //       checked={
    //         selectedAssets.size === filteredAssets.length &&
    //         filteredAssets.length > 0
    //       }
    //       onChange={toggleSelectAll}
    //       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    //     />
    //   ) as any,
    //   render: (_: any, row: DigitalAsset) => (
    //     <div onClick={(e) => e.stopPropagation()}>
    //       <input
    //         type="checkbox"
    //         checked={selectedAssets.has(row)}
    //         onChange={() => toggleSelect(row)}
    //         className="w-4 h-4 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
    //       />
    //     </div>
    //   ),
    //   width: "80px",
    // },
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
      // customTruncate: true,
      // truncateLength: 48,
    },
    { key: "brand", label: "Brand", width: "150px" },
    { key: "product_type", label: "Product Type" },
    { key: "category", label: "Category" },
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
        <div className="h-[65px] flex items-center px-5">
          <div className="w-full md:w-3/4">
            {/* <AutoComplete
              data={suggestions?.data?.results || []}
              value={searchInput}
              onChange={(val) => {
                setSearchInput(val); // only typing
              }}
              onSelect={(item) => {
                const categoryValue = item.category || item.name;
                setSearchInput(categoryValue);
                triggerSearch(categoryValue);
              }}
              placeholder="Search products..."
              inputClassName="rounded-lg text-lg"
            /> */}
            <AutoComplete
              data={suggestions?.results || []}
              value={searchInput}
              onChange={setSearchInput} // typing
              onSelect={triggerSearch} // Enter or click triggers product API
              placeholder="Search products..."
              loading={suggestionLoading}
            />
          </div>
          <div className="w-1/4 float-right">
            {/* list grid view toggle */}
            <div className="flex items-center justify-end mx-4 space-x-2">
              <button
                onClick={() => setGridView(!gridView)}
                className={`p-2 rounded flex items-center justify-center transition-colors ${
                  !gridView
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <List size={20} />
              </button>

              <button
                onClick={() => setGridView(!gridView)}
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
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-5 pb-4">
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
            />
          </div>
        </>
      )}
    </div>
  );
}
