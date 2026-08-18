import { Button, IconButton } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import { $api } from "../utils";
import Loader from "../lib/loader";
import PostDelete from "../AdminComponents/Post/PostDelete";
import CustomDataTable from "../lib/custom-data-table";
import { FaRightToBracket } from "react-icons/fa6";

export default function Post() {

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("uz");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await $api.get("/post");
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
      width: "70px",
    },
    {
      name: `Sarlavha (${activeTab.toUpperCase()})`,
      selector: (row) => <p className="whitespace-pre-wrap">{ row.title[activeTab] }</p>,
      sortable: true,
    },
    {
      name: "Sahifa",
      selector: (row) => row.category?.title[activeTab],
      sortable: true,
    },
    {
      name: `Havola`,
      selector: (row) => {
        return (
          <Link
            to={`/sahifa/${row.id}`}
            className=" w-32 p-2 flex justify-center text-blue-400 shadow rounded-xl cursor-pointer"
          >
            https://ticty.uz/sahifa/{row?.id}
          </Link>
        );
      },
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sahifalar</h2>
      <div className="flex justify-between items-center">
        <div className="mb-4 flex space-x-2">
          {["uz", "ru", "en", "kk"].map((lang) => (
            <button
              key={lang}
              className={`px-4 py-2 rounded ${activeTab === lang ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              onClick={() => setActiveTab(lang)}
            >
              {lang == "kk" ? "CHI" : lang.toUpperCase()}
            </button>
          ))}
        </div>
        <div>
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
