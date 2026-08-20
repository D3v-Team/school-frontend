/**
 * Shared admin UI primitives
 * Import: import { C, Spin, fmtDate, PBtn, GBtn, ABtn, Lbl,
 *                   Overlay, MBox, SearchBar, FilterPills, Pagination,
 *                   TableHead, EmptyRow, LoadingRow } from '../AdminComponents/ui';
 */

/* ─── design tokens ──────────────────────────────────────────── */
export const C = {
    white: '#ffffff', bg: '#f8fafc', border: '#e2e8f0',
    text: '#0f172a', sub: '#475569', muted: '#94a3b8',
    brand: '#ea6c0a', bBg: '#fff7ed', bBdr: '#fed7aa',
    red: '#dc2626', rBg: '#fef2f2', rBdr: '#fecaca',
    green: '#16a34a', gBg: '#f0fdf4', gBdr: '#bbf7d0',
    yellow: '#ca8a04', yBg: '#fefce8', yBdr: '#fef08a',
    blue: '#2563eb', blueBg: '#eff6ff', blueBdr: '#bfdbfe',
};

/* ─── spinner ─────────────────────────────────────────────────── */
export const Spin = ({ size = 16, color = C.brand }) => (
    <svg className="animate-spin" width={size} height={size}
        viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

/* ─── date formatter ──────────────────────────────────────────── */
export const fmtDate = d => d ? new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric',
}) : '—';

/* ─── label ───────────────────────────────────────────────────── */
export const Lbl = ({ children, req }) => (
    <div style={{
        fontSize: 11, fontWeight: 700, color: C.muted,
        textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5,
    }}>
        {children}{req && <span style={{ color: C.brand, marginLeft: 2 }}>*</span>}
    </div>
);

/* ─── input style fn ──────────────────────────────────────────── */
export const iStyle = (focused, err) => ({
    width: '100%', padding: '8px 11px', borderRadius: 8,
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
    background: C.bg, color: C.text, boxSizing: 'border-box',
    border: `1.5px solid ${err ? C.red : focused ? C.brand : C.border}`,
    transition: 'border-color .15s',
});

export const taStyle = focused => ({
    width: '100%', padding: '8px 11px', borderRadius: 8, resize: 'vertical',
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
    background: C.bg, color: C.text, boxSizing: 'border-box',
    border: `1.5px solid ${focused ? C.brand : C.border}`,
    transition: 'border-color .15s',
});

/* ─── buttons ─────────────────────────────────────────────────── */
export const PBtn = ({ onClick, loading, disabled, children, color = C.brand, style: sx = {}, type = 'button' }) => (
    <button type={type} onClick={onClick} disabled={loading || disabled} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 18px', borderRadius: 9, border: 'none',
        background: color, color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.75 : 1, transition: 'opacity .15s', ...sx,
    }}>
        {loading && <Spin color="#fff" />}
        {children}
    </button>
);

export const GBtn = ({ onClick, children, style: sx = {}, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 18px', borderRadius: 9,
        border: `1px solid ${C.border}`, background: C.white,
        color: C.sub, fontSize: 13, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, ...sx,
    }}>
        {children}
    </button>
);

export const ABtn = ({ onClick, title, bg, bdr, color, children, loading }) => (
    <button title={title} onClick={e => { e.stopPropagation(); onClick(); }}
        disabled={loading}
        style={{
            width: 28, height: 28, borderRadius: 7, cursor: loading ? 'default' : 'pointer',
            border: `1px solid ${bdr}`, background: bg, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: loading ? 0.6 : 1, flexShrink: 0,
        }}>
        {children}
    </button>
);

/* ─── modal overlay + box ─────────────────────────────────────── */
export const Overlay = ({ onClose, children }) => (
    <div onClick={e => e.target === e.currentTarget && onClose()}
        style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.48)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
        {children}
    </div>
);

