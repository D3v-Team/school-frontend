import React, { useState, useEffect } from "react";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { $api } from "../utils";
import { Button, IconButton, Tooltip } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { DepartmentCenterDelete } from "../AdminComponents/department-centers/department-centers-delete";

export default function Center() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("uz");

    const fetchData = async () => {
        try {
            const response = await $api.get("/department-centers?status=centers");
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
            selector: (row) => row.title[activeTab],
            sortable: true,
        },
        {
            name: `Markaz rahbari (${activeTab.toUpperCase()})`,
            selector: (row) => row?.name,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex space-x-2">
                    <NavLink to={`/admin/sections-centers/edit/${row?.id}`}>
                        <IconButton variant="text">
                            <FaPencilAlt className="h-4 w-4" />
                        </IconButton>
                    </NavLink>
                    <DepartmentCenterDelete onDeleted={fetchData} rowId={row.id} />
                </div>
            ),
            width: "170px",
        },
    ];

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Bolimlar</h2>
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
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
                <NavLink className="block" to="/admin/centers/create">
                    <Button className="bg-green-500 text-white">Malumot qo'shish</Button>
                </NavLink>
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
