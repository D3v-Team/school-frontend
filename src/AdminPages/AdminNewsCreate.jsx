import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { $api } from "../utils";

/* ─── design tokens (light mode) ────────────────────────────── */
const C = {
    pageBg:     '#f1f5f9',
    surface:    '#ffffff',
    surfaceAlt: '#f8fafc',
    border:     '#e2e8f0',
    brand:      '#ea6c0a',
    brandDark:  '#c2410c',
    brandBg:    '#fff7ed',
    brandBorder:'#fed7aa',
    text:       '#0f172a',
    textSub:    '#475569',
    textMuted:  '#94a3b8',
    green:      '#16a34a',
    greenBg:    '#f0fdf4',
    greenBorder:'#bbf7d0',
    red:        '#dc2626',
    redBg:      '#fef2f2',
    redBorder:  '#fecaca',
};

/* ─── tiny spinner ───────────────────────────────────────────── */
const Spin = ({ size = 16, color = '#fff' }) => (
    <svg className="animate-spin" width={size} height={size}
        viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

/* ─── section card wrapper ───────────────────────────────────── */
const Card = ({ children, style = {} }) => (
    <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        ...style,
    }}>
        {children}
    </div>
);

/* ─── label ──────────────────────────────────────────────────── */
const Label = ({ children, required }) => (
    <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: C.textMuted, textTransform: 'uppercase',
        letterSpacing: '.07em', marginBottom: 6,
    }}>
        {children}
        {required && <span style={{ color: C.brand, marginLeft: 3 }}>*</span>}
    </label>
);

/* ─── text input ─────────────────────────────────────────────── */
function TInput({ value, onChange, placeholder, hasError }) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                background: C.surfaceAlt, color: C.text,
                border: `1.5px solid ${hasError ? C.red : focused ? C.brand : C.border}`,
                transition: 'border-color .15s',
                boxSizing: 'border-box',
            }}
        />
    );
}

/* ─── textarea ───────────────────────────────────────────────── */
function TArea({ value, onChange, placeholder, rows = 5, hasError }) {
    const [focused, setFocused] = useState(false);
    return (
        <textarea
            rows={rows}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                background: C.surfaceAlt, color: C.text, resize: 'vertical',
                border: `1.5px solid ${hasError ? C.red : focused ? C.brand : C.border}`,
                transition: 'border-color .15s',
                boxSizing: 'border-box',
            }}
        />
    );
}

/* ─── lang tab config ────────────────────────────────────────── */
const LANGS = [
    { key: 'latin', flag: '🇺🇿', label: "Lotin (UZ)" },
    { key: 'cyril', flag: '🇺🇿', label: "Krill (UZ)" },
    { key: 'ru',    flag: '🇷🇺', label: "Rus"         },
];

