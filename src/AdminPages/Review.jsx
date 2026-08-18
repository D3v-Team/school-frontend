import { Button, IconButton } from '@material-tailwind/react';
import { TrashIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { $api } from '../utils';
import Loader from '../lib/loader';
import ReviewDelete from '../AdminComponents/review/review-delete';

export default function Review() {
    const [activeTab, setActiveTab] = useState("uz");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const response = await $api.get("/review-process");
            setData(response.data.data);
        } catch (error) {
            console.error("Xatolik yuz berdi:", error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Murojaatlarni ko‘rib chiqish tartibi</h2>
            <div className="flex justify-between items-center">
                <div className="mb-4 flex space-x-2">
                    {["uz", "ru", "en", "kk"].map((lang) => (
                        <button
                            key={lang}
                            className={`px-4 py-2 rounded ${activeTab === lang ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                            onClick={() => setActiveTab(lang)}
                        >
                            {lang == "kk" ? "CHI" : lang.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div>
                    <NavLink className="block" to="/admin/review/create">
                        <Button className="bg-green-500 text-white">Malumot qo'shish</Button>
                    </NavLink>
                </div>
            </div>
            {data?.length > 0 && data ? (
                data?.map((i, index) => (
                    <div key={index} className="bg-white p-5 rounded-lg mt-5 shadow">
                        <div className="flex items-center justify-end">
                            <div className="flex items-center gap-2">
                                <NavLink to={`/admin/review/edit/${i?.id}`}>
                                    <IconButton className="bg-blue-500 text-white" variant="text">
                                        <FaPencilAlt className="h-4 w-4" />
                                    </IconButton>
                                </NavLink>
                                <ReviewDelete Id={i?.id} refresh={fetchData} />
                            </div>
                        </div>
                        <h1 className="font-bold text-xl">{i?.title?.[activeTab]}</h1>
                        {/* Рендеринг HTML-контента */}
                        <div className="mt-2" dangerouslySetInnerHTML={{ __html: i?.description?.[activeTab] }} />
                    </div>
                ))
            ) : (
                <div className='h-[500px] flex items-center justify-center'>
                    <h1 className='opacity-[0.5]'>
                        Malumot Yo'q
                    </h1>
                </div>
            )}

        </div>
    );
}
