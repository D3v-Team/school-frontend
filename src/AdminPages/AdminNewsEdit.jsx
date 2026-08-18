import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Button, Input, Checkbox } from "@material-tailwind/react";
import UzNewsCreate from "../AdminComponents/news/news-create/uz-news-create";
import RuNewsCreate from "../AdminComponents/news/news-create/ru-news-create";
import EnNewsCreate from "../AdminComponents/news/news-create/en-news-create";
import KKNewsCreate from "../AdminComponents/news/news-create/kk-news-create";
import { $api } from "../utils";
import { sweetAlert } from "../utils/sweetalert";
import Loader from "../lib/loader";

export default function AdminNewsEdit() {
    const [activeTab, setActiveTab] = useState("uz");
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [date, setDate] = useState("");
    const [dateError, setDateError] = useState("");
    const [showInCarousel, setShowInCarousel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(true)
    const { ID } = useParams()

    const [uzinfo, setUzInfo] = useState({
        title: "",
        description: "",
        summary: "",
    });

    const [ruinfo, setRuInfo] = useState({
        title: "",
        description: "",
        summary: "",
    });

    const [Eninfo, setEnInfo] = useState({
        title: "",
        description: "",
        summary: "",
    });

    const [KKinfo, setKKInfo] = useState({
        title: "",
        description: "",
        summary: "",
    });
    const [filePreview, setFilePreview] = useState(null);

    const getInID = async () => {
        try {
            const response = await $api(`/news/${ID}`)
            setUzInfo({ title: response?.data?.data?.title?.uz, description: response?.data?.data?.description?.uz, summary: response?.data?.data?.summary.uz })
            setRuInfo({ title: response?.data?.data?.title?.ru, description: response?.data?.data?.description?.ru, summary: response?.data?.data?.summary.ru })
            setEnInfo({ title: response?.data?.data?.title?.en, description: response?.data?.data?.description?.en, summary: response?.data?.data?.summary.en })
            setKKInfo({ title: response?.data?.data?.title?.kk, description: response?.data?.data?.description?.kk, summary: response?.data?.data?.summary.kk })
            setDate(response?.data?.data?.date)
            setSelectedFile(response?.data?.data?.image[0]?.url)
            setFilePreview(response?.data?.data?.image[0]?.url)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading2(false)
        }
    }

    useEffect(() => {
        getInID()
    }, [])

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];

            if (file.size > 5 * 1024 * 1024) {
                setFileError("Rasm hajmi 5MB dan katta bo'lmasligi kerak");
                setSelectedFile(null);
                setFilePreview(null); // Rasm previewni tozalash
            } else {
                setFileError("");
                setSelectedFile(file);
                setFilePreview(URL.createObjectURL(file)); // Rasm previewni o'rnatish
            }
        }
    };

    const validateForm = () => {
        let isValid = true;
        if (!date) {
            setDateError("Sana tanlash majburiy");
            isValid = false;
        } else {
            setDateError("");
        }
        return isValid;
    };
    const CreateNews = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const requestData = {
                title: {
                    uz: uzinfo.title,
                    ru: ruinfo.title,
                    en: Eninfo.title,
                    kk: KKinfo.title,
                },
                description: {
                    uz: uzinfo.description,
                    ru: ruinfo.description,
                    en: Eninfo.description,
                    kk: KKinfo.description,
                },
                summary: {
                    uz: uzinfo.summary,
                    ru: ruinfo.summary,
                    en: Eninfo.summary,
                    kk: KKinfo.summary,
                },
                show_in_carousel: showInCarousel === true ? "true" : "false",
                date: date,
            };

            await $api.put(`/news/${ID}`, requestData);

            sweetAlert("Muvaffaqiyatli qo'shildi", "success");
            setShowInCarousel(false);
            setDate("");
        } catch (error) {
            sweetAlert(`Xatolik: ${error.message}`, "error");
            console.error("Xatolik yuz berdi:", error);
        } finally {
            setLoading(false);
        }
    };


    if (loading2) {
        return <Loader />;
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Yangilik o'zgartirish</h2>
            <div className="flex justify-between items-center ">
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
                    <NavLink className="block" to={"/admin/news"}>
                        <Button className="bg-green-500 text-white">
                            Barcha yangiliklar
                        </Button>
                    </NavLink>
                </div>
            </div>

            <div className="bg-white p-4 rounded-md">
                <div className="mt-5">
                    {activeTab === "uz" ? (
                        <UzNewsCreate value={uzinfo} onChange={setUzInfo} />
                    ) : activeTab === "ru" ? (
                        <RuNewsCreate value={ruinfo} onChange={setRuInfo} />
                    ) : activeTab === "en" ? (
                        <EnNewsCreate value={Eninfo} onChange={setEnInfo} />
                    ) : (
                        <KKNewsCreate value={KKinfo} onChange={setKKInfo} />
                    )}
                </div>

                <div className="mt-4">
                    <Input
                        type="date"
                        label="Sana tanlang"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
                </div>

                <div className="mt-4">
                    <Checkbox
                        label="Karuselga qo'shish"
                        checked={showInCarousel}
                        onChange={(e) => setShowInCarousel(e.target.checked)}
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition">
                            {selectedFile
                                ? `${selectedFile.name} (${(
                                    selectedFile.size /
                                    1024 /
                                    1024
                                ).toFixed(2)} MB)`
                                : "Rasm yuklash"}
                        </div>
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
                </div>

                {filePreview && (
                    <div className="mt-4">
                        <img
                            src={filePreview}
                            alt="Tanlangan rasm"
                            className="h-60 object-cover rounded-md border"
                        />
                    </div>
                )}

                <Button
                    loading={loading}
                    onClick={CreateNews}
                    className="bg-green-500 text-white text-center mt-4 w-full"
                >
                    {loading ? "Yaratilmoqda..." : "o'zgartirish"}
                </Button>
            </div>
        </div>
    );
}