export const MBox = ({ title, onClose, width = 680, children }) => (
    <div style={{
        width: '100%', maxWidth: width, background: C.white,
        borderRadius: 16, border: `1px solid ${C.border}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
        {title && (
            <div style={{
                padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                background: C.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexShrink: 0,
            }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h3>
                <button onClick={onClose} style={{
                    width: 28, height: 28, border: `1px solid ${C.border}`,
                    borderRadius: 7, background: C.white, cursor: 'pointer', color: C.muted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>{children}</div>
    </div>
);

export const MFooter = ({ onClose, onSave, saving, label = 'Saqlash' }) => (
    <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`,
    }}>
        <GBtn onClick={onClose}>Bekor qilish</GBtn>
        <PBtn onClick={onSave} loading={saving}>{label}</PBtn>
    </div>
);

/* ─── delete confirm modal ────────────────────────────────────── */
export function DeleteConfirm({ title, desc, onClose, onConfirm, loading }) {
    return (
        <Overlay onClose={onClose}>
            <div style={{
                width: '100%', maxWidth: 380, background: C.white,
                borderRadius: 16, border: `1px solid ${C.border}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: 28, textAlign: 'center',
            }}>
                <div style={{
                    width: 50, height: 50, borderRadius: '50%', margin: '0 auto 14px',
                    background: C.rBg, border: `1px solid ${C.rBdr}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke={C.red} strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.sub, marginBottom: 22, lineHeight: 1.65 }}>{desc}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <GBtn onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Bekor</GBtn>
                    <PBtn onClick={onConfirm} loading={loading} color={C.red}
                        style={{ flex: 1, justifyContent: 'center' }}>
                        O'chirish
                    </PBtn>
                </div>
            </div>
        </Overlay>
    );
}

/* ─── SearchBar ───────────────────────────────────────────────── */
import { useState, useRef } from 'react';

export function SearchBar({ value, onChange, placeholder = 'Qidirish...', delay = 400 }) {
    const [focused, setFocused] = useState(false);
    const timer = useRef(null);

    const handleChange = e => {
        const v = e.target.value;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(v), delay);
        // controlled by parent, pass raw for display
        onChange.__raw?.(v);
    };

    return (
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
            <svg style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none', transition: 'color .15s',
            }}
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={focused ? C.brand : C.muted} strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
                type="text"
                defaultValue={value}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={e => {
                    clearTimeout(timer.current);
                    timer.current = setTimeout(() => onChange(e.target.value), delay);
                }}
                style={{
                    width: '100%', padding: '9px 36px 9px 36px', borderRadius: 10,
                    border: `1.5px solid ${focused ? C.brand : C.border}`,
                    background: C.white, fontSize: 13, color: C.text,
                    outline: 'none', boxSizing: 'border-box',
                    boxShadow: focused ? `0 0 0 3px ${C.bBdr}` : 'none',
                    transition: 'border-color .15s, box-shadow .15s',
                }}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.muted, padding: 2, display: 'flex',
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            )}
        </div>
    );
}

