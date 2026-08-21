import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BRAND      = '#ea6c0a';
const BRAND_DARK = '#c2410c';
const BG_HEADER  = '#0f172a';
const BG_CARD    = '#111827';
const BG_HOVER   = '#1e293b';
const BORDER     = 'rgba(255,255,255,0.08)';
const TEXT_MAIN  = '#f1f5f9';
const TEXT_MUTED = '#64748b';
const TEXT_SUB   = '#94a3b8';
const DANGER     = '#f87171';
const DANGER_BG  = 'rgba(248,113,113,0.1)';

const UZ_FLAG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 36 27">
        <rect width="36" height="9" fill="#0099b5"/>
        <rect y="9" width="36" height="9" fill="#fff"/>
        <rect y="18" width="36" height="9" fill="#1eb53a"/>
        <rect y="8" width="36" height="1.5" fill="#ce1126"/>
        <rect y="17.5" width="36" height="1.5" fill="#ce1126"/>
        <circle cx="6" cy="4.5" r="3" fill="#fff"/>
        <circle cx="7.2" cy="4.5" r="2.4" fill="#0099b5"/>
    </svg>
);
const RU_FLAG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 36 27">
        <rect width="36" height="9" fill="#fff"/>
        <rect y="9" width="36" height="9" fill="#0039a6"/>
        <rect y="18" width="36" height="9" fill="#d52b1e"/>
    </svg>
);

const LANGS = [
    { code: 'uz',   label: 'UZ',  flag: UZ_FLAG },
    { code: 'cyrl', label: 'КР',  flag: UZ_FLAG },
    { code: 'ru',   label: 'RU',  flag: RU_FLAG },
];

export function ComplexNavbar({ role, handleLogOut }) {
    const user       = JSON.parse(localStorage.getItem("auth-user") || "{}");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const raw = (i18n.language || 'uz').split('-')[0];
    const currentLang = raw === 'kk' ? 'cyrl' : (['uz','cyrl','ru'].includes(raw) ? raw : 'uz');

    /* close on outside click */
    useEffect(() => {
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* clean phone — remove any leading "+998" if already there */
    const rawPhone = user?.phone || '';
    const displayPhone = rawPhone.startsWith('+998')
        ? rawPhone
        : rawPhone
            ? `+998${rawPhone.replace(/^998/, '')}`
            : '';

    const isSuperAdmin = role === 'SUPER_ADMIN';
    const initial = (user?.name || 'A').charAt(0).toUpperCase();

    return (
        <header style={{
            height: 60, flexShrink: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '0 24px',
            background: BG_HEADER, borderBottom: `1px solid ${BORDER}`,
            position: 'relative', zIndex: 40,
            boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
        }}>
            {/* keyframe animatsiya (dropdown uchun) */}
            <style>{`
                @keyframes navbarDropdownFade {
                    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            {/* left — logo / title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 2px 10px rgba(234,108,10,0.35)`,
                }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_MAIN, letterSpacing: '-0.01em' }}>
                    Admin panel
                </span>
            </div>

            {/* center — lang switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}` }}>
                {LANGS.map(lang => {
                    const isActive = currentLang === lang.code;
                    return (
                        <button key={lang.code} type="button"
                            onClick={() => {
                                i18n.changeLanguage(lang.code);
                                localStorage.setItem('i18nextLng', lang.code);
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '5px 12px', borderRadius: 7, border: 'none',
                                cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 700 : 500,
                                background: isActive ? BRAND : 'transparent',
                                color: isActive ? '#fff' : TEXT_MUTED,
                                transition: 'all .15s', whiteSpace: 'nowrap', lineHeight: 1,
                            }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = BG_HOVER; e.currentTarget.style.color = TEXT_MAIN; } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_MUTED; } }}>
                            {lang.flag}
                            {lang.label}
                        </button>
                    );
                })}
            </div>

            {/* right — profile */}
            <div ref={ref} style={{ position: 'relative' }}>
                <button
                    onClick={() => setOpen(v => !v)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '6px 12px 6px 6px', borderRadius: 10,
                        border: `1px solid ${open ? 'rgba(234,108,10,0.35)' : BORDER}`,
                        background: open ? BG_HOVER : 'transparent',
                        cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { if (!open) e.currentTarget.style.background = BG_HOVER; }}
                    onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
                    {/* avatar */}
                    <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
                    }}>
                        {initial}
                    </div>

                    {/* name + role */}
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_MAIN, margin: 0, lineHeight: 1.2 }}>
                            {user?.name || 'Admin'}
                        </p>
                        <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>
                            {isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </p>
                    </div>

                    {/* chevron */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke={TEXT_MUTED} strokeWidth="2.5"
                        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', marginLeft: 2 }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {/* dropdown */}
                {open && (
                    <div style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        width: 250, background: BG_CARD, borderRadius: 14,
                        border: `1px solid ${BORDER}`,
                        boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
                        overflow: 'hidden', zIndex: 100,
                        animation: 'navbarDropdownFade .15s ease-out',
                    }}>
                        {/* profile header */}
                        <div style={{
                            padding: '16px', background: BG_HOVER,
                            borderBottom: `1px solid ${BORDER}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
                                    boxShadow: '0 4px 14px rgba(234,108,10,0.3)',
                                }}>
                                    {initial}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_MAIN, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user?.name || 'Admin'}
                                    </p>
                                    {displayPhone && (
                                        <p style={{ fontSize: 11, color: TEXT_MUTED, margin: '2px 0 0' }}>{displayPhone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* menu items */}
                        <div style={{ padding: '6px' }}>
                            <DropItem
                                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                                label="Mening profilim"
                                onClick={() => { setOpen(false); navigate('/admin/profile'); }} />

                            {isSuperAdmin && (
                                <DropItem
                                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                                    label="Foydalanuvchilar"
                                    onClick={() => { setOpen(false); navigate('/admin/users'); }} />
                            )}
                        </div>

                        {/* logout */}
                        <div style={{ padding: '6px', borderTop: `1px solid ${BORDER}` }}>
                            <button
                                onClick={() => { setOpen(false); handleLogOut(); }}
                                style={{
                                    width: '100%', padding: '9px 12px', border: 'none', borderRadius: 8,
                                    background: 'transparent', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    fontSize: 13, color: DANGER, fontWeight: 500,
                                    transition: 'background .1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = DANGER_BG}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                Chiqish
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

function DropItem({ icon, label, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            style={{
                width: '100%', padding: '9px 12px', border: 'none', borderRadius: 8,
                background: hovered ? BG_HOVER : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, color: hovered ? TEXT_MAIN : TEXT_SUB, fontWeight: 500,
                transition: 'background .1s, color .1s',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
            <span style={{ color: hovered ? BRAND : TEXT_MUTED, transition: 'color .1s' }}>{icon}</span>
            {label}
        </button>
    );
}