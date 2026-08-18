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
import { FaPencilAlt } from "react-icons/fa";

export function UpdateAdmin({ onUpdated, rowData }) {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: rowData?.name || "",
    phone: rowData?.phone || "",
    login: rowData?.login || "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    login: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(!open);

  const validateInputs = () => {
    let newErrors = { name: "", phone: "", login: "", password: "" };
    let isValid = true;

    if (!admin.name.trim()) {
      newErrors.name = "Ism kiritish majburiy";
      isValid = false;
    }
    if (!admin.phone.trim()) {
      newErrors.phone = "Telefon raqam kiritish majburiy";
      isValid = false;
    } else if (admin.phone.length > 9) {
      newErrors.phone = "Telefon raqam 9 ta belgidan oshmasligi kerak";
      isValid = false;
    }
    if (!admin.login.trim()) {
      newErrors.login = "Login kiritish majburiy";
      isValid = false;
    }
    if (admin.password && admin.password.length < 8) {
      newErrors.password = "Parol kamida 8 ta belgi bo‘lishi kerak";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateAdmin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await $api.put(`/user/${rowData.id}`, admin);
      onUpdated();
      sweetAlert("Admin muvaffaqiyatli yangilandi", "success");
      handleOpen();
    } catch (error) {
      console.error("Admin yangilashda xatolik:", error);
      sweetAlert(
        `Xatolik: ${error.response?.data?.message || "Noma’lum xatolik"}`,
        "error"
      );
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
            Adminni Tahrirlash
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
          {[
            { key: "name", label: "Ism" },
            { key: "phone", label: "Telefon" },
            { key: "login", label: "Login" },
            { key: "password", label: "Parol (ixtiyoriy)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 text-left font-medium"
              >
                {label}
              </Typography>
              <Input
                type={key === "password" ? "password" : "text"}
                value={admin[key]}
                onChange={(e) => setAdmin({ ...admin, [key]: e.target.value })}
                required={key !== "password"}
                placeholder={`${label} kiriting`}
                error={!!errors[key]}
              />
              {errors[key] && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors[key]}
                </Typography>
              )}
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={handleUpdateAdmin}
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
