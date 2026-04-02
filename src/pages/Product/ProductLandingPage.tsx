import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

import AppCarousel from "../../components/AppCarousel";
import { fetchProductDetail } from "../../api/product";
import type { ProductType } from "../../types/product";

const ProductLandingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["product", 1],
    queryFn: () => fetchProductDetail(Number(id)),
  });

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  const productData: ProductType = data?.data;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-24 px-8 flex items-center justify-between sticky top-0 bg-white z-50">
        <h1 className="text-gray-700 text-4xl font-bold">Product Detail</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          &larr; Back
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 px-8">
        <div className="flex gap-4 h-[calc(100vh-6rem)]">
          {/* LEFT: Carousel */}
          <div className="w-1/2 bg-gray-100 rounded-lg p-4">
            <AppCarousel images={productData?.images} />
          </div>

          {/* RIGHT: Details */}
          <div className="w-1/2 bg-white rounded-lg p-6 overflow-y-auto py-4">
            {/* Brand & Category */}
            <div className="flex gap-2 py-4">
              {productData?.brand && (
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium cursor-pointer">
                  {productData?.brand?.brand_name}
                </span>
              )}
              {productData?.category?.name && (
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium cursor-pointer">
                  {productData?.category?.name}
                </span>
              )}
              {productData?.industry?.industry_name && (
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium cursor-pointer">
                  {productData?.industry?.industry_name}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {productData?.product_name}
            </h2>
            <p className="text-sm text-gray-500">SKU: {productData?.sku}</p>

            <p className="text-xl text-blue-700 font-semibold mb-4">
              $ {productData?.base_price || "--"}
            </p>
            <div className="flex w-full">
              <p className="w-1/3 text-sm">
                MPN:{" "}
                <span className="text-gray-400 text-sm">
                  {productData?.mpn || "--"}
                </span>
              </p>
              <p className="w-1/3 text-sm">
                Vendor:{" "}
                <span className="text-gray-400 text-sm">
                  {productData?.vendor_name || "--"}
                </span>
              </p>
              <p className="w-1/3 text-sm">
                Stock Quantity:{" "}
                <span className="text-gray-400 text-sm">
                  {productData?.stock_qty || 0}
                </span>
              </p>
            </div>

            <h3 className="fond-bold py-4">
              Taxonomy:{" "}
              <span className="text-gray-600 italic">
                {productData?.taxonomy}
              </span>
            </h3>

            <h3 className="font-bold">Description:</h3>
            <p className="text-gray-600 mb-6">
              {productData?.long_description}
            </p>

            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="list-disc pl-5 space-y-2">
              {productData.features.map((f, i) => (
                <li key={i}>{f?.value}</li>
              ))}
            </ul>

            {/* Attributes */}
            <div className="py-6">
              <h3 className="font-bold mb-3">Attributes</h3>

              {productData?.attributes.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 border-b border-gray-200 last:border-none"
                >
                  <span className="text-gray-500">{item.attribute_name}</span>

                  <span className="font-medium text-gray-800">
                    {item.attribute_value}
                  </span>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div className="py-6">
              <h3 className="font-bold mb-4">Documents</h3>

              <div className="space-y-3">
                {productData?.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3">
                      {/* PDF Icon */}
                      <div className="w-10 h-10 flex items-center justify-center  text-red-600 rounded">
                        <FileText />
                      </div>

                      {/* Name */}
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500">PDF Document</p>
                      </div>
                    </div>

                    {/* Right */}
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLandingPage;
