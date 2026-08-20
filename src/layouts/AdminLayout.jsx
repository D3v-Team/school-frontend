import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../AdminComponents/Sidebar";
import { useEffect, useState } from "react";
import { ComplexNavbar } from "../AdminComponents/Navbar";
import { $api } from "../utils";

export default function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const role  = localStorage.getItem("role") || "admin";
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        const fetchUser = async () => {
            try {
                /* Try to refresh user info — endpoint may vary */
                const res = await $api.get("/auth/me").catch(() => $api.get("/auth-user"));
                const data = res?.data?.data || res?.data;
                if (data) {
                    const updatedRole = data.role || role;
                    localStorage.setItem("role", updatedRole);
                    localStorage.setItem("auth-user", JSON.stringify({
                        id:    data.id    || "",
                        name:  data.name  || data.full_name  || "",
                        phone: data.phone_number || data.phone || "",
                        role:  updatedRole,
                    }));
                }
            } catch {
                /* silent — token may be valid but endpoint differs */
            }
        };
        fetchUser();
    }, [token]);

    const handleLogOut = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="admin-panel flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"} flex-shrink-0`}>
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
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
