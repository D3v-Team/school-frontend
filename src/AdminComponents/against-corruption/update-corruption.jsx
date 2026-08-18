import React, { useEffect, useState } from "react";
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
import { FaPencilAlt } from "react-icons/fa";

export function UpdateCorruption({ onUpdated, rowData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [existingFile, setExistingFile] = useState(null);

  const [form, setForm] = useState({
    name: { uz: "", ru: "", en: "", kk: "" },
    url: "",
  });

  const handleOpen = () => setOpen(!open);

  useEffect(() => {
    if (rowData) {
      setForm({
        name: rowData.name,
        url: rowData.url,
      });
    }
  }, [rowData]);

  // Title o'zgarishini boshqarish
  const handleTitleChange = (e, lang) => {
    setForm((prev) => ({
      ...prev,
      name: { ...prev.name, [lang]: e.target.value },
    }));
  };

  // URL o'zgarishini boshqarish
  const handleUrlChange = (e) => {
    setForm((prev) => ({ ...prev, url: e.target.value }));
  };

  // Fayl tanlash
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpdate = async () => {
    // **Sarlavha barcha tillarda kiritilganligini tekshiramiz**
    for (const lang of ["uz", "ru", "en", "kk"]) {
      if (!form.name[lang]) {
        sweetAlert(
          `Sarlavha (${lang.toUpperCase()}) kiritish majburiy!`,
          "error"
        );
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // **Har bir til uchun name alohida qo‘shiladi**
      formData.append("name[uz]", form.name.uz);
      formData.append("name[ru]", form.name.ru);
      formData.append("name[en]", form.name.en);
      formData.append("name[kk]", form.name.kk);

      if (form.url) {
        // URL-ni serverga qayta jo‘natamiz
        formData.append("url", form.url);
      }

      // **Faylni qo'shish (agar yuklangan bo‘lsa)**
      if (file) {
        formData.append("file", file);
      }
      await $api.post(`/fighting-corruption-update/${rowData.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUpdated();
      sweetAlert("Muvaffaqiyatli yangilandi", "success");
      handleOpen();
    } catch (error) {
      console.error("Xatolik:", error);
      sweetAlert("Xatolik yuz berdi!", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <IconButton onClick={handleOpen} variant="text">
        <FaPencilAlt className="h-4 w-4" />
      </IconButton>

      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Ma'lumotlarni tahrirlash
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
          {/* Title (ko‘p tilli) */}
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
              </div>
            ))}
          </div>

          {/* URL qo'shish */}
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
          </div>

          {/* Fayl yuklash */}
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-medium"
            >
              Fayl yuklash
            </Typography>
            <Input type="file" onChange={handleFileChange} />

            {fileName && (
              <p className="text-gray-700 text-sm mt-1">
                Tanlangan fayl: {fileName}
              </p>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-500 text-white"
          >
            {loading ? "Yangilanyapti..." : "Yangilash"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
