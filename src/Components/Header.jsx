import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import BigModal from './others/BigModal';
import VisionModal from './others/VisionModal';
import { useTranslation } from 'react-i18next';
import LanguageSelect from './others/LanguageSelect';
import PhoneHeaderModal from './others/PhoneHeaderModal';
import pub, { fetchContactInfo, getLang } from '../utils/api';

/* ─── Force dark mode always ─────────────────────────────────── */
function useForceDark() {
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);
}

/* ─── Static nav structure ───────────────────────────────────── */
const NAV = [
    {
        key: 'umumiy', label: 'Umumiy_malumot',
        items: [
            { to: '/biz-haqimizda', label: 'biz_haqimizda' },
            { to: '/rahbariyat',    label: 'rahbariyat' },
            { to: '/ramzlar',       label: 'davlat_ramzlari' },
        ],
    },
    {
        key: 'talim', label: 'Talim',
        items: [
            { to: '/xodimlar',       label: 'Xodimlar' },
            { to: '/togarak',        label: 'Togaraklar' },
            { to: '/dars-jadvali',   label: 'Darsjadvali' },
            { to: '/hujjatlar',      label: 'hujjatlar' },
        ],
    },
    {
        key: 'talabalar', label: 'Oquvchilar',
        items: [
            { to: '/ota-ona-uchrashув', label: 'Otaonauchrashuvlari' },
            { to: '/murojaatlar',       label: 'murojaatlar' },
            { to: "/ochiq-ma'lumotlar", label: 'ochiq_malumotlar' },
        ],
    },
    {
        key: 'axborot', label: 'Axborotxizmati',
        items: [
            { to: '/barcha-yangiliklar', label: 'Yangiliklar' },
            { to: '/gazeta',             label: 'Maktabgazetasi' },
            { to: '/oshxona',            label: 'Oshxonamenyusi' },
            { to: '/fotogalereya',       label: 'Fotogalereya' },
            { to: '/Videogalereya',      label: 'Videogalereya' },
        ],
    },
    { key: 'boglanish', label: 'boglanish', to: '/contact' },
];

const ACCENT = '#ea6c0a';

/* ─── Nav icons ──────────────────────────────────────────────── */
const ICONS = {
    umumiy: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    talim:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    talabalar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    axborot: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>,
};

/* ─── Dropdown component ─────────────────────────────────────── */
function Dropdown({ item }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const location = useLocation();
    const { t } = useTranslation();
    const isActive = item.items?.some(s => location.pathname.startsWith(s.to));

    useEffect(() => {
        const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    return (
        <div ref={ref} className="relative h-full flex items-stretch"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}>

            {/* trigger */}
            <button className={`relative flex items-center gap-1.5 px-4 py-0 text-[13px] font-medium
                tracking-wide transition-all duration-150 whitespace-nowrap group
                ${isActive ? 'text-orange-400' : 'text-slate-300 hover:text-white'}`}>
                <span className="opacity-50 group-hover:opacity-100 transition-opacity hidden xl:block">
                    {ICONS[item.key]}
                </span>
                    {t(item.label)}
                <svg className={`w-3 h-3 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {/* hover/active bar */}
                <span className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-200
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                    style={{ background: ACCENT }}/>
            </button>

            {/* panel */}
            {open && (
                <div className="absolute top-full left-0 z-[9999] min-w-[210px]"
                    style={{ paddingTop: 4 }}>
                    <div className="rounded-lg shadow-2xl overflow-hidden"
                        style={{
                            background: '#1a2332',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}>
                        {/* colored top strip */}
                        <div className="flex items-center gap-2 px-4 py-2.5"
                            style={{ background: ACCENT }}>
                            <span className="opacity-80">{ICONS[item.key]}</span>
                            <span className="text-white text-[11px] font-bold uppercase tracking-widest">
                                {t(item.label)}
                            </span>
                        </div>
                        {/* links */}
                        {item.items.map((sub, i) => (
                            <NavLink key={sub.to} to={sub.to}
                                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setOpen(false); }}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors duration-100
                                    ${i < item.items.length - 1 ? 'border-b border-white/5' : ''}
                                    ${isActive
                                        ? 'text-orange-400 bg-white/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`
                                }>
                                <span className="w-1 h-1 rounded-full flex-shrink-0"
                                    style={{ background: ACCENT, opacity: 0.7 }}/>
                                {sub.dynamic ? sub.label : t(sub.label)}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Main header ────────────────────────────────────────────── */
export default function Header() {
    useForceDark();

    const [burgerOpen, setBurgerOpen] = useState(false);
    const [phoneOpen,  setPhoneOpen]  = useState(false);
    const [visionOpen, setVisionOpen] = useState(false);
    const [scrolled,   setScrolled]   = useState(false);
    const [contact,    setContact]    = useState(null);
    const [pages,      setPages]      = useState([]);

    const visionRef = useRef(null);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchContactInfo().then(setContact);
        pub.get('/api/pages', { params: { limit: 100 } })
            .then(res => setPages(res.data?.data || res.data?.items || []))
            .catch(() => setPages([]));
    }, []);

    const dynamicNav = NAV.map(item => ({ ...item, items: item.items ? [...item.items] : item.items }));
    const pageGroup = slug => {
        const value = String(slug || '').toUpperCase();
        if (['ADMISSIONS', 'CONTACT'].includes(value)) return value === 'CONTACT' ? 'boglanish' : 'talabalar';
        if (['ABOUT', 'MISSION', 'VISION', 'HISTORY', 'RULES', 'PRIVACY', 'FAQ', 'ANTI_CORRUPTION'].includes(value)) return 'umumiy';
        return 'axborot';
    };
    pages.filter(page => page?.id && page?.title_latin).forEach(page => {
        const target = dynamicNav.find(item => item.key === pageGroup(page.slug));
        if (target?.items) {
            target.items.push({
                to: `/sahifa/${page.id}`,
                label: getLang(page, 'title', i18n.language),
                dynamic: true,
            });
        }
    });

    const phone   = contact?.phone || '';
    const email   = contact?.email || '';
    const address = contact ? getLang(contact, 'address', i18n.language) : '';
    const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;
    const mailHref = email ? `mailto:${email}` : undefined;

    /* ── header height tracker → CSS variable for MainLayout ── */
    const headerRef = useRef(null);
    useEffect(() => {
        const update = () => {
            if (headerRef.current) {
                const h = headerRef.current.offsetHeight;
                document.documentElement.style.setProperty('--header-h', `${h}px`);
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [scrolled]);

    /* ── scroll collapse ── */
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', fn, { passive: true });
        fn();
        return () => window.removeEventListener('scroll', fn);
    }, []);

    /* ── vision outside click ── */
    useEffect(() => {
        const fn = e => { if (visionRef.current && !visionRef.current.contains(e.target)) setVisionOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    return (
        <>
        <style>{`
            .nav-item-hover:hover { background: rgba(255,255,255,0.05); }
        `}</style>

        <header ref={headerRef}
            className="fixed top-0 left-0 right-0 w-full z-[200]"
            style={{
                background: '#0f172a',
                boxShadow: scrolled
                    ? '0 2px 20px rgba(0,0,0,0.4)'
                    : '0 1px 0 rgba(255,255,255,0.06)',
            }}>

            {/* ── ROW 1: top bar (collapses on scroll) ─────────── */}
            <div style={{
                maxHeight: scrolled ? 0 : 38,
                overflow: scrolled ? 'hidden' : 'visible',
                transition: 'max-height 0.3s ease',
                background: '#0a0f1c',
                borderBottom: scrolled ? 'none' : '1px solid rgba(255,255,255,0.05)',
            }}>
                <div className="Container">
                    <div className="flex items-center justify-between" style={{ height: 38 }}>
                        {/* left — quick contacts */}
                        <div className="flex items-center gap-6 text-[11px] text-slate-500">
                            {phone && (
                                <a href={telHref}
                                    className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z"/>
                                    </svg>
                                    {phone}
                                </a>
                            )}
                            {email && (
                                <a href={mailHref}
                                    className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    {email}
                                </a>
                            )}
                        </div>
                        {/* right — vision + language */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={e => { e.stopPropagation(); setVisionOpen(p => !p); }}
                                className="text-slate-500 hover:text-white p-1.5 rounded-full
                                    hover:bg-white/5 transition-all"
                                title="Ko'rish sozlamalari">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                            <LanguageSelect />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 2: brand + contacts (collapses on scroll) ─── */}
            <div style={{
                maxHeight: scrolled ? 0 : 72,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
                borderBottom: scrolled ? 'none' : '1px solid rgba(255,255,255,0.05)',
            }}>
                <div className="Container">
                    <div className="flex items-center justify-between" style={{ height: 72 }}>
                        {/* brand */}
                        <NavLink to="/" className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: ACCENT }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                    Surxondaryo viloyati
                                </p>
                                <h1 className="text-[14px] font-bold leading-tight max-w-[300px]"
                                    style={{ color: ACCENT }}>
                                    {t('Logo')}
                                </h1>
                            </div>
                        </NavLink>

                        {/* contacts */}
                        <div className="h-service flex items-center gap-5">
                            {/* phone */}
                            {phone && (
                                <a href={telHref} className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: ACCENT }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('ishonch_telefoni')}</p>
                                        <p className="text-xs font-semibold text-slate-200">{phone}</p>
                                    </div>
                                </a>
                            )}
                            {/* email */}
                            {email && (
                                <a href={mailHref} className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: ACCENT }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('elektron_pochta')}</p>
                                        <p className="text-xs font-semibold text-slate-200">{email}</p>
                                    </div>
                                </a>
                            )}
                            {/* address */}
                            <NavLink to="/contact"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: ACCENT }}>
                                    <svg width="14" height="18" viewBox="0 0 18 22" fill="none"
                                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z"/>
                                        <path d="M9 21C13 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 5 17 9 21Z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t('manzil')}</p>
                                    <p className="text-xs font-semibold text-slate-200 max-w-[200px] leading-tight">
                                        {address || t('manzil2')}
                                    </p>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 3: navigation (always visible) ───────────── */}
            <div style={{
                background: '#1e293b',
                borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div className="Container flex items-stretch" style={{ height: 52 }}>
                    {/* burger button */}
                    <button
                        onClick={() => setBurgerOpen(true)}
                        className="Header_big_modal flex items-center gap-2 mr-4 px-3 text-slate-400
                            hover:text-white transition-colors flex-shrink-0"
                        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
                        aria-label="Menyu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6"  x2="21" y2="6"/>
                            <line x1="3" y1="12" x2="16" y2="12"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                    <button
                        onClick={() => setPhoneOpen(true)}
                        className="Phone_modal hidden flex items-center mr-4 px-3 text-slate-400
                            hover:text-white transition-colors flex-shrink-0"
                        aria-label="Menyu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6"  x2="21" y2="6"/>
                            <line x1="3" y1="12" x2="16" y2="12"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>

                    {/* desktop nav — full width, no right panel */}
                    <div className="menu_wr flex items-stretch justify-between w-full">
                        {dynamicNav.map(item =>
                            item.items ? (
                                <Dropdown key={item.key} item={item} />
                            ) : (
                                <NavLink key={item.key} to={item.to}
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className={({ isActive }) =>
                                        `relative flex items-center px-4 text-[13px] font-medium
                                        tracking-wide transition-colors duration-150 whitespace-nowrap
                                        ${isActive ? 'text-orange-400' : 'text-slate-300 hover:text-white'}`
                                    }>
                                    {({ isActive }) => (
                                        <>
                                            {t(item.label)}
                                            <span className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full
                                                transition-opacity duration-150
                                                ${isActive ? 'opacity-100' : 'opacity-0'}`}
                                                style={{ background: ACCENT }}/>
                                        </>
                                    )}
                                </NavLink>
                            )
                        )}
                    </div>
                </div>
            </div>
        </header>

        <BigModal
            isOpen={burgerOpen}
            onClose={() => setBurgerOpen(false)}
            headerScrolled={scrolled}
        />
        <PhoneHeaderModal isOpen={phoneOpen} onClose={() => setPhoneOpen(false)} data={[]} />
        <VisionModal isOpen={visionOpen} ref={visionRef} />
        </>
    );
}
