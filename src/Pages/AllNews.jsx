import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import pub, { getLang, formatDate, mediaUrl } from "../utils/api";

export default function AllNews() {
    const { i18n } = useTranslation();
    const [data,        setData]        = useState([]);
    const [page,        setPage]        = useState(1);
    const [total,       setTotal]       = useState(0);
    const [loading,     setLoading]     = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const LIMIT = 12;

    const fetchNews = async (pageNum = 1, append = false) => {
        try {
            const res = await pub.get('/api/news', {
                params: { page: pageNum, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc', is_public: true },
            });
            const d = res.data;
            const items = d?.data || d?.items || [];
            setData(prev => append ? [...prev, ...items] : items);
            setTotal(d?.total || d?.meta?.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => { fetchNews(1); }, []);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        setLoadingMore(true);
        fetchNews(next, true);
    };

    if (loading) {
        return (
            <section className="news py-10 px-4 max-w-6xl mx-auto">
                <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mb-8" />
                <div className="grid md:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-xl overflow-hidden shadow-sm">
                            <div className="h-[224px] bg-gray-200 animate-pulse" />
                            <div className="p-4 space-y-3">
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="news py-10 px-4 max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <span className="text-orange-500 font-semibold tracking-wide uppercase text-sm">
                        Yangiliklar
                    </span>
                    <h2 className="text-3xl md:text-[34px] font-extrabold text-[#1f235b] mt-1">
                        So'nggi yangiliklar
                    </h2>
                    <div className="w-14 h-1 bg-orange-500 rounded-full mt-3" />
                </div>
                {total > 0 && (
                    <span className="hidden sm:block text-sm text-gray-400">
                        {data.length} / {total} ta
                    </span>
                )}
            </div>

            {data.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {data.map(item => (
                        <NavLink
                            key={item.id}
                            to={`/yangilik/${item.id}`}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="group bg-white overflow-hidden flex flex-col rounded-2xl shadow-sm ring-1 ring-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative overflow-hidden h-[224px] bg-gray-100">
                                {item.cover_image ? (
                                    <img
                                        src={mediaUrl(item.cover_image)}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#1f235b] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                    {formatDate(item.created_at)}
                                </span>
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="font-bold text-lg text-gray-900 flex-grow line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
                                    {getLang(item, 'title', i18n.language)}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                    {getLang(item, 'content', i18n.language)?.replace(/<[^>]+>/g, '').slice(0, 100)}
                                </p>
                                <span className="mt-auto inline-flex items-center gap-1.5 text-[#1f235b] font-semibold text-sm group-hover:gap-2.5 transition-all">
                                    Batafsil
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </NavLink>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg className="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z M9 12h6M9 16h6M9 8h2" />
                    </svg>
                    <p className="text-lg">Yangiliklar topilmadi</p>
                </div>
            )}

            {data.length < total && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="group px-7 py-3 rounded-full border-2 border-[#002266] bg-[#002266] text-white font-medium hover:bg-transparent hover:text-[#002266] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loadingMore ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                Yuklanmoqda...
                            </>
                        ) : (
                            <>
                                Ko'proq ko'rish
                                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}