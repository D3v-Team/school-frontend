import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { AddCategoryDetail } from "../AdminComponents/category-detail/add-category-detail";
import { UpdateCategoryDetail } from "../AdminComponents/category-detail/update-category-detail";
import { DeleteCategoryDetail } from "../AdminComponents/category-detail/delete-category-detail";
import { FaRightToBracket } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import PostDelete from "../AdminComponents/Post/PostDelete";


export default function AllPosts() {
    const { ID } = useParams();
    const [details, setDetails] = useState([]);
    const [categoryTitle, setCategoryTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState("uz");


    const fetchData = async () => {
        try {
            const { data } = await $api.get(`/category-detail/${ID}`);
            setCategoryTitle(data?.data?.title || {});
            setDetails(data?.data?.posts || []);
        } catch (error) {
            console.error("Xatolik yuz berdi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [ID]);

    const columns = [
        {
            name: "Tr",
            selector: (_, index) => (page - 1) * perPage + index + 1,
            width: "80px",
        },
        {
            name: `Sarlavha (${activeTab.toUpperCase()})`,
            selector: (row) => row.title[activeTab],
            sortable: true,
        },
        {
            name: `Havola`,
            selector: (row) => {
                return (
                    <Link
                        to={`/sahifa/${ID}`}
                        className=" w-32 p-2 flex justify-center bg-blue-400 shadow rounded-xl cursor-pointer text-white"
                    >
                        <FaRightToBracket className=" text-xl text-center" />
                    </Link>
                );
            },
        },
        {
            name: `Malumot o'zgartirish`,
            selector: (row) => {
                return (
                    <Link
                        to={`/admin/post/edit/${row.id}`}
                        className=" w-32 p-2 flex justify-center bg-yellow-400 shadow rounded-xl cursor-pointer text-white"
                    >
                        <FaRightToBracket className=" text-xl text-center" />
                    </Link>
                );
            },
        },
        {
            name: `Malumot o'chirish`,
            selector: (row) => {
                return (
                    <PostDelete Id={row?.id} refresh={fetchData} />
                );
            },
        },
    ];

    if (loading) {
        return <Loader />;
    }


    return (
        <div>
            <h2 className="text-xl font-bold mb-4">
                {categoryTitle[activeTab]} - Sahifa malumotlari
            </h2>
            <div className="mb-4 flex justify-between items-center">
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
                    <AddCategoryDetail onCategoryDetailAdded={fetchData} />
                </div>
            </div>
            <CustomDataTable
                data={details}
                columns={columns}
                page={page}
                setPage={setPage}
                perPage={perPage}
                setPerPage={setPerPage}
            />
        </div>
    );
}
