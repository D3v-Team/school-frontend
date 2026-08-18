import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button, Input, Checkbox } from "@material-tailwind/react";
import UzNewsCreate from "../AdminComponents/news/news-create/uz-news-create";
import RuNewsCreate from "../AdminComponents/news/news-create/ru-news-create";
import EnNewsCreate from "../AdminComponents/news/news-create/en-news-create";
import KKNewsCreate from "../AdminComponents/news/news-create/kk-news-create";
import { $api } from "../utils";
import { sweetAlert } from "../utils/sweetalert";

export default function NewsCreate() {
  const [activeTab, setActiveTab] = useState("uz");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [date, setDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [showInCarousel, setShowInCarousel] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const [filePreview, setFilePreview] = useState(null); // Rasm preview uchun yangi state

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
      const formData = new FormData();

      formData.append("title[uz]", uzinfo.title);
      formData.append("title[ru]", ruinfo.title);
      formData.append("title[en]", Eninfo.title);
      formData.append("title[kk]", KKinfo.title);

      formData.append("description[uz]", uzinfo.description);
      formData.append("description[ru]", ruinfo.description);
      formData.append("description[en]", Eninfo.description);
      formData.append("description[kk]", KKinfo.description);

      formData.append("summary[en]", Eninfo.summary);
      formData.append("summary[uz]", uzinfo.summary);
      formData.append("summary[ru]", ruinfo.summary);
      formData.append("summary[kk]", KKinfo.summary);

      formData.append("show_in_carousel", showInCarousel === true ? 'true' : 'false');
      formData.append("date", date);
      console.log([...formData.entries()]);

      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      console.log([...formData.entries()]);


      await $api.post(`/news`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      sweetAlert("Muvaffaqiyatli qo'shildi", "success");
      setUzInfo({ title: "", description: "", summary: "" });
      setRuInfo({ title: "", description: "", summary: "" });
      setEnInfo({ title: "", description: "", summary: "" });
      setKKInfo({ title: "", description: "", summary: "" });
      setShowInCarousel(false);
      setDate("");
      setSelectedFile(null);
      setFilePreview(null)
    } catch (error) {
      sweetAlert(`Xatolik: ${error.message}`, "error");
      console.error("Xatolik yuz berdi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Yangilik yaratish</h2>
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
          {loading ? "Yaratilmoqda..." : "Yaratish"}
        </Button>
      </div>
    </div>
  );
}
