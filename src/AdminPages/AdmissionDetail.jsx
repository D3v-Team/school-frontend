import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { $api } from "../utils";

/* ─── tokens ─────────────────────────────────────────────────── */
const C = {
    white: '#ffffff', bg: '#f8fafc', border: '#e2e8f0',
    text: '#0f172a', sub: '#475569', muted: '#94a3b8',
    brand: '#ea6c0a', brandBg: '#fff7ed', brandBdr: '#fed7aa',
};

const STATUS_MAP = {
    NEW:         { label: "Yangi",              bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    IN_PROGRESS: { label: "Ko'rib chiqilmoqda", bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
    ACCEPTED:    { label: "Qabul qilindi",      bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    REJECTED:    { label: "Rad etildi",         bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

/* ─── helpers ────────────────────────────────────────────────── */
const Spin = ({ size = 20, color = C.brand }) => (
    <svg className="animate-spin" width={size} height={size}
        viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP.NEW;
    return (
        <span style={{
            fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            textTransform: 'uppercase', letterSpacing: '.05em',
        }}>
            {s.label}
        </span>
    );
};

const fmtDate = d => d ? new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'long', year: 'numeric',
}) : '—';

const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: 'uppercase', letterSpacing: '.07em' }}>
            {label}
        </span>
        <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>
            {value || '—'}
        </span>
    </div>
);

const Card = ({ children, style = {} }) => (
    <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: 20, ...style,
    }}>
        {children}
    </div>
);

const CardTitle = ({ children }) => (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted,
        textTransform: 'uppercase', letterSpacing: '.07em',
        marginBottom: 16, margin: '0 0 16px' }}>
        {children}
    </h3>
);

