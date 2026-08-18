import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { FaCheckCircle, FaEnvelopeOpenText, FaEnvelope } from "react-icons/fa";
import { DeleteMessage } from "../AdminComponents/message-user/delete-message";
import ShowAll from "../AdminComponents/user-message/showAll";

export default function MessageUser() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchData = async () => {
    try {
      const response = await $api.get("/message-user");
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

  const updateStatus = async (id) => {
    try {
      await $api.post(`/message-status/${id}`, {
        status: "Javob berildi",
      });
      fetchData();
    } catch (error) {
      console.error("Status yangilashda xatolik yuz berdi:", error);
    }
  };

  const columns = [
    {
      name: "Tr",
      selector: (_, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: "70px",
    },
    {
      name: "F.I.O",
      selector: (row) => <p className="whitespace-pre-wrap">{row.full_name}</p>,
      sortable: true,
      width: "250px",
    },
    {
      name: "Shahar",
      selector: (row) => row.city || "Noma'lum",
      sortable: true,
      width: "180px",
    },
    {
      name: "Tuman",
      selector: (row) => row.district || "Noma'lum",
      sortable: true,
      width: "180px",
    },
    {
      name: "Telefon",
      selector: (row) => row.phone,
      sortable: true,
      width: "180px",
    },
    {
      name: "Fayl",
      selector: (row) =>
        row.file.length > 0 ? (
          <a
            href={row.file[0]?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 bg-blue-50 p-2 rounded-2xl underline"
          >
            Havola
          </a>
        ) : (
          "-"
        ),
      sortable: false,
      width: "100px",
    },
    {
      name: "Status",
      selector: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === "O'qilmadi" && (
            <FaEnvelope className="text-red-500" />
          )}
          {row.status === "O'qildi" && (
            <FaEnvelopeOpenText className="text-yellow-500" />
          )}
          {row.status === "Javob berildi" && (
            <FaCheckCircle className="text-green-500" />
          )}
          <button
            onClick={() => updateStatus(row.id)}
            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
          >
            O'qish
          </button>
        </div>
      ),
      sortable: true,
      width: "140px",
    },
    {
      name: "Actions",
      selector: (row) => (
        <div className="flex">
          <ShowAll id={row.id} />
          <DeleteMessage onDeleted={fetchData} rowId={row.id} />
        </div>
      ),
      sortable: true,
      width: "140px",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Foydalanuvchi Xabarlari</h2>
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
