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

export function AddCategory({ onCategoryAdded }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState({ uz: "", ru: "", en: "", kk: "" });
  const [errors, setErrors] = useState({ uz: false, ru: false, en: false, kk: false });
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(!open);

  const validateInputs = () => {
    let newErrors = { uz: false, ru: false, en: false, kk: false };
    let isValid = true;

    Object.keys(category).forEach((lang) => {
      if (!category[lang].trim()) {
        newErrors[lang] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddCategory = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await $api.post("/category", { title: category });
      onCategoryAdded();
      setCategory({ uz: "", ru: "", en: "", kk: "" });
      setErrors({ uz: false, ru: false, en: false, kk: false });
      sweetAlert("Muvaffaqiyatli qo'shildi", "success")
      handleOpen();
    } catch (error) {
      console.error("Kategoriya qo'shishda xatolik:", error);
      sweetAlert(`Xatolik: ${error}`, "error")
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={handleOpen} className="bg-green-500 text-white">
        Kategoriya qo'shish
      </Button>

      <Dialog open={open} handler={handleOpen} size="sm" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Yangi Kategoriya Qo'shish
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
          {["uz", "ru", "en", "kk"].map((lang) => (
            <div key={lang}>
              <Typography variant="small" color="blue-gray" className="mb-2 text-left font-medium">
                Sarlavha ({lang == "kk" ? "CHI" : lang.toUpperCase()})
              </Typography>
              <Input
                value={category[lang]}
                onChange={(e) => setCategory({ ...category, [lang]: e.target.value })}
                required
                placeholder={`Kategoriya nomi (${lang == "kk" ? "CHI" : lang.toUpperCase()})`}
                error={errors[lang]}
              />
              {errors[lang] && (
                <Typography variant="small" color="red" className="mt-1">
                  Ushbu maydon to‘ldirilishi shart!
                </Typography>
              )}
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleAddCategory} loading={loading} className="bg-blue-500 text-white">
            Saqlash
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