/* ─── Status update panel ────────────────────────────────────── */
function StatusPanel({ data, onUpdated }) {
    const [status,  setStatus]  = useState(data.status || 'NEW');
    const [comment, setComment] = useState(data.admin_comment || '');
    const [saving,  setSaving]  = useState(false);
    const [msg,     setMsg]     = useState('');

    const handleSave = async () => {
        setSaving(true); setMsg('');
        try {
            await $api.patch(`/api/admission/${data.id}`, { status, admin_comment: comment });
            setMsg('success');
            onUpdated({ ...data, status, admin_comment: comment });
        } catch (err) {
            setMsg(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardTitle>Holat boshqaruvi</CardTitle>

            {/* status selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {Object.entries(STATUS_MAP).map(([key, s]) => (
                    <label key={key} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                        border: `1.5px solid ${status === key ? s.color : C.border}`,
                        background: status === key ? s.bg : C.bg,
                        transition: 'all .15s',
                    }}>
                        <input type="radio" name="status" value={key}
                            checked={status === key}
                            onChange={() => setStatus(key)}
                            style={{ accentColor: s.color }} />
                        <span style={{ fontSize: 13, fontWeight: status === key ? 700 : 400,
                            color: status === key ? s.color : C.sub }}>
                            {s.label}
                        </span>
                    </label>
                ))}
            </div>

            {/* comment */}
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                textTransform: 'uppercase', letterSpacing: '.07em',
                display: 'block', marginBottom: 6 }}>
                Admin izohi
            </label>
            <textarea rows={3} value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ariza haqida izoh..."
                style={{
                    width: '100%', padding: '8px 11px', borderRadius: 8,
                    fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                    background: C.bg, color: C.text, outline: 'none',
                    border: `1.5px solid ${C.border}`, boxSizing: 'border-box',
                    marginBottom: 12, transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = C.brand}
                onBlur={e  => e.target.style.borderColor = C.border}
            />

            {msg === 'success' && (
                <div style={{ padding: '7px 12px', borderRadius: 7, fontSize: 12, marginBottom: 10,
                    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                    ✓ Muvaffaqiyatli saqlandi
                </div>
            )}
            {msg && msg !== 'success' && (
                <div style={{ padding: '7px 12px', borderRadius: 7, fontSize: 12, marginBottom: 10,
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    ⚠ {msg}
                </div>
            )}

            <button onClick={handleSave} disabled={saving} style={{
                width: '100%', padding: '9px', borderRadius: 9, border: 'none',
                background: C.brand, color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
                {saving && <Spin size={14} color="#fff" />}
                Saqlash
            </button>
        </Card>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function AdmissionDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [data,     setData]     = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form,     setForm]     = useState({});
    const [saving,   setSaving]   = useState(false);
    const [saveMsg,  setSaveMsg]  = useState('');
    const [delConf,  setDelConf]  = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await $api.get(`/api/admission/${id}`);
                const d = res.data?.data || res.data;
                setData(d);
                setForm({ ...d, birth_date: d.birth_date ? String(d.birth_date).slice(0, 10) : '' });
            } catch {
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleEdit = async () => {
        setSaving(true); setSaveMsg('');
        try {
            const payload = {
                student_full_name: form.student_full_name,
                birth_date:        form.birth_date ? `${form.birth_date.slice(0, 10)}T00:00:00.000Z` : undefined,
                grade_applying:    form.grade_applying,
                parent_full_name:  form.parent_full_name,
                parent_phone:      form.parent_phone,
                parent_email:      form.parent_email,
                address:           form.address,
                previous_school:   form.previous_school,
                message:           form.message,
            };
            await $api.patch(`/api/admission/admin/${id}`, payload);
            setData(prev => ({ ...prev, ...payload }));
            setEditMode(false);
        } catch (err) {
            setSaveMsg(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await $api.delete(`/api/admission/${id}`);
            navigate('/admin/admissions');
        } catch {
            setDeleting(false);
        }
    };

    /* ── loading ─────────────────────────────────────────────── */
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 300, gap: 12, color: C.muted }}>
            <Spin size={24} />
            <span style={{ fontSize: 14 }}>Yuklanmoqda...</span>
        </div>
    );

    if (!data) return (
        <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 15, color: C.muted }}>Ariza topilmadi</p>
            <button onClick={() => navigate('/admin/admissions')}
                style={{ marginTop: 12, padding: '8px 20px', borderRadius: 9,
                    border: `1px solid ${C.border}`, background: C.white,
                    cursor: 'pointer', fontSize: 13, color: C.sub }}>
                ← Orqaga
            </button>
        </div>
    );

    /* ── render ──────────────────────────────────────────────── */
    const s = STATUS_MAP[data.status] || STATUS_MAP.NEW;

    return (
        <div style={{ minHeight: '100%' }}>

            {/* ── breadcrumb / header ──────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => navigate('/admin/admissions')} style={{
                        width: 36, height: 36, borderRadius: 9,
                        border: `1px solid ${C.border}`, background: C.white,
                        cursor: 'pointer', color: C.sub,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.3">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
                                {data.student_full_name}
                            </h1>
                            <StatusBadge status={data.status} />
                        </div>
                        <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                            Ariza #{data.id} · {fmtDate(data.created_at)}
                        </p>
                    </div>
                </div>

                {/* action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {editMode ? (
                        <>
                            <button onClick={() => { setEditMode(false); setForm(data); setSaveMsg(''); }}
                                style={{
                                    padding: '8px 16px', borderRadius: 9, border: `1px solid ${C.border}`,
                                    background: C.white, color: C.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                }}>
                                Bekor qilish
                            </button>
                            <button onClick={handleEdit} disabled={saving} style={{
                                padding: '8px 16px', borderRadius: 9, border: 'none',
                                background: C.brand, color: '#fff', fontSize: 13, fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1,
                                display: 'flex', alignItems: 'center', gap: 7,
                            }}>
                                {saving && <Spin size={13} color="#fff" />}
                                Saqlash
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setEditMode(true)} style={{
                                padding: '8px 16px', borderRadius: 9,
                                border: `1px solid ${C.brandBdr}`, background: C.brandBg,
                                color: C.brand, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 7,
                            }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Tahrirlash
                            </button>
                            <button onClick={() => setDelConf(true)} style={{
                                padding: '8px 16px', borderRadius: 9,
                                border: '1px solid #fecaca', background: '#fef2f2',
                                color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 7,
                            }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6"/><path d="M14 11v6"/>
                                </svg>
                                O'chirish
                            </button>
                        </>
                    )}
                </div>
            </div>

            {saveMsg && (
                <div style={{ marginBottom: 14, padding: '9px 14px', borderRadius: 8, fontSize: 13,
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    ⚠ {saveMsg}
                </div>
            )}

            {/* ── content ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

                {/* LEFT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* O'quvchi ma'lumotlari */}
                    <Card>
                        <CardTitle>O'quvchi ma'lumotlari</CardTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {editMode ? (
                                <>
                                    <EField label="To'liq ismi" value={form.student_full_name}
                                        onChange={v => set('student_full_name', v)} />
                                    <EField label="Tug'ilgan sana" value={form.birth_date}
                                        onChange={v => set('birth_date', v)} type="date" />
                                    <EField label="Qaysi sinfga" value={form.grade_applying}
                                        onChange={v => set('grade_applying', v)} />
                                    <EField label="Oldingi maktab" value={form.previous_school}
                                        onChange={v => set('previous_school', v)} />
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <EField label="Manzil" value={form.address}
                                            onChange={v => set('address', v)} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <InfoRow label="To'liq ismi"     value={data.student_full_name} />
                                    <InfoRow label="Tug'ilgan sana"  value={fmtDate(data.birth_date)} />
                                    <InfoRow label="Qaysi sinfga"    value={data.grade_applying ? `${data.grade_applying}-sinf` : '—'} />
                                    <InfoRow label="Oldingi maktab"  value={data.previous_school} />
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <InfoRow label="Manzil"      value={data.address} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Ota-ona ma'lumotlari */}
                    <Card>
                        <CardTitle>Ota-ona ma'lumotlari</CardTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {editMode ? (
                                <>
                                    <EField label="To'liq ismi" value={form.parent_full_name}
                                        onChange={v => set('parent_full_name', v)} />
                                    <EField label="Telefon" value={form.parent_phone}
                                        onChange={v => set('parent_phone', v)} type="tel" />
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <EField label="Email" value={form.parent_email}
                                            onChange={v => set('parent_email', v)} type="email" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <InfoRow label="To'liq ismi" value={data.parent_full_name} />
                                    <InfoRow label="Telefon"     value={data.parent_phone} />
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <InfoRow label="Email"   value={data.parent_email} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Xabar */}
                    {(data.message || editMode) && (
                        <Card>
                            <CardTitle>Xabar / Izoh</CardTitle>
                            {editMode ? (
                                <textarea rows={4} value={form.message || ''}
                                    onChange={e => set('message', e.target.value)}
                                    style={{
                                        width: '100%', padding: '9px 12px', borderRadius: 8,
                                        fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                                        background: C.bg, color: C.text, outline: 'none',
                                        border: `1.5px solid ${C.border}`, boxSizing: 'border-box',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.brand}
                                    onBlur={e  => e.target.style.borderColor = C.border}
                                />
                            ) : (
                                <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, margin: 0 }}>
                                    {data.message}
                                </p>
                            )}
                        </Card>
                    )}

                    {/* Admin izohi (readonly) */}
                    {data.admin_comment && (
                        <Card style={{ borderLeft: `3px solid ${s.color}` }}>
                            <CardTitle>Admin izohi</CardTitle>
                            <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, margin: 0 }}>
                                {data.admin_comment}
                            </p>
                        </Card>
                    )}
                </div>

                {/* RIGHT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* status card (read-only summary) */}
                    <Card style={{ borderTop: `3px solid ${s.color}` }}>
                        <CardTitle>Joriy holat</CardTitle>
                        <StatusBadge status={data.status} />
                        <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
                            Yuborilgan: {fmtDate(data.created_at)}
                        </p>
                        {data.updated_at && data.updated_at !== data.created_at && (
                            <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                                Yangilangan: {fmtDate(data.updated_at)}
                            </p>
                        )}
                    </Card>

                    {/* status update panel */}
                    <StatusPanel data={data} onUpdated={setData} />
                </div>
            </div>

            {/* ── delete confirm overlay ────────────────────── */}
            {delConf && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                }}>
                    <div style={{
                        width: '100%', maxWidth: 380, background: C.white,
                        borderRadius: 16, border: `1px solid ${C.border}`,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: 28, textAlign: 'center',
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                            O'chirishni tasdiqlang
                        </h3>
                        <p style={{ fontSize: 13, color: C.sub, marginBottom: 22, lineHeight: 1.6 }}>
                            Ushbu ariza butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setDelConf(false)} style={{
                                flex: 1, padding: '9px', borderRadius: 9,
                                border: `1px solid ${C.border}`, background: C.white,
                                color: C.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}>Bekor</button>
                            <button onClick={handleDelete} disabled={deleting} style={{
                                flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                                background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600,
                                cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.75 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            }}>
                                {deleting && <Spin size={13} color="#fff" />}
                                O'chirish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── edit field ─────────────────────────────────────────────── */
function EField({ label, value, onChange, type = 'text' }) {
    const [f, setF] = useState(false);
    return (
        <div>
            <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#94a3b8', textTransform: 'uppercase',
                letterSpacing: '.07em', marginBottom: 5,
            }}>{label}</label>
            <input type={type} value={value || ''}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setF(true)} onBlur={() => setF(false)}
                style={{
                    width: '100%', padding: '8px 11px', borderRadius: 8,
                    fontSize: 13, fontFamily: 'inherit', outline: 'none',
                    background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box',
                    border: `1.5px solid ${f ? '#ea6c0a' : '#e2e8f0'}`,
                    transition: 'border-color .15s',
                }} />
        </div>
    );
}
