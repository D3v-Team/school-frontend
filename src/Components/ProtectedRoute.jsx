import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * - token yo'q → /login ga yo'naltiradi
 * - role "admin" yoki "super_admin" bo'lishi kerak
 * - superOnly={true} bo'lsa faqat super_admin kiradi
 */
const ProtectedRoute = ({ children, superOnly = false }) => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role") || "";

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const allowed = superOnly
        ? role === "SUPER_ADMIN"
        : ["ADMIN", "SUPER_ADMIN"].includes(role);

    if (!allowed) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
