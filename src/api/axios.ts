// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:8000",
  baseURL: "https://54.196.84.222.nip.io/api-f1",
  timeout: 10000,
});
