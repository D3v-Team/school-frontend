
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ReactLoading from "react-loading";
import { NavLink } from "react-router-dom";
export default function DocumentsHero() {
    const { i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getDoc = async () => {
        try {
            const response = await axios.get(`/regulatory-document`);
            setData(response?.data?.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDoc();
    }, []);
    return (
        <section className="my-[32px]">
            <div className="Container">
                <div className="flex items-center justify-center flex-col gap-[24px] w-full">
                    {loading ? (
                        <ReactLoading type="spinningBubbles" color="#000" height={100} width={100} />
                    ) : data.length === 0 ? (
                        <h4 >Empty data</h4>
                    ) : (
                        data.map((item) => (
                            <div
                                key={item.id}
                                className="w-full border-[1px] px-[24px] py-[18px] bg-white cursor-pointer duration-500 hover:shadow-lg rounded-[8px] flex items-center gap-[10px] justify-between"
                            >
                                <div>
                                    <span>{item?.name?.[i18n.language] || "Noma’lum ma’lumot"}</span>
                                </div>
                                <a href={item?.file[0]?.url || item?.url} target="_blank" rel="noopener noreferrer">
                                    <div className="text-[#A4A7AE] text-[30px]">
                                        <svg
                                            width="20px"
                                            height="20px"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M19 7.00001L19 1.00001M19 1.00001H13M19 1.00001L10 10M8 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V12"
                                                stroke="#A4A7AE"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}