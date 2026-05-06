// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:8000",
  baseURL: "https://54.91.144.49.nip.io",
  timeout: 10000,
});
