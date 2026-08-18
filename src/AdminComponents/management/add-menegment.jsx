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
  Checkbox,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";

export function AddManagement({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    position: { uz: "", ru: "", en: "", kk: "" },
    reception_days: "",
    phone: "",
    email: "",
    message_receiver: false,
  });

  const handleOpen = () => setOpen(!open);

  const validate = () => {
    let newErrors = {};
    if (!form.name) newErrors.name = "Ism majburiy";
    if (!form.reception_days)
      newErrors.reception_days = "Qabul kunlari majburiy";
    if (!form.phone) newErrors.phone = "Telefon raqam majburiy";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      newErrors.email = "Email noto‘g‘ri";
    Object.keys(form.position).forEach((lang) => {
      if (!form.position[lang])
        newErrors[
          `position_${lang}`
        ] = `Lavozim (${lang.toUpperCase()}) majburiy`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handlePositionChange = (e, lang) => {
    setForm({
      ...form,
      position: { ...form.position, [lang]: e.target.value },
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      Object.keys(form.position).forEach((lang) => {
        formData.append(`position[${lang}]`, form.position[lang]);
      });
      formData.append("reception_days", form.reception_days);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      if (imageFile) formData.append("photo", imageFile);
      formData.append("message_receiver", form.message_receiver);

      await $api.post("/management", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onAdded();
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
        Rahbariyat qo‘shish
      </Button>
      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader>
          <div className="flex justify-between w-full">
            <Typography variant="h4">Yangi Rahbariyat Qo‘shish</Typography>
            <IconButton variant="text" onClick={handleOpen}>
              <XMarkIcon className="h-4 w-4" />
            </IconButton>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className=" grid grid-cols-2 gap-3">
            {Object.keys(form.position).map((lang) => (
              <div key={lang}>
                <Input
                  label={`Lavozim (${lang.toUpperCase()})`}
                  value={form.position[lang]}
                  onChange={(e) => handlePositionChange(e, lang)}
                />
                {errors[`position_${lang}`] && (
                  <Typography color="red">
                    {errors[`position_${lang}`]}
                  </Typography>
                )}
              </div>
            ))}
            <di>
              <Input
                label="F.I.O"
                value={form.name}
                onChange={(e) => handleInputChange(e, "name")}
              />
              {errors.name && (
                <Typography color="red">{errors.name}</Typography>
              )}
            </di>
            <div>
              <Input
                label="Qabul kunlari"
                value={form.reception_days}
                onChange={(e) => handleInputChange(e, "reception_days")}
              />
              {errors.reception_days && (
                <Typography color="red">{errors.reception_days}</Typography>
              )}
            </div>
            <div>
              <Input
                label="Telefon"
                value={form.phone}
                onChange={(e) => handleInputChange(e, "phone")}
              />
              {errors.phone && (
                <Typography color="red">{errors.phone}</Typography>
              )}
            </div>
            <div>
              <Input
                label="Email"
                value={form.email}
                onChange={(e) => handleInputChange(e, "email")}
              />
              {errors.email && (
                <Typography color="red">{errors.email}</Typography>
              )}
            </div>
            <Checkbox
              label="Murojaatlar qabul qiluvchi"
              checked={form.message_receiver}
              onChange={() =>
                setForm({ ...form, message_receiver: !form.message_receiver })
              }
            />
            <Input type="file" onChange={handleImageUpload} accept="image/*" />
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
