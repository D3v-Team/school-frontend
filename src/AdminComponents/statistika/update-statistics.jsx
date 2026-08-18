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
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaPencilAlt } from "react-icons/fa";
import { $api } from "../../utils";
import { sweetAlert } from "../../utils/sweetalert";

export function UpdateStatistic({ onUpdated, rowData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    students_count: 0,
    professors_count: 0,
    faculties_count: 0,
    education_programs_count: 0,
  });

  const handleOpen = () => setOpen(!open);

  // Eski ma'lumotlarni yuklash
  useEffect(() => {
    if (rowData) {

      setForm({
        students_count: rowData.students_count ?? 0,
        professors_count: rowData.professors_count ?? 0,
        faculties_count: rowData.faculties_count ?? 0,
        education_programs_count: rowData.education_programs_count ?? 0,
      });
    }
  }, [rowData]);

  // Inputlar qiymatini o‘zgartirish
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  };

  // Malumotni PUT qilish (update)
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await $api.put(`/university-statistic/${rowData.id}`, form);
      onUpdated(); // Yangilangan ma'lumotlarni olish
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

      <Dialog open={open} handler={handleOpen} size="md" className="p-4">
        <DialogHeader className="relative">
          <Typography variant="h4" color="blue-gray">
            Universitet statistik ma'lumotlarini yangilash
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
          {/* Students */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Talabalar soni
            </Typography>
            <Input
              type="number"
              name="students_count"
              value={form.students_count}
              onChange={handleChange}
              required
            />
          </div>

          {/* Professors */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Professorlar soni
            </Typography>
            <Input
              type="number"
              name="professors_count"
              value={form.professors_count}
              onChange={handleChange}
              required
            />
          </div>

          {/* Faculties */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Fakultetlar soni
            </Typography>
            <Input
              type="number"
              name="faculties_count"
              value={form.faculties_count}
              onChange={handleChange}
              required
            />
          </div>

          {/* Education Programs */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Ta’lim dasturlari soni
            </Typography>
            <Input
              type="number"
              name="education_programs_count"
              value={form.education_programs_count}
              onChange={handleChange}
              required
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleUpdate} loading={loading} className="bg-blue-500 text-white">
            Yangilash
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