/* ─── FilterPills ─────────────────────────────────────────────── */
export function FilterPills({ options, value, onChange }) {
    // options: [{ val, label, color?, bg?, border? }]
    return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {options.map(opt => {
                const active = value === opt.val;
                return (
                    <button key={String(opt.val)} onClick={() => onChange(opt.val)}
                        style={{
                            padding: '6px 14px', borderRadius: 20, fontSize: 12,
                            fontWeight: active ? 700 : 500, cursor: 'pointer',
                            transition: 'all .15s',
                            border: `1.5px solid ${active && opt.border ? opt.border : active ? C.brand : C.border}`,
                            background: active && opt.bg ? opt.bg : active ? C.bBg : C.white,
                            color: active && opt.color ? opt.color : active ? C.brand : C.sub,
                            boxShadow: active ? `0 0 0 2px ${active && opt.border ? opt.border + '66' : C.bBdr}` : 'none',
                        }}>
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ─── Pagination ──────────────────────────────────────────────── */
export function Pagination({ page, total, limit, onChange }) {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    const from = (page - 1) * limit + 1;
    const to   = Math.min(page * limit, total);

    // build page numbers window
    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        const left  = Math.max(1, page - 2);
        const right = Math.min(totalPages, page + 2);
        if (left > 1)          pages.push(1);
        if (left > 2)          pages.push('...');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages - 1) pages.push('...');
        if (right < totalPages)     pages.push(totalPages);
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, flexWrap: 'wrap', gap: 10,
        }}>
            {/* info */}
            <span style={{ fontSize: 12, color: C.muted }}>
                <strong style={{ color: C.sub }}>{from}–{to}</strong>
                {' '}/ {total} ta natija
            </span>

            {/* pages */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* prev */}
                <button onClick={() => onChange(page - 1)} disabled={page <= 1}
                    style={{
                        height: 34, padding: '0 12px', borderRadius: 8,
                        border: `1px solid ${C.border}`, background: C.white,
                        color: page <= 1 ? C.muted : C.sub, fontSize: 13,
                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                        opacity: page <= 1 ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.3">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Oldingi
                </button>

                {pages.map((p, i) => p === '...' ? (
                    <span key={`e${i}`} style={{ width: 34, textAlign: 'center', color: C.muted, fontSize: 13 }}>
                        …
                    </span>
                ) : (
                    <button key={p} onClick={() => onChange(p)}
                        style={{
                            width: 34, height: 34, borderRadius: 8, border: 'none',
                            fontSize: 13, fontWeight: p === page ? 700 : 400, cursor: 'pointer',
                            background: p === page ? C.brand : '#f1f5f9',
                            color: p === page ? '#fff' : C.sub,
                            boxShadow: p === page ? '0 2px 8px rgba(234,108,10,0.3)' : 'none',
                            transition: 'all .15s',
                        }}>
                        {p}
                    </button>
                ))}

                {/* next */}
                <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
                    style={{
                        height: 34, padding: '0 12px', borderRadius: 8,
                        border: `1px solid ${C.border}`, background: C.white,
                        color: page >= totalPages ? C.muted : C.sub, fontSize: 13,
                        cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                        opacity: page >= totalPages ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                    Keyingi
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.3">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

/* ─── Table header row ────────────────────────────────────────── */
export function TableHead({ cols, gridCols }) {
    return (
        <div style={{
            display: 'grid', gridTemplateColumns: gridCols,
            padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg,
        }}>
            {cols.map((h, i) => (
                <span key={i} style={{
                    fontSize: 11, fontWeight: 700, color: C.muted,
                    textTransform: 'uppercase', letterSpacing: '.07em',
                    textAlign: h.right ? 'right' : 'left',
                }}>{h.label ?? h}</span>
            ))}
        </div>
    );
}

/* ─── Loading / Empty rows ────────────────────────────────────── */
export const LoadingRow = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '56px 0', gap: 10 }}>
        <Spin /><span style={{ fontSize: 13, color: C.muted }}>Yuklanmoqda...</span>
    </div>
);

export const EmptyRow = ({ text = 'Ma\'lumot topilmadi' }) => (
    <div style={{ textAlign: 'center', padding: '56px 0', color: C.muted }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.2"
            style={{ margin: '0 auto 10px', display: 'block' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p style={{ fontSize: 13 }}>{text}</p>
    </div>
);

/* ─── Page header ─────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, onAdd, addLabel = 'Yangi qo\'shish' }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{subtitle}</p>}
            </div>
            {onAdd && (
                <PBtn onClick={onAdd}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    {addLabel}
                </PBtn>
            )}
        </div>
    );
}

/* ─── Table wrapper card ──────────────────────────────────────── */
export const TableCard = ({ children }) => (
    <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 12, overflow: 'hidden',
    }}>
        {children}
    </div>
);

/* ─── Status badge ────────────────────────────────────────────── */
export function StatusBadge({ label, bg, color, border }) {
    return (
        <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: bg, color, border: `1px solid ${border}`,
            textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
}

/* ─── Toggle (is_active / is_public) ─────────────────────────── */
export function Toggle({ value, onChange }) {
    return (
        <div onClick={() => onChange(!value)}
            style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: value ? C.brand : '#cbd5e1',
                position: 'relative', transition: 'background .2s', flexShrink: 0,
            }}>
            <div style={{
                position: 'absolute', top: 3, left: value ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left .2s',
            }} />
        </div>
    );
}

/* ─── Lang tabs (3-lang content) ──────────────────────────────── */
export const LANGS = [
    { key: 'latin', flag: '🇺🇿', label: 'Lotin' },
    { key: 'cyril', flag: '🇺🇿', label: 'Krill' },
    { key: 'ru',    flag: '🇷🇺', label: 'Rus'   },
];
