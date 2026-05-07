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
import { Redirect } from "@shopify/app-bridge/actions";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

const urlParams = new URLSearchParams(window.location.search);
const host = urlParams.get("host");
const shop = urlParams.get("shop");

// Shopify App Bridge
export const shopifyApp =
  host && import.meta.env.VITE_SHOPIFY_API_KEY
    ? createApp({
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      })
    : null;

/**
 * 🚨 IMPORTANT: trigger OAuth flow
 * Shopify does NOT call /auth automatically
 */
console.log("show", shop, shopifyApp)
if (shop) {
  //@ts-ignore
  const redirect = Redirect.create(shopifyApp);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  redirect.dispatch(
    Redirect.Action.REMOTE,
    `${backendUrl}/auth/?shop=${shop}&host=${host}`
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);