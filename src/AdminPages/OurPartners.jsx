import React, { useState, useEffect } from "react";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { $api } from "../utils";
import { Tooltip } from "@material-tailwind/react";
import { CreateOurPartners } from "../AdminComponents/OurPartners/create-our-partners";
import { UpdateOurPartners } from "../AdminComponents/OurPartners/edit-our-partners";
import { DeleteOurPartners } from "../AdminComponents/OurPartners/delete-our-partners";

export default function OurPartners() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("uz");

    const fetchData = async () => {
        try {
            const response = await $api.get("/our-partners");
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
            name: "Nomi",
            selector: (row) => ( <Tooltip content={row?.name} placement="right">
                <span>{ row?.name }</span>
            </Tooltip>),
            sortable: true,
        },
        {
            name: "URL",
            selector: (row) => (
                <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    Havola
                </a>
            ),
            sortable: false,
        },
        {
            name: "Rasm",
            selector: (row) => (
                <div className="my-2">
                    <img
                        src={row?.image[0]?.url}
                        className="w-32 h-16  object-cover"
                    />
                </div>
            ),
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex space-x-2">
                    <UpdateOurPartners onUpdated={fetchData} rowData={row} />
                    <DeleteOurPartners onDeleted={fetchData} rowId={row.id} />
                </div>
            ),
            width: "170px",
        },
    ];

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Hamkorlarimiz</h2>
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
                <CreateOurPartners onAdded={fetchData} />
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
