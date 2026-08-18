import React, { useState, useEffect } from "react";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { $api } from "../utils";
import { Tooltip, Avatar } from "@material-tailwind/react";
import { AddManagement } from "../AdminComponents/management/add-menegment";
import { UpdateManagement } from "../AdminComponents/management/update-management";
import { DeleteManagement } from "../AdminComponents/management/delete-management";

export default function Management() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    try {
      const response = await $api.get("/management");
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
      name: "Avatar",
      selector: (row) => (
        <div className="my-2">
          <Avatar size="lg"
            src={row.image[0]?.url || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
            className=" object-cover"
          />
        </div>
      ),
      width: "90px"
    },
    {
      name: "Ism",
      selector: (row) => (
        <p className="whitespace-pre-wrap">{ row.name }</p>
      ),
      sortable: true, 
      width: "230px",
    },
    {
      name: `Lavozim (${activeTab.toUpperCase()})`,
      selector: (row) => (
        <p className="whitespace-pre-wrap">{ row.position[activeTab] }</p>
      ),
      width: "260px"
    },
    {
      name: "Qabul kunlari",
      selector: (row) => (
        <p className="whitespace-pre-wrap">{ row.reception_days }</p>
      ), 
      width: "150px",
    },
    {
      name: "Telefon",
      selector: (row) => row.phone,
      width: "120px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateManagement onUpdated={fetchData} rowData={row} />
          <DeleteManagement onDeleted={fetchData} rowId={row.id} />
        </div>
      ),
      width: "130px",
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rahbariyat</h2>
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
        <AddManagement onAdded={fetchData} />
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
