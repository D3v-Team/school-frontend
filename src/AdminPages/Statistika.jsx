import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { UpdateStatistic } from "../AdminComponents/statistika/update-statistics";

export default function Statistika() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); // Statistik ma'lumotni saqlash
  const [activeTab, setActiveTab] = useState("uz");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // API'dan ma'lumot olish
  const fetchData = async () => {
    try {
      const response = await $api.get("/university-statistic");
      setData(response.data.data); // API dan kelgan data-ni saqlaymiz
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "Tr",
      selector: (_, index) => (page - 1) * perPage + index + 1,
      width: "80px",
    },
    {
      name: "Talabalar soni",
      selector: (row) => row.students_count || "Noma'lum",
      sortable: true,
    },
    {
      name: "Professorlar soni",
      selector: (row) => row.professors_count || "Noma'lum",
      sortable: true,
    },
    {
      name: "Fakultetlar soni",
      selector: (row) => row.faculties_count || "Noma'lum",
      sortable: true,
    },
    {
      name: "Ta'lim dasturlari soni",
      selector: (row) => row.education_programs_count || "Noma'lum",
      sortable: true,
    },
    {
      name: "Yaratilgan vaqti",
      selector: (row) => new Date(row.created_at).toLocaleString() || "Noma'lum",
      sortable: true,
    },
    {
      name: "Yangilangan vaqti",
      selector: (row) => new Date(row.updated_at).toLocaleString() || "Noma'lum",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateStatistic onUpdated={fetchData} rowData={row} />
        </div>
      ),
      width: "170px",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Universitet Statistikasi</h2>
      <div className="mb-4 flex justify-between items-center">
        <div className="mb-4 flex space-x-2">
          {["uz", "ru", "en", "kk"].map((lang) => (
            <button
              key={lang}
              className={`px-4 py-2 rounded ${
                activeTab === lang ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => setActiveTab(lang)}
            >
              {lang == "kk" ? "CHI" : lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {data ? (
        <CustomDataTable
          data={[data]}
          columns={columns}
          page={page}
          setPage={setPage}
          perPage={perPage}
          setPerPage={setPerPage}
        />
      ) : (
        <p className="text-gray-500">Hali ma'lumot yo'q</p>
      )}
    </div>
  );
}
