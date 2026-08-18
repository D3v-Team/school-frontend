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
  Select,
  Option,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";

export function AddScheduledEvent({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    title: { uz: "", ru: "", en: "", kk: "" },
    date: "",
    start_time: "",
    end_time: "",
    status: { uz: "Kutulmoqda", ru: "Kutulmoqda", en: "Kutulmoqda", kk: "Kutulmoqda" },
  });

  const handleOpen = () => setOpen(!open);

  const validateForm = () => {
    let newErrors = {};

    // Title tekshirish
    ["uz", "ru", "en", "kk"].forEach(lang => {
      if (!form.title[lang]) {
        newErrors[lang] = `Sarlavha (${lang.toUpperCase()}) kiritish shart!`;
      }
    });

    // Sana va vaqtlarni tekshirish
    if (!form.date) newErrors.date = "Sana tanlash shart!";
    if (!form.start_time) newErrors.start_time = "Boshlanish vaqtini tanlang!";
    if (!form.end_time) newErrors.end_time = "Tugash vaqtini tanlang!";

    // Boshlanish va tugash vaqtini taqqoslash
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      newErrors.time = "Boshlanish vaqti tugash vaqtidan oldin bo‘lishi kerak!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTitleChange = (e, lang) => {
    setForm((prev) => ({
      ...prev,
      title: { ...prev.title, [lang]: e.target.value },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "date") {
      const [year, month, day] = value.split("-");
      const formattedDate = `${day}.${month}.${year}`;
      setForm((prev) => ({ ...prev, [name]: formattedDate }));
    } else if (name === "start_time" || name === "end_time") {
      const [hours, minutes] = value.split(":");
      const formattedTime = `${hours}:${minutes}`;
      setForm((prev) => ({ ...prev, [name]: formattedTime }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleStatusChange = (value) => {
    setForm((prev) => ({
      ...prev,
      status: { uz: value, ru: value, en: value, kk: value },
    }));
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await $api.post("/scheduled-event", form);
      onAdded();
      sweetAlert("Muvaffaqiyatli qo‘shildi", "success");
      handleOpen();

      setForm({
        title: { uz: "", ru: "", en: "", kk: "" },
        date: "",
        start_time: "",
        end_time: "",
        status: { uz: "Kutulmoqda", ru: "Kutulmoqda", en: "Kutulmoqda", kk: "Kutulmoqda" },
      });
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
        Yangi Tadbir Qo‘shish
      </Button>

      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Yangi Tadbir Qo‘shish
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
                  Sarlavha ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input value={form.title[lang]} onChange={(e) => handleTitleChange(e, lang)} required />
                {errors[lang] && <p className="text-red-500 text-sm">{errors[lang]}</p>}
              </div>
            ))}
          </div>

          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Sana
            </Typography>
            <Input type="date" name="date"  onChange={handleChange} required />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Boshlanish vaqti
              </Typography>
              <Input type="time" name="start_time" value={form.start_time} onChange={handleChange} required />
              {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time}</p>}
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Tugash vaqti
              </Typography>
              <Input type="time" name="end_time" value={form.end_time} onChange={handleChange} required />
              {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time}</p>}
            </div>
          </div>

          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}

          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Status
            </Typography>
            <Select value={form.status.uz} onChange={handleStatusChange} label="Status tanlang">
              <Option value="Kutilmoqda">Kutilmoqda</Option>
              <Option value="Tasdiqlangan">Tasdiqlangan</Option>
              <Option value="Bekor qilingan">Bekor qilingan</Option>
            </Select>
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
