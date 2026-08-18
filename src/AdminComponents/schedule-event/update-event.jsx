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
  Select,
  Option,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaPencilAlt } from "react-icons/fa";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";

export function UpdateScheduledEvent({ onUpdated, rowData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: { uz: "", ru: "", en: "", kk: "" },
    date: "",
    start_time: "",
    end_time: "",
    status: { uz: "Kutulmoqda", ru: "Kutulmoqda", en: "Kutulmoqda", kk: "Kutulmoqda" },
  });

  const handleOpen = () => setOpen(!open);

  // Sana formatini (DD.MM.YYYY) form input uchun YYYY-MM-DD formatga o'giradi
  const convertDateToInputFormat = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split(".");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (rowData) {
      setForm({
        title: rowData.title,
        date: convertDateToInputFormat(rowData.date),
        start_time: rowData.start_time.slice(0, 5), // `HH:MM:SS` → `HH:MM`
        end_time: rowData.end_time.slice(0, 5), // `HH:MM:SS` → `HH:MM`
        status: rowData.status,
      });
    }
  }, [rowData]);

  // Title o'zgarishi
  const handleTitleChange = (e, lang) => {
    setForm((prev) => ({
      ...prev,
      title: { ...prev.title, [lang]: e.target.value },
    }));
  };

  // Sana va vaqtni to‘g‘ri formatda o‘zgartirish
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      const [year, month, day] = value.split("-");
      const formattedDate = `${day}.${month}.${year}`;
      setForm((prev) => ({ ...prev, [name]: formattedDate }));
    } else if (name === "start_time" || name === "end_time") {
      const [hours, minutes] = value.split(":"); // `14:30:00` → `["14", "30"]`
      const formattedTime = `${hours}:${minutes}`; // `14:30`
      setForm((prev) => ({ ...prev, [name]: formattedTime }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Statusni o'zgartirish
  const handleStatusChange = (value) => {
    setForm((prev) => ({
      ...prev,
      status: { uz: value, ru: value, en: value, kk: value },
    }));
  };

  // Yangilash funksiyasi
  const handleUpdate = async () => {
    if (!form.date || !form.start_time || !form.end_time) {
      sweetAlert("Sanani va vaqtni to‘liq kiriting!", "error");
      return;
    }

    setLoading(true);
    try {
      await $api.put(`/scheduled-event/${rowData.id}`, form);
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
            Tadbirni tahrirlash
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
                  Sarlavha ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input
                  value={form.title[lang]}
                  onChange={(e) => handleTitleChange(e, lang)}
                  placeholder={`Sarlavha (${lang == "kk" ? "CHI" : lang.toUpperCase()})`}
                  required
                />
              </div>
            ))}
          </div>

          {/* Sana */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Sana
            </Typography>
            <Input
              type="date"
              name="date"
              value={convertDateToInputFormat(form.date)}
              onChange={handleChange}
              required
            />
          </div>

          {/* Start va End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Boshlanish vaqti
              </Typography>
              <Input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Tugash vaqti
              </Typography>
              <Input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Status tanlash */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Status
            </Typography>
            <Select value={form.status.uz} onChange={handleStatusChange} label="Status tanlang">
              <Option value="Kutilmoqda">Kutiloqda</Option>
              <Option value="Tasdiqlangan">Tasdiqlangan</Option>
              <Option value="Bekor qilingan">Bekor qilingan</Option>
            </Select>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleUpdate} loading={loading} className="bg-blue-500 text-white">
            Yangilash
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
