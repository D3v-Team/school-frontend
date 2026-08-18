import React, { useEffect, useState } from "react";
import calendar from '../img/calendar.png';
import eye from '../img/eye1.png';
import axios from "axios";
import { useTranslation } from "react-i18next";
import ReactLoading from 'react-loading';
import img_def from '../img/default_image.jpg';
import { NavLink } from "react-router-dom";

export default function AllNews() {
    const { i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const getNews = async (pageNum = 1) => {
        try {
            const response = await axios.get(`/news-all?page=${pageNum}`);
            setData(prev => pageNum === 1 ? response?.data?.data : [...prev, ...response?.data?.data]);
            setTotalPages(response?.data?.pagination?.total_pages);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        getNews();
    }, []);

    const loadMore = () => {
        if (page < totalPages) {
            setLoadingMore(true);
            setPage(prev => {
                const newPage = prev + 1;
                getNews(newPage);
                return newPage;
            });
        }
    };


    if (loading || loadingMore) {
        return (
            <div className="flex items-center justify-center w-full h-[400px]">
                <ReactLoading type="spinningBubbles" color='#002266' height={100} width={100} />
            </div>
        );
    }

    return (
        <section className="news py-10 px-4 max-w-6xl mx-auto">
            <div className="relative pb-4 mb-6">
                <h2 className="text-3xl font-bold text-[#1f235b] relative inline-block mb-[20px] bg-white pr-4 z-10">
                    • Yangiliklar
                </h2>
                <div className="absolute left-0 top-150 w-full border-t border-[#1f235b] -z-10"></div>
                <div className="absolute left-0 top-150 w-1/4 border-t-2 border-[#1f235b] -z-10"></div>
            </div>

            {data?.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {data?.map((news) => (
                        <NavLink
                            key={news?.id}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            to={`/yangilik/${news?.id}`}
                            className='bg-white overflow-hidden flex flex-col group'
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={news.image[0]?.url || img_def}
                                    alt="news"
                                    className="news_img w-full h-[224px] object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                />
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="text-gray-500 text-sm flex items-center space-x-3">
                                    <img src={calendar} alt="date" />
                                    <span>{news?.date}</span>
                                    <img src={eye} alt="views" />
                                    <span>{news?.view}</span>
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 flex-grow line-clamp-2 mt-[17px] mb-[16px]">
                                    {news.title[i18n.language] || news.title["uz"]}
                                </h3>
                                <h3 className="overflow-hidden text-gray-500 text-[16px] font-normal line-clamp-2">
                                    {news.description[i18n.language] || news.description["uz"]}
                                </h3>

                                <span className="text-black mt-[16px] inline-block font-medium hover:underline">
                                    Batafsil →
                                </span>
                            </div>
                        </NavLink>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <h1>Malumot yo'q</h1>
                </div>
            )}
            {page < totalPages && (
                <button
                    onClick={loadMore}
                    className="mx-auto block px-[20px] duration-500 hover:bg-transparent hover:text-[#002266] rounded-[10px] border-[2px] border-[#002266] bg-[#002266] text-[white] py-[10px]"
                    disabled={loadingMore}
                >
                    {loadingMore ? <ReactLoading type="spinningBubbles" color='#ffffff' height={20} width={20} /> : "Ko‘proq ko‘rish"}
                </button>
            )}

        </section>
    );
}
