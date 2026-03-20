import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AutoComplete } from "../components/AutoComplete";
import { MultiSelect } from "../components/MultiSelect";
import { fetchProducts, fetchProductsFilterMeta } from "../api/product";

export default function Search() {
  const [filters, setFilters] = useState({
    q: "",
    brands: [] as string[],
    category: [] as string[],
    price: [] as string[],
    sortBy: "" as string,
  });

  const [brands, setBrands] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [priceRanges, setPriceRanges] = useState<
    { min: number; max: number; label: string }[]
  >([]);

  // Fetch filter metadata
  useEffect(() => {
    (async () => {
      const res = await fetchProductsFilterMeta();
      setBrands(res?.brands || []);
      setCategory(res?.categories || []);

      // Convert backend price ranges to label strings
      const priceOpts =
        res?.price_ranges?.map((range: any) => ({
          ...range,
          label: `₹${range.min.toLocaleString()} - ₹${range.max.toLocaleString()}`,
        })) || [];
      setPriceRanges(priceOpts);
    })();
  }, []);

  // Prepare API-ready price filter
  // Prepare API-ready price filter
  const apiPriceFilter =
    Array.isArray(filters.price) && filters.price.length
      ? filters.price
          .map((label) => {
            const range = priceRanges.find((r) => r.label === label);
            return range
              ? { price_min: range.min, price_max: range.max }
              : null;
          })
          .filter(Boolean)
      : [];

  // Fetch products
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", filters],
    //@ts-ignore
    queryFn: () => fetchProducts({ ...filters, price: apiPriceFilter }),
  });

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Header + Filters */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="h-[65px] flex items-center px-5">
          <div className="w-full md:w-1/2">
            <AutoComplete
              data={data?.data || []}
              value={filters.q}
              onChange={(val) => setFilters((prev) => ({ ...prev, q: val }))}
              onSelect={(item) => {
                setFilters((prev) => ({ ...prev, q: item.name }));
              }}
              placeholder="Search products..."
              inputClassName="rounded-lg text-lg"
              dropdownClassName="rounded-lg shadow-lg"
              itemClassName="hover:bg-gray-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 px-5 pb-4">
          <MultiSelect
            options={brands}
            value={filters.brands}
            onChange={(newBrands) =>
              setFilters((prev) => ({ ...prev, brands: newBrands }))
            }
            placeholder="Filter by brands"
          />
          <MultiSelect
            options={category}
            value={filters.category}
            onChange={(newCategory) =>
              setFilters((prev) => ({ ...prev, category: newCategory }))
            }
            placeholder="Filter by category"
          />
          <MultiSelect
            options={priceRanges.map((r) => r.label)}
            value={filters.price}
            onChange={(newPrice) =>
              setFilters((prev) => ({ ...prev, price: newPrice }))
            }
            placeholder="Filter by price"
            singleSelect={true}
          />
          {/* Sort dropdown (single-select) */}
          <MultiSelect
            options={[
              "Product Name (A → Z)",
              "Product Name (Z → A)",
              "Price (Low → High)",
              "Price (High → Low)",
            ]}
            value={filters.sortBy ? [filters.sortBy] : []} // pass as array
            onChange={(newSortArray) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: newSortArray[0] || "",
              }))
            }
            placeholder="Sort by"
            singleSelect={true}
          />
        </div>
        {/* Single Clear All button */}
        <div className="flex justify-end mr-4">
          {(filters.q ||
            filters.brands.length > 0 ||
            filters.category.length > 0 ||
            (filters.price && filters.price.length > 0) ||
            filters.sortBy) && (
            <button
              className="ml-auto px-3 py-1 text-[12px]  text-red-700 hover:text-red-900 rounded transition cursor-pointer"
              onClick={() => {
                setFilters({
                  q: "",
                  brands: [],
                  category: [],
                  price: [],
                  sortBy: "",
                });
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
        {isError && (
          <div className="text-sm text-red-500">Failed to load products</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {data?.data?.map((product: any) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="w-full h-64 overflow-hidden rounded-lg">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold mt-3 truncate" title={product.name}>
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">{product.brand}</p>
              <p className="text-sm text-green-600">{product.category}</p>
              <p className="text-blue-600 font-bold mt-2">
                ₹{product.base_price}
              </p>
            </div>
          ))}
        </div>

        {!isLoading && data?.data?.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
