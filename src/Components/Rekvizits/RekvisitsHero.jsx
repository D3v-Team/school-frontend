import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";

export default function RekvisitsHero() {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { t } = useTranslation()

  const getRekvisits = async () => {
    try {
      const response = await axios.get(`/requisite-all`);
      setData(response?.data?.data || []);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRekvisits();
  }, []);

  return (
    <section>
      <div className="Container">
        {loading ? (
          < div className="flex items-center justify-center w-full h-[400px]" >
            <ReactLoading type="spinningBubbles" color='#fffff' height={100} width={100} />
          </div >
        ) : data.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-5">
            Empty data
          </div>
        ) : (
          data.map((item, index) => (
            <div key={index}>
              <h1 className="mt-[20px] mb-[20px] font-semibold text-xl leading-[150%] text-[#0a0d12]">
                {item?.title?.[i18n.language] || item?.title?.["uz"]}
              </h1>
              {[
                { label: `${t('Manzil')}`, value: item?.address },
                { label: `${t('Telefon')}`, value: item?.phone },
                { label: `${t('Hisobraqam')}`, value: item?.account_number },
                { label: `${t('Bank')}`, value: item?.bank },
                { label: `${t('MFO')}`, value: item?.mfo },
                { label: `${t('Shaxsiyhisobraqam')}`, value: item?.personal_account },
                { label: "OKONX", value: item?.oknox },
                { label: "STIR", value: item?.stir },
              ].map((field, idx) => (
                <div
                  key={idx}
                  className="rek_card flex items-center justify-start border-b border-[#e9eaeb] p-[16px_24px] max-w-[1280px] w-[100%] gap-[250px] h-[72px]"
                >
                  <h1 className="w-[200px]">{field.label}</h1>
                  <h2>{field.value || "Ma'lumot mavjud emas"}</h2>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
