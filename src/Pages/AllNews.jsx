import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "motion/react";
import pub, { getLang, formatDate, mediaUrl } from "../utils/api";

const FALLBACK_IMG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='224' viewBox='0 0 400 224'>
            <rect width='400' height='224' fill='#1e293b'/>
            <circle cx='170' cy='95' r='14' fill='#334155'/>
            <polyline points='150,150 190,110 240,150 280,120 320,150' fill='none' stroke='#334155' stroke-width='6'/>
        </svg>`
    );

const springValues = { damping: 30, stiffness: 100, mass: 2 };

function TiltedImage({ imageSrc, altText, rotateAmplitude = 6, scaleOnHover = 1.05, children }) {
    const ref = useRef(null);
    const rotateX = useSpring(useMotionValue(0), springValues);
    const rotateY = useSpring(useMotionValue(0), springValues);
    const scale   = useSpring(1, springValues);

    function handleMouse(e) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        rotateX.set(((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -rotateAmplitude);
        rotateY.set(((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  rotateAmplitude);
    }

    return (
        <div
            ref={ref}
            className="relative w-full h-full overflow-hidden [perspective:800px]"
            onMouseMove={handleMouse}
            onMouseEnter={() => scale.set(scaleOnHover)}
            onMouseLeave={() => { scale.set(1); rotateX.set(0); rotateY.set(0); }}
        >
            <motion.div
                className="relative w-full h-full [transform-style:preserve-3d]"
                style={{ rotateX, rotateY, scale }}
            >
                <img
                    src={imageSrc}
                    alt={altText}
                    className="absolute inset-0 w-full h-full object-cover will-change-transform"
                />
                {children}
            </motion.div>
        </div>
    );
}

/* ── Skeleton ── */
function Skeleton() {
    return (
        <div className="Container py-12">
            <div className="h-8 w-52 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-10" />
            <div className="h-[340px] bg-gray-200 dark:bg-slate-700 rounded-3xl animate-pulse mb-8" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-700 animate-pulse h-[300px]" />
                ))}
            </div>
        </div>
    );
}

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

    if (loading) return <Skeleton />;

    const [featured, ...rest] = data;

    return (
        <div className="relative overflow-hidden py-12 marginTop-[100px]" >
            {/* dekorativ blur doiralar */}
            <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl" />
            <div className="pointer-events-none absolute top-60 -left-24 w-80 h-80 rounded-full bg-blue-400/5 blur-3xl" />

            <div className="Container py-12 marginTop-[100px]">

                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                   
                </div>

                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2zM9 12h6M9 16h6M9 8h2" />
                        </svg>
                        <p className="text-lg font-medium">Yangiliklar topilmadi</p>
                    </div>
                ) : (
                    <>
                        {/* ── Featured card ── */}
                        {featured && (
                            <NavLink
                                to={`/yangilik/${featured.id}`}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="group relative block mb-10 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800"
                                style={{ border: '1px solid rgba(0,0,0,0.06)', marginTop: '100px' }}
                            >
                                {/* orange top accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 z-10" />

                                <div className="grid md:grid-cols-[1.3fr_1fr] ">
                                    {/* image side */}
                                    <div className="relative h-[260px] md:h-[380px]">
                                        <TiltedImage
                                            imageSrc={featured.cover_image ? mediaUrl(featured.cover_image) : FALLBACK_IMG}
                                            altText={getLang(featured, 'title', i18n.language) || ''}
                                            rotateAmplitude={3}
                                            scaleOnHover={1.03}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                                        </TiltedImage>
                                        {/* badge */}
                                        <span className="absolute top-5 left-5 z-10 bg-orange-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow">
                                            ✦ Eng yangi
                                        </span>
                                    </div>

                                    {/* content side */}
                                    <div className="flex flex-col justify-center p-7 md:p-10 bg-white dark:bg-slate-800">
                                        {/* date */}
                                        <time className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                            {formatDate(featured.created_at)}
                                        </time>

                                        {/* title */}
                                        <h2 className="font-extrabold text-xl md:text-2xl text-[#1f235b] dark:text-white leading-snug mb-4 line-clamp-3 group-hover:text-orange-500 transition-colors duration-200">
                                            {getLang(featured, 'title', i18n.language)}
                                        </h2>

                                        {/* excerpt */}
                                        <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6">
                                            {getLang(featured, 'content', i18n.language)
                                                ?.replace(/<[^>]+>/g, '')
                                                .slice(0, 180)}
                                        </p>

                                        {/* CTA */}
                                        <span className="inline-flex items-center gap-2 text-orange-500 font-bold text-sm w-fit group-hover:gap-4 transition-all duration-200">
                                            Batafsil o'qish
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </NavLink>
                        )}

                        {/* ── Grid ── */}
                        {rest.length > 0 && (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                {rest.map(item => {
                                    const cover = item.cover_image ? mediaUrl(item.cover_image) : FALLBACK_IMG;
                                    return (
                                        <NavLink
                                            key={item.id}
                                            to={`/yangilik/${item.id}`}
                                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                            className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
                                            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}
                                        >
                                            {/* image */}
                                            <div className="relative w-full" style={{ height: 200 }}>
                                                <TiltedImage
                                                    imageSrc={cover}
                                                    altText={getLang(item, 'title', i18n.language) || ''}
                                                    rotateAmplitude={6}
                                                    scaleOnHover={1.06}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                    <time className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-[#1f235b] dark:text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                                                        {formatDate(item.created_at)}
                                                    </time>
                                                </TiltedImage>
                                            </div>

                                            {/* body */}
                                            <div className="flex flex-col flex-1 p-5">
                                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors duration-200">
                                                    {getLang(item, 'title', i18n.language)}
                                                </h3>
                                                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                                                    {getLang(item, 'content', i18n.language)
                                                        ?.replace(/<[^>]+>/g, '')
                                                        .slice(0, 110)}
                                                </p>

                                                {/* footer */}
                                                <div className="flex items-center justify-between mt-auto pt-4"
                                                    style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                                    <span className="inline-flex items-center gap-1.5 text-orange-500 font-semibold text-xs group-hover:gap-3 transition-all duration-200">
                                                        Batafsil
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ── Load more ── */}
                {data.length < total && (
                    <div className="flex justify-center mt-14">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="group flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: '#ea6c0a',
                                color: '#fff',
                                boxShadow: '0 6px 20px rgba(234,108,10,0.35)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ea6c0a'; e.currentTarget.style.border = '2px solid #ea6c0a'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ea6c0a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = 'none'; }}
                        >
                            {loadingMore ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                    Yuklanmoqda...
                                </>
                            ) : (
                                <>
                                    Ko'proq ko'rish
                                    <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
