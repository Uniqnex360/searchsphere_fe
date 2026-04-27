// import ProductDetail from "../pages/Product/productDetail";
import ProductLandingPage from "../pages/Product/ProductLandingPage";
import ProductSearchKeyword from "../pages/Product/ProductSearchkeyword";

export const productRoutes = [
  // { path: "product/create", element: <ProductDetail mode="create" /> },
  // { path: "product/update/:id", element: <ProductDetail mode="update" />},
  { path: "product/detail/:id", element: <ProductLandingPage /> },
  { path: "product/search/keyword", element: <ProductSearchKeyword /> },
];
