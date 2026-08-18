import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
    Button,
    Select,
    Option,
    Input,

} from "@material-tailwind/react";
import UzAboutUsCreate from "../AdminComponents/text-editor/uz";
import EnAboutUsCreate from "../AdminComponents/text-editor/en";
import KKAboutUsCreate from "../AdminComponents/text-editor/kk";
import RuAboutUsCreate from "../AdminComponents/text-editor/ru";
import { $api } from "../utils";
import { sweetAlert } from "../utils/sweetalert";
import Loader from "../lib/loader";


export default function DepartmenEdit() {
    const [uzinfo, setUzInfo] = useState({ title: "", description: "", position: "" });
    const [ruinfo, setRuInfo] = useState({ title: "", description: "", position: "" });
    const [Eninfo, setEnInfo] = useState({ title: "", description: "", position: "" });
    const [KKinfo, setKKInfo] = useState({ title: "", description: "", position: "" });
    const [imageFile, setImageFile] = useState(null);
    const [reception_days, setReception_days] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [name, setName] = useState('')
    const [activeTab, setActiveTab] = useState("uz");
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(true)
    const [status, setStatus] = useState('')
    const { ID } = useParams()

    const FechDataId = async () => {
        try {
            const response = await $api.get(`/department-centers/${ID}`)
            setUzInfo({ title: response?.data?.data?.title?.uz, description: response?.data?.data?.text?.uz, position: response?.data?.data?.position?.uz });
            setRuInfo({ title: response?.data?.data?.title?.ru, description: response?.data?.data?.text?.ru, position: response?.data?.data?.position?.ru })
            setEnInfo({ title: response?.data?.data?.title?.en, description: response?.data?.data?.text?.en, position: response?.data?.data?.position?.en })
            setKKInfo({ title: response?.data?.data?.title?.kk, description: response?.data?.data?.text?.kk, position: response?.data?.data?.position?.kk })
            setStatus(response?.data?.data?.status)
            setName(response?.data?.data?.name)
            setReception_days(response?.data?.data?.reception_days)
            setImageFile(response?.data?.data?.imageFile)
            setPhone(response?.data?.data?.phone)
            setEmail(response?.data?.data?.email)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading2(false)
        }
    }

    useEffect(() => {
        FechDataId()
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) setImageFile(file);
    };

    const Handledit = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append("title[uz]", uzinfo.title);
        formData.append("title[ru]", ruinfo.title);
        formData.append("title[en]", Eninfo.title);
        formData.append("title[kk]", KKinfo.title);

        formData.append("text[uz]", uzinfo.description);
        formData.append("text[ru]", ruinfo.description);
        formData.append("text[en]", Eninfo.description);
        formData.append("text[kk]", KKinfo.description);

        formData.append("position[uz]", uzinfo.position);
        formData.append("position[ru]", ruinfo.position);
        formData.append("position[en]", Eninfo.position);
        formData.append("position[kk]", KKinfo.position);

        formData.append("name", name);
        formData.append("reception_days", reception_days);
        formData.append("phone", phone);
        formData.append("email", email);

        formData.append("status", status);

        try {
            await $api.post(`/department-center-update/${ID}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            sweetAlert("Muvaffaqiyatli qo'shildi", "success");
        } catch (error) {
            sweetAlert(`Xatolik: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };




    if (loading2) {
        return <Loader />;
    }
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">{status === 'sections' ? "Bolim" : 'Markaz'} yangilash</h2>
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
                    <NavLink className={`block`} to={`/admin/${status}`}>
                        <Button className="bg-green-500 text-white">
                            Malumot ko'rish
                        </Button>
                    </NavLink>
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

                <h1 className="mt-[10px]">
                    Rahbar haqida malumot
                </h1>
                <div className="mt-[10px]">
                    <Input
                        label="F.I.O"
                        name="title"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-[10px]">
                    <Input
                        label="Qabul kunlari"
                        name="Day"
                        value={reception_days}
                        onChange={(e) => setReception_days(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-[10px]">
                    <Input
                        label="Teleefon raqam"
                        name="Number"
                        type="number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-[10px]">
                    <Input
                        label="Email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-[10px]">
                    <Input label="Foto" type="file" onChange={handleImageUpload} accept="image/*" />
                </div>


                <div className="">
                    {activeTab === "uz" ? (
                        <div className="mt-[10px]">
                            <Input
                                label="Position (Uz)"
                                name="title"
                                value={uzinfo?.position || ""}
                                onChange={(e) => setUzInfo({ ...uzinfo, position: e.target.value })}
                                required
                            />

                        </div>) : activeTab === "ru" ? (
                            <div className="mt-[10px]">
                                <Input
                                    label="Position (Ru)"
                                    name="title"
                                    value={ruinfo?.position || ""}
                                    onChange={(e) => setRuInfo({ ...ruinfo, position: e.target.value })}
                                    required
                                />
                            </div>
                        ) : activeTab === "en" ? (
                            <div className="mt-[10px]">
                                <Input
                                    label="Position (En)"
                                    name="title"
                                    value={Eninfo?.position || ""}
                                    onChange={(e) => setEnInfo({ ...Eninfo, position: e.target.value })}
                                    required
                                />
                            </div>) : activeTab === "kk" ? (
                                <div className="mt-[10px]">
                                    <Input
                                        label="Position (CHI)"
                                        name="title"
                                        value={KKinfo?.position || ""}
                                        onChange={(e) => setKKInfo({ ...KKinfo, position: e.target.value })}
                                        required
                                    />
                                </div>) : null}
                </div>

                <Button
                    disabled={loading}
                    loading={loading}
                    onClick={Handledit}
                    className="bg-green-500 text-white flex items-center justify-center mt-[10px] w-full">
                    Saqlash
                </Button>
            </div>
        </div>
    )
}