import { XMarkIcon } from "@heroicons/react/24/outline";
import {
    Dialog,
    Button,
    Typography,
    IconButton,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { sweetAlert } from "../../utils/sweetalert";
import { $api } from "../../utils";


export default function AboutUsDelete({ Id, refresh }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);



    const DeleteAboutUs = async () => {
        setLoading(true);
        try {
            await $api.delete(`/about-me/${Id}`);
            refresh();
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
            <IconButton onClick={() => setOpen(true)} className="bg-red-500 text-white" variant="text">
                <TrashIcon className="h-4 w-4" />
            </IconButton>

            <Dialog open={open} handler={() => setOpen(!open)} size="xs" className="p-4">
                <DialogHeader className="relative">
                    <Typography variant="h5" color="red">
                        Malumotni o‘chirish
                    </Typography>
                    <IconButton
                        size="sm"
                        variant="text"
                        className="!absolute right-3.5 top-3.5"
                        onClick={() => setOpen(false)}
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
                    <Button variant="text" color="blue-gray" onClick={() => setOpen(false)}>
                        Bekor qilish
                    </Button>
                    <Button
                        loading={loading}
                        onClick={DeleteAboutUs}
                        className="bg-red-500 text-white"
                    >
                        Ha, o‘chirish
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    )
}