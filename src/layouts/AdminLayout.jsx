import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../AdminComponents/Sidebar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ComplexNavbar } from "../AdminComponents/Navbar";

export default function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const role  = localStorage.getItem("role") || "admin";
    const token = localStorage.getItem("token");
    const { i18n } = useTranslation();

    useEffect(() => {
        if (!token) { navigate("/login"); }
    }, [token, navigate]);

    const handleLogOut = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="admin-panel flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-60"} flex-shrink-0`}>
                <Sidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    handleLogOut={handleLogOut}
                    role={role}
                />
            </div>

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <ComplexNavbar role={role} handleLogOut={handleLogOut} />
                <div className="flex-1 overflow-y-auto p-4">
                    <Outlet key={i18n.language} />
                </div>
            </div>
        </div>
    );
}
