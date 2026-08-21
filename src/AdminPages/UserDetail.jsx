import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { $api } from "../utils";
import {
    C, Spin, fmtDate, Lbl, iStyle,
    PBtn, GBtn, DeleteConfirm, Overlay,
} from "../AdminComponents/ui";

const ROLE_CFG = {
    SUPER_ADMIN: { label: 'Super Admin', color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
    ADMIN:       { label: 'Admin',       color: C.green,  bg: C.gBg,     border: C.gBdr   },
    EDITOR:      { label: 'Editor',      color: C.blue,   bg: C.blueBg,  border: C.blueBdr },
};
const ROLES = ['ADMIN', 'SUPER_ADMIN'];

const Card = ({ children, style = {} }) => (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', ...style }}>
        {children}
    </div>
);

const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</span>
        <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{value || '—'}</span>
    </div>
);

export default function UserDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [user,     setUser]     = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form,     setForm]     = useState({});
    const [saving,   setSaving]   = useState(false);
    const [saveMsg,  setSaveMsg]  = useState('');
    const [showPass, setShowPass] = useState(false);
    const [delConf,  setDelConf]  = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];

    useEffect(() => {
        (async () => {
            try {
                const res = await $api.get(`/api/users/${id}`);
                const d = res.data?.data || res.data;
                setUser(d);
                setForm({
                    phone_number: d.phone_number || '',
                    email:        d.email        || '',
                    full_name:    d.full_name    || '',
                    password:     '',
                    role:         d.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
                    is_login:     d.is_login     ?? true,
                });
            } catch { setUser(null); }
            finally { setLoading(false); }
        })();
    }, [id]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        setSaving(true); setSaveMsg('');
        try {
            const payload = {
                phone_number: form.phone_number.trim(),
                email:        form.email.trim(),
                full_name:    form.full_name.trim(),
                role:         form.role,
                is_login:     form.is_login,
            };
            if (form.password.trim()) payload.password = form.password;
            await $api.patch(`/api/users/${id}`, payload);
            setUser(prev => ({ ...prev, ...payload }));
            setEditMode(false);
            setSaveMsg('ok');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.message;
            setSaveMsg(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik'));
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await $api.delete(`/api/users/${id}`);
            navigate('/admin/users');
        } catch { setDeleting(false); }
    };

    const inputSt = k => ({
        width: '100%', padding: '9px 12px', borderRadius: 8,
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
        background: C.bg, color: C.text, boxSizing: 'border-box',
        border: `1.5px solid ${fc(k) ? C.brand : C.border}`,
        transition: 'border-color .15s',
    });

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, color: C.muted }}>
            <Spin size={24} /> <span style={{ fontSize: 14 }}>Yuklanmoqda...</span>
        </div>
    );

    if (!user) return (
        <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 15, color: C.muted }}>Foydalanuvchi topilmadi</p>
            <button onClick={() => navigate('/admin/users')} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 13, color: C.sub }}>← Orqaga</button>
        </div>
    );

    const role = ROLE_CFG[user.role] || ROLE_CFG.EDITOR;

    return (
        <div style={{ minHeight: '100%' }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => navigate('/admin/users')} style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    </button>
                    {/* avatar */}
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: role.bg, border: `2px solid ${role.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: role.color, flexShrink: 0 }}>
                        {(user.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>{user.full_name}</h1>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: role.bg, color: role.color, border: `1px solid ${role.border}` }}>
                                {role.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {editMode ? (
                        <>
                            <GBtn onClick={() => { setEditMode(false); setSaveMsg(''); }}>Bekor qilish</GBtn>
                            <PBtn onClick={handleSave} loading={saving}>Saqlash</PBtn>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setEditMode(true)} style={{ padding: '8px 16px', borderRadius: 9, border: `1px solid ${C.bBdr}`, background: C.bBg, color: C.brand, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Tahrirlash
                            </button>
                            <button onClick={() => setDelConf(true)} style={{ padding: '8px 16px', borderRadius: 9, border: `1px solid ${C.rBdr}`, background: C.rBg, color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                                O'chirish
                            </button>
                        </>
                    )}
                </div>
            </div>

            {saveMsg === 'ok' && <div style={{ marginBottom: 14, padding: '9px 14px', borderRadius: 8, fontSize: 13, background: C.gBg, border: `1px solid ${C.gBdr}`, color: C.green }}>✓ Muvaffaqiyatli saqlandi</div>}
            {saveMsg && saveMsg !== 'ok' && <div style={{ marginBottom: 14, padding: '9px 14px', borderRadius: 8, fontSize: 13, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>⚠ {saveMsg}</div>}

            {/* content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

                {/* LEFT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* basic info */}
                    <Card>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 16px' }}>
                            Asosiy ma'lumotlar
                        </h3>
                        {editMode ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <Lbl req>To'liq ism</Lbl>
                                    <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} onFocus={() => sf('full_name', true)} onBlur={() => sf('full_name', false)} style={inputSt('full_name')} />
                                </div>
                                <div>
                                    <Lbl req>Telefon raqam</Lbl>
                                    <input type="tel" value={form.phone_number} onChange={e => set('phone_number', e.target.value)} onFocus={() => sf('phone', true)} onBlur={() => sf('phone', false)} style={inputSt('phone')} placeholder="+998..." />
                                </div>
                                <div>
                                    <Lbl>Email</Lbl>
                                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} onFocus={() => sf('email', true)} onBlur={() => sf('email', false)} style={inputSt('email')} />
                                </div>
                                <div>
                                    <Lbl>Yangi parol (ixtiyoriy)</Lbl>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} onFocus={() => sf('pass', true)} onBlur={() => sf('pass', false)} style={{ ...inputSt('pass'), paddingRight: 40 }} placeholder="O'zgartirmaslik uchun bo'sh qoldiring" />
                                        <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: C.muted, fontSize: 14 }}>
                                            {showPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <InfoRow label="To'liq ism"  value={user.full_name} />
                                <InfoRow label="Telefon"     value={user.phone_number} />
                                <div style={{ gridColumn: 'span 2' }}>
                                    <InfoRow label="Email"   value={user.email} />
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* activity */}
                    <Card>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 16px' }}>
                            Faoliyat
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <InfoRow label="Qo'shilgan sana" value={fmtDate(user.created_at)} />
                            <InfoRow label="Yangilangan"     value={fmtDate(user.updated_at)} />
                        </div>
                    </Card>
                </div>

                {/* RIGHT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* role card */}
                    <Card style={{ borderTop: `3px solid ${role.color}` }}>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 12px' }}>Rol</h3>
                        {editMode ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {ROLES.map(r => {
                                    const cfg    = ROLE_CFG[r];
                                    const active = form.role === r;
                                    return (
                                        <button key={r} type="button" onClick={() => set('role', r)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                                                border: `1.5px solid ${active ? cfg.color : C.border}`,
                                                background: active ? cfg.bg : C.bg,
                                                transition: 'all .15s', textAlign: 'left',
                                            }}>
                                            <div style={{
                                                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                                background: active ? cfg.color : C.border,
                                            }} />
                                            <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? cfg.color : C.sub, flex: 1 }}>
                                                {cfg.label}
                                            </span>
                                            {active && (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                    stroke={cfg.color} strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '8px 16px', borderRadius: 20,
                                background: role.bg, color: role.color,
                                border: `1px solid ${role.border}`,
                                fontSize: 14, fontWeight: 700,
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: role.color }} />
                                {role.label}
                            </div>
                        )}
                    </Card>

                    {/* login status */}
                    <Card>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 12px' }}>Kirish holati</h3>
                        {editMode ? (
                            <div
                                onClick={() => set('is_login', !form.is_login)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                                    border: `1.5px solid ${form.is_login ? C.gBdr : C.rBdr}`,
                                    background: form.is_login ? C.gBg : C.rBg,
                                    transition: 'all .2s',
                                }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: form.is_login ? C.green : C.red }}>
                                        {form.is_login ? 'Kirish ruxsati bor' : 'Kirish bloklangan'}
                                    </div>
                                    <div style={{ fontSize: 11, color: form.is_login ? C.green : C.red, opacity: 0.75, marginTop: 2 }}>
                                        {form.is_login ? 'Foydalanuvchi tizimga kira oladi' : 'Login bloklangan'}
                                    </div>
                                </div>
                                <div style={{
                                    width: 44, height: 24, borderRadius: 12, flexShrink: 0,
                                    background: form.is_login ? C.green : '#cbd5e1',
                                    position: 'relative', transition: 'background .2s',
                                }}>
                                    <div style={{
                                        position: 'absolute', top: 3,
                                        left: form.is_login ? 23 : 3,
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                        transition: 'left .2s',
                                    }} />
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: '12px 14px', borderRadius: 10, textAlign: 'center',
                                background: user.is_login ? C.gBg : C.rBg,
                                border: `1px solid ${user.is_login ? C.gBdr : C.rBdr}`,
                                color: user.is_login ? C.green : C.red,
                                fontSize: 13, fontWeight: 700,
                            }}>
                                {user.is_login ? 'Tizimga kira oladi' : 'Kirish bloklangan'}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* delete confirm */}
            {delConf && (
                <DeleteConfirm
                    title="Foydalanuvchini o'chirish"
                    desc={<><strong style={{ color: C.text }}>{user.full_name}</strong> foydalanuvchisi butunlay o'chiriladi.</>}
                    onClose={() => setDelConf(false)}
                    onConfirm={handleDelete}
                    loading={deleting} />
            )}
        </div>
    );
}
