import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
    {
        id: 1, category: "Ota-onalar uchun", title: "Ota-onalar kabineti",
        items: ["Qabul talablari va ro'yxatdan o'tish", "Hujjatlar ro'yxati va yuklab olish", "Ma'muriyat bilan bog'lanish", "Ota-onalar va o'qituvchilar uchrashuvlari jadvali"],
        to: "/virtual-kabinet", accent: "#ea6c0a", bg: "#130e05",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
        id: 2, category: "O'quvchilar uchun", title: "O'quvchilar kabineti",
        items: ["Joriy darslar va qo'ng'iroq jadvallari", "Bayram va tadbirlar jadvali", "To'garaklar va seksiyalar", "Maktab tadbirlari haqida e'lonlar"],
        to: "/", accent: "#3b82f6", bg: "#05080f",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    },
    {
        id: 3, category: "Maktab haqida", title: "Maktab tashrif qog'ozi",
        items: ["Muassasa tarixi va yutuqlari", "Professor-o'qituvchilar tarkibi", "Rahbariyat haqida ma'lumot", "Maktabning rekvizitlari"],
        to: "/biz-haqimizda", accent: "#8b5cf6", bg: "#0a0510",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
        id: 4, category: "Hujjatlar", title: "Rasmiy hujjatlar bo'limi",
        items: ["Nizom va litsenziyalar", "O'zini o'zi baholash hisobotlari", "Davlat idoralari uchun hujjatlar", "Buyruqlar va farmoyishlar"],
        to: "/hujjatlar", accent: "#10b981", bg: "#031008",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
    {
        id: 5, category: "Media zona", title: "Axborot xizmati",
        items: ["Yangiliklar bo'limi", "Sinf hayotidan foto galereyalar", "Video galereyalar va reportajlar", "Maktab gazetasi va e'lonlar"],
        to: "/barcha-yangiliklar", accent: "#ec4899", bg: "#0f0408",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    },
];

export default function Inter() {
    const { t } = useTranslation();
    const cardsRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.filter(Boolean).forEach((el, i) => {
                gsap.fromTo(el,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.55,
                        ease: "power2.out",
                        delay: i * 0.07,
                        scrollTrigger: {
                            trigger: el,
                            start: "top 90%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <section style={{ background: '#0a0f1c' }} className="py-16">
            <div className="Container">
                {/* Header — part of normal document flow, never sticky */}
                <div className="mb-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2"
                        style={{ color: '#ea6c0a' }}>Online xizmatlar</p>
                    <h2 className="text-3xl font-bold text-slate-100">{t('Interaktivxizmatlar')}</h2>
                </div>

                {/* Cards — scroll-triggered fade-up, gap-5 = 20px */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {SERVICES.map((s, idx) => (
                        <div key={s.id} ref={el => cardsRef.current[idx] = el} style={{ opacity: 0 }}>
                            <NavLink to={s.to} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="block">
                                <div className="w-full rounded-2xl overflow-hidden"
                                    style={{
                                        background: s.bg,
                                        border: `1px solid ${s.accent}22`,
                                        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                                        transition: 'box-shadow .25s, border-color .25s, transform .25s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${s.accent}35`; e.currentTarget.style.borderColor = `${s.accent}45`; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = `${s.accent}22`; }}
                                >
                                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${s.accent}, transparent 60%)` }} />
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left */}
                                        <div className="flex-shrink-0 p-6 md:p-8 flex flex-col justify-between gap-5"
                                            style={{ minWidth: 240, borderRight: `1px solid ${s.accent}12` }}>
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                        style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}35`, color: s.accent }}>
                                                        {s.icon}
                                                    </div>
                                                    <span className="text-2xl font-black tabular-nums select-none"
                                                        style={{ color: `${s.accent}18` }}>
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
                                                    style={{ color: s.accent }}>{s.category}</p>
                                                <h3 className="text-base font-bold text-slate-100 leading-snug">{s.title}</h3>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold px-3 py-1.5 rounded-full"
                                                style={{ background: `${s.accent}15`, color: s.accent, border: `1px solid ${s.accent}30` }}>
                                                Ko&apos;rish
                                                <svg width="10" height="10" viewBox="0 0 14 15" fill="none">
                                                    <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </div>
                                        {/* Right */}
                                        <div className="flex-1 p-6 md:p-8">
                                            <p className="text-[10px] text-slate-600 uppercase tracking-[0.14em] font-semibold mb-4">Nima topasiz</p>
                                            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {s.items.map((item, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                                        <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                                                            style={{ background: `${s.accent}15`, border: `1px solid ${s.accent}35` }}>
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.accent }} />
                                                        </span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

