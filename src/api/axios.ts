// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:8000", // 🔥 your FastAPI URL
  baseURL: "https://35.175.188.201.nip.io",
  timeout: 10000,
});
