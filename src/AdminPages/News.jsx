import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
import {
  Button,
  IconButton,

} from "@material-tailwind/react";
import DeleteNews from '../AdminComponents/news/delete-news'
import Loader from "../lib/loader";
import { $api } from "../utils";
import CustomDataTable from '../lib/custom-data-table';
import { FaPencilAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function News() {
  const [activeTab, setActiveTab] = useState("uz");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {
    try {
      const response = await $api.get("/news");
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
      selector: (row, index) => (index + 1),
      // selector: (_, index) => (page - 1) * perPage + index + 1,
      width: "170px",
    },
    {
      name: `Rasm`,
      selector: (row) => {
        return (
          <div className='my-[20px]'>
            <img className='w-[200px] h-[100px] rounded-[10px] object-cover' src={row?.image[0]?.url} alt="Foto" />
          </div>
        )
      },
    },
    {
      name: `Sarlavha (${activeTab.toUpperCase()})`,
      selector: (row) => {
        return (
          <p className='whitespace-pre-wrap'>
            {row.title[activeTab]}
          </p>
        )
      },
    },
    {
      name: "Malumot",
      selector: (row) => {
        return (
          <p className=' whitespace-pre-wrap'>
            {row.description[activeTab]}
          </p>
        )
      },
    },
    {
      name: "Action",
      cell: (row) => (

        <div className="flex space-x-2">
          <NavLink to={`/admin/news/edit/${row?.id}`}>
            <IconButton className=" text-black" variant="text">
              <FaPencilAlt className="h-4 w-4" />
            </IconButton>
          </NavLink>
          <DeleteNews Id={row.id} onCategoryDeleted={fetchData} />
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
      <h2 className="text-xl font-bold mb-4">Yangiliklar</h2>
      <div className=" flex  justify-between items-center ">
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
          <NavLink className={`block`} to={'/admin/news/create'}>
            <Button className="bg-green-500 text-white">
              Yangilik qo'shish
            </Button>
          </NavLink>
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
  )
}
