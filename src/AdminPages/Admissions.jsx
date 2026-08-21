import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { $api } from "../utils";

/* ─── tokens ─────────────────────────────────────────────────── */
const C = {
    white:    '#ffffff',
    bg:       '#f8fafc',
    border:   '#e2e8f0',
    text:     '#0f172a',
    sub:      '#475569',
    muted:    '#94a3b8',
    brand:    '#ea6c0a',
    brandBg:  '#fff7ed',
    brandBdr: '#fed7aa',
};

const STATUS_MAP = {
    NEW:         { label: "Yangi",         bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    IN_PROGRESS: { label: "Ko'rib chiqilmoqda", bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
    ACCEPTED:    { label: "Qabul qilindi", bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    REJECTED:    { label: "Rad etildi",    bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

/* ─── helpers ────────────────────────────────────────────────── */
const Spin = ({ size = 16, color = C.brand }) => (
    <svg className="animate-spin" width={size} height={size}
        viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP.NEW;
    return (
        <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap',
        }}>
            {s.label}
        </span>
    );
};

const fmtDate = d => d ? new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric',
}) : '—';

/* ─── Status update modal ────────────────────────────────────── */
function StatusModal({ item, onClose, onSaved }) {
    const [status, setStatus]   = useState(item.status || 'NEW');
    const [comment, setComment] = useState(item.admin_comment || '');
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState('');

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            await $api.patch(`/api/admission/${item.id}`, { status, admin_comment: comment });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Overlay onClose={onClose}>
            <ModalBox title="Holatni yangilash" onClose={onClose} width={440}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <Label>Holat</Label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {Object.entries(STATUS_MAP).map(([key, s]) => (
                                <button key={key} type="button"
                                    onClick={() => setStatus(key)}
                                    style={{
                                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                        fontSize: 12, fontWeight: 600, border: `1.5px solid`,
                                        borderColor: status === key ? s.color : C.border,
                                        background: status === key ? s.bg : C.white,
                                        color: status === key ? s.color : C.sub,
                                        transition: 'all .15s',
                                    }}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Admin izohi (ixtiyoriy)</Label>
                        <textarea rows={3} value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Ariza haqida izoh..."
                            style={textareaStyle} />
                    </div>
                    {error && <ErrorBox msg={error} />}
                    <ModalFooter onClose={onClose} onSave={handleSave} saving={saving} saveLabel="Saqlash" />
                </div>
            </ModalBox>
        </Overlay>
    );
}

/* ─── Delete confirm modal ───────────────────────────────────── */
function DeleteModal({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/admission/${item.id}`); onDeleted(); }
        catch { /* silent */ }
        finally { setLoading(false); }
    };
    return (
        <Overlay onClose={onClose}>
            <ModalBox title="" onClose={onClose} width={380}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                        O'chirishni tasdiqlang
                    </h3>
                    <p style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.6 }}>
                        <strong style={{ color: C.text }}>{item.student_full_name}</strong> arizasi
                        o'chiriladi. Bu amalni qaytarib bo'lmaydi.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <GhostBtn onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Bekor</GhostBtn>
                        <PrimaryBtn onClick={confirm} loading={loading}
                            color="#dc2626" style={{ flex: 1, justifyContent: 'center' }}>
                            O'chirish
                        </PrimaryBtn>
                    </div>
                </div>
            </ModalBox>
        </Overlay>
    );
}

/* ─── Create / Edit form modal ───────────────────────────────── */
function FormModal({ item, onClose, onSaved }) {
    const isEdit = !!item;
    const EMPTY = {
        student_full_name: '', birth_date: '', grade_applying: '',
        parent_full_name: '', parent_phone: '', parent_email: '',
        address: '', previous_school: '', message: '',
    };
    const [form, setForm]   = useState(isEdit ? { ...EMPTY, ...item } : EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState('');

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    /* focus state */
    const focusRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { focusRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!focusRef.current[k];

    const handleSave = async () => {
        if (!form.student_full_name.trim() || !form.parent_phone.trim()) {
            setError("O'quvchi ismi va ota-ona telefoni majburiy");
            return;
        }
        setSaving(true); setError('');
        try {
            const payload = {
                ...form,
                birth_date: form.birth_date ? `${form.birth_date}T00:00:00.000Z` : undefined,
            };
            if (isEdit) {
                await $api.patch(`/api/admission/admin/${item.id}`, payload);
            } else {
                await $api.post('/api/admission/apply', payload);
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    };

    const inputSt = k => ({
        width: '100%', padding: '8px 11px', borderRadius: 8,
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
        background: C.bg, color: C.text, boxSizing: 'border-box',
        border: `1.5px solid ${fc(k) ? C.brand : C.border}`,
        transition: 'border-color .15s',
    });

    return (
        <Overlay onClose={onClose}>
            <ModalBox
                title={isEdit ? 'Arizani tahrirlash' : 'Yangi ariza'}
                onClose={onClose} width={640}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                    <div style={{ gridColumn: 'span 2' }}>
                        <Label>O'quvchi to'liq ismi <span style={{ color: C.brand }}>*</span></Label>
                        <input type="text" value={form.student_full_name}
                            onChange={e => set('student_full_name', e.target.value)}
                            onFocus={() => sf('student_full_name', true)}
                            onBlur={() => sf('student_full_name', false)}
                            style={inputSt('student_full_name')} />
                    </div>

                    <div>
                        <Label>Tug'ilgan sana</Label>
                        <input type="date" value={form.birth_date}
                            onChange={e => set('birth_date', e.target.value)}
                            onFocus={() => sf('birth_date', true)}
                            onBlur={() => sf('birth_date', false)}
                            style={inputSt('birth_date')} />
                    </div>

                    <div>
                        <Label>Sinf (masalan: 1)</Label>
                        <input type="text" value={form.grade_applying}
                            onChange={e => set('grade_applying', e.target.value)}
                            onFocus={() => sf('grade_applying', true)}
                            onBlur={() => sf('grade_applying', false)}
                            style={inputSt('grade_applying')} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <Label>Ota-ona to'liq ismi <span style={{ color: C.brand }}>*</span></Label>
                        <input type="text" value={form.parent_full_name}
                            onChange={e => set('parent_full_name', e.target.value)}
                            onFocus={() => sf('parent_full_name', true)}
                            onBlur={() => sf('parent_full_name', false)}
                            style={inputSt('parent_full_name')} />
                    </div>

                    <div>
                        <Label>Telefon <span style={{ color: C.brand }}>*</span></Label>
                        <input type="tel" value={form.parent_phone}
                            onChange={e => set('parent_phone', e.target.value)}
                            onFocus={() => sf('parent_phone', true)}
                            onBlur={() => sf('parent_phone', false)}
                            style={inputSt('parent_phone')} />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <input type="email" value={form.parent_email}
                            onChange={e => set('parent_email', e.target.value)}
                            onFocus={() => sf('parent_email', true)}
                            onBlur={() => sf('parent_email', false)}
                            style={inputSt('parent_email')} />
                    </div>

                    <div>
                        <Label>Manzil</Label>
                        <input type="text" value={form.address}
                            onChange={e => set('address', e.target.value)}
                            onFocus={() => sf('address', true)}
                            onBlur={() => sf('address', false)}
                            style={inputSt('address')} />
                    </div>

                    <div>
                        <Label>Oldingi maktab</Label>
                        <input type="text" value={form.previous_school}
                            onChange={e => set('previous_school', e.target.value)}
                            onFocus={() => sf('previous_school', true)}
                            onBlur={() => sf('previous_school', false)}
                            style={inputSt('previous_school')} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <Label>Xabar / Izoh</Label>
                        <textarea rows={3} value={form.message}
                            onChange={e => set('message', e.target.value)}
                            onFocus={() => sf('message', true)}
                            onBlur={() => sf('message', false)}
                            style={{
                                width: '100%', padding: '8px 11px', borderRadius: 8,
                                fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                                background: C.bg, color: C.text, outline: 'none',
                                boxSizing: 'border-box',
                                border: `1.5px solid ${fc('message') ? C.brand : C.border}`,
                                transition: 'border-color .15s',
                            }} />
                    </div>
                </div>

                {error && (
                    <div style={{
                        marginTop: 12, padding: '8px 12px', borderRadius: 8, fontSize: 12,
                        background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                    }}>
                        ⚠ {error}
                    </div>
                )}

                <div style={{ marginTop: 16 }}>
                    <ModalFooter onClose={onClose} onSave={handleSave} saving={saving}
                        saveLabel={isEdit ? 'Saqlash' : 'Yaratish'} />
                </div>
            </ModalBox>
        </Overlay>
    );
}

/* ─── Shared mini components ─────────────────────────────────── */
const Overlay = ({ children, onClose }) => (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
        {children}
    </div>
);

const ModalBox = ({ children, title, onClose, width = 520 }) => (
    <div style={{
        width: '100%', maxWidth: width, background: C.white,
        borderRadius: 16, border: `1px solid ${C.border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
    }}>
        {title && (
            <div style={{
                padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: C.bg, flexShrink: 0,
            }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h3>
                <button onClick={onClose} style={{
                    width: 28, height: 28, border: `1px solid ${C.border}`,
                    borderRadius: 7, background: C.white, cursor: 'pointer',
                    color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
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

const ModalFooter = ({ onClose, onSave, saving, saveLabel = 'Saqlash' }) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <GhostBtn onClick={onClose}>Bekor qilish</GhostBtn>
        <PrimaryBtn onClick={onSave} loading={saving}>{saveLabel}</PrimaryBtn>
    </div>
);

const PrimaryBtn = ({ children, onClick, loading, color = C.brand, style = {}, disabled }) => (
    <button onClick={onClick} disabled={loading || disabled} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 18px', borderRadius: 9, border: 'none',
        background: color, color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.75 : 1, transition: 'opacity .15s',
        ...style,
    }}>
        {loading && <Spin color="#fff" />}
        {children}
    </button>
);

const GhostBtn = ({ children, onClick, style = {} }) => (
    <button onClick={onClick} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 18px', borderRadius: 9,
        border: `1px solid ${C.border}`, background: C.white,
        color: C.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background .15s', ...style,
    }}>
        {children}
    </button>
);

const Label = ({ children }) => (
    <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: C.muted, textTransform: 'uppercase',
        letterSpacing: '.07em', marginBottom: 5,
    }}>
        {children}
    </label>
);

const FInput = ({ value, onChange, type = 'text' }) => {
    const [f, setF] = useState(false);
    return (
        <input type={type} value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setF(true)} onBlur={() => setF(false)}
            style={{
                width: '100%', padding: '8px 11px', borderRadius: 8,
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                background: C.bg, color: C.text, boxSizing: 'border-box',
                border: `1.5px solid ${f ? C.brand : C.border}`,
                transition: 'border-color .15s',
            }} />
    );
};

const textareaStyle = {
    width: '100%', padding: '8px 11px', borderRadius: 8, fontSize: 13,
    fontFamily: 'inherit', outline: 'none', resize: 'vertical',
    background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box',
    border: '1.5px solid #e2e8f0', transition: 'border-color .15s',
};

const ErrorBox = ({ msg, style = {} }) => (
    <div style={{
        padding: '8px 12px', borderRadius: 8, fontSize: 12,
        background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', ...style,
    }}>
        ⚠ {msg}
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const STATUSES = ['', 'NEW', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED'];
const LIMIT = 10;

export default function Admissions() {
    const navigate = useNavigate();

    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [status,  setStatus]  = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);
    // modal: null | 'create' | { type:'status'|'edit'|'delete', item }

    /* fetch */
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page, limit: LIMIT,
                sortBy: 'created_at', sortOrder: 'desc',
            };
            if (search.trim()) params.search = search.trim();
            if (status) params.status = status;
            const res = await $api.get('/api/admission', { params });
            const d = res.data;
            setItems(d?.data || d?.items || []);
            setTotal(d?.total || d?.meta?.total || 0);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const searchTimer = useRef(null);
    const handleSearch = v => {
        setSearch(v); setPage(1);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(fetchData, 400);
    };

    const totalPages = Math.ceil(total / LIMIT);
    const refresh = () => { setModal(null); fetchData(); };

    /* status counts for summary cards */
    const counts = items.reduce((acc, it) => {
        acc[it.status] = (acc[it.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={{ minHeight: '100%' }}>

            {/* ── header ─────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>
                        Onlayn Qabul Arizalari
                    </h1>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                        Jami: <strong style={{ color: C.sub }}>{total}</strong> ta ariza
                    </p>
                </div>
                <PrimaryBtn onClick={() => setModal('create')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Yangi ariza
                </PrimaryBtn>
            </div>

            {/* ── summary cards ──────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {Object.entries(STATUS_MAP).map(([key, s]) => (
                    <div key={key}
                        onClick={() => { setStatus(status === key ? '' : key); setPage(1); }}
                        style={{
                            background: C.white, border: `1px solid ${status === key ? s.color : C.border}`,
                            borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                            transition: 'all .15s',
                            boxShadow: status === key ? `0 0 0 3px ${s.border}` : 'none',
                        }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
                            {s.label}
                        </p>
                        <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: 0 }}>
                            {counts[key] || 0}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── filters row ────────────────────────────── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                {/* search */}
                <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
                    <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={C.muted} strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" placeholder="Ism, telefon bo'yicha qidirish..."
                        value={search} onChange={e => handleSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 12px 8px 34px', borderRadius: 9,
                            border: `1px solid ${C.border}`, background: C.white,
                            fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = C.brand}
                        onBlur={e  => e.target.style.borderColor = C.border}
                    />
                </div>

                {/* status filter pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {STATUSES.map(s => {
                        const active = status === s;
                        const info   = s ? STATUS_MAP[s] : null;
                        return (
                            <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1); }}
                                style={{
                                    padding: '7px 14px', borderRadius: 9, fontSize: 12,
                                    fontWeight: active ? 700 : 500, cursor: 'pointer',
                                    border: `1px solid ${active && info ? info.color : C.border}`,
                                    background: active && info ? info.bg : active ? C.brandBg : C.white,
                                    color: active && info ? info.color : active ? C.brand : C.sub,
                                    transition: 'all .15s',
                                }}>
                                {s ? (STATUS_MAP[s]?.label || s) : 'Barchasi'}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── table ──────────────────────────────────── */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {/* thead */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 100px 100px',
                    padding: '10px 18px',
                    borderBottom: `1px solid ${C.border}`,
                    background: C.bg,
                }}>
                    {["O'quvchi", "Ota-ona", "Sinf", "Holat", "Sana", ""].map((h, i) => (
                        <span key={i} style={{
                            fontSize: 11, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '.07em',
                            textAlign: i === 5 ? 'right' : 'left',
                        }}>{h}</span>
                    ))}
                </div>

                {/* rows */}
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10 }}>
                        <Spin /> <span style={{ fontSize: 13, color: C.muted }}>Yuklanmoqda...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.2" style={{ margin: '0 auto 10px', display: 'block' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <p style={{ fontSize: 13 }}>Arizalar topilmadi</p>
                    </div>
                ) : items.map((item, i) => (
                    <div key={item.id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1.2fr 1fr 1fr 100px 100px',
                            alignItems: 'center',
                            padding: '12px 18px',
                            borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none',
                            cursor: 'pointer',
                            transition: 'background .1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {/* student */}
                        <div onClick={() => navigate(`/admin/admissions/${item.id}`)}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>
                                {item.student_full_name || '—'}
                            </p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0, marginTop: 1 }}>
                                {item.parent_email || ''}
                            </p>
                        </div>

                        {/* parent */}
                        <div onClick={() => navigate(`/admin/admissions/${item.id}`)}>
                            <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>
                                {item.parent_full_name || '—'}
                            </p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                {item.parent_phone || ''}
                            </p>
                        </div>

                        {/* grade */}
                        <span onClick={() => navigate(`/admin/admissions/${item.id}`)}
                            style={{ fontSize: 13, color: C.sub }}>
                            {item.grade_applying ? `${item.grade_applying}-sinf` : '—'}
                        </span>

                        {/* status */}
                        <span onClick={() => navigate(`/admin/admissions/${item.id}`)}>
                            <StatusBadge status={item.status} />
                        </span>

                        {/* date */}
                        <span onClick={() => navigate(`/admin/admissions/${item.id}`)}
                            style={{ fontSize: 12, color: C.muted }}>
                            {fmtDate(item.created_at)}
                        </span>

                        {/* actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                            {/* status btn */}
                            <ActionBtn
                                title="Holat o'zgartirish"
                                bg="#eff6ff" border="#bfdbfe" color="#2563eb"
                                onClick={() => setModal({ type: 'status', item })}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.3">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </ActionBtn>
                            {/* edit btn */}
                            <ActionBtn
                                title="Tahrirlash"
                                bg={C.brandBg} border={C.brandBdr} color={C.brand}
                                onClick={() => setModal({ type: 'edit', item })}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </ActionBtn>
                            {/* delete btn */}
                            <ActionBtn
                                title="O'chirish"
                                bg="#fef2f2" border="#fecaca" color="#dc2626"
                                onClick={() => setModal({ type: 'delete', item })}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6"/><path d="M14 11v6"/>
                                </svg>
                            </ActionBtn>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── pagination ─────────────────────────────── */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>
                        {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total}
                    </span>
                    <div style={{ display: 'flex', gap: 5 }}>
                        <GhostBtn onClick={() => setPage(p => p - 1)}
                            style={{ padding: '5px 12px', opacity: page <= 1 ? 0.4 : 1 }}>
                            ← Oldingi
                        </GhostBtn>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            const p = totalPages <= 7 ? i + 1 : i + Math.max(1, page - 3);
                            if (p > totalPages) return null;
                            return (
                                <button key={p} onClick={() => setPage(p)} style={{
                                    width: 32, height: 32, borderRadius: 7, border: 'none',
                                    fontSize: 13, cursor: 'pointer',
                                    fontWeight: p === page ? 700 : 400,
                                    background: p === page ? C.brand : '#f1f5f9',
                                    color: p === page ? '#fff' : C.sub,
                                }}>{p}</button>
                            );
                        })}
                        <GhostBtn onClick={() => setPage(p => p + 1)}
                            style={{ padding: '5px 12px', opacity: page >= totalPages ? 0.4 : 1 }}>
                            Keyingi →
                        </GhostBtn>
                    </div>
                </div>
            )}

            {/* ── modals ─────────────────────────────────── */}
            {modal === 'create' && (
                <FormModal onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'status' && (
                <StatusModal item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'edit' && (
                <FormModal item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'delete' && (
                <DeleteModal item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />
            )}
        </div>
    );
}

/* ─── tiny icon button ───────────────────────────────────────── */
function ActionBtn({ children, onClick, title, bg, border, color }) {
    return (
        <button title={title} onClick={e => { e.stopPropagation(); onClick(); }}
            style={{
                width: 28, height: 28, borderRadius: 7, cursor: 'pointer',
                border: `1px solid ${border}`, background: bg, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
            {children}
        </button>
    );
}
