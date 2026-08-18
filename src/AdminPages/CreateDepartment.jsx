import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Button,
    Select,
    Option,
    Input,
    Checkbox
} from "@material-tailwind/react";
import UzAboutUsCreate from "../AdminComponents/text-editor/uz";
import EnAboutUsCreate from "../AdminComponents/text-editor/en";
import KKAboutUsCreate from "../AdminComponents/text-editor/kk";
import RuAboutUsCreate from "../AdminComponents/text-editor/ru";
import { $api } from "../utils";
import { sweetAlert } from "../utils/sweetalert";


export default function CreateDepartment() {
    const [uzinfo, setUzInfo] = useState({ title: "", description: "", position: "" });
    const [ruinfo, setRuInfo] = useState({ title: "", description: "", position: "" });
    const [Eninfo, setEnInfo] = useState({ title: "", description: "", position: "" });
    const [KKinfo, setKKInfo] = useState({ title: "", description: "", position: "" });
    const [activeTab, setActiveTab] = useState("uz");
    const [imageFile, setImageFile] = useState(null);
    const [reception_days, setReception_days] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [name, setName] = useState('')

    const [loading, setLoading] = useState(false)


    const CreateAboutUs = async () => {
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

        if (imageFile) {
            formData.append("photo", imageFile);
        }
        formData.append("status", "sections");
        try {
            await $api.post("/department-centers", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            sweetAlert("Muvaffaqiyatli qo'shildi", "success");

            setUzInfo({ title: "", description: "", position: "" });
            setRuInfo({ title: "", description: "", position: "" });
            setEnInfo({ title: "", description: "", position: "" });
            setKKInfo({ title: "", description: "", position: "" });
            setName("");
            setReception_days("");
            setPhone("");
            setEmail("");
            setImageFile(null);

        } catch (error) {
            sweetAlert(`Xatolik: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };



    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) setImageFile(file);
    };


    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Markazlar yaratish</h2>
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
                    <NavLink className={`block`} to={'/admin/centers'}>
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
                    onClick={CreateAboutUs}
                    className="bg-green-500 text-white flex items-center justify-center mt-[10px] w-full">
                    Yaratish
                </Button>
            </div>
        </div>
    )
}