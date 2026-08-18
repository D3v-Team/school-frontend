import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { FaEye } from "react-icons/fa";
import { $api } from "../../utils";

export default function ShowAll({ id }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await $api.get(`/message-user/${id}`);
      setData(response.data.data);
    } catch (error) {
      setError("Xatolik yuz berdi");
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    if (!open) {
      await fetchData();
    }
    setOpen(!open);
  };

  return (
    <div>
      <IconButton onClick={handleOpen} variant="text">
        <FaEye className="h-5 w-5 text-blue-500" />
      </IconButton>

      <Dialog open={open} handler={handleOpen} size="xl">
        <DialogHeader>Foydalanuvchi Xabari</DialogHeader>
        <DialogBody className="h-[500px] overflow-scroll p-5">
          {loading ? (
            <p className="text-center text-blue-500">Yuklanmoqda...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              <p>
                <strong className=" font-semibold text-black">To‘liq ism:</strong> {data?.full_name}
              </p>
              <p>
                <strong className=" font-semibold text-black">Telefon:</strong>{" "}
                <a href={`tel:${data?.phone}`} className="text-blue-500 underline">
                  {data?.phone}
                </a>
              </p>
              <p>
                <strong className=" font-semibold text-black">Email:</strong>{" "}
                <a href={`mailto:${data?.email}`} className="text-blue-500 underline">
                  {data?.email}
                </a>
              </p>
              <p>
                <strong className=" font-semibold text-black">Region:</strong> {data?.region}
              </p>
              <p>
                <strong className=" font-semibold text-black">Shahar:</strong> {data?.city || "Ko‘rsatilmagan"}
              </p>
              <p>
                <strong className=" font-semibold text-black">Status:</strong>{" "}
                <span className={`px-2 py-1 rounded text-white ${data?.status === "O'qilmadi" ? "bg-red-500" : "bg-green-500"}`}>
                  {data?.status}
                </span>
              </p>
              <p>
                <strong className=" font-semibold text-black">Xabar:</strong> {data?.message_text}
              </p>

              {/* Fayl mavjud bo‘lsa, havola chiqarish */}
              {data?.file?.length > 0 && (
                <p>
                  <strong>Fayl:</strong>{" "}
                  <a
                    href={data.file[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Yuklab olish
                  </a>
                </p>
              )}

              {/* Rahbariyat ma’lumotlari */}
              {data?.managment && (
                <div className="mt-6 p-4 border border-gray-300 rounded-lg">
                  <h3 className="text-lg font-bold">Rahbariyat</h3>
                  <p>
                    <strong>F.I.Sh:</strong> {data.managment.name}
                  </p>
                  <p>
                    <strong>Lavozimi:</strong> {data.managment.position?.uz}
                  </p>
                  <p>
                    <strong>Qabul kunlari:</strong> {data.managment.reception_days}
                  </p>
                  <p>
                    <strong>Telefon:</strong>{" "}
                    <a href={`tel:${data.managment.phone}`} className="text-blue-500 underline">
                      {data.managment.phone}
                    </a>
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${data.managment.email}`} className="text-blue-500 underline">
                      {data.managment.email}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleOpen} className="bg-red-500 text-white">
            Yopish
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
