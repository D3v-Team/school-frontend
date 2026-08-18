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

export function CreateOurPartners({ onAdded }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const [form, setForm] = useState({
        name: "",
        url: "",
        image: "",
    });

    const handleOpen = () => setOpen(!open);

    const handleInputChange = (e, field) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);

        const formData = new FormData();
        formData.append("photo", imageFile);

    };

    const handleAdd = async () => {

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("url", form.url);
            formData.append("photo", imageFile);

            await $api.post("/our-partners", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            onAdded();
            setForm({
                name: "",
                url: "",
                image: "",
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
            <Button onClick={handleOpen} className="bg-green-500 text-white">
                Hamkor qo‘shish
            </Button>

            <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
                <DialogHeader className="relative">
                    <Typography variant="h4" color="blue-gray">
                        Hamkor Qo‘shish
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
                        <Input label="Nomi" value={form.name} onChange={(e) => handleInputChange(e, "name")} required />
                        <Input label="Havola" value={form.url} onChange={(e) => handleInputChange(e, "url")} required />
                        <div className="w-[100%]">
                            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                Rasm yuklash
                            </Typography>
                            <Input type="file" onChange={handleImageUpload} accept="image/*" />
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button onClick={handleAdd} disabled={loading} className="bg-blue-500 text-white">
                        {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
