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

export function CreateJob({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: { uz: "", ru: "", en: "", kk: "" },
    faculty: { uz: "", ru: "", en: "", kk: "" },
    description: { uz: "", ru: "", en: "", kk: "" },
    location: { uz: "", ru: "", en: "", kk: "" },
    employment_type: { uz: "", ru: "", en: "", kk: "" },
    url: ""
  });
  const [errors, setErrors] = useState({
    title: {}, faculty: {}, description: {}, location: {}, employment_type: {}, url: ""
  });

  const handleOpen = () => setOpen(!open);

  const fieldLabels = {
    title: "E'lon nomi",
    faculty: "Fakultet",
    description: "Tavsif",
    location: "Manzil",
    employment_type: "Bandlik turi"
  };

  const handleChange = (e, field, lang) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: e.target.value },
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: e.target.value.trim() ? "" : "Maydon to'ldirilishi shart" }
    }));
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, url: value }));
    const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;
    setErrors((prev) => ({ ...prev, url: urlRegex.test(value) ? "" : "To‘g‘ri URL kiriting" }));
  };

  const handleAdd = async () => {
    let hasError = false;
    const newErrors = {
      title: {}, faculty: {}, description: {}, location: {}, employment_type: {}, url: ""
    };

    ["title", "faculty", "description", "location", "employment_type"].forEach((field) => {
      Object.keys(form[field]).forEach((lang) => {
        if (!form[field][lang].trim()) {
          newErrors[field][lang] = "Maydon to'ldirilishi shart";
          hasError = true;
        }
      });
    });

    if (!form.url || !/^(https?:\/\/)[^\s$.?#].[^\s]*$/.test(form.url)) {
      newErrors.url = "To‘g‘ri URL kiriting";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await $api.post("/job-vacancies", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onAdded();
      setForm({
        title: { uz: "", ru: "", en: "", kk: "" },
        faculty: { uz: "", ru: "", en: "", kk: "" },
        description: { uz: "", ru: "", en: "", kk: "" },
        location: { uz: "", ru: "", en: "", kk: "" },
        employment_type: { uz: "", ru: "", en: "", kk: "" },
        url: ""
      });
      sweetAlert("Muvaffaqiyatli qo‘shildi", "success");
      handleOpen();
    } catch (error) {
      console.error("Xatolik:", error);
      sweetAlert("Xatolik yuz berdi!", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={handleOpen} className="bg-green-500 text-white">
        E'lon yaratish
      </Button>

      <Dialog open={open} handler={handleOpen} size="xl" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">E'lon yaratish</Typography>
          <IconButton size="sm" variant="text" className="!absolute right-3.5 top-3.5" onClick={handleOpen}>
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4 pb-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 h-[400px]">
            {["title", "faculty", "description", "location", "employment_type"].map((field) => (
              ["uz", "ru", "en", "kk"].map((lang) => (
                <div key={`${field}-${lang}`}>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    {fieldLabels[field]} ({lang.toUpperCase()})
                  </Typography>
                  <Input value={form[field][lang]} onChange={(e) => handleChange(e, field, lang)} required />
                  {errors[field][lang] && <Typography color="red" className="mt-1">{errors[field][lang]}</Typography>}
                </div>
              ))
            ))}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">Havola</Typography>
              <Input value={form.url} onChange={handleUrlChange} required />
              {errors.url && <Typography color="red" className="mt-1">{errors.url}</Typography>}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={loading} className="bg-blue-500 text-white">
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}