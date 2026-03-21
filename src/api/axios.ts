// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:8000", // 🔥 your FastAPI URL
  baseURL: "https://18.234.66.152.nip.io",
  timeout: 10000,
});
