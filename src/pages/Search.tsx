// src/pages/Search.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AutoComplete } from "../components/AutoComplete";
import { fetchProducts } from "../api/product";
import { useDebounce } from "../hooks/useDebounce";
// import { MultiSelect } from "../components/MultiSelect";

export default function Search() {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<any>(null);
  // const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // const options = ["Aervoe", "3M", "Bosch", "Makita"];

  const debouncedValue = useDebounce(value, 300);

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["autocomplete", debouncedValue],
    queryFn: () => fetchProducts(debouncedValue),
    enabled: !!debouncedValue, // don't call API if empty
    staleTime: 1000 * 60, // cache 1 min
    // keepPreviousData: true, // smooth UI 🔥
  });

  return (
        <div className="p-10 max-w-md">
          <AutoComplete
            data={data?.data || []}
            value={value}
            onChange={setValue}
            onSelect={(item) => {
              setSelected(item);
              setValue(item.name);
            }}
            placeholder="Search products..."
            inputClassName="border rounded-lg"
            dropdownClassName="rounded-lg shadow-lg"
            itemClassName="hover:bg-gray-100 cursor-pointer"
          />
          {/* 🔄 Loading */}
          {isLoading && (
            <div className="text-xs text-gray-500 mt-2">Loading...</div>
          )}

          {/* ❌ Error */}
          {isError && (
            <div className="text-xs text-red-500 mt-2">
              Failed to load results
            </div>
          )}

          {/* ✅ Selected */}
          {selected && (
            <div className="mt-4 text-sm">Selected: {selected.name}</div>
          )}
        </div>
  );
}
