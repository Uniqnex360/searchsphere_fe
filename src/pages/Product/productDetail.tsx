import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppFormInput from "../../components/AppFormInput";
import { fetchProductDetail } from "../../api/product";
import { AppArrayInput } from "../../components/AppArrayInput";

type Image = { id: number; name: string; url: string };
type Feature = { id: number; value: string };
type Attribute = {
  id: number;
  attribute_name: string;
  attribute_value: string;
};
type Video = { id: number; name: string; url: string };
type Document = { id: number; name: string; url: string };
type Category = { id: number; name: string };
type Industry = { id: number; industry_name: string };

interface FormValues {
  product_name: string;
  brand: string | null;
  category: Category | null;
  industry: Industry | null;

  base_price: string | null;

  mpn: string | null;
  sku: string | null;

  short_description: string | null;
  long_descriptoin: string | null;

  taxonomy: string | null;
  vendor_name: string | null;
  images: Image[];
  features: Feature[];
  attributes: Attribute[];
  videos: Video[];
  documents: Document[];
}

interface ProductDetailProps {
  mode: "create" | "update" | "detail";
}

const ProductDetail: React.FC<ProductDetailProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch product detail
  const { data, isLoading } = useQuery({
    queryKey: ["productDetail", id],
    queryFn: () => fetchProductDetail(Number(id)),
    enabled: mode !== "create" && !!id,
  });

  // React Hook Form setup
  const { control, register, handleSubmit, reset, formState } =
    useForm<FormValues>({
      defaultValues: {
        product_name: "",
        brand: null,
        category: null,
        industry: null,
        base_price: null,
        short_description: null,
        long_descriptoin: null,
        taxonomy: null,
        vendor_name: null,
        images: [],
        features: [],
        attributes: [],
        videos: [],
        documents: [],
      },
    });

  // Field arrays for dynamic lists
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: "images" });
  const {
    fields: videoFields,
    append: appendVideo,
    remove: removeVideo,
  } = useFieldArray({ control, name: "videos" });
  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({ control, name: "documents" });
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control, name: "features" });
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({ control, name: "attributes" });

  // Prepopulate form when data arrives
  useEffect(() => {
    if (data?.data) {
      const product = data.data;
      reset({
        product_name: product.product_name || "",
        brand: product.brand || null,
        category: product.category.name || null,
        industry: product.industry.industry_name || null,
        base_price: product.base_price || null,
        mpn: product.mpn || null,
        sku: product.sku || null,
        short_description: product.short_description || null,
        long_descriptoin: product.long_descriptoin || null,
        taxonomy: product.taxonomy || null,
        vendor_name: product.vendor_name || null,
        images: product.images || [],
        features: product.features || [],
        attributes: product.attributes || [],
        videos: product.videos || [],
        documents: product.documents || [],
      });
    }
  }, [data, reset]);

  const onSubmit: SubmitHandler<FormValues> = (formData) => {
    if (mode === "create") console.log("Creating:", formData);
    else console.log("Updating:", formData);
    navigate(-1);
  };

  if (mode !== "create" && isLoading)
    return <p className="mt-10 text-center">Loading...</p>;

  const isDetail = mode === "detail";

  return (
    <>
      <div className="p-8">
        {/* Header div */}
        <div className="flex justify-between sticky top-0 z-50 bg-white p-6">
          <h2 className="text-xl font-semibold capitalize">Product {mode}</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            &larr; Back
          </button>
        </div>

        <hr className="text-gray-200" />

        {/* Body div */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name */}
            <AppFormInput<FormValues>
              label="Product Name"
              name="product_name"
              placeholder="Enter product name"
              register={register}
              rules={{ required: "Product Name is required" }}
              error={formState.errors.product_name}
              formState={formState}
              type="text"
              className={isDetail ? "opacity-70 pointer-events-none" : ""}
            />

            <div className="flex gap-2">
              {/* Brand */}
              <AppFormInput<FormValues>
                label="Brand"
                name="brand"
                placeholder="Enter Brand"
                register={register}
                rules={{ required: "Brand is required" }}
                error={formState.errors.brand}
                formState={formState}
                type="text"
                className={isDetail ? "opacity-70 pointer-events-none" : ""}
              />

              {/* Category */}
              <AppFormInput<FormValues>
                label="Category"
                name="category"
                placeholder="Enter Category"
                register={register}
                rules={{ required: "Category is required" }}
                error={formState.errors.category}
                formState={formState}
                type="text"
                className={isDetail ? "opacity-70 pointer-events-none" : ""}
              />

              {/* Industry */}
              <AppFormInput<FormValues>
                label="Industry"
                name="industry"
                placeholder="Enter Industry"
                register={register}
                rules={{ required: "Industry is required" }}
                error={formState.errors.industry}
                formState={formState}
                type="text"
                className={isDetail ? "opacity-70 pointer-events-none" : ""}
              />

              {/* Vendor Name */}
              <AppFormInput<FormValues>
                label="Vendor Name"
                name="vendor_name"
                placeholder="Vendor name"
                register={register}
                rules={{ required: "vendor name is required" }}
                error={formState.errors.vendor_name}
                formState={formState}
                type="text"
                className={isDetail ? "opacity-70 pointer-events-none" : ""}
              />
            </div>

            <div className="flex gap-2">
              {/* MPN */}
              <AppFormInput<FormValues>
                label="MPN"
                name="mpn"
                placeholder="Enter MPN"
                register={register}
                rules={{ required: "MPN is required" }}
                error={formState.errors.mpn}
                formState={formState}
                type="text"
                className={isDetail ? "opacity-70 pointer-events-none" : ""}
              />

              {/* SKU */}
              <AppFormInput<FormValues>
                label="SKU"
                name="sku"
                placeholder="Enter SKU"
                register={register}
                rules={{ required: "SKU is required" }}
                error={formState.errors.sku}
                formState={formState}
                type="text"
                className={isDetail ? "opacity-70 pointer-events-none" : ""}
              />

              {/* SKU */}
              <AppFormInput<FormValues>
                label="price"
                name="base_price"
                placeholder="Enter Base Price"
                register={register}
                rules={{ required: "Base Price is required" }}
                error={formState.errors.base_price}
                formState={formState}
                type="text"
                className={isDetail ? "opacity-70 pointer-events-none" : ""}
              />

            </div>

            {/* Taxonomy */}
            <AppFormInput<FormValues>
              label="Taxonomy"
              name="taxonomy"
              placeholder="L1 > l2 > l3"
              register={register}
              error={formState.errors.taxonomy}
              formState={formState}
              type="text"
              className={isDetail ? "opacity-70 pointer-events-none" : ""}
            />

            {/* Images Section */}
            <AppArrayInput
              title="Images"
              fields={imageFields}
              register={register}
              errors={formState.errors.images}
              append={appendImage}
              remove={removeImage}
              isDetail={isDetail}
              type="image"
            />

            {/* Videos Section */}
            <AppArrayInput
              title="Videos"
              fields={videoFields}
              register={register}
              errors={formState.errors.videos}
              append={appendVideo}
              remove={removeVideo}
              isDetail={isDetail}
              type="video"
            />

            {/* Documents Section */}
            <AppArrayInput
              title="Documents"
              fields={documentFields}
              register={register}
              errors={formState.errors.documents}
              append={appendDocument}
              remove={removeDocument}
              isDetail={isDetail}
              type="document"
            />

            {/* Features Section */}
            <AppArrayInput
              title="Features"
              fields={featureFields}
              register={register}
              errors={formState.errors.features}
              append={appendFeature}
              remove={removeFeature}
              isDetail={isDetail}
              type="feature"
            />

            {/* Attributes Section */}
            <AppArrayInput
              title="Attributes"
              fields={attributeFields}
              register={register}
              errors={formState.errors.attributes}
              append={appendAttribute}
              remove={removeAttribute}
              isDetail={isDetail}
              type="attribute"
            />

            {!isDetail && (
              <button
                type="submit"
                className="w-[250px] float-end py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {mode === "create" ? "Create" : "Update"}
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
