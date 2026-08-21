import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { $api } from "../utils";
import { fmtDate, LangPills } from "../AdminComponents/ui";
import { getLang, mediaUrl, useLang } from "../utils/api";

/* ── shared styles (light) ─────────────────────────────────── */
const S = {
    card: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
    },
    input: {
        width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        color: '#0f172a', outline: 'none', transition: 'border-color .2s',
        fontFamily: 'inherit',
    },
    label: {
        fontSize: 11, fontWeight: 700, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '.08em',
        display: 'block', marginBottom: 4,
    },
    btn: (col = '#ea6c0a') => ({
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', border: 'none', background: col, color: '#fff',
        transition: 'opacity .15s',
    }),
    btnGhost: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', border: '1px solid #e2e8f0',
        background: '#ffffff', color: '#475569', transition: 'all .15s',
    },
};

/* ── helpers ───────────────────────────────────────────────── */
const Spinner = () => (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const Badge = ({ pub }) => (
    <span style={{
        fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
        background: pub ? '#f0fdf4' : '#f8fafc',
        color: pub ? '#16a34a' : '#94a3b8',
        border: `1px solid ${pub ? '#bbf7d0' : '#e2e8f0'}`,
        textTransform: 'uppercase', letterSpacing: '.06em',
    }}>
        {pub ? 'Aktiv' : 'Yashirin'}
    </span>
);

/* ── Edit modal ────────────────────────────────────────────── */
function EditModal({ initial, onClose, onSaved }) {
    const currentLang = useLang();
    const fileRef = useRef(null);
    const [form, setForm] = useState({
        title_latin:   initial.title_latin   || '',
        title_cyril:   initial.title_cyril   || '',
        title_ru:      initial.title_ru      || '',
        content_latin: initial.content_latin || '',
        content_cyril: initial.content_cyril || '',
        content_ru:    initial.content_ru    || '',
        is_public:     initial.is_public     ?? true,
    });
    const [coverFile, setCoverFile] = useState(null);
    const [preview, setPreview]     = useState(initial.cover_image ? mediaUrl(initial.cover_image) : null);
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState('');
    const [activeTab, setActiveTab] = useState(currentLang);

    const TABS = [
        { key: 'latin', label: '🇺🇿 Lotin' },
        { key: 'cyril', label: '🇺🇿 Krill' },
        { key: 'ru',    label: '🇷🇺 Rus'   },
    ];

    const handleFile = e => {
        const f = e.target.files[0];
        if (!f) return;
        setCoverFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.title_latin.trim()) { setError("Lotin sarlavha majburiy"); return; }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (coverFile) fd.append('cover_image', coverFile);
            await $api.patch(`/api/news/${initial.id}`, fd);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    const tk = { latin: ['title_latin','content_latin'], cyril: ['title_cyril','content_cyril'], ru: ['title_ru','content_ru'] };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}>
            <div style={{
                width: '100%', maxWidth: 680, background: '#fff',
                borderRadius: 16, border: '1px solid #e2e8f0',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)', overflow: 'hidden',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            }}>
                {/* header */}
                <div style={{
                    padding: '16px 22px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8fafc',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, background: '#fff7ed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#ea6c0a" strokeWidth="2.2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                Yangilikni tahrirlash
                            </h2>
                            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                {initial.title_latin?.slice(0, 40) || 'Yangilik'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 7,
                        background: '#fff', cursor: 'pointer', color: '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* body */}
                <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px 22px', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, marginBottom: 16 }}>
                        {/* cover */}
                        <div>
                            <label style={S.label}>Muqova rasmi</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {preview ? (
                                    <img src={preview} alt="cover" style={{
                                        width: 80, height: 54, objectFit: 'cover',
                                        borderRadius: 7, border: '1px solid #e2e8f0',
                                    }} />
                                ) : (
                                    <div style={{
                                        width: 80, height: 54, borderRadius: 7,
                                        border: '2px dashed #e2e8f0', background: '#f8fafc',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="#cbd5e1" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <input ref={fileRef} type="file" accept="image/*"
                                        className="hidden" onChange={handleFile} />
                                    <button type="button"
                                        onClick={() => fileRef.current?.click()}
                                        style={{
                                            padding: '6px 12px', borderRadius: 7, fontSize: 12,
                                            fontWeight: 600, cursor: 'pointer', border: '1px solid #e2e8f0',
                                            background: '#f8fafc', color: '#475569',
                                        }}>
                                        Tanlash
                                    </button>
                                    {coverFile && (
                                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                                            {coverFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* is_public */}
                        <div>
                            <label style={S.label}>Holat</label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 8,
                                border: '1px solid #e2e8f0', background: '#f8fafc',
                            }}>
                                <div onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))}
                                    style={{
                                        width: 38, height: 20, borderRadius: 10, cursor: 'pointer',
                                        background: form.is_public ? '#ea6c0a' : '#cbd5e1',
                                        position: 'relative', transition: 'background .2s', flexShrink: 0,
                                    }}>
                                    <div style={{
                                        position: 'absolute', top: 2,
                                        left: form.is_public ? 20 : 2,
                                        width: 16, height: 16, borderRadius: '50%',
                                        background: '#fff', transition: 'left .2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                    }} />
                                </div>
                                <span style={{
                                    fontSize: 12, fontWeight: 600,
                                    color: form.is_public ? '#16a34a' : '#94a3b8',
                                }}>
                                    {form.is_public ? 'Aktiv' : 'Yashirin'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* lang tabs */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{
                            display: 'flex', background: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                        }}>
                            {TABS.map(t => (
                                <button key={t.key} type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    style={{
                                        flex: 1, padding: '9px 4px', border: 'none',
                                        background: activeTab === t.key ? '#fff' : 'transparent',
                                        fontSize: 12, fontWeight: activeTab === t.key ? 700 : 500,
                                        color: activeTab === t.key ? '#ea6c0a' : '#64748b',
                                        borderBottom: activeTab === t.key ? '2px solid #ea6c0a' : '2px solid transparent',
                                        cursor: 'pointer', transition: 'all .15s',
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {TABS.filter(t => t.key === activeTab).map(t => (
                                <div key={t.key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div>
                                        <label style={S.label}>Sarlavha</label>
                                        <input type="text" value={form[tk[t.key][0]]}
                                            onChange={e => setForm(f => ({ ...f, [tk[t.key][0]]: e.target.value }))}
                                            style={S.input}
                                            onFocus={e => e.target.style.borderColor = '#ea6c0a'}
                                            onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                    <div>
                                        <label style={S.label}>Mazmun</label>
                                        <textarea rows={5} value={form[tk[t.key][1]]}
                                            onChange={e => setForm(f => ({ ...f, [tk[t.key][1]]: e.target.value }))}
                                            style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit' }}
                                            onFocus={e => e.target.style.borderColor = '#ea6c0a'}
                                            onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            marginTop: 12, padding: '9px 13px', borderRadius: 8, fontSize: 12,
                            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                        }}>
                            ⚠ {error}
                        </div>
                    )}

                    {/* footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                        <button type="button" onClick={onClose} style={S.btnGhost}>
                            Bekor qilish
                        </button>
                        <button type="submit" disabled={saving}
                            style={{ ...S.btn(), opacity: saving ? .75 : 1 }}>
                            {saving && <Spinner />}
                            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete modal ──────────────────────────────────────────── */
function DeleteModal({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const confirm = async () => {
        setLoading(true);
        try {
            await $api.delete(`/api/news/${item.id}`);
            onDeleted();
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}>
            <div style={{
                width: '100%', maxWidth: 380, background: '#fff',
                borderRadius: 16, border: '1px solid #e2e8f0',
                boxShadow: '0 16px 48px rgba(0,0,0,0.1)', padding: 28,
                textAlign: 'center',
            }}>
                <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                    </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    O'chirishni tasdiqlang
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 22, lineHeight: 1.6 }}>
                    <strong style={{ color: '#0f172a' }}>
                        {item?.title_latin?.slice(0, 50) || 'Bu yangilik'}
                    </strong>{' '}
                    o'chiriladi. Bu amalni qaytarib bo'lmaydi.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose}
                        style={{ ...S.btnGhost, flex: 1, justifyContent: 'center' }}>
                        Bekor
                    </button>
                    <button onClick={confirm} disabled={loading}
                        style={{ ...S.btn('#dc2626'), flex: 1, justifyContent: 'center', opacity: loading ? .75 : 1 }}>
                        {loading && <Spinner />}
                        O'chirish
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main ──────────────────────────────────────────────────── */
export default function AdminNews() {
    const navigate = useNavigate();
    const lang = useLang(); // navbar tilga qarab avtomatik
    const [news,    setNews]    = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);
    const LIMIT = 10;
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim()) params.search = search.trim();
                const res = await $api.get('/api/news', { params });
                const d   = res.data;
                if (!cancelled) {
                    setNews(d?.data || d?.items || []);
                    setTotal(d?.total || d?.meta?.total || 0);
                }
            } catch {
                if (!cancelled) setNews([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [page, search, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };
    const refresh = () => { setModal(null); setTick(t => t + 1); };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div style={{ minHeight: '100%' }}>

            {/* ── header ─────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20,
            }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Yangiliklar
                    </h1>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                        Jami:{' '}
                        <strong style={{ color: '#475569' }}>{total}</strong> ta yangilik
                    </p>
                </div>
                <button style={S.btn()} onClick={() => navigate('/admin/news/create')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Yangi yangilik
                </button>
            </div>

            {/* ── search ──────────────────────────────────── */}
            <div style={{ position: 'relative', maxWidth: 340, marginBottom: 16 }}>
                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    type="text" placeholder="Qidirish..." value={search}
                    onChange={e => handleSearch(e.target.value)}
                    style={{ ...S.input, paddingLeft: 34 }}
                    onFocus={e => e.target.style.borderColor = '#ea6c0a'}
                    onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                />
            </div>

            {/* ── table ──────────────────────────────────── */}
            <div style={{ ...S.card, overflow: 'hidden' }}>
                {/* thead */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 90px 100px 90px',
                    padding: '10px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                }}>
                    {['Sarlavha', 'Mazmun', 'Holat', 'Sana', ''].map((h, i) => (
                        <span key={i} style={{
                            fontSize: 11, fontWeight: 700, color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '.07em',
                            textAlign: i === 4 ? 'right' : 'left',
                        }}>{h}</span>
                    ))}
                </div>

                {/* body */}
                {loading ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '60px 0', gap: 10, color: '#94a3b8',
                    }}>
                        <Spinner />
                        <span style={{ fontSize: 13 }}>Yuklanmoqda...</span>
                    </div>
                ) : news.length === 0 ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '60px 0', color: '#cbd5e1',
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <p style={{ marginTop: 10, fontSize: 13 }}>Yangiliklar topilmadi</p>
                    </div>
                ) : (
                    news.map((item, i) => (
                        <div key={item.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 90px 100px 90px',
                                alignItems: 'center',
                                padding: '12px 20px',
                                borderBottom: i < news.length - 1 ? '1px solid #f1f5f9' : 'none',
                                transition: 'background .1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* title + thumb */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                {item.cover_image ? (
                                    <img src={mediaUrl(item.cover_image)} alt=""
                                        style={{
                                            width: 40, height: 28, objectFit: 'cover',
                                            borderRadius: 6, flexShrink: 0,
                                            border: '1px solid #e2e8f0',
                                        }} />
                                ) : (
                                    <div style={{
                                        width: 40, height: 28, borderRadius: 6, flexShrink: 0,
                                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke="#cbd5e1" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                )}
                                <span style={{
                                    fontSize: 13, fontWeight: 600, color: '#1e293b',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {getLang(item, 'title', lang) || '—'}
                                </span>
                            </div>

                            {/* content preview */}
                            <span style={{
                                fontSize: 12, color: '#94a3b8',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                paddingRight: 12,
                            }}>
                                {getLang(item, 'content', lang)?.replace(/<[^>]+>/g, '').slice(0, 70) || '—'}
                            </span>

                            {/* badge */}
                            <span><Badge pub={item.is_public} /></span>

                            {/* date */}
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                {fmtDate(item.created_at)}
                            </span>

                            {/* actions */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                <button title="Tahrirlash"
                                    onClick={() => setModal({ mode: 'edit', item })}
                                    style={{
                                        width: 30, height: 30, borderRadius: 7, cursor: 'pointer',
                                        border: '1px solid #fed7aa', background: '#fff7ed',
                                        color: '#ea6c0a', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button title="O'chirish"
                                    onClick={() => setModal({ mode: 'delete', item })}
                                    style={{
                                        width: 30, height: 30, borderRadius: 7, cursor: 'pointer',
                                        border: '1px solid #fecaca', background: '#fef2f2',
                                        color: '#dc2626', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6"/><path d="M14 11v6"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── pagination ─────────────────────────────── */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginTop: 16,
                }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            style={{ ...S.btnGhost, padding: '5px 12px', opacity: page <= 1 ? .4 : 1 }}>
                            ← Oldingi
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const p = totalPages <= 7 ? i + 1 : i + Math.max(1, page - 3);
                            if (p > totalPages) return null;
                            return (
                                <button key={p} onClick={() => setPage(p)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 7,
                                        fontSize: 13, cursor: 'pointer', border: 'none',
                                        fontWeight: p === page ? 700 : 400,
                                        background: p === page ? '#ea6c0a' : '#f1f5f9',
                                        color: p === page ? '#fff' : '#64748b',
                                    }}>
                                    {p}
                                </button>
                            );
                        })}
                        <button disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            style={{ ...S.btnGhost, padding: '5px 12px', opacity: page >= totalPages ? .4 : 1 }}>
                            Keyingi →
                        </button>
                    </div>
                </div>
            )}

            {/* ── modals ─────────────────────────────────── */}
            {modal?.mode === 'edit' && (
                <EditModal
                    initial={modal.item}
                    onClose={() => setModal(null)}
                    onSaved={refresh}
                />
            )}
            {modal?.mode === 'delete' && (
                <DeleteModal
                    item={modal.item}
                    onClose={() => setModal(null)}
                    onDeleted={refresh}
                />
            )}
        </div>
    );
}
