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

export default function DelteNews({ Id, onCategoryDeleted }) {
    
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleOpen = () => setOpen(!open);

    const handleDeleteCategory = async () => {
        setLoading(true);
        try {
            await $api.delete(`/news/${Id}`);
            onCategoryDeleted();
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
            <IconButton onClick={handleOpen} variant="text" color="red" >
                <TrashIcon className="h-5 w-5" />
            </IconButton>

            <Dialog open={open} handler={handleOpen} size="xs" className="p-4">
                <DialogHeader className="relative">
                    <Typography variant="h5" color="red">
                        Yangilikdi o‘chirish
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
                        Rostan ham ushbu Yangilikdi o‘chirmoqchimisiz? Bu amal qaytarib
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


    )
}