/* ═══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */
export default function AdminNewsCreate() {
    const navigate = useNavigate();
    const fileRef  = useRef(null);

    /* form state */
    const [activeLang, setActiveLang] = useState('latin');
    const [form, setForm] = useState({
        title_latin:   '',
        title_cyril:   '',
        title_ru:      '',
        content_latin: '',
        content_cyril: '',
        content_ru:    '',
        is_public:     true,
    });
    const [coverFile, setCoverFile] = useState(null);
    const [preview,   setPreview]   = useState(null);
    const [errors,    setErrors]    = useState({});
    const [saving,    setSaving]    = useState(false);
    const [toast,     setToast]     = useState(null);

    /* helpers */
    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3200);
    };

    /* file pick */
    const handleFile = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) {
            setErrors(p => ({ ...p, cover: 'Rasm 5MB dan oshmasin' }));
            return;
        }
        setErrors(p => ({ ...p, cover: '' }));
        setCoverFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const removeFile = () => {
        setCoverFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    /* validation */
    const validate = () => {
        const e = {};
        if (!form.title_latin.trim())   e.title_latin   = 'Majburiy maydon';
        if (!form.content_latin.trim()) e.content_latin = 'Majburiy maydon';
        if (!form.title_cyril.trim())   e.title_cyril   = 'Majburiy maydon';
        if (!form.content_cyril.trim()) e.content_cyril = 'Majburiy maydon';
        if (!form.title_ru.trim())      e.title_ru      = 'Majburiy maydon';
        if (!form.content_ru.trim())    e.content_ru    = 'Majburiy maydon';
        return e;
    };

    /* submit */
    const handleSubmit = async e => {
        e?.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            /* switch to first tab that has error */
            if (errs.title_latin || errs.content_latin)   setActiveLang('latin');
            else if (errs.title_cyril || errs.content_cyril) setActiveLang('cyril');
            else if (errs.title_ru    || errs.content_ru)    setActiveLang('ru');
            return;
        }

        setSaving(true);
        setErrors({});
        try {
            const fd = new FormData();
            fd.append('title_latin',   form.title_latin.trim());
            fd.append('title_cyril',   form.title_cyril.trim());
            fd.append('title_ru',      form.title_ru.trim());
            fd.append('content_latin', form.content_latin.trim());
            fd.append('content_cyril', form.content_cyril.trim());
            fd.append('content_ru',    form.content_ru.trim());
            fd.append('is_public',     form.is_public);
            if (coverFile) fd.append('cover_image', coverFile);

            await $api.post('/api/news', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            showToast('success', "Yangilik muvaffaqiyatli yaratildi!");
            setTimeout(() => navigate('/admin/news'), 1400);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Xatolik yuz berdi';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    /* lang completeness check */
    const langDone = {
        latin: form.title_latin.trim() && form.content_latin.trim(),
        cyril: form.title_cyril.trim() && form.content_cyril.trim(),
        ru:    form.title_ru.trim()    && form.content_ru.trim(),
    };

    /* per-lang field keys */
    const fieldKeys = {
        latin: { title: 'title_latin',   content: 'content_latin'  },
        cyril: { title: 'title_cyril',   content: 'content_cyril'  },
        ru:    { title: 'title_ru',      content: 'content_ru'     },
    };

    /* ─── render ─────────────────────────────────────────── */
    return (
        <div style={{ minHeight: '100%', padding: 4 }}>

            {/* ── toast notification ──────────────────────── */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 9999,
                    padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: toast.type === 'success' ? C.greenBg : C.redBg,
                    border: `1px solid ${toast.type === 'success' ? C.greenBorder : C.redBorder}`,
                    color: toast.type === 'success' ? C.green : C.red,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    animation: 'slideInRight .25s ease',
                }}>
                    {toast.type === 'success'
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                    {toast.msg}
                </div>
            )}

            {/* ── page header ─────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* back button */}
                    <button
                        type="button"
                        onClick={() => navigate('/admin/news')}
                        style={{
                            width: 36, height: 36, borderRadius: 9,
                            border: `1px solid ${C.border}`, background: C.surface,
                            cursor: 'pointer', color: C.textSub,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.3">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </button>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1.2 }}>
                            Yangi yangilik
                        </h1>
                        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                            Barcha 3 tilda to'ldiring
                        </p>
                    </div>
                </div>

                {/* save button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 24px', borderRadius: 10, border: 'none',
                        background: saving ? C.brandDark : C.brand,
                        color: '#fff', fontSize: 14, fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.85 : 1,
                        boxShadow: '0 2px 14px rgba(234,108,10,.28)',
                        transition: 'all .15s',
                    }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                    {saving ? <Spin /> : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    )}
                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
            </div>

            {/* ── two-column layout ───────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>

                {/* ════ LEFT — language tabs ════ */}
                <Card>
                    {/* tab bar */}
                    <div style={{
                        display: 'flex', borderBottom: `1px solid ${C.border}`,
                        padding: '0 4px', gap: 2, background: C.surfaceAlt,
                        borderRadius: '14px 14px 0 0',
                    }}>
                        {LANGS.map(({ key, flag, label }) => {
                            const active = activeLang === key;
                            const done   = langDone[key];
                            const hasErr = (errors[`title_${key}`] || errors[`content_${key}`]);
                            return (
                                <button key={key} type="button"
                                    onClick={() => setActiveLang(key)}
                                    style={{
                                        flex: 1, padding: '11px 8px',
                                        border: 'none', borderRadius: '10px 10px 0 0',
                                        cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
                                        background: active ? C.surface : 'transparent',
                                        color: hasErr ? C.red : active ? C.brand : C.textSub,
                                        borderBottom: active ? `2.5px solid ${C.brand}` : '2.5px solid transparent',
                                        transition: 'all .15s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    }}>
                                    <span>{flag}</span>
                                    <span>{label}</span>
                                    {done && !hasErr && (
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: C.green, flexShrink: 0,
                                        }}/>
                                    )}
                                    {hasErr && (
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: C.red, flexShrink: 0,
                                        }}/>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* tab body */}
                    <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {LANGS.filter(l => l.key === activeLang).map(({ key, label }) => {
                            const tk = fieldKeys[key];
                            return (
                                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* title */}
                                    <div>
                                        <Label required>Sarlavha ({label})</Label>
                                        <TInput
                                            value={form[tk.title]}
                                            onChange={v => { set(tk.title, v); setErrors(p => ({ ...p, [tk.title]: '' })); }}
                                            placeholder={`Sarlavhani ${label} tilida kiriting...`}
                                            hasError={!!errors[tk.title]}
                                        />
                                        {errors[tk.title] && (
                                            <p style={{ fontSize: 11, color: C.red, marginTop: 4 }}>
                                                ⚠ {errors[tk.title]}
                                            </p>
                                        )}
                                    </div>

                                    {/* content */}
                                    <div>
                                        <Label required>Mazmun ({label})</Label>
                                        <TArea
                                            value={form[tk.content]}
                                            onChange={v => { set(tk.content, v); setErrors(p => ({ ...p, [tk.content]: '' })); }}
                                            placeholder={`Mazmunni ${label} tilida kiriting...`}
                                            rows={8}
                                            hasError={!!errors[tk.content]}
                                        />
                                        {errors[tk.content] && (
                                            <p style={{ fontSize: 11, color: C.red, marginTop: 4 }}>
                                                ⚠ {errors[tk.content]}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* character counters */}
                        <div style={{
                            display: 'flex', justifyContent: 'flex-end', gap: 16,
                            paddingTop: 4, borderTop: `1px solid ${C.border}`,
                        }}>
                            {activeLang === 'latin' && <>
                                <span style={{ fontSize: 11, color: C.textMuted }}>
                                    Sarlavha: <b style={{ color: C.textSub }}>{form.title_latin.length}</b> belgi
                                </span>
                                <span style={{ fontSize: 11, color: C.textMuted }}>
                                    Mazmun: <b style={{ color: C.textSub }}>{form.content_latin.length}</b> belgi
                                </span>
                            </>}
                            {activeLang === 'cyril' && <>
                                <span style={{ fontSize: 11, color: C.textMuted }}>
                                    Sarlavha: <b style={{ color: C.textSub }}>{form.title_cyril.length}</b> belgi
                                </span>
                                <span style={{ fontSize: 11, color: C.textMuted }}>
                                    Mazmun: <b style={{ color: C.textSub }}>{form.content_cyril.length}</b> belgi
                                </span>
                            </>}
                            {activeLang === 'ru' && <>
                                <span style={{ fontSize: 11, color: C.textMuted }}>
                                    Sarlavha: <b style={{ color: C.textSub }}>{form.title_ru.length}</b> belgi
                                </span>
                                <span style={{ fontSize: 11, color: C.textMuted }}>
                                    Mazmun: <b style={{ color: C.textSub }}>{form.content_ru.length}</b> belgi
                                </span>
                            </>}
                        </div>
                    </div>
                </Card>

                {/* ════ RIGHT — meta panel ════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* cover image */}
                    <Card style={{ padding: 18 }}>
                        <Label>Muqova rasmi</Label>

                        {preview ? (
                            <div style={{ position: 'relative' }}>
                                <img src={preview} alt="preview"
                                    style={{
                                        width: '100%', height: 170, objectFit: 'cover',
                                        borderRadius: 9, border: `1px solid ${C.border}`,
                                        display: 'block',
                                    }} />
                                <button type="button" onClick={removeFile}
                                    style={{
                                        position: 'absolute', top: 8, right: 8,
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.6)', border: 'none',
                                        color: '#fff', fontSize: 16, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        lineHeight: 1,
                                    }}>×</button>
                                <p style={{
                                    fontSize: 11, color: C.textMuted, marginTop: 6,
                                    textAlign: 'center', overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    📎 {coverFile?.name}
                                </p>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    height: 148, borderRadius: 9, cursor: 'pointer',
                                    border: `2px dashed ${C.border}`, background: C.surfaceAlt,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all .15s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = C.brand;
                                    e.currentTarget.style.background  = C.brandBg;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = C.border;
                                    e.currentTarget.style.background  = C.surfaceAlt;
                                }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: C.brandBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        stroke={C.brand} strokeWidth="1.8">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: C.brand }}>
                                        Rasm tanlash
                                    </p>
                                    <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                                        PNG, JPG · max 5 MB
                                    </p>
                                </div>
                            </div>
                        )}

                        <input ref={fileRef} type="file" accept="image/*"
                            className="hidden" onChange={handleFile} />
                        {errors.cover && (
                            <p style={{ fontSize: 11, color: C.red, marginTop: 6 }}>⚠ {errors.cover}</p>
                        )}
                    </Card>

                    {/* visibility toggle */}
                    <Card style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Ko'rinishi</p>
                                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                                    {form.is_public ? 'Hammaga ko\'rinadigan' : 'Yashirin (draft)'}
                                </p>
                            </div>
                            {/* toggle pill */}
                            <div
                                onClick={() => set('is_public', !form.is_public)}
                                style={{
                                    width: 48, height: 26, borderRadius: 13, cursor: 'pointer',
                                    background: form.is_public ? C.brand : '#cbd5e1',
                                    position: 'relative', transition: 'background .2s', flexShrink: 0,
                                }}>
                                <div style={{
                                    position: 'absolute', top: 3,
                                    left: form.is_public ? 25 : 3,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: '#fff',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                                    transition: 'left .2s',
                                }}/>
                            </div>
                        </div>

                        {/* status badge */}
                        <div style={{
                            marginTop: 12, padding: '6px 12px', borderRadius: 8,
                            textAlign: 'center', fontSize: 12, fontWeight: 700,
                            background: form.is_public ? C.greenBg : '#f8fafc',
                            border: `1px solid ${form.is_public ? C.greenBorder : C.border}`,
                            color: form.is_public ? C.green : C.textMuted,
                        }}>
                            {form.is_public ? '✓ Aktiv — Ko\'rinadi' : '○ Yashirin — Draft'}
                        </div>
                    </Card>

                    {/* lang progress */}
                    <Card style={{ padding: 18 }}>
                        <Label>Tillar holati</Label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const done   = langDone[key];
                                const hasErr = errors[`title_${key}`] || errors[`content_${key}`];
                                return (
                                    <div key={key}
                                        onClick={() => setActiveLang(key)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                            background: hasErr ? C.redBg : done ? C.greenBg : C.surfaceAlt,
                                            border: `1px solid ${hasErr ? C.redBorder : done ? C.greenBorder : C.border}`,
                                            transition: 'all .15s',
                                        }}>
                                        <span style={{ fontSize: 16 }}>{flag}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: C.text }}>
                                            {label}
                                        </span>
                                        <span style={{ fontSize: 11, fontWeight: 700,
                                            color: hasErr ? C.red : done ? C.green : C.textMuted }}>
                                            {hasErr ? '⚠ Xato' : done ? '✓ To\'liq' : '— Bo\'sh'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

              
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(20px); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}
