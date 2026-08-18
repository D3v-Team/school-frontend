import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { AddOpenData } from "../AdminComponents/open-data/add-open-data";
import { UpdateOpenData } from "../AdminComponents/open-data/update-open-data";
import { DeleteOpenData } from "../AdminComponents/open-data/delete-open-data";
import { commonAlert } from "../utils/sweetalert";

export default function OpenData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    try {
      const response = await $api.get("/open-data");
      setData(response.data.data); // API dan kelgan data-ni state-ga saqlaymiz
    } catch (error) {
      console.log(error);
      let errorMessage = {
        message: error.response?.data?.message || "Xatolik",
        errors: error.response?.data?.errors || "",
      };
      console.log(errorMessage);
      let errorHTML = `
            <h2>${errorMessage.message}</h2>
            <ul>
             ${JSON.stringify(errorMessage.errors)}
            </ul>
            `;
      commonAlert(errorHTML, "error");
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
        <p className="whitespace-pre-wrap">
          {row.name?.[activeTab] || "Noma'lum"}
        </p>
      ),
      sortable: true,
    },
    {
      name: "URL",
      selector: (row) =>
        row.url ? (
          <a
            href={row.url.startsWith("http") ? row.url : `https://${row.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Havola
          </a>
        ) : (
          "Url mavjud emas"
        ),
      sortable: false,
      width: "250px",
    },
    {
      name: "File",
      selector: (row) =>
        row.file && Array.isArray(row.file) && row.file.length > 0 ? (
          <a
            href={row.file[row.file.length - 1].url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Havola
          </a>
        ) : (
          "Fayl mavjud emas"
        ),
      sortable: false,
      width: "250px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateOpenData onUpdated={fetchData} rowData={row} />
          <DeleteOpenData onDeleted={fetchData} rowId={row.id} />
        </div>
      ),
      width: "130px",
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
          <AddOpenData onAdded={fetchData} />
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
