import React, { useState, useEffect } from "react";
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
import { FaPencilAlt } from "react-icons/fa";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";

export function UpdatePhoto({ rowData, onUpdated }) {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: { uz: "", ru: "", en: "", kk: "" },
    photo: null,
  });

  // rowData orqali kelgan ma'lumotlarni yuklash
  useEffect(() => {
    if (rowData?.id) {
      setForm({
        title: {
          uz: rowData?.title?.uz || "",
          ru: rowData?.title?.ru || "",
          en: rowData?.title?.en || "",
          kk: rowData?.title?.kk || "",
        },
        photo: null,
      });
    }
  }, [rowData]);

  const handleOpen = () => setOpen(!open);

  const handleTitleChange = (e, lang) => {
    setForm((prev) => ({
      ...prev,
      title: { ...prev.title, [lang]: e.target.value },
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleUpdate = async () => {
    let newErrors = {};
    ["uz", "ru", "en", "kk"].forEach((lang) => {
      if (!form.title[lang] || form.title[lang].length < 3) {
        newErrors[lang] = `Sarlavha (${lang.toUpperCase()}) kamida 3 ta belgi bo‘lishi kerak!`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      if (form.photo) {
        formData.append("photo", form.photo);
      }
      Object.keys(form.title).forEach((lang) => {
        formData.append(`title[${lang}]`, form.title[lang]);
      });

      await $api.post(`/photo-gallery-uypdate/${rowData.id}`, formData);
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
            Rasmni Yangilash
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
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Sarlavha ({lang.toUpperCase()})
                </Typography>
                <Input
                  value={form.title[lang]}
                  onChange={(e) => handleTitleChange(e, lang)}
                  placeholder={`Sarlavha (${lang.toUpperCase()})`}
                  required
                />
                {errors[lang] && <p className="text-red-500 text-sm">{errors[lang]}</p>}
              </div>
            ))}
          </div>

          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Yangi rasm yuklash (ixtiyoriy)
            </Typography>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleUpdate} disabled={loading} className="bg-blue-500 text-white">
            {loading ? "Yangilanmoqda..." : "Yangilash"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
