type ProductFeature = {
  id: number | string;
  name: string;
  value: string;
};

type ProductImage = {
  id: number | string;
  name: string;
  url: string;
};

type ProductDocument = {
  id: number | string;
  name: string;
  url: string;
};

type Industry = {
  id: number | string;
  industry_name: string;
};

type Category = {
  id: number | string;
  name: string;
};

type ProductAttribute = {
  id: number | string;
  attribute_name: string;
  attribute_value: string;
};

export type ProductType = {
  id?: number | string;
  product_name: string;
  brand: string | null;
  industry: Industry;
  category: Category;
  taxonomy: string;
  vendor_name: string;
  sku: string | null;
  stock_qty: number | null;
  mpn: string | null;
  long_description: string;
  base_price: number | null;
  images: ProductImage[];
  features: ProductFeature[];
  attributes: ProductAttribute[];
  documents: ProductDocument[];
};
