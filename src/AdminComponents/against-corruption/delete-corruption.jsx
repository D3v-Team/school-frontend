import React, { useState } from "react";
import {
  Dialog,
  Button,
  Typography,
  IconButton,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { $api } from "../../utils";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { sweetAlert } from "../../utils/sweetalert";

export function DeleteCorruption({ rowId, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(!open);

  const handleDeleteCategory = async () => {
    setLoading(true);
    try {
      await $api.delete(`/fighting-corruption/${rowId}`);
      onDeleted();
      sweetAlert("Muvaffaqiyatli o'chirildi", "success");
      setOpen(false);
    } catch (error) {
      setOpen(false);
      console.error("Malumotni o‘chirishda xatolik:", error);
      sweetAlert(`Xatolik: ${error}`, "error");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Delete tugmasi - IconButton */}
      <IconButton variant="text" color="red" onClick={handleOpen}>
        <TrashIcon className="h-5 w-5" />
      </IconButton>

      {/* Delete tasdiqlash oynasi */}
      <Dialog open={open} handler={handleOpen} size="xs" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h5" color="red">
            Malumotni o‘chirish
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
          <Typography variant="paragraph" color="blue-gray">
            Rostan ham ushbu malumotni o‘chirmoqchimisiz? Bu amal qaytarib
            bo‘lmaydi.
          </Typography>
        </DialogBody>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="text" color="blue-gray" onClick={handleOpen}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleDeleteCategory}
            loading={loading}
            className="bg-red-500 text-white"
          >
            Ha, o‘chirish
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
