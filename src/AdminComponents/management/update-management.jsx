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
  Card,
  ListItem,
  ListItemPrefix,
  Checkbox,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";
import { FaPencilAlt } from "react-icons/fa";
import { List } from "lucide-react";

export function UpdateManagement({ onUpdated, rowData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    position: { uz: "", ru: "", en: "", kk: "" },
    reception_days: "",
    phone: "",
    email: "",
    category_id: "",
  });

  useEffect(() => {
    if (rowData) {
      setForm({
        name: rowData.name || "",
        position: {
          uz: rowData.position?.uz || "",
          ru: rowData.position?.ru || "",
          en: rowData.position?.en || "",
          kk: rowData.position?.kk || "",
        },
        reception_days: rowData.reception_days || "",
        phone: rowData.phone || "",
        email: rowData.email || "",
        // message_receiver: rowData.message_receiver || false,
      });
    }
  }, [rowData]);

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
      await $api.put(`/management/${rowData.id}`, form);
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

        <DialogBody className="space-y-4 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {["uz", "ru", "en", "kk"].map((lang) => (
              <div key={lang}>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  Lavozim ({lang == "kk" ? "CHI" : lang.toUpperCase()})
                </Typography>
                <Input
                  value={form.position[lang]}
                  onChange={(e) => handlePositionChange(e, lang)}
                  required
                />
              </div>
            ))}
            <Input
              label="F.I.O"
              value={form.name}
              onChange={(e) => handleInputChange(e, "name")}
              required
            />
            <Input
              label="Qabul kunlari"
              value={form.reception_days}
              onChange={(e) => handleInputChange(e, "reception_days")}
              required
            />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => handleInputChange(e, "phone")}
              required
            />
            <Input
              label="Email"
              value={form.email}
              onChange={(e) => handleInputChange(e, "email")}
              required
            />
            {/* <Checkbox
              checked={form.message_receiver}
              label={
                <div>
                  <Typography color="blue-gray" className="font-medium">
                    Rektor 
                  </Typography>
                </div>
              }
            /> */}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleUpdate}
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
