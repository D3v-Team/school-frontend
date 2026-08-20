import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { $api } from "../utils";
import {
    C, Spin, fmtDate, Lbl, iStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, TableHead, TableCard,
} from "../AdminComponents/ui";

const LIMIT = 10;

const ROLE_CFG = {
    SUPER_ADMIN: { label: 'Super Admin', color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
    ADMIN:       { label: 'Admin',       color: C.green,  bg: C.gBg,     border: C.gBdr   },
    EDITOR:      { label: 'Editor',      color: C.blue,   bg: C.blueBg,  border: C.blueBdr },
};

const ROLES = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

/* ─── Create / Edit modal ─────────────────────────────────────── */
function UserForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [form, setForm] = useState({
        phone_number: item?.phone_number || '',
        email:        item?.email        || '',
        full_name:    item?.full_name    || '',
        password:     '',
        role:         item?.role         || 'EDITOR',
        is_login:     item?.is_login     ?? true,
    });
    const [showPass, setShowPass] = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');
    const [errors,   setErrors]   = useState({});

    const fRef = useRef({});
    const [, tick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; tick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const handleSave = async () => {
        const errs = {};
        if (!form.phone_number.trim()) errs.phone_number = 'Majburiy';
        if (!form.full_name.trim())    errs.full_name    = 'Majburiy';
        if (!isEdit && !form.password.trim()) errs.password = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const payload = {
                phone_number: form.phone_number.trim(),
                email:        form.email.trim(),
                full_name:    form.full_name.trim(),
                role:         form.role,
                is_login:     form.is_login,
            };
            if (form.password.trim()) payload.password = form.password;

            if (isEdit) await $api.patch(`/api/users/${item.id}`, payload);
            else        await $api.post('/api/users', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    const inputSt = (k, err) => ({
        width: '100%', padding: '9px 12px', borderRadius: 8,
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
        background: C.bg, color: C.text, boxSizing: 'border-box',
        border: `1.5px solid ${err ? C.red : fc(k) ? C.brand : C.border}`,
        transition: 'border-color .15s',
    });

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'} onClose={onClose} width={500}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* full_name */}
                    <div>
                        <Lbl req>To'liq ism</Lbl>
                        <input type="text" value={form.full_name}
                            onChange={e => set('full_name', e.target.value)}
                            onFocus={() => sf('full_name', true)} onBlur={() => sf('full_name', false)}
                            style={inputSt('full_name', errors.full_name)}
                            placeholder="Ism Familiya..." />
                        {errors.full_name && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.full_name}</div>}
                    </div>

                    {/* phone */}
                    <div>
                        <Lbl req>Telefon raqam</Lbl>
                        <input type="tel" value={form.phone_number}
                            onChange={e => set('phone_number', e.target.value)}
                            onFocus={() => sf('phone_number', true)} onBlur={() => sf('phone_number', false)}
                            style={inputSt('phone_number', errors.phone_number)}
                            placeholder="+998901234567" />
                        {errors.phone_number && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.phone_number}</div>}
                    </div>

                    {/* email */}
                    <div>
                        <Lbl>Email</Lbl>
                        <input type="email" value={form.email}
                            onChange={e => set('email', e.target.value)}
                            onFocus={() => sf('email', true)} onBlur={() => sf('email', false)}
                            style={inputSt('email')}
                            placeholder="user@example.com" />
                    </div>

                    {/* password */}
                    <div>
                        <Lbl req={!isEdit}>{isEdit ? 'Yangi parol (ixtiyoriy)' : 'Parol'}</Lbl>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                onFocus={() => sf('password', true)} onBlur={() => sf('password', false)}
                                style={{ ...inputSt('password', errors.password), paddingRight: 40 }}
                                placeholder={isEdit ? "O'zgartirmaslik uchun bo'sh qoldiring" : '••••••••'} />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: C.muted, fontSize: 14, padding: 2 }}>
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.password}</div>}
                    </div>

                    {/* role */}
                    <div>
                        <Lbl req>Rol</Lbl>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {ROLES.map(r => {
                                const cfg    = ROLE_CFG[r];
                                const active = form.role === r;
                                return (
                                    <button key={r} type="button" onClick={() => set('role', r)}
                                        style={{ flex: 1, padding: '8px 6px', borderRadius: 9, border: `1.5px solid ${active ? cfg.color : C.border}`, background: active ? cfg.bg : C.bg, color: active ? cfg.color : C.sub, fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all .15s', textAlign: 'center' }}>
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* is_login */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: form.is_login ? C.green : C.red }}>
                                {form.is_login ? '✓ Kirish ruxsati bor' : '✗ Kirish bloklangan'}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                                Foydalanuvchi tizimga kira oladi
                            </div>
                        </div>
                        <div onClick={() => set('is_login', !form.is_login)}
                            style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: form.is_login ? C.brand : '#cbd5e1', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: 3, left: form.is_login ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left .2s' }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
                            ⚠ {error}
                        </div>
                    )}
                </div>
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Yaratish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE — list
═══════════════════════════════════════════════════════════════ */
export default function Users() {
    const navigate  = useNavigate();
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
            if (search.trim()) params.search = search.trim();
            const res = await $api.get('/api/users', { params });
            const d   = res.data;
            setItems(d?.data || d?.items || []);
            setTotal(d?.total || d?.meta?.total || 0);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = useCallback(v => { setSearch(v); setPage(1); }, []);
    const refresh = () => { setModal(null); fetchData(); };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Foydalanuvchilar" subtitle={`Jami: ${total} ta foydalanuvchi`}
                onAdd={() => setModal('create')} addLabel="Yangi foydalanuvchi" />

            <div style={{ marginBottom: 14 }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Ism yoki telefon bo'yicha..." />
            </div>

            <TableCard>
                <TableHead
                    gridCols="2fr 1.4fr 1fr 100px 110px 80px"
                    cols={["To'liq ism", 'Telefon', 'Rol', 'Kirish', 'Qo\'shilgan', { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Foydalanuvchilar topilmadi" /> : (
                    items.map((item, i) => {
                        const role = ROLE_CFG[item.role] || ROLE_CFG.EDITOR;
                        return (
                            <div key={item.id}
                                onClick={() => navigate(`/admin/users/${item.id}`)}
                                style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 100px 110px 80px', alignItems: 'center', padding: '12px 18px', borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none', transition: 'background .1s', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                {/* name + avatar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.bBg, border: `1px solid ${C.bBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: C.brand, flexShrink: 0 }}>
                                        {(item.full_name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.full_name || '—'}
                                        </p>
                                        <p style={{ fontSize: 11, color: C.muted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.email || ''}
                                        </p>
                                    </div>
                                </div>

                                <span style={{ fontSize: 12, color: C.sub }}>{item.phone_number || '—'}</span>

                                <StatusBadge label={role.label} bg={role.bg} color={role.color} border={role.border} />

                                <StatusBadge
                                    label={item.is_login ? 'Faol' : 'Bloklangan'}
                                    bg={item.is_login ? C.gBg : C.rBg}
                                    color={item.is_login ? C.green : C.red}
                                    border={item.is_login ? C.gBdr : C.rBdr} />

                                <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}
                                    onClick={e => e.stopPropagation()}>
                                    <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                        onClick={() => setModal({ type: 'edit', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </ABtn>
                                    <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red}
                                        onClick={() => setModal({ type: 'delete', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                    </ABtn>
                                </div>
                            </div>
                        );
                    })
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <UserForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <UserForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/users/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm
            title="Foydalanuvchini o'chirish"
            desc={<><strong style={{ color: C.text }}>{item.full_name}</strong> foydalanuvchisi o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
