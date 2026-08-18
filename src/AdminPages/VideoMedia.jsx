import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { UpdateVideo } from "../AdminComponents/video-gallery/update-video";
import { DeleteVideo } from "../AdminComponents/video-gallery/delete-video";
import { AddVideo } from "../AdminComponents/video-gallery/add-video";

export default function VideoMedia() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    try {
      const response = await $api.get("/video-gallery");
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
      selector: (_, index) => (page - 1) * perPage + index + 1,
      width: "80px",
    },
    {
      name: `Sarlavha (${activeTab.toUpperCase()})`,
      selector: (row) => row.title?.[activeTab] || "Noma'lum",
      sortable: true,
    },
    {
      name: "Video Url",
      selector: (row) => (
        <a className="text-blue-500 underline" target="_blank" rel="noopener noreferrer" href={row?.url}>
          Video havola
        </a>
      ),
      sortable: false,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateVideo onUpdated={fetchData} rowData={row} />
          <DeleteVideo onDeleted={fetchData} rowId={row.id} />
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
              className={`px-4 py-2 rounded ${activeTab === lang ? "bg-blue-500 text-white" : "bg-gray-300"}`}
              onClick={() => setActiveTab(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <div>
          <AddVideo onAdded={fetchData}/>
        </div>
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
