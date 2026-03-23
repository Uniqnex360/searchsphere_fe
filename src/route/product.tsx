import ProductDetail from "../pages/Product/productDetail";

export const productRoutes = [
  { path: "product/create", element: <ProductDetail mode="create" /> },
  { path: "product/update/:id", element: <ProductDetail mode="update" />},
  { path: "product/detail/:id", element: <ProductDetail mode="detail" />},
];
