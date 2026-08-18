import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../AdminComponents/Sidebar";
import { useEffect, useState } from "react";
import { ComplexNavbar } from "../AdminComponents/Navbar";
import { $api } from "../utils";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const token = localStorage.getItem('token');
  let navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await $api.get(`/auth-user`)
        if (response.data.status) {
          // Update user info
          const { name, phone } = response.data.data;
          localStorage.setItem('auth-user', JSON.stringify({ name, phone }));
        }
      } catch (error) {
        
      }
    };
    fetchUserInfo()
  }, [token])

  const handleLogOut = () => {
    localStorage.clear();
    navigate("/login");
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-200">
      {/* Sidebar */}
      <div
        className={`transition-width duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          handleLogOut={handleLogOut}
        />
      </div>

      {/* Main content area */}
      <div
        className={`${
          isCollapsed ? "w-[calc(100% - 80px)]" : "w-[calc(100%-316px)]"
        } flex flex-1 flex-col`}
      >
        {/* Navbar */}
        <ComplexNavbar />

        {/* Scrollable Content */}
        <div className={` flex-1 overflow-y-auto p-4`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
