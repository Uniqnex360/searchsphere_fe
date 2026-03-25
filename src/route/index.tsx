import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Settings from "../pages/Settings";
import Search from "../pages/Search";
import NotFound from "../pages/Error/NotFound";
import ErrorPage from "../pages/Error/Error";
import { productRoutes } from "./product";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />, 
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <Products /> },
      { path: "settings", element: <Settings /> },
      { path: "product", element: <Search /> },
      ...productRoutes,
    ],
  },

  // 👇 OUTSIDE layout
  {
    path: "/404",
    element: <NotFound />,
  },

  {
    path: "*",
    element: <NotFound />,
  },

  {
    path: "/error",
    element: <ErrorPage />,
  },
]);
