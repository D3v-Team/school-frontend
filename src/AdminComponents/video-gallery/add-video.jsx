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

export function AddVideo({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: { uz: "", ru: "", en: "", kk: "" },
    url: null,
  });

  const handleOpen = () => setOpen(!open);

  const handleTitleChange = (e, lang) => {
    setForm((prev) => ({
      ...prev,
      title: { ...prev.title, [lang]: e.target.value },
    }));
  };

  const handleLinkChange = (e) => {
    setForm((prev) => ({ ...prev, url: e.target.value }));
  };

  const handleAdd = async () => {
    let newErrors = {};
    ["uz", "ru", "en", "kk"].forEach((lang) => {
      if (!form.title[lang] || form.title[lang].length < 3) {
        newErrors[
          lang
        ] = `Sarlavha (${lang.toUpperCase()}) kamida 3 ta belgi bo‘lishi kerak!`;
      }
    });

    if (!form.url) {
      newErrors.url = "Havola yuklash kerak";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("url", form.url);
      Object.keys(form.title).forEach((lang) => {
        formData.append(`title[${lang}]`, form.title[lang]);
      });

      await $api.post("/video-gallery", formData);
      onAdded();
      sweetAlert("Muvaffaqiyatli qo‘shildi", "success");
      handleOpen();
      setForm({ title: { uz: "", ru: "", en: "", kk: "" }, photo: null });
      setErrors({});
    } catch (error) {
      console.error("Xatolik:", error);
      sweetAlert("Xatolik yuz berdi!", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={handleOpen} className="bg-green-500 text-white">
        Rasm qo‘shish
      </Button>

      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Rasm Qo‘shish
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
                  value={form.title[lang]}
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
              Video havolasi
            </Typography>
            <Input
              type="text"
              label="https://www.youtube.com"
              onChange={handleLinkChange}
              required
            />
            {errors.url && (
              <p className="text-red-500 text-sm">{errors.url}</p>
            )}
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
