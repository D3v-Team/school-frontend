import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { AddScheduledEvent } from "../AdminComponents/schedule-event/add-event";
import { DeleteEvent } from "../AdminComponents/schedule-event/delete-event";
import { UpdateScheduledEvent } from "../AdminComponents/schedule-event/update-event";

export default function ScheduleEvent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    try {
      const response = await $api.get("/scheduled-event");
      setData(response.data.data); // API dan kelgan data-ni state-ga saqlaymiz
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
      name: `Sarlavha (${activeTab.toUpperCase()})`,
      selector: (row) => (
        <p
          className="whitespace-pre-wrap"
        >
          {row.title?.[activeTab] || "Noma'lum"}
        </p>
      ),
      sortable: true,
    },
    {
      name: `Sana`,
      selector: (row) => row.date || "Noma'lum",
      sortable: true,
      width: "170px",
    },
    {
      name: `Boshlanish vaqti`,
      selector: (row) => row.start_time || "Noma'lum",
      sortable: true,
      width: "170px",
    },

    {
      name: `Tugash vaqti`,
      selector: (row) => row.end_time || "Noma'lum",
      sortable: true,
      width: "170px",
    },
    {
      name: `Status (${activeTab.toUpperCase()})`,
      selector: (row) => row.status?.[activeTab] || "Noma'lum",
      sortable: true,
      width: "170px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateScheduledEvent onUpdated={fetchData} rowData={row} />
          <DeleteEvent onDeleted={fetchData} rowId={row.id} />
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
      <h2 className="text-xl font-bold mb-4">Ochiq ma'lumotlar</h2>
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
        <div>
          <AddScheduledEvent onAdded={fetchData} />
        </div>
      </div>
      <CustomDataTable
        data={data} // To‘g‘ri data state-ni uzatamiz
        columns={columns}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
      />
    </div>
  );
}
