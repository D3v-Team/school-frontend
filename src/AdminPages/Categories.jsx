import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { AddCategory } from "../AdminComponents/categories/add-category";
import { UpdateCategory } from "../AdminComponents/categories/update-category";
import { DeleteCategory } from "../AdminComponents/categories/delete-category";
import { FaRightToBracket } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Categories() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    try {
      const response = await $api.get("/category");
      setData(response.data.data);
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 300);
  }, [window.location.href]);

  const columns = [
    {
      name: "Tr",
      selector: (_, index) => (page - 1) * perPage + index + 1,
      width: "70px",
    },
    {
      name: `Sarlavha (${activeTab.toUpperCase()})`,
      selector: (row) => (
        <p className="whitespace-pre-wrap">{row.title[activeTab]}</p>
      ),
      sortable: true,
    },
    {
      name: `Kategoriya bo'limlari`,
      selector: (row) => {
        return (
          <Link
            to={`detail/${row.id}`}
            className=" w-32 p-2 flex justify-center bg-blue-400 shadow rounded-xl cursor-pointer text-white"
          >
            <FaRightToBracket className=" text-xl text-center" />
          </Link>
        );
      },
      width: "200px"
    },
    // {
    //   name: "Slag",
    //   selector: (row) => row.slug,
    //   sortable: true,
    // },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateCategory categoryData={row} onCategoryUpdated={fetchData} />
          <DeleteCategory categoryId={row.id} onCategoryDeleted={fetchData} />
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
      <h2 className="text-xl font-bold mb-4">Kategoriyalar</h2>
      <div className=" flex  justify-between items-center ">
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
          <AddCategory onCategoryAdded={fetchData} />
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
