import React, { useState, useEffect } from "react";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { $api } from "../utils";
import { Tooltip } from "@material-tailwind/react";
import { CreateJob } from "../AdminComponents/job/create-job";
import { UpdateJob } from "../AdminComponents/job/update-job";
import { DeleteJob } from "../AdminComponents/job/delete-job";

export default function Job() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    try {
      const response = await $api.get("/job-vacancies");
      setData(response.data.data);
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
      selector: (_, index) => (
        <Tooltip content={`Tartib raqam: ${index + 1}`} placement="right">
          <span>{index + 1}</span>
        </Tooltip>
      ),
      width: "80px",
    },
    {
      name: `Nomi (${activeTab.toUpperCase()})`,
      selector: (row) => (
        <p className="whitespace-pre-wrap">{row.title[activeTab]}</p>
      ),
      sortable: true,
    },
    {
      name: `Fakultet (${activeTab.toUpperCase()})`,
      selector: (row) => (
        <p className="whitespace-pre-wrap">{row.faculty[activeTab]}</p>
      ),
    },
    {
      name: `Malumot (${activeTab.toUpperCase()})`,
      selector: (row) => (
        <p className="whitespace-pre-wrap">{row.description[activeTab]}</p>
      ),
    },
    {
      name: `Manzil (${activeTab.toUpperCase()})`,
      selector: (row) => (
        <p className="whitespace-pre-wrap">{row.location[activeTab]}</p>
      ),
    },
    {
      name: `Vaqti (${activeTab.toUpperCase()})`,
      selector: (row) => row.employment_type[activeTab],
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateJob onUpdated={fetchData} rowData={row} />
          <DeleteJob onDeleted={fetchData} rowId={row.id} />
        </div>
      ),
      width: "130px",
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Bo‘sh ish o‘rinlari</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
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
        <CreateJob onAdded={fetchData} />
      </div>
      <CustomDataTable
        data={data}
        columns={columns}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
      />
    </div>
  );
}
