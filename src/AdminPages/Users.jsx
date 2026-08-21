import { useState, useEffect, useRef } from "react";
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

const ROLES = ['ADMIN', 'SUPER_ADMIN'];

/* ─── Create / Edit modal ─────────────────────────────────────── */
function UserForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [form, setForm] = useState({
        phone_number: item?.phone_number || '',
        email:        item?.email        || '',
        full_name:    item?.full_name    || '',
        password:     '',
        role:         item?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
        is_login:     item?.is_login     ?? true,
    });
    const [showPass, setShowPass] = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');
    const [errors,   setErrors]   = useState({});

    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
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
                        <select value={form.role} onChange={e => set('role', e.target.value)}
                            style={{
                                width: '100%', padding: '9px 32px 9px 12px', borderRadius: 9,
                                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                                background: ROLE_CFG[form.role]?.bg || C.bg,
                                color: ROLE_CFG[form.role]?.color || C.text,
                                boxSizing: 'border-box',
                                border: `1.5px solid ${ROLE_CFG[form.role]?.border || C.border}`,
                                cursor: 'pointer', appearance: 'none', fontWeight: 600,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                            }}>
                            {ROLES.map(r => (
                                <option key={r} value={r}>{ROLE_CFG[r].label}</option>
                            ))}
                        </select>
                    </div>

                    {/* is_login */}
                    <div>
                        <Lbl>Kirish holati</Lbl>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={() => set('is_login', true)}
                                style={{
                                    flex: 1, padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                                    border: `1.5px solid ${form.is_login ? C.gBdr : C.border}`,
                                    background: form.is_login ? C.gBg : C.bg,
                                    color: form.is_login ? C.green : C.sub,
                                    fontSize: 13, fontWeight: form.is_login ? 700 : 500,
                                    transition: 'all .15s',
                                }}>
                                Faol
                            </button>
                            <button type="button" onClick={() => set('is_login', false)}
                                style={{
                                    flex: 1, padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                                    border: `1.5px solid ${!form.is_login ? C.rBdr : C.border}`,
                                    background: !form.is_login ? C.rBg : C.bg,
                                    color: !form.is_login ? C.red : C.sub,
                                    fontSize: 13, fontWeight: !form.is_login ? 700 : 500,
                                    transition: 'all .15s',
                                }}>
                                Bloklangan
                            </button>
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
    const [roleFilt, setRoleFilt] = useState('');
    const [loginFilt, setLoginFilt] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);

    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim())   params.search   = search.trim();
                if (roleFilt)        params.role     = roleFilt;
                if (loginFilt !== '') params.is_login = loginFilt;
                const res = await $api.get('/api/users', { params });
                const d   = res.data;
                if (!cancelled) {
                    setItems(d?.data || d?.items || []);
                    setTotal(d?.total || d?.meta?.total || 0);
                }
            } catch { if (!cancelled) setItems([]); }
            finally { if (!cancelled) setLoading(false); }
        };
        load();
        return () => { cancelled = true; };
    }, [page, search, roleFilt, loginFilt, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };
    const refresh = () => { setModal(null); setTick(t => t + 1); };

    const selectSt = active => ({
        padding: '8px 32px 8px 12px', borderRadius: 9, fontSize: 13,
        border: `1.5px solid ${active ? C.brand : C.border}`,
        background: active ? C.bBg : C.white,
        color: active ? C.brand : C.sub,
        outline: 'none', cursor: 'pointer', appearance: 'none', fontWeight: active ? 700 : 400,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    });

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Foydalanuvchilar" subtitle={`Jami: ${total} ta foydalanuvchi`}
                onAdd={() => setModal('create')} addLabel="Yangi foydalanuvchi" />

            {/* filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Ism yoki telefon bo'yicha..." />

                {/* role filter */}
                <select value={roleFilt} onChange={e => { setRoleFilt(e.target.value); setPage(1); }}
                    style={selectSt(!!roleFilt)}>
                    <option value="">Rol: Barchasi</option>
                    {Object.entries(ROLE_CFG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                    ))}
                </select>

                {/* login filter */}
                <select value={loginFilt} onChange={e => { setLoginFilt(e.target.value); setPage(1); }}
                    style={selectSt(loginFilt !== '')}>
                    <option value="">Kirish: Barchasi</option>
                    <option value="true">Faol</option>
                    <option value="false">Bloklangan</option>
                </select>
            </div>

            <TableCard>
                <TableHead
                    gridCols="2fr 1.4fr 120px 130px 110px 160px"
                    cols={["To'liq ism", 'Telefon', 'Rol', 'Kirish', "Qo'shilgan", { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Foydalanuvchilar topilmadi" /> : (
                    items.map((item, i) => {
                        const role = ROLE_CFG[item.role] || ROLE_CFG.EDITOR;
                        return (
                            <div key={item.id}
                                onClick={() => navigate(`/admin/users/${item.id}`)}
                                style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 120px 130px 110px 160px', alignItems: 'center', padding: '12px 18px', borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none', transition: 'background .1s', cursor: 'pointer' }}
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

                                {/* Role — colored badge */}
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                    background: role.bg, color: role.color,
                                    border: `1px solid ${role.border}`,
                                    whiteSpace: 'nowrap', width: 'fit-content',
                                }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
                                    {role.label}
                                </span>

                                {/* Login status */}
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                    background: item.is_login ? C.gBg : C.rBg,
                                    color: item.is_login ? C.green : C.red,
                                    border: `1px solid ${item.is_login ? C.gBdr : C.rBdr}`,
                                    whiteSpace: 'nowrap', width: 'fit-content',
                                }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.is_login ? C.green : C.red, flexShrink: 0 }} />
                                    {item.is_login ? 'Faol' : 'Bloklangan'}
                                </span>

                                <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                                    {fmtDate(item.created_at)}
                                </span>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5, flexWrap: 'nowrap' }}
                                    onClick={e => e.stopPropagation()}>
                                    <button title="Tahrirlash"
                                        onClick={() => setModal({ type: 'edit', item })}
                                        style={{
                                            padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                                            border: `1px solid ${C.bBdr}`, background: C.bBg,
                                            color: C.brand, fontSize: 12, fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            whiteSpace: 'nowrap',
                                        }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Tahrir
                                    </button>
                                    <button title="O'chirish"
                                        onClick={() => setModal({ type: 'delete', item })}
                                        style={{
                                            padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                                            border: `1px solid ${C.rBdr}`, background: C.rBg,
                                            color: C.red, fontSize: 12, fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            whiteSpace: 'nowrap',
                                        }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                            <path d="M10 11v6"/><path d="M14 11v6"/>
                                        </svg>
                                        O'chir
                                    </button>
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
