import { Upload } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { fetchImportList } from "../api/product";
import { productImport } from "../api/product";
import AppTable from "../components/AppTable";

const BulkUpload = () => {

    //@ts-ignore
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Mutation for file upload
  const mutation = useMutation({
    mutationFn: productImport,
    onSuccess: () => {
      toast.success("Upload successful!");
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["import-list"] }); // refresh list
    },
    onError: (error: any) => {
      toast.error("Upload failed!");
      console.error(error);
    },
  });

  const { data: listData, isLoading } = useQuery({
    queryKey: ["import-list"],
    queryFn: () => fetchImportList(),
  });

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;
    setFile(selectedFile);

    // Trigger mutation
    mutation.mutate(selectedFile);
  };

  const columns = [
    {
      key: "module_type",
      label: "Module",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "rows",
      label: "Total Rows",
    },
    {
      key: "meta_data.progress",
      label: "Completed %",
    },
    {
      key: "error",
      label: "Error",
    },
  ];

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* header */}
      <div className="w-full h-[15%] flex items-center justify-between px-8 border-b border-b-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Import Product Data
          </h1>
        </div>

        <div>
          <label
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
              mutation.status === "pending"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <Upload size={20} />
            {mutation.status === "pending" ? "Uploading..." : "Import"}
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              disabled={mutation.status === "pending"}
            />
          </label>
        </div>
      </div>

      <div className="p-8">
        <AppTable
          columns={columns}
          data={Array.isArray(listData?.data) ? listData.data : []}
          isLoading={isLoading}
        />
      </div>

      {/* optional loader or status message */}
      {mutation.status === "pending" && (
        <div className="mt-4 px-8 text-blue-600 font-medium">
          Uploading file, please wait...
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
