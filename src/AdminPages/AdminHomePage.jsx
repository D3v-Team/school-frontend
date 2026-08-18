import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import Loader from "../lib/loader";

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await $api.get("/university-statistic");
      setData(response.data.data); // API dan kelgan ma'lumotni saqlaymiz
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Boshqaruv Paneli</h1>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold">{data?.students_count || 0}</h2>
          <p className="text-lg">Talabalar</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold">{data?.professors_count || 0}</h2>
          <p className="text-lg">Professorlar</p>
        </div>
        <div className="bg-yellow-500 text-black p-6 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold">{data?.faculties_count || 0}</h2>
          <p className="text-lg">Fakultetlar</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold">{data?.education_programs_count || 0}</h2>
          <p className="text-lg">Ta'lim Dasturlari</p>
        </div>
      </div>
    </div>
  );
}
