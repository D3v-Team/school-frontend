import React, { useState, useEffect } from "react";
import { FaPencilAlt } from "react-icons/fa";
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
import { $api } from "../../utils";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { sweetAlert } from "../../utils/sweetalert";


export function UpdateCategory({ categoryData, onCategoryUpdated }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState({ uz: "", ru: "", en: "", kk: "" });
  const [errors, setErrors] = useState({
    uz: false,
    ru: false,
    en: false,
    kk: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryData) {
      setCategory(categoryData.title);
    }
  }, [categoryData]);

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

  const handleUpdateCategory = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await $api.put(`/category/${categoryData.id}`, { title: category });
      onCategoryUpdated();
      handleOpen();
      sweetAlert("Kategoriya yangilandi", "success");
    } catch (error) {
      setOpen(false);
      console.error("Kategoriya yangilashda xatolik:", error);
      sweetAlert(`Kategoriya yangilanmadi:, ${error}`, "error");
    }
    setLoading(false);
  };

  return (
    <>
      <IconButton onClick={handleOpen} variant="text">
        <FaPencilAlt className="h-4 w-4" />
      </IconButton>

      <Dialog open={open} handler={handleOpen} size="sm" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Kategoriya Tahrirlash
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
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 text-left font-medium"
              >
                Sarlavha ({lang == "kk" ? "CHI" : lang.toUpperCase()})
              </Typography>
              <Input
                value={category[lang]}
                onChange={(e) =>
                  setCategory({ ...category, [lang]: e.target.value })
                }
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
          <Button
            onClick={handleUpdateCategory}
            loading={loading}
            className="bg-blue-500 text-white"
          >
            Yangilash
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
