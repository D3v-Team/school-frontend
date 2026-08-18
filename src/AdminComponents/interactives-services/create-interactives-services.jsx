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

export function CreateInteractivesServices({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [url, setUrl] = useState('')


  const [form, setForm] = useState({
    name: { uz: "", ru: "", en: "", kk: "" },
    url: "",
    image: "",
  });

  const handleOpen = () => setOpen(!open);

  const validateForm = () => {
    let newErrors = {};
    if (!form.name.uz) newErrors.uz = "O‘zbek tilida nom kiritish shart";
    if (!form.name.ru) newErrors.ru = "Rus tilida nom kiritish shart";
    if (!form.name.en) newErrors.en = "Ingliz tilida nom kiritish shart";
    if (!form.name.kk) newErrors.kk = "Xitoy tilida nom kiritish shart";
    if (!url) newErrors.url = "Havola kiritish shart";
    if (!imageFile) newErrors.image = "Rasm yuklash shart";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePositionChange = (e, lang) => {
    setForm({
      ...form,
      name: { ...form.name, [lang]: e.target.value },
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    setLoading(true);
    console.log('Loading file ');
    try {
      const formData = new FormData();
      formData.append("title[uz]", form.name.uz);
      formData.append("title[ru]", form.name.ru);
      formData.append("title[en]", form.name.en);
      formData.append("title[kk]", form.name.kk);
      formData.append("photo", imageFile);
      formData.append("url", url);

      await $api.post("/interactives-services", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onAdded();
      setForm({
        name: { uz: "", ru: "", en: "", kk: "" },
        url: "",
        image: "",
      });
      setUrl('')
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
        Xizmat qo‘shish
      </Button>

      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Interaktiv xizmat Qo‘shish
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
          <div className="flex items-center gap-[10px] flex-col">
            {["uz", "ru", "en", "kk"].map((lang) => (
              <div key={lang} className="w-full">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  Nomi ({lang === "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input
                  value={form.name[lang]}
                  onChange={(e) => handlePositionChange(e, lang)}
                  required
                />
                {errors[lang] && <p className="text-red-500 text-sm">{errors[lang]}</p>}
              </div>
            ))}
            <div className="w-full">
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-medium"
              >
                Havola
              </Typography>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              {errors?.url && <p className="text-red-500 text-sm">{errors?.url}</p>}
            </div>
            <div className="w-full">
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-medium"
              >
                Rasm yuklash
              </Typography>
              <Input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
              />
              {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
            </div>
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
