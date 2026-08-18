import React, { useState } from "react";
import {
  Dialog,
  Button,
  Typography,
  IconButton,
  Input,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";

export function AddOpenData({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [form, setForm] = useState({
    name: { uz: "", ru: "", en: "", kk: "" },
    url: "",
  });

  const handleOpen = () => setOpen(!open);

  const validateForm = () => {
    let newErrors = {};

    // Sarlavha tekshirish
    ["uz", "ru", "en", "kk"].forEach((lang) => {
      if (!form.name[lang] || form.name[lang].length < 3) {
        newErrors[
          lang
        ] = `Sarlavha (${lang.toUpperCase()}) kamida 3 ta belgi bo‘lishi kerak!`;
      }
    });

    // URL tekshirish
    const urlPattern = /^(https?:\/\/)[\w.-]+(?:\.[\w.-]+)+(?:[\/\w._%+-]*)?$/;
    if (form.url) {
      if (!urlPattern.test(form.url)) {
        newErrors.url = "URL noto‘g‘ri formatda kiritilgan!";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTitleChange = (e, lang) => {
    setForm((prev) => ({
      ...prev,
      name: { ...prev.name, [lang]: e.target.value },
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setForm((prev) => ({ ...prev, file: selectedFile }));
    }
  };

  const handleUrlChange = (e) => {
    setForm((prev) => ({ ...prev, url: e.target.value }));
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Name obyektini to‘g‘ri formatda qo‘shish
      Object.keys(form.name).forEach((lang) => {
        formData.append(`name[${lang}]`, form.name[lang]);
      });
  
      formData.append("url", form.url);
      if (file) {
        formData.append("file", file);
      }
  
      await $api.post("/open-data", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      onAdded();
      sweetAlert("Muvaffaqiyatli qo‘shildi", "success");
      handleOpen();
      setForm({ name: { uz: "", ru: "", en: "", kk: "" }, url: "" });
      setFile(null);
      setFileName("");
      setErrors({});
    } catch (error) {
      setOpen(false);
      console.log(error);
      let errorMessage = {
        message: error.response?.data?.message || "Xatolik",
        errors: error.response?.data?.errors || "",
      };
      console.log(errorMessage);
      let errorHTML = `
                  <h2>${errorMessage.message}</h2>
                  <ul>
                   ${JSON.stringify(errorMessage.errors)}
                  </ul>
                  `;
      commonAlert(errorHTML, "error");
    }
    setLoading(false);
  };
  
  

  return (
    <>
      <Button onClick={handleOpen} className="bg-green-500 text-white">
        Malumot qo‘shish
      </Button>

      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Malumot Qo‘shish
          </Typography>
          <IconButton
            size="sm"
            variant="text"
            className="!absolute right-3.5 top-3.5"
            onClick={handleOpen}
          >
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="space-y-4 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {["uz", "ru", "en", "kk"].map((lang) => (
              <div key={lang}>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  Sarlavha ({lang.toUpperCase()})
                </Typography>
                <Input
                  value={form.name[lang]}
                  onChange={(e) => handleTitleChange(e, lang)}
                  placeholder={`Sarlavha (${lang.toUpperCase()})`}
                  required
                />
                {errors[lang] && (
                  <p className="text-red-500 text-sm">{errors[lang]}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-medium"
            >
              URL
            </Typography>
            <Input
              value={form.url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              required
            />
            {errors.url && <p className="text-red-500 text-sm">{errors.url}</p>}
          </div>

          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-medium"
            >
              Fayl yuklash
            </Typography>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xlsx,.csv,.jpg,.png"
            />
            {/* {fileName && (
              <p className="text-gray-700 text-sm mt-1">
                Tanlangan fayl: {fileName}
              </p>
            )} */}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-500 text-white"
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
