// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:8000", // 🔥 your FastAPI URL
  baseURL: "http://35.175.188.201:8000",
  timeout: 10000,
});
