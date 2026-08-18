import React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AccordionGallery from "../AccordionGallery";

gsap.registerPlugin(ScrollTrigger);

/* Static placeholder — backend connects later */
const placeholderNews = [
    {
        id: 1,
        date: "15.08.2026",
        view: 124,
        image: null,
        titleUz: "Yangi o'quv yili boshlanishiga tayyorgarlik ko'rilmoqda",
        descUz: "Maktabimizda yangi o'quv yiliga tayyorgarlik ishlari jadal sur'atlarda olib borilmoqda.",
        galleryImg: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80",
    },
    {
        id: 2,
        date: "10.08.2026",
        view: 89,
        image: null,
        titleUz: "Olimpiada g'oliblarini tabriklash marosimi bo'lib o'tdi",
        descUz: "Surxondaryo viloyati olimpiadalarida yuqori o'rinlarni egallagan o'quvchilarimiz taqdirlandilar.",
        galleryImg: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
    },
    {
        id: 3,
        date: "05.08.2026",
        view: 67,
        image: null,
        titleUz: "Maktab kutubxonasi yangilandi",
        descUz: "Zamonaviy o'quv adabiyotlari va elektron resurslar bilan boyitilgan kutubxona ochildi.",
        galleryImg: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=80",
    },
    {
        id: 4,
        date: "01.08.2026",
        view: 53,
        image: null,
        titleUz: "Sport musobaqalarida g'alaba qozondik",
        descUz: "O'quvchilarimiz viloyat sport musobaqalarida birinchi o'rinni egallashdi.",
        galleryImg: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80",
    },
    {
        id: 5,
        date: "28.07.2026",
        view: 41,
        image: null,
        titleUz: "Robototexnika to'garagi ochildi",
        descUz: "Maktabimizda zamonaviy robototexnika va dasturlash to'garagi faoliyat boshladi.",
        galleryImg: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80",
    },
];

const galleryItems = placeholderNews.map(n => ({
    image: n.galleryImg,
    label: n.titleUz,
    link: `/yangilik/${n.id}`,
}));

const NewsCard = ({ item }) => (
    <NavLink
        to={`/yangilik/${item.id}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="block group"
    >
        <div
            className="w-full rounded-xl overflow-hidden transition-all duration-250"
            style={{
                background: '#0f1623',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                transition: 'box-shadow 0.25s, border-color 0.25s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
                e.currentTarget.style.borderColor = 'rgba(234,108,10,0.3)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            }}
        >
            {/* image area */}
            <div className="h-[160px] flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1a1f2e,#0d1117)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <div className="absolute top-3 left-3 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                    style={{ background: '#ea6c0a' }}>
                    Yangilik
                </div>
            </div>
            {/* content */}
            <div className="p-4">
                <div className="flex items-center gap-3 text-slate-600 text-xs mb-2.5">
                    <span>{item.date}</span>
                    <span>·</span>
                    <span>{item.view} ko'rilgan</span>
                </div>
                <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-orange-400 transition-colors duration-200">
                    {item.titleUz}
                </h3>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{item.descUz}</p>
            </div>
        </div>
    </NavLink>
);

const News = () => {
    const { t } = useTranslation();
    const headerRef = useRef(null);
    const cardsRef  = useRef(null);
    const galRef    = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 28 },
                { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
                  scrollTrigger: { trigger: headerRef.current, start: 'top 90%', toggleActions: 'play none none none' } }
            );
            gsap.fromTo(cardsRef.current?.children || [],
                { opacity: 0, y: 36 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
                  scrollTrigger: { trigger: cardsRef.current, start: 'top 88%', toggleActions: 'play none none none' } }
            );
            gsap.fromTo(galRef.current,
                { opacity: 0, scale: 0.97 },
                { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out',
                  scrollTrigger: { trigger: galRef.current, start: 'top 85%', toggleActions: 'play none none none' } }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section style={{ background: '#0a0f1c' }} className="py-16">
            <div className="Container">
                {/* header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2"
                            style={{ color: '#ea6c0a' }}>So&apos;nggi xabarlar</p>
                        <h2 className="text-3xl font-bold text-slate-100">{t('Yangiliklar')}</h2>
                    </div>
                    <NavLink
                        to="/barcha-yangiliklar"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-orange-400 transition-colors px-3 py-1.5 rounded-lg"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        {t('Koproqkorish')}
                        <svg width="11" height="11" viewBox="0 0 14 15" fill="none">
                            <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </NavLink>
                </div>

                {/* AccordionGallery — interactive image accordion */}
                <div className="mb-10">
                    <AccordionGallery
                        items={galleryItems}
                        defaultIndex={2}
                        expandRatio={0.48}
                        trigger="hover"
                        accentColor="#ea6c0a"
                        overlayColor="#0a0f1c"
                        textColor="#ffffff"
                        grayscale={true}
                        showLabels={true}
                        duration={0.55}
                        ease="power3.out"
                        parallax={0.4}
                        tilt={6}
                        stagger={0.06}
                        height={380}
                        gap={8}
                        radius={16}
                        orientation="horizontal"
                    />
                </div>

                {/* Small news cards row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {placeholderNews.slice(0, 3).map(news => (
                        <NewsCard key={news.id} item={news} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default News;

