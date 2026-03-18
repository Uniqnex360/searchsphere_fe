import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Search from "./pages/Search";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <Products /> },
      { path: "settings", element: <Settings /> },
      { path: "search", element: <Search /> },
    ],
  },
]);
