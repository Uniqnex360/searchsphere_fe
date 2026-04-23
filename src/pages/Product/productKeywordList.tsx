import { useState, useEffect } from "react";
import { List, LayoutGrid, Eye, DollarSign, ArrowDownUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AutoComplete } from "../../components/AutoComplete";
import { MultiSelect } from "../../components/MultiSelect";
import {
  fetchProductsV2, // Updated to V2
  fetchProductsFilterMeta,
  fetchAutosuggestV6,
} from "../../api/product";
import AppPagination from "../../components/AppPagination";
import AppTable from "../../components/AppTable";
import type { ProductType } from "../../types/product";

// ===============================
// SIDEBAR COMPONENT
// ===============================
const AttributeSidebar = ({
  dynamicAttributes,
  selectedAttrs,
  onAttrChange,
}: {
  dynamicAttributes: Record<string, string[]>;
  selectedAttrs: Record<string, string[]>;
  onAttrChange: (name: string, value: string) => void;
}) => {
  const [expandedAttrs, setExpandedAttrs] = useState<Record<string, boolean>>({});

  const toggleExpand = (attrName: string) => {
    setExpandedAttrs((prev) => ({
      ...prev,
      [attrName]: !prev[attrName],
    }));
  };

  const excludeList = ["brand", "category", "product type", "product category"];
  const moveToEndList = [
    "ships",
    "quantity",
    "packaging",
    "minimum purchase & shipping",
  ];

  const sortedAttributeGroups = Object.entries(dynamicAttributes).sort(
    ([nameA], [nameB]) => {
      const lowerA = nameA.toLowerCase();
      const lowerB = nameB.toLowerCase();
      const isALast = moveToEndList.includes(lowerA);
      const isBLast = moveToEndList.includes(lowerB);

      if (isALast && !isBLast) return 1;
      if (!isALast && isBLast) return -1;
      return lowerA.localeCompare(lowerB);
    },
  );

  return (
    <div className="w-64 bg-white p-5 overflow-y-auto border-r border-gray-200 hidden lg:block shrink-0">
      <h3 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">
        Filter By
      </h3>
      {sortedAttributeGroups.map(([attrName, options]) => {
        if (excludeList.includes(attrName.toLowerCase()) || !options) {
          return null;
        }

        const sortedOptions = [...options].sort((a, b) => {
          const aNum = parseFloat(a);
          const bNum = parseFloat(b);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });

        const isExpanded = expandedAttrs[attrName] || false;
        const visibleOptions = isExpanded
          ? sortedOptions
          : sortedOptions.slice(0, 10);
        const hasMore = sortedOptions.length > 10;

        return (
          <div key={attrName} className="mb-8">
            <h4 className="text-sm font-bold text-gray-800 mb-3 capitalize">
              {attrName.replace(/_/g, " ")}
            </h4>
            <div className="space-y-2">
              {visibleOptions.map((option) => {
                const isChecked =
                  selectedAttrs[attrName]?.includes(option) ?? false;

                return (
                  <label
                    key={option}
                    className="flex items-start gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={isChecked}
                      onChange={() => onAttrChange(attrName, option)}
                    />
                    <span
                      className={`${
                        isChecked ? "font-semibold text-blue-700" : ""
                      } line-clamp-2`}
                    >
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>

            {hasMore && (
              <button
                onClick={() => toggleExpand(attrName)}
                className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
              >
                {isExpanded ? (
                  <>
                    <span>Show Less</span>
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Show {sortedOptions.length - 10} More</span>
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

import { useParams } from "react-router-dom";

export default function ProductKeywordList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const [gridView, setGridView] = useState(false);

  const { search_id } = useParams();

  // ===============================
  // URL STATE PARSING
  // ===============================
  const getDynamicAttrsFromURL = () => {
    const attrs: Record<string, string[]> = {};
    Object.keys(params).forEach((key) => {
      if (key.startsWith("attr_")) {
        const attrName = key.replace("attr_", "");
        attrs[attrName] = params[key].split(",");
      }
    });
    return attrs;
  };

  const filters = {
    q: params.q || "",
    brands: params.brand ? params.brand.split(",") : [],
    product_type: params.product_type ? params.product_type.split(",") : [],
    category: params.category ? params.category.split(",") : [],
    price_min: params.price_min || null,
    price_max: params.price_max || null,
    sortBy: params.sortBy || "",
    sortDirection: params.sortDirection || "desc",
    attributes: getDynamicAttrsFromURL(),
  };

  const page = Number(params.page) || 1;
  const size = 50;
  const isKeyword = searchParams.get("isKeyword") === "true";

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.product_type.length > 0 ||
    filters.category.length > 0 ||
    filters.price_min !== null ||
    filters.price_max !== null;

  // ===============================
  // LOCAL INPUT STATE
  // ===============================
  const [searchInput, setSearchInput] = useState(filters.q);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const [priceRanges, setPriceRanges] = useState<
    { min: number; max: number; label: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const res = await fetchProductsFilterMeta();
      const priceOpts =
        res?.price_ranges?.map((r: any) => ({
          ...r,
          label: `$${r.min.toLocaleString()} - $${r.max.toLocaleString()}`,
        })) || [];
      setPriceRanges(priceOpts);
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchSuggestions();
    }, 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  console.log("search_id:", search_id);

  const {
    data: suggestions,
    refetch: fetchSuggestions,
    isLoading: suggestionLoading,
  } = useQuery({
    queryKey: ["suggestions", searchInput],
    queryFn: () => fetchAutosuggestV6({ q: searchInput }),
    enabled: false,
  });

  // ===============================
  // ✅ MAIN API CALL (V2)
  // ===============================
  const { data: productList, isLoading } = useQuery({
    queryKey: ["products",search_id, params], // React to any URL param change
    queryFn: () =>
      fetchProductsV2({
        id: search_id,// search_id from URL
        q: filters.q,
        brand: filters.brands.join(","),
        product_type: filters.product_type.join(","),
        category: filters.category.join(","),
        //@ts-ignore
        price_min: filters.price_min,
        //@ts-ignore
        price_max: filters.price_max,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        attr_filters: filters.attributes,
        page,
      }),
  });

  // ===============================
  // HANDLERS
  // ===============================
  const updateParams = (newParams: Record<string, any>) => {
    const updated = { ...params, ...newParams };
    Object.keys(updated).forEach((key) => {
      if (
        updated[key] === undefined ||
        updated[key] === null ||
        updated[key] === ""
      ) {
        delete updated[key];
      }
    });
    setSearchParams(updated);
  };

  console.log("product list", productList)

  const handleAttributeChange = (name: string, value: string) => {
    const currentValues = filters.attributes[name] || [];
    let newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const key = `attr_${name}`;
    const newParams = { ...params };

    if (newValues.length > 0) {
      newParams[key] = newValues.join(",");
    } else {
      delete newParams[key];
    }

    newParams.page = "1";
    setSearchParams(newParams);
  };

  const handleSort = (key: string) => {
    const currentSortBy = filters.sortBy;
    const currentSortDir = filters.sortDirection || "desc";
    let newSortDir: "asc" | "desc" =
      currentSortBy === key && currentSortDir === "asc" ? "desc" : "asc";
    updateParams({ sortBy: key, sortDirection: newSortDir, page: "1" });
  };

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
        return imageUrl ? (
          <img
            //@ts-ignore
            src={imageUrl}
            alt={row.product_name || "Asset"}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          "--"
        );
      },
    },
    {
      key: "name",
      label: "Name",
      render: (_: any, row: ProductType) => {
        const name = row?.name || "--";
        return (
          <div
            className="whitespace-normal break-words text-sm text-gray-900"
            style={{ maxWidth: 300, lineHeight: "1.4" }}
            title={name}
          >
            {name}
          </div>
        );
      },
    },
    { key: "brand", label: "Brand", sortable: true },
    { key: "product_type", label: "Product Type", sortable: true },
    { key: "category", label: "Category", sortable: true },
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
      {/* HEADER SECTION */}
      <div className="bg-white shadow-sm sticky top-0 z-50 ">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Product</h1>
        </div>
        <div className="h-[65px] flex items-center justify-between px-5 gap-4">
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
                primaryData={suggestions?.primary_results || []}
                fallbackData={suggestions?.fallback_results || []}
                fallbackType={suggestions?.fallback_type}
                value={searchInput}
                onChange={setSearchInput}
                onSelect={triggerSearch}
                placeholder="Search products..."
                loading={suggestionLoading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setGridView(false)}
              className={`p-2 rounded flex items-center justify-center transition-colors ${!gridView ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setGridView(true)}
              className={`p-2 rounded flex items-center justify-center transition-colors ${gridView ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        {/* PRIMARY FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-5 pb-4 items-center">
          <MultiSelect
            options={productList?.facets?.brands || []}
            value={filters.brands}
            onChange={(v) => updateParams({ brand: v.join(","), page: "1" })}
            placeholder="Filter by Brands"
          />
          <MultiSelect
            options={productList?.facets?.product_type || []}
            value={filters.product_type}
            onChange={(v) =>
              updateParams({ product_type: v.join(","), page: "1" })
            }
            placeholder="Filter by Product Type"
          />
          <MultiSelect
            options={productList?.facets?.categories || []}
            value={filters.category}
            onChange={(v) => updateParams({ category: v.join(","), page: "1" })}
            placeholder="Filter by category"
          />
          <div className="flex items-center gap-1 w-fit justify-self-start">
            <div className="flex items-center justify-center border border-gray-200 rounded-lg p-2 h-[42px] w-[42px]">
              <MultiSelect
                options={priceRanges.map((r) => r.label)}
                value={
                  filters.price_min
                    ? [`$${filters.price_min} - $${filters.price_max}`]
                    : []
                }
                onChange={(v) => {
                  const selected = priceRanges.find((r) => r.label === v[0]);
                  updateParams({
                    price_min: selected?.min || "",
                    price_max: selected?.max || "",
                    page: "1",
                  });
                }}
                singleSelect
                triggerType="icon"
                icon={<DollarSign size={18} />}
              />
            </div>
            <div className="flex items-center justify-center border border-gray-200 rounded-lg p-2 h-[42px] w-[42px]">
              <MultiSelect
                options={[
                  "Sort by Views",
                  "Sort by Search Popularity",
                  "Product Name (A → Z)",
                  "Product Name (Z → A)",
                  "Price (Low → High)",
                  "Price (High → Low)",
                  "Brand (A -> Z)",
                  "Brand (Z -> A)",
                  "Category (A -> Z)",
                  "Category (Z -> A)",
                  "Product Type (A -> Z)",
                  "Product Type (Z -> A)",
                ]}
                value={filters.sortBy ? [filters.sortBy] : []}
                onChange={(v) =>
                  updateParams({ sortBy: v[0] || "", page: "1" })
                }
                singleSelect
                triggerType="icon"
                icon={<ArrowDownUp size={18} />}
              />
            </div>
          </div>
        </div>

        {/* PAGINATION / TOTALS */}
        <div className="flex justify-end items-center mr-4 p-2 gap-2">
          <AppPagination
            total={productList?.total_docs_after_filter || 0}
            page={page}
            size={size}
            onPageChange={(p) => {
              updateParams({ page: String(p) });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <p className="italic text-sm text-gray-400">
            Total: {productList?.total_docs_after_filter || 0}
          </p>
        </div>

        {/* CLEAR ALL BUTTON */}
        {(filters.q ||
          hasActiveFilters ||
          Object.keys(filters.attributes).length > 0) && (
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

      {/* CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {(filters.q || hasActiveFilters) &&
          productList?.facets?.dynamic_attributes && (
            <AttributeSidebar
              dynamicAttributes={productList?.facets.dynamic_attributes}
              selectedAttrs={filters.attributes}
              onAttrChange={handleAttributeChange}
            />
          )}

        <div className="flex-1 overflow-y-auto p-5">
          {gridView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {productList?.results?.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
                  onClick={() => navigate(`/product/detail/${p.id}`)}
                >
                  <div className="h-48 w-full bg-gray-50 rounded mb-3 overflow-hidden">
                    <img
                      src={p.images?.[0]}
                      className="h-full w-full object-contain mix-blend-multiply"
                      alt={p.name}
                    />
                  </div>
                  <div className="font-semibold text-sm line-clamp-2 h-10 mb-1">
                    {p.name}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    $ {p.base_price || "--"}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-auto pt-2">
                    {p.brand} • {p.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <AppTable
                columns={columns}
                data={productList?.results || []}
                isLoading={isLoading}
                sortKey={filters.sortBy}
                sortDirection={filters.sortDirection as any}
                onSort={handleSort}
              />

              <div className="flex justify-end items-center mr-4 p-2 gap-2">
                <AppPagination
                  total={productList?.total_docs_after_filter || 0}
                  page={page}
                  size={size}
                  onPageChange={(p) => {
                    updateParams({ page: String(p) });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}