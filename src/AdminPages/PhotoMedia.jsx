import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { AddPhoto } from "../AdminComponents/photo-gallery/add-photo";
import { UpdatePhoto } from "../AdminComponents/photo-gallery/update-photo";
import { DeletePhoto } from "../AdminComponents/photo-gallery/delete-photo";

export default function PhotoMedia() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    try {
      const response = await $api.get("/photo-gallery");
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
      name: "Rasm",
      selector: (row) => (
        row.image?.length > 0 ? (
          <img src={row.image[row.image.length - 1].url} alt="Gallery" className="w-44 my-3 object-cover rounded" />
        ) : (
          "Rasm yo'q"
        )
      ),
      sortable: false,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdatePhoto onUpdated={fetchData} rowData={row} />
          <DeletePhoto onDeleted={fetchData} rowId={row.id} />
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
          <AddPhoto onAdded={fetchData}/>
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
