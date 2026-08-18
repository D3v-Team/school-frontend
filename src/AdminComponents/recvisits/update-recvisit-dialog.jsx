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
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";
import { FaPencilAlt } from "react-icons/fa";

export function UpdateRecvisitDialog({ onUpdated, rowData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Barcha maydonlar uchun state
  const [form, setForm] = useState({
    title: {
      uz: rowData?.title.uz || "",
      ru: rowData?.title.ru || "",
      en: rowData?.title.en || "",
      kk: rowData?.title.kk || "",
    },
    address: rowData?.address || "",
    phone: rowData?.phone || "",
    account_number: rowData?.account_number || "",
    bank: rowData?.bank || "",
    mfo: rowData?.mfo || "",
    personal_account: rowData?.personal_account || "",
    stir: rowData?.stir || "",
    oknox: rowData?.oknox || "",
  });

  const handleOpen = () => setOpen(!open);

  const handleInputChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleTitleChange = (e, lang) => {
    setForm({ ...form, title: { ...form.title, [lang]: e.target.value } });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await $api.put(`/requisites/${rowData.id}`, {
        ...form
      });
      onUpdated();
      setForm({
        title: { uz: "", ru: "", en: "", kk: "" },
        address: "",
        phone: "",
        account_number: "",
        bank: "",
        mfo: "",
        personal_account: "",
        stir: "",
        oknox: "",
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
      <IconButton onClick={handleOpen} variant="text">
        <FaPencilAlt className="h-4 w-4" />
      </IconButton>

      <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Yangi Rekvizit Qo‘shish
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
          {/* Kategoriya tanlash */}

          <div className=" grid grid-cols-2 gap-4">
            {/* Title (ko‘p tilli) */}
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

            {/* Address */}
            <Input
              label="Manzil"
              value={form.address}
              onChange={(e) => handleInputChange(e, "address")}
              required
            />

            {/* Telefon */}
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => handleInputChange(e, "phone")}
              required
            />

            {/* Hisob raqami */}
            <Input
              label="Hisob raqami"
              value={form.account_number}
              onChange={(e) => handleInputChange(e, "account_number")}
              required
            />

            {/* Bank */}
            <Input
              label="Bank"
              value={form.bank}
              onChange={(e) => handleInputChange(e, "bank")}
              required
            />

            {/* MFO */}
            <Input
              label="MFO"
              value={form.mfo}
              onChange={(e) => handleInputChange(e, "mfo")}
              required
            />

            {/* Shaxsiy hisob */}
            <Input
              label="Shaxsiy hisob"
              value={form.personal_account}
              onChange={(e) => handleInputChange(e, "personal_account")}
              required
            />

            {/* STIR */}
            <Input
              label="STIR"
              value={form.stir}
              onChange={(e) => handleInputChange(e, "stir")}
              required
            />

            {/* OKNOX */}
            <Input
              label="OKNOX"
              value={form.oknox}
              onChange={(e) => handleInputChange(e, "oknox")}
              required
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleUpdate}
            loading={loading}
            className="bg-blue-500 text-white"
          >
            Saqlash
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
