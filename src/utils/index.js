import axios from "axios";

export const BASE_URL = "https://api.ticty.uz";

export const $api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}` // Tokenni o‘rnatish uchun
  },
});

// Tokenni har bir so‘rov oldidan qo‘shish
$api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 qaytsa localStorage tozalab login sahifasiga yo‘naltirish
$api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/login"; // Agar Next.js bo‘lsa, useRouter bilan yo‘naltirish yaxshi
    }
    return Promise.reject(error);
  }
);
