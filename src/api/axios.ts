// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // 🔥 your FastAPI URL
  timeout: 10000,
});
