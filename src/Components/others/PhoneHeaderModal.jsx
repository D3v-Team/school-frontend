import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ACCENT = '#ea6c0a';

const SECTIONS = [
    {
        key: 'umumiy',
        title: "Umumiy ma'lumot",
        links: [
            { to: '/biz-haqimizda',      label: 'Biz haqimizda' },
            { to: '/rahbariyat',          label: 'Rahbariyat' },
            { to: '/hamkorlarimiz',       label: 'Hamkorlarimiz' },
            { to: '/hujjatlar',           label: "Me'yoriy hujjatlar" },
            { to: '/murojaatlar',         label: "Murojaatlarni ko'rib chiqish" },
            { to: "/ochiq-ma'lumotlar",   label: "Ochiq ma'lumotlar" },
            { to: "/bo'lim-markazlar",    label: "Bo'lim va markazlar" },
            { to: '/rekvizitlar',         label: 'Rekvizitlar' },
            { to: '/virtual-kabinet',     label: 'Direktor virtual qabulxonasi' },
            { to: '/korrupsiyaga-kurash', label: 'Korrupsiyaga qarshi' },
            { to: '/bosh-ish-orni',       label: "Bo'sh ish o'rinlari" },
        ],
    },
    {
        key: 'talim',
        title: "Ta'lim",
        links: [
            { to: "/bo'lim-markazlar", label: "Bo'lim va markazlar" },
            { to: '/hujjatlar',        label: "Me'yoriy hujjatlar" },
            { to: '/hisobot',          label: 'Moliyaviy hisobot' },
        ],
    },
    {
        key: 'oquvchilar',
        title: "O'quvchilar",
        links: [
            { to: '/virtual-kabinet', label: 'Direktor virtual qabulxonasi' },
            { to: '/murojaatlar',     label: "Murojaatlarni ko'rib chiqish" },
            { to: '/fotogalereya',    label: 'Fotogalereya' },
            { to: '/Videogalereya',   label: 'Video galereya' },
        ],
    },
    {
        key: 'axborot',
        title: 'Axborot xizmati',
        links: [
            { to: '/barcha-yangiliklar', label: 'Yangiliklar' },
            { to: '/fotogalereya',       label: 'Fotogalereya' },
            { to: '/Videogalereya',      label: 'Video galereya' },
        ],
    },
];

export default function PhoneHeaderModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [openKey, setOpenKey] = useState(null);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const close = () => { onClose(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    return (
        <>
        {/* backdrop */}
        <div
            className="fixed inset-0 z-[99998] transition-opacity duration-300"
            style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(3px)',
                opacity:       isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'all' : 'none',
            }}
            onClick={onClose}
        />

        {/* slide-in drawer */}
        <div
            className="fixed top-0 left-0 bottom-0 z-[99999] w-[88vw] max-w-[360px]
                flex flex-col overflow-hidden"
            style={{
                background: '#0f172a',
                transform:  isOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
                boxShadow:  '4px 0 40px rgba(0,0,0,0.5)',
            }}>

            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: ACCENT }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Surxondaryo viloyati</p>
                        <p className="text-white text-xs font-bold leading-tight">{t('Logo')}</p>
                    </div>
                </div>
                <button onClick={onClose}
                    className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/15
                        rounded-full p-2 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* accordion sections */}
                {SECTIONS.map(sec => (
                    <div key={sec.key}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                            onClick={() => setOpenKey(openKey === sec.key ? null : sec.key)}
                            className="w-full flex items-center justify-between px-5 py-3.5
                                text-sm font-semibold transition-colors"
                            style={{
                                color:      openKey === sec.key ? '#fb923c' : '#e2e8f0',
                                background: openKey === sec.key ? 'rgba(234,108,10,0.08)' : 'transparent',
                            }}>
                            {sec.title}
                            <svg className={`w-4 h-4 transition-transform duration-200
                                ${openKey === sec.key ? 'rotate-180' : ''}`}
                                viewBox="0 0 20 20" fill="none">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className={`overflow-hidden transition-all duration-300
                            ${openKey === sec.key ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            {sec.links.map(link => (
                                <NavLink key={link.to} to={link.to} onClick={close}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2.5 pl-8 pr-5 py-2.5 text-[13px]
                                        transition-all duration-150
                                        ${isActive
                                            ? 'text-orange-400 bg-orange-950/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}`
                                    }>
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ background: ACCENT }}/>
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}

                {/* direct link */}
                <NavLink to="/contact" onClick={close}
                    className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold
                        text-slate-100 hover:text-white transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    Bog&apos;lanish
                    <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
                        <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334"
                            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </NavLink>
            </div>

            {/* footer */}
            <div className="flex-shrink-0 px-5 py-4"
                style={{ background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <a href="tel:+998955115856"
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white
                        transition-colors mb-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z"/>
                    </svg>
                    +998 (95) 511 58 56
                </a>
                <a href="mailto:info@maktab.uz"
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    info@maktab.uz
                </a>
            </div>
        </div>
        </>
    );
}
