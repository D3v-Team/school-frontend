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

export function AddRecvisitsDialog({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const initialForm = {
    title: { uz: "", ru: "", en: "", kk: "" },
    address: "",
    phone: "",
    account_number: "",
    bank: "",
    mfo: "",
    personal_account: "",
    stir: "",
    oknox: "",
  };

  const [form, setForm] = useState(initialForm);

  const handleOpen = () => setOpen(!open);

  const handleChange = (e, field, nested = false) => {
    setForm((prev) =>
      nested
        ? { ...prev, title: { ...prev.title, [field]: e.target.value } }
        : { ...prev, [field]: e.target.value }
    );
  };

  const validate = () => {
    let newErrors = {};
    Object.keys(form.title).forEach((lang) => {
      if (!form.title[lang].trim()) newErrors[`title_${lang}`] = "Sarlavha majburiy!";
    });
    
    if (!form.phone.trim()) newErrors.phone = "Telefon raqami noto‘g‘ri!";
    if (!form.mfo.trim()) newErrors.mfo = "MFO maydoni majburiy";
    if (!form.personal_account.trim()) newErrors.personal_account = "Shaxsiy hisob raqami majburiy";
    
    ["account_number", "stir", "oknox"].forEach((field) => {
      if (!/^\d+$/.test(form[field])) newErrors[field] = "Faqat raqamlardan iborat bo‘lishi kerak!";
    });
    
    ["address", "bank"].forEach((field) => {
      if (!form[field].trim()) newErrors[field] = "Bu maydon majburiy!";
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await $api.post("/requisites", form);
      onAdded();
      setForm(initialForm);
      setErrors({});
      sweetAlert("Muvaffaqiyatli qo‘shildi", "success");
      handleOpen();
    } catch (error) {
      sweetAlert("Xatolik yuz berdi!", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={handleOpen} className="bg-green-500 text-white">
        Rekvizit qo‘shish
      </Button>

      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Yangi Rekvizit Qo‘shish
          </Typography>
          <IconButton
            size="sm"
            variant="text"
            className="absolute right-3.5 top-3.5"
            onClick={handleOpen}
          >
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="space-y-4 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(form.title).map((lang) => (
              <div key={lang}>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Sarlavha ({lang.toUpperCase()})
                </Typography>
                <Input
                  value={form.title[lang]}
                  onChange={(e) => handleChange(e, lang, true)}
                  required
                />
                {errors[`title_${lang}`] && <Typography color="red" className="mt-1">{errors[`title_${lang}`]}</Typography>}
              </div>
            ))}
            {["address", "phone", "account_number", "bank", "stir", "mfo", "personal_account", "oknox"].map((field) => (
              <div key={field}>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  {field.replace("_", " ").toUpperCase()}
                </Typography>
                <Input value={form[field]} onChange={(e) => handleChange(e, field)} required />
                {errors[field] && <Typography color="red" className="mt-1">{errors[field]}</Typography>}
              </div>
            ))}
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