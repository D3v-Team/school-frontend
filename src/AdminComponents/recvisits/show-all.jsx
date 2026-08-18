import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  IconButton,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { FaEye } from "react-icons/fa";
import { $api } from "../../utils";

export default function ShowAll({ id }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("uz");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await $api.get(`/requisites/${id}`);
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
        <FaEye className="h-4 w-4" />
      </IconButton>

      <Dialog open={open} handler={handleOpen} size="md">
        <DialogHeader>{data?.title?.[activeTab] || "Ma'lumot"}</DialogHeader>
        <DialogBody>
          {loading ? (
            <p className="text-center text-blue-500">Yuklanmoqda...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div>
              <Tabs value={activeTab}>
                <TabsHeader>
                  {["uz", "ru", "en", "kk"].map((lang) => (
                    <Tab key={lang} value={lang} onClick={() => setActiveTab(lang)}>
                      {lang.toUpperCase()}
                    </Tab>
                  ))}
                </TabsHeader>
                <TabsBody>
                  {["uz", "ru", "en", "kk"].map((lang) => (
                    <TabPanel key={lang} value={lang}>
                      <div className="space-y-2">
                        <p><strong>Sarlavha:</strong> {data?.title[lang]}</p>
                        <p><strong>Manzil:</strong> {data?.address}</p>
                        <p><strong>Telefon:</strong> {data?.phone}</p>
                        <p><strong>Hisob raqam:</strong> {data?.account_number}</p>
                        <p><strong>Bank:</strong> {data?.bank}</p>
                        <p><strong>MFO:</strong> {data?.mfo}</p>
                        <p><strong>Shaxsiy hisob:</strong> {data?.personal_account}</p>
                        <p><strong>STIR:</strong> {data?.stir}</p>
                        <p><strong>OKNOX:</strong> {data?.oknox}</p>
                        <p><strong>Slug:</strong> {data?.slug}</p>
                      </div>
                    </TabPanel>
                  ))}
                </TabsBody>
              </Tabs>
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
