import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const ACCENT = '#ea6c0a';

const SECTIONS = [
    {
        key: 'umumiy',
        title: "Umumiy ma'lumot",
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
        links: [
            { to: '/biz-haqimizda',      label: 'Biz haqimizda' },
            { to: '/rahbariyat',          label: 'Rahbariyat' },
            { to: "/bo'lim-markazlar",    label: "Bo'lim va markazlar" },
            { to: '/rekvizitlar',         label: 'Rekvizitlar' },
            { to: "/ochiq-ma'lumotlar",   label: "Ochiq ma'lumotlar" },
            { to: '/korrupsiyaga-kurash', label: 'Korrupsiyaga qarshi' },
            { to: '/hujjatlar',           label: "Me'yoriy hujjatlar" },
            { to: '/bosh-ish-orni',       label: "Bo'sh ish o'rinlari" },
            { to: '/xalqaro-aloqalar',    label: 'Xalqaro aloqalar' },
            { to: '/hamkorlarimiz',       label: 'Hamkorlarimiz' },
        ],
    },
    {
        key: 'talim',
        title: "Ta'lim",
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
        links: [
            { to: "/bo'lim-markazlar", label: "Bo'lim va markazlar" },
            { to: '/hujjatlar',        label: "Me'yoriy hujjatlar" },
            { to: '/hisobot',          label: 'Moliyaviy hisobot' },
            { to: '/korrupsiyaga-kurash', label: 'Korrupsiyaga qarshi' },
            { to: '/bosh-ish-orni',    label: "Bo'sh ish o'rinlari" },
        ],
    },
    {
        key: 'oquvchilar',
        title: "O'quvchilar",
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
        links: [
            { to: '/virtual-kabinet',   label: 'Direktor virtual qabulxonasi' },
            { to: '/murojaatlar',       label: "Murojaatlarni ko'rib chiqish" },
            { to: '/fotogalereya',      label: 'Fotogalereya' },
            { to: '/Videogalereya',     label: 'Video galereya' },
        ],
    },
    {
        key: 'axborot',
        title: 'Axborot xizmati',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>,
        links: [
            { to: '/barcha-yangiliklar', label: 'Yangiliklar' },
            { to: '/fotogalereya',       label: 'Fotogalereya' },
            { to: '/Videogalereya',      label: 'Video galereya' },
            { to: "/ochiq-ma'lumotlar",  label: "Ochiq ma'lumotlar" },
        ],
    },
];

export default function BigModal({ isOpen, onClose, headerScrolled }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            /* close on scroll — same behaviour as original */
            const onScroll = () => onClose();
            window.addEventListener('scroll', onScroll, { passive: true });
            return () => window.removeEventListener('scroll', onScroll);
        } else {
            setVisible(false);
        }
    }, [isOpen, onClose]);

    const handleClose = () => {
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* top offset = actual header height via CSS variable */
    const topOffset = headerScrolled ? '52px' : 'var(--header-h, 162px)';

    return (
        <>
        {/* semi-transparent backdrop */}
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99998,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? 'all' : 'none',
                transition: 'opacity 0.3s',
            }}
        />

        {/* full-width slide panel (like original big_modal) */}
        <div
            style={{
                position: 'fixed',
                top: topOffset,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                background: '#0f172a',
                overflowY: 'auto',
                transform: visible ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)',
            }}>

            {/* sticky header bar */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 24px',
                background: '#1a2332',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 28, height: 28,
                        borderRadius: 8,
                        background: ACCENT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                    </div>
                    <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>Sayt xaritasi</span>
                </div>
                <button onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                    aria-label="Yopish">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            {/* content grid */}
            <div className="Container" style={{ paddingTop: 32, paddingBottom: 40 }}>
                <div className="modal_wr grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {SECTIONS.map(sec => (
                        <div key={sec.key}>
                            {/* section title */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                marginBottom: 14,
                                paddingBottom: 10,
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <span style={{
                                    padding: '5px 6px',
                                    borderRadius: 6,
                                    background: ACCENT,
                                    color: 'white',
                                    display: 'flex',
                                }}>
                                    {sec.icon}
                                </span>
                                <span className="big_li" style={{ fontSize: 13 }}>{sec.title}</span>
                            </div>
                            {/* links */}
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {sec.links.map(link => (
                                    <li key={link.to} style={{ marginBottom: 2 }}>
                                        <NavLink to={link.to} onClick={handleClose}
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 py-2 px-2 rounded-lg text-[13px]
                                                transition-colors duration-100
                                                ${isActive
                                                    ? 'text-orange-400 bg-white/5'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`
                                            }>
                                            <span style={{
                                                width: 5, height: 5,
                                                borderRadius: '50%',
                                                background: ACCENT,
                                                flexShrink: 0,
                                                opacity: 0.6,
                                            }}/>
                                            {link.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* bottom strip */}
                <div style={{
                    marginTop: 36,
                    paddingTop: 20,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 24,
                }}>
                    <a href="tel:+998955115856"
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z"/>
                        </svg>
                        +998 (95) 511 58 56
                    </a>
                    <a href="mailto:info@maktab.uz"
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        info@maktab.uz
                    </a>
                    <NavLink to="/contact" onClick={handleClose}
                        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                            font-semibold text-white hover:opacity-90 transition-opacity"
                        style={{ background: ACCENT }}>
                        Bog&apos;lanish
                        <svg width="13" height="13" viewBox="0 0 14 15" fill="none">
                            <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334"
                                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </NavLink>
                </div>
            </div>
        </div>
        </>
    );
}
