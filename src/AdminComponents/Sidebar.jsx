import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight as MdRight } from "react-icons/md";
import { RiLogoutBoxLine } from "react-icons/ri";
import {
    MdDashboard, MdCampaign, MdContactMail, MdViewCarousel,
    MdRestaurantMenu, MdGroups, MdPhone, MdEvent, MdPermMedia,
    MdPeople, MdNewspaper, MdPages, MdCalendarMonth,
    MdLink, MdAdminPanelSettings, MdSchool, MdFolderOpen,
} from "react-icons/md";
import { TbNews } from "react-icons/tb";

const ACCENT     = '#ea6c0a';
const BG         = '#0f172a';
const BG_ITEM    = 'rgba(255,255,255,0.06)';
const TEXT       = '#cbd5e1';      /* normal item text — visible on dark */
const TEXT_MUTED = '#64748b';      /* sub labels, collapse btn */
const TEXT_ACTIVE= '#ffffff';
const BORDER     = 'rgba(255,255,255,0.07)';

/* ─── grouped menu ───────────────────────────────────────────── */
const MENU = [
    /* single */
    { name: "Asosiy",   path: "/admin",              icon: MdDashboard },

    /* group: Kontent */
    {
        group: "Kontent",
        items: [
            { name: "Yangiliklar",     icon: TbNews,        subItems: [
                { name: "Barcha yangiliklar", path: "/admin/news" },
                { name: "Yangilik yaratish",  path: "/admin/news/create" },
            ]},
            { name: "E'lonlar",        icon: MdCampaign,    path: "/admin/announcements" },
            { name: "Sahifalar",       icon: MdPages,       path: "/admin/post" },
            { name: "Maktab gazetasi", icon: MdNewspaper,   path: "/admin/newspapers" },
            { name: "Foydali linklar", icon: MdLink,        path: "/admin/useful-links" },
        ],
    },

    /* group: Tadbirlar */
    {
        group: "Tadbirlar",
        items: [
            { name: "Tadbirlar",              icon: MdEvent,         path: "/admin/events" },
            { name: "Jadvallar",              icon: MdCalendarMonth, path: "/admin/schedule-event" },
            { name: "Ota-ona uchrashuvlari",  icon: MdGroups,        path: "/admin/meetings" },
        ],
    },

    /* group: Media */
    {
        group: "Media",
        items: [
            { name: "Media",     icon: MdPermMedia, subItems: [
                { name: "Foto medialar",  path: "/admin/photo-media" },
                { name: "Video medialar", path: "/admin/video-media" },
            ]},
            { name: "Bannerlar", icon: MdViewCarousel, path: "/admin/banners" },
        ],
    },

    {
        group: "Qabul",
        items: [
            { name: "Onlayn Qabul", icon: MdSchool, subItems: [
                { name: "Qabul arizalari",  path: "/admin/admissions" },
                { name: "Qabul hujjatlari", path: "/admin/required-documents" },
            ]},
            { name: "Hujjatlar",    icon: MdFolderOpen, path: "/admin/regulatory-doc" },
        ],
    },

    /* group: Xodimlar */
    {
        group: "Xodimlar",
        items: [
            { name: "Xodimlar",     icon: MdPeople,  path: "/admin/management" },
            { name: "To'garaklar",  icon: MdGroups,  path: "/admin/clubs" },
        ],
    },

    /* group: Aloqa */
    {
        group: "Aloqa",
        items: [
            { name: "Qayta aloqa",         icon: MdContactMail, path: "/admin/message-user" },
            { name: "Murojaatlar",         icon: MdContactMail, path: "/admin/contact-messages" },
            { name: "Aloqa ma'lumotlari",  icon: MdPhone,       path: "/admin/contact-info" },
        ],
    },

    /* group: Oshxona */
    {
        group: "Oshxona",
        items: [
            { name: "Oshxona menyusi", icon: MdRestaurantMenu, path: "/admin/canteen-menu" },
        ],
    },
];

const SUPER_ITEMS = [
    { name: "Foydalanuvchilar", icon: MdAdminPanelSettings, path: "/admin/users" },
];

