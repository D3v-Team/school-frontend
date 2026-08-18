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
  Select,
  Option,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";
import { FaPencilAlt } from "react-icons/fa";

export function UpdateJob({ onUpdated, rowData }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: { uz: "", ru: "", en: "", kk: "" },
    faculty: { uz: "", ru: "", en: "", kk: "" },
    description: { uz: "", ru: "", en: "", kk: "" },
    location: { uz: "", ru: "", en: "", kk: "" },
    employment_type: { uz: "", ru: "", en: "", kk: "" },
    url: ''
  });

  useEffect(() => {
    if (rowData) {
      setForm({
        name: rowData.name || "",
        title: {
          uz: rowData.title?.uz || "",
          ru: rowData.title?.ru || "",
          en: rowData.title?.en || "",
          kk: rowData.title?.kk || "",
        },
        faculty: {
          uz: rowData.faculty?.uz || "",
          ru: rowData.faculty?.ru || "",
          en: rowData.faculty?.en || "",
          kk: rowData.faculty?.kk || "",
        },
        description: {
          uz: rowData.description?.uz || "",
          ru: rowData.description?.ru || "",
          en: rowData.description?.en || "",
          kk: rowData.description?.kk || "",
        },
        location: {
          uz: rowData.location?.uz || "",
          ru: rowData.location?.ru || "",
          en: rowData.location?.en || "",
          kk: rowData.location?.kk || "",
        },
        employment_type: {
          uz: rowData.employment_type?.uz || "",
          ru: rowData.employment_type?.ru || "",
          en: rowData.employment_type?.en || "",
          kk: rowData.employment_type?.kk || "",
        },

        url: rowData?.url
      });
    }
  }, [rowData]);

  const handletitleChange = (e, lang) => {
    setForm({
      ...form,
      title: { ...form.title, [lang]: e.target.value },
    });
  };

  const handleFacultyChange = (e, lang) => {
    setForm({
      ...form,
      faculty: { ...form.faculty, [lang]: e.target.value },
    });
  };
  const handlelocationChange = (e, lang) => {
    setForm({
      ...form,
      location: { ...form.location, [lang]: e.target.value },
    });
  };
  const handleEmployment_typeChange = (e, lang) => {
    setForm({
      ...form,
      employment_type: { ...form.employment_type, [lang]: e.target.value },
    });
  };
  const handleDescriptionChange = (e, lang) => {
    setForm({
      ...form,
      description: { ...form.description, [lang]: e.target.value },
    });
  };

  const handleOpen = () => setOpen(!open);

  const handleInputChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handlePositionChange = (e, lang) => {
    setForm({
      ...form,
      position: { ...form.position, [lang]: e.target.value },
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await $api.put(`/job-vacancies/${rowData.id}`, form);
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
            Rahbariyat Yangilash
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

        <DialogBody className="space-y-4 pb-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            {["uz", "ru", "en", "kk"]?.map((lang) => (
              <div key={lang}>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Nomi ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input value={form?.title[lang]} onChange={(e) => handletitleChange(e, lang)} required />
              </div>
            ))}
            {["uz", "ru", "en", "kk"]?.map((lang) => (
              <div key={lang}>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Lavozim ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input value={form?.faculty[lang]} onChange={(e) => handleFacultyChange(e, lang)} required />
              </div>
            ))}
            {["uz", "ru", "en", "kk"]?.map((lang) => (
              <div key={lang}>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Batafsil malumot ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input value={form.description[lang]} onChange={(e) => handleDescriptionChange(e, lang)} required />
              </div>
            ))}
            {["uz", "ru", "en", "kk"]?.map((lang) => (
              <div key={lang}>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Manzil ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input value={form.location[lang]} onChange={(e) => handlelocationChange(e, lang)} required />
              </div>
            ))}
            {["uz", "ru", "en", "kk"]?.map((lang) => (
              <div key={lang}>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Ish turi ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input value={form.employment_type[lang]} onChange={(e) => handleEmployment_typeChange(e, lang)} required />
              </div>
            ))}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Havola
              </Typography>
              <Input value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                required />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleUpdate} disabled={loading} className="bg-blue-500 text-white">
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
