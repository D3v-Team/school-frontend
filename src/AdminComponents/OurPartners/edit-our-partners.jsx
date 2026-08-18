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
    Select,
    Option,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";
import { FaPencilAlt } from "react-icons/fa";

export function UpdateOurPartners({ onUpdated, rowData }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        position: { uz: "", ru: "", en: "", kk: "" },
        url: "",
        phone: "",
        email: "",
    });

    useEffect(() => {
        if (rowData) {
            setForm({
                name: rowData.name || "",
                url: rowData.url || "",
            });
        }
    }, [rowData]);

    const handleOpen = () => setOpen(!open);

    const handleInputChange = (e, field) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await $api.put(`/our-partners/${rowData.id}`, form);
            onUpdated();
            sweetAlert("Muvaffaqiyatli yangilandi", "success");
            handleOpen();
        } catch (error) {
            console.error("Xatolik:", error);
            sweetAlert("Xatolik yuz berdi!", "error");
        }
        setLoading(false);S
    };

    return (
        <>
            <IconButton onClick={handleOpen} variant="text">
                <FaPencilAlt className="h-4 w-4" />
            </IconButton>

            <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
                <DialogHeader className="relative">
                    <Typography variant="h4" color="blue-gray">
                        Hamkorlar Yangilash
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
                    <div className="flex items-center flex-col gap-[10px]">
                        <Input label="Nomi" value={form.name} onChange={(e) => handleInputChange(e, "name")} required />
                        <Input label="Havola" value={form.url} onChange={(e) => handleInputChange(e, "url")} required />
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button onClick={handleUpdate} disabled={loading} className="bg-blue-500 text-white">
                        {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
