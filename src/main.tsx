// import { createRoot } from "react-dom/client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import "./index.css";
// import App from "./App.tsx";

// const queryClient = new QueryClient();

// createRoot(document.getElementById("root")!).render(
//   <QueryClientProvider client={queryClient}>
//     <App />
//   </QueryClientProvider>,
// );


import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createApp } from "@shopify/app-bridge";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

// Get Shopify context from URL
const urlParams = new URLSearchParams(window.location.search);
const host = urlParams.get("host");
// const shop = urlParams.get("shop");

// Safe App Bridge initialization
export const shopifyApp =
  host && import.meta.env.VITE_SHOPIFY_API_KEY
    ? createApp({
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      })
    : null;

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);