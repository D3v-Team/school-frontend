import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Button,
} from "@material-tailwind/react";
import UzAboutUsCreate from "../AdminComponents/text-editor/uz";
import EnAboutUsCreate from "../AdminComponents/text-editor/en";
import KKAboutUsCreate from "../AdminComponents/text-editor/kk";
import { $api } from "../utils";
import { sweetAlert } from "../utils/sweetalert";
import RuAboutUsCreate from "../AdminComponents/text-editor/ru";
import Loader from "../lib/loader";

export default function AboutUsEdit() {

    const [uzinfo, setUzInfo] = useState({ title: "", description: "" });
    const [ruinfo, setRuInfo] = useState({ title: "", description: "" });
    const [Eninfo, setEnInfo] = useState({ title: "", description: "" });
    const [KKinfo, setKKInfo] = useState({ title: "", description: "" });
    const [activeTab, setActiveTab] = useState("uz");
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(true)
    const { ID } = useParams()

    const FechAboutUsId = async () => {
        try {
            const response = await $api.get(`/about-me/${ID}`)
            setUzInfo({ title: response?.data?.data?.title?.uz, description: response?.data?.data?.text?.uz })
            setRuInfo({ title: response?.data?.data?.title?.ru, description: response?.data?.data?.text?.ru })
            setEnInfo({ title: response?.data?.data?.title?.en, description: response?.data?.data?.text?.en })
            setKKInfo({ title: response?.data?.data?.title?.kk, description: response?.data?.data?.text?.kk })
        } catch (error) {
            console.log(error)
        } finally {
            setLoading2(false)
        }
    }

    useEffect(() => {
        FechAboutUsId()
    }, []);

    const EditAboutUs = async () => {
        setLoading(true)
        const payload = {
            title: {
                uz: uzinfo.title,
                ru: ruinfo.title,
                en: Eninfo.title,
                kk: KKinfo.title
            },
            text: {
                uz: uzinfo.description,
                ru: ruinfo.description,
                en: Eninfo.description,
                kk: KKinfo.description
            },
        };

        try {
            await $api.put(`/about-me/${ID}`, payload);
            sweetAlert("Muvaffaqiyatli qo'shildi", "success");
        } catch (error) {
            sweetAlert(`Xatolik: ${error.message}`, "error");
        } finally {
            setLoading(false)
        }
    };

    if (loading2) {
        return <Loader />;
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Biz haqimizda o`zgartirish</h2>
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

            </div>
            <div className="bg-[white] p-[20px] rounded-[10px] mt-[20px]">
                <div className="mt-5">
                    {activeTab === "uz" ? (
                        <UzAboutUsCreate value={uzinfo} onChange={setUzInfo} />
                    ) : activeTab === "ru" ? (
                        <RuAboutUsCreate value={ruinfo} onChange={setRuInfo} />
                    ) : activeTab === "en" ? (
                        <EnAboutUsCreate value={Eninfo} onChange={setEnInfo} />
                    ) : activeTab === "kk" ? (
                        <KKAboutUsCreate value={KKinfo} onChange={setKKInfo} />
                    ) : null}
                </div>
                <Button
                    disabled={loading}
                    loading={loading}
                    onClick={EditAboutUs}
                    className="bg-green-500 text-white flex items-center justify-center mt-[10px] w-full">
                    O`zgartirish
                </Button>
            </div>
        </div>
    )
}