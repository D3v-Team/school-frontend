import axios from "axios";

export const BASE_URL = "https://school.udsgroup.uz";

export const $api = axios.create({
    baseURL: `${BASE_URL}`,
});

/* ── Attach token before every request ── */
$api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ── Handle 401 globally ── */
$api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/* ── Auth helpers ── */
export const getUser      = () => JSON.parse(localStorage.getItem("auth-user") || "null");
export const getToken     = () => localStorage.getItem("token");
export const getRole      = () => localStorage.getItem("role") || "";
export const isAdmin      = () => ["ADMIN", "SUPER_ADMIN"].includes(getRole());
export const isSuperAdmin = () => getRole() === "SUPER_ADMIN";