/* ─── single nav item ────────────────────────────────────────── */
function NavItem({ item, isCollapsed, openKey, setOpenKey }) {
    const location = useLocation();
    const Icon = item.icon;
    const isOpen = openKey === item.name;

    const isActive = item.path
        ? location.pathname === item.path
        : item.subItems?.some(s => location.pathname.startsWith(s.path));

    /* leaf */
    if (!item.subItems) {
        return (
            <Link to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: isCollapsed ? '9px 0' : '8px 10px',
                borderRadius: 8, textDecoration: 'none',
                background: isActive ? ACCENT : 'transparent',
                color: isActive ? TEXT_ACTIVE : TEXT,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'background .15s, color .15s',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = BG_ITEM; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
                <Icon style={{ fontSize: 16, flexShrink: 0 }} />
                {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>}
            </Link>
        );
    }

    /* dropdown */
    return (
        <div>
            <button
                onClick={() => setOpenKey(isOpen ? null : item.name)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: isCollapsed ? '9px 0' : '8px 10px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: isActive && !isOpen ? 'rgba(234,108,10,0.15)' : 'transparent',
                    color: isActive ? ACCENT : TEXT,
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    transition: 'background .15s, color .15s',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={e => { if (!isActive || isOpen) e.currentTarget.style.background = BG_ITEM; }}
                onMouseLeave={e => { e.currentTarget.style.background = (isActive && !isOpen) ? 'rgba(234,108,10,0.15)' : 'transparent'; }}
            >
                <Icon style={{ fontSize: 16, flexShrink: 0 }} />
                {!isCollapsed && (
                    <>
                        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                        </span>
                        <FaChevronDown style={{
                            fontSize: 10, flexShrink: 0,
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform .2s',
                            color: TEXT_MUTED,
                        }} />
                    </>
                )}
            </button>

            {isOpen && !isCollapsed && (
                <div style={{
                    marginTop: 2, marginLeft: 14,
                    borderLeft: `1px solid ${BORDER}`,
                    paddingLeft: 12, paddingBottom: 2,
                }}>
                    {item.subItems.map(sub => {
                        const subActive = location.pathname === sub.path;
                        return (
                            <Link key={sub.path} to={sub.path} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '6px 8px', borderRadius: 6, textDecoration: 'none',
                                fontSize: 12, fontWeight: subActive ? 600 : 400,
                                color: subActive ? ACCENT : TEXT_MUTED,
                                background: subActive ? 'rgba(234,108,10,0.1)' : 'transparent',
                                transition: 'all .15s',
                            }}
                            onMouseEnter={e => { if (!subActive) { e.currentTarget.style.background = BG_ITEM; e.currentTarget.style.color = TEXT; } }}
                            onMouseLeave={e => { if (!subActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_MUTED; } }}
                            >
                                <FaChevronRight style={{ fontSize: 8, opacity: 0.5, flexShrink: 0 }} />
                                {sub.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── group label ────────────────────────────────────────────── */
function GroupLabel({ label, isCollapsed }) {
    if (isCollapsed) return (
        <div style={{
            height: 1, background: BORDER, margin: '8px 0',
        }} />
    );
    return (
        <div style={{
            padding: '10px 10px 4px',
            fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
            textTransform: 'uppercase', color: TEXT_MUTED,
            userSelect: 'none',
        }}>
            {label}
        </div>
    );
}

/* ─── Sidebar ────────────────────────────────────────────────── */
export default function Sidebar({ isCollapsed, setIsCollapsed, handleLogOut, role }) {
    const [openKey, setOpenKey] = useState(null);
    const isSuperAdmin = role === "SUPER_ADMIN";
    const user = JSON.parse(localStorage.getItem("auth-user") || "{}");

    return (
        <aside style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            transition: 'width .3s', overflow: 'hidden', position: 'fixed',
            zIndex: 50, background: BG, borderRight: `1px solid ${BORDER}`,
            width: isCollapsed ? 64 : 240,
        }}>

            {/* ── logo ─────────────────────────────────────── */}
            <div style={{
                flexShrink: 0, display: 'flex', alignItems: 'center',
                gap: 10, padding: isCollapsed ? '18px 0' : '16px 16px',
                borderBottom: `1px solid ${BORDER}`,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8, background: ACCENT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                </div>
                {!isCollapsed && (
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                            Admin panel
                        </p>
                        <p style={{ color: TEXT_MUTED, fontSize: 10, margin: 0 }}>
                            Boshqaruv tizimi
                        </p>
                    </div>
                )}
            </div>

       
            {/* ── nav ──────────────────────────────────────── */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>

                {/* single top item — Asosiy */}
                <NavItem
                    item={MENU[0]}
                    isCollapsed={isCollapsed}
                    openKey={openKey}
                    setOpenKey={setOpenKey}
                />

                {/* groups */}
                {MENU.slice(1).map(section => (
                    <div key={section.group}>
                        <GroupLabel label={section.group} isCollapsed={isCollapsed} />
                        {section.items.map(item => (
                            <NavItem
                                key={item.name}
                                item={item}
                                isCollapsed={isCollapsed}
                                openKey={openKey}
                                setOpenKey={setOpenKey}
                            />
                        ))}
                    </div>
                ))}

                {/* super admin extra */}
                {isSuperAdmin && (
                    <div>
                        <GroupLabel label="Boshqaruv" isCollapsed={isCollapsed} />
                        {SUPER_ITEMS.map(item => (
                            <NavItem
                                key={item.name}
                                item={item}
                                isCollapsed={isCollapsed}
                                openKey={openKey}
                                setOpenKey={setOpenKey}
                            />
                        ))}
                    </div>
                )}
            </nav>

            {/* ── bottom ───────────────────────────────────── */}
            <div style={{
                flexShrink: 0, padding: '10px 10px 14px',
                borderTop: `1px solid ${BORDER}`,
                display: 'flex', flexDirection: 'column', gap: 2,
            }}>
                {/* logout */}
                <button onClick={handleLogOut} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: isCollapsed ? '9px 0' : '8px 10px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'transparent', color: TEXT_MUTED,
                    fontSize: 13, transition: 'all .15s',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_MUTED; }}
                >
                    <RiLogoutBoxLine style={{ fontSize: 16, flexShrink: 0 }} />
                    {!isCollapsed && <span>Chiqish</span>}
                </button>

                {/* collapse toggle */}
                <button onClick={() => setIsCollapsed(v => !v)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '7px', borderRadius: 8, border: 'none',
                    cursor: 'pointer', background: 'transparent', color: TEXT_MUTED,
                    fontSize: 18, transition: 'all .15s', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = BG_ITEM; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_MUTED; }}
                >
                    {isCollapsed ? <MdRight /> : <MdChevronLeft />}
                </button>
            </div>
        </aside>
    );
}
