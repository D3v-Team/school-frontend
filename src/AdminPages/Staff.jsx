import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { mediaUrl, useLang } from "../utils/api";
import {
    C, Spin, fmtDate, Lbl, iStyle, taStyle, LANGS,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, FilterPills, Pagination, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, Toggle,
} from "../AdminComponents/ui";

const LIMIT = 12;

const CATEGORIES = {
    DIRECTOR:         { label: 'Direktor',         color: C.brand,  bg: C.bBg,  border: C.bBdr  },
    DEPUTY_DIRECTOR:  { label: 'Direktor o\'rinb.', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    TEACHER:          { label: "O'qituvchi",        color: C.green,  bg: C.gBg,  border: C.gBdr  },
    ADMINISTRATION:   { label: 'Xodim',             color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    OTHER:            { label: 'Boshqa',            color: C.muted,  bg: C.bg,   border: C.border },
};

/* ─── Form ────────────────────────────────────────────────────── */
function StaffForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const fileRef = useRef(null);

    const EMPTY = {
        full_name_latin: '', full_name_cyril: '', full_name_ru: '',
        category: 'TEACHER',
        position_latin: '', position_cyril: '', position_ru: '',
        subject_latin: '', subject_cyril: '', subject_ru: '',
        bio_latin: '', bio_cyril: '', bio_ru: '',
        phone: '', email: '', reception_days: '',
        degree_latin: '', degree_cyril: '', degree_ru: '',
        order: '', is_active: true,
    };

    const [form, setForm] = useState(isEdit ? { ...EMPTY, ...item } : EMPTY);
    const [activeLang, setActiveLang] = useState('latin');
    const [photoFile,  setPhotoFile]  = useState(null);
    const [preview,    setPreview]    = useState(item?.photo ? mediaUrl(item.photo) : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    const fRef = useRef({});
    const [, tick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; tick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const lk = {
        latin: {
            name: 'full_name_latin', pos: 'position_latin',
            sub: 'subject_latin',    bio: 'bio_latin', deg: 'degree_latin',
        },
        cyril: {
            name: 'full_name_cyril', pos: 'position_cyril',
            sub: 'subject_cyril',    bio: 'bio_cyril', deg: 'degree_cyril',
        },
        ru: {
            name: 'full_name_ru', pos: 'position_ru',
            sub: 'subject_ru',    bio: 'bio_ru', deg: 'degree_ru',
        },
    };

    const langDone = {
        latin: !!form.full_name_latin.trim() && !!form.position_latin.trim(),
        cyril: !!form.full_name_cyril.trim() && !!form.position_cyril.trim(),
        ru:    !!form.full_name_ru.trim()    && !!form.position_ru.trim(),
    };

    const handleFile = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError("Rasm 5MB dan oshmasin"); return; }
        setPhotoFile(f); setPreview(URL.createObjectURL(f));
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.full_name_latin.trim()) errs.full_name_latin = 'Majburiy';
        if (!form.position_latin.trim())  errs.position_latin  = 'Majburiy';
        if (!form.category)               errs.category        = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            const textFields = [
                'full_name_latin','full_name_cyril','full_name_ru',
                'category',
                'position_latin','position_cyril','position_ru',
                'subject_latin','subject_cyril','subject_ru',
                'bio_latin','bio_cyril','bio_ru',
                'phone','email','reception_days',
                'degree_latin','degree_cyril','degree_ru',
            ];
            textFields.forEach(k => { if (form[k]) fd.append(k, form[k]); });
            if (form.order !== '') fd.append('order', Number(form.order));
            fd.append('is_active', form.is_active);
            if (photoFile) fd.append('photo', photoFile);

            if (isEdit) await $api.patch(`/api/staff/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else        await $api.post('/api/staff', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Xodimni tahrirlash' : 'Yangi xodim'} onClose={onClose} width={800}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16 }}>
                    {/* LEFT — lang tabs */}
                    <div>
                        <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}` }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const hasErr = !!errors[lk[key].name] || !!errors[lk[key].pos];
                                return (
                                    <button key={key} type="button" onClick={() => setActiveLang(key)}
                                        style={{ flex: 1, padding: '10px 6px', border: 'none', borderRadius: active ? '10px 10px 0 0' : 0, background: active ? C.white : 'transparent', fontSize: 12, fontWeight: active ? 700 : 500, color: hasErr ? C.red : active ? C.brand : C.sub, borderBottom: `2.5px solid ${active ? C.brand : 'transparent'}`, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                        {flag} {label}
                                        {done && !hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />}
                                        {hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red }} />}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <Lbl req={activeLang === 'latin'}>To'liq ism ({LANGS.find(l => l.key === activeLang)?.label})</Lbl>
                                <input type="text" value={form[lk[activeLang].name]}
                                    onChange={e => set(lk[activeLang].name, e.target.value)}
                                    onFocus={() => sf(lk[activeLang].name, true)} onBlur={() => sf(lk[activeLang].name, false)}
                                    style={iStyle(fc(lk[activeLang].name), !!errors[lk[activeLang].name])}
                                    placeholder="F.I.O." />
                                {errors[lk[activeLang].name] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk[activeLang].name]}</div>}
                            </div>
                            <div>
                                <Lbl req={activeLang === 'latin'}>Lavozim</Lbl>
                                <input type="text" value={form[lk[activeLang].pos]}
                                    onChange={e => set(lk[activeLang].pos, e.target.value)}
                                    onFocus={() => sf(lk[activeLang].pos, true)} onBlur={() => sf(lk[activeLang].pos, false)}
                                    style={iStyle(fc(lk[activeLang].pos), !!errors[lk[activeLang].pos])}
                                    placeholder="Lavozim..." />
                                {errors[lk[activeLang].pos] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk[activeLang].pos]}</div>}
                            </div>
                            <div>
                                <Lbl>Fan (ixtiyoriy)</Lbl>
                                <input type="text" value={form[lk[activeLang].sub]}
                                    onChange={e => set(lk[activeLang].sub, e.target.value)}
                                    onFocus={() => sf(lk[activeLang].sub, true)} onBlur={() => sf(lk[activeLang].sub, false)}
                                    style={iStyle(fc(lk[activeLang].sub))} placeholder="O'qitiladigan fan..." />
                            </div>
                            <div>
                                <Lbl>Ilmiy daraja</Lbl>
                                <input type="text" value={form[lk[activeLang].deg]}
                                    onChange={e => set(lk[activeLang].deg, e.target.value)}
                                    onFocus={() => sf(lk[activeLang].deg, true)} onBlur={() => sf(lk[activeLang].deg, false)}
                                    style={iStyle(fc(lk[activeLang].deg))} placeholder="masalan: Pedagog, nomzod..." />
                            </div>
                            <div>
                                <Lbl>Bio / Haqida</Lbl>
                                <textarea rows={3} value={form[lk[activeLang].bio]}
                                    onChange={e => set(lk[activeLang].bio, e.target.value)}
                                    onFocus={() => sf(lk[activeLang].bio, true)} onBlur={() => sf(lk[activeLang].bio, false)}
                                    style={taStyle(fc(lk[activeLang].bio))} placeholder="Qisqacha ma'lumot..." />
                            </div>
                        </div>
                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => (
                                <div key={key} onClick={() => setActiveLang(key)} style={{ flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', border: `1px solid ${(errors[lk[key].name] || errors[lk[key].pos]) ? C.rBdr : langDone[key] ? C.gBdr : C.border}`, background: (errors[lk[key].name] || errors[lk[key].pos]) ? C.rBg : langDone[key] ? C.gBg : C.bg }}>
                                    <div style={{ fontSize: 14 }}>{flag}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: (errors[lk[key].name] || errors[lk[key].pos]) ? C.red : langDone[key] ? C.green : C.muted }}>
                                        {(errors[lk[key].name] || errors[lk[key].pos]) ? '⚠' : langDone[key] ? '✓ Tayyor' : label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — photo + meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* photo */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
                            <Lbl>Fotosurat</Lbl>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                                    <button type="button" onClick={() => { setPhotoFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            ) : (
                                <div onClick={() => fileRef.current?.click()} style={{ height: 160, borderRadius: 8, cursor: 'pointer', border: `2px dashed ${C.border}`, background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>Rasm tanlash</span>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                        </div>

                        {/* category */}
                        <div>
                            <Lbl req>Kategoriya</Lbl>
                            <select value={form.category} onChange={e => set('category', e.target.value)}
                                style={{ ...iStyle(false, !!errors.category), padding: '8px 11px', cursor: 'pointer' }}>
                                {Object.entries(CATEGORIES).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                            {errors.category && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠</div>}
                        </div>

                        {/* phone + email */}
                        <div>
                            <Lbl>Telefon</Lbl>
                            <input type="tel" value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                                onFocus={() => sf('ph', true)} onBlur={() => sf('ph', false)}
                                style={iStyle(fc('ph'))} placeholder="+998 XX XXX XX XX" />
                        </div>
                        <div>
                            <Lbl>Email</Lbl>
                            <input type="email" value={form.email}
                                onChange={e => set('email', e.target.value)}
                                onFocus={() => sf('em', true)} onBlur={() => sf('em', false)}
                                style={iStyle(fc('em'))} placeholder="info@..." />
                        </div>
                        <div>
                            <Lbl>Qabul kunlari</Lbl>
                            <input type="text" value={form.reception_days}
                                onChange={e => set('reception_days', e.target.value)}
                                onFocus={() => sf('rd', true)} onBlur={() => sf('rd', false)}
                                style={iStyle(fc('rd'))} placeholder="Du-Ju: 9:00-12:00" />
                        </div>
                        <div>
                            <Lbl>Tartib raqami</Lbl>
                            <input type="number" value={form.order}
                                onChange={e => set('order', e.target.value)}
                                onFocus={() => sf('ord', true)} onBlur={() => sf('ord', false)}
                                style={iStyle(fc('ord'))} placeholder="1" min={0} />
                        </div>
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? C.green : C.muted }}>
                                {form.is_active ? '✓ Faol' : '○ Nofaol'}
                            </span>
                            <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
                        </div>
                        {error && <div style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>⚠ {error}</div>}
                    </div>
                </div>
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Qo\'shish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Staff() {
    const lang = useLang(); // navbar tilga qarab avtomatik
    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
    const [catFilt,  setCatFilt]  = useState('');
    const [actFilt,  setActFilt]  = useState('');
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null);

    const [tick,     setTick]     = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim())  params.search    = search.trim();
                if (catFilt)        params.category  = catFilt;
                if (actFilt !== '') params.is_active = actFilt;
                const res = await $api.get('/api/staff', { params });
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
    }, [page, search, catFilt, actFilt, tick]);

    const refresh = () => { setModal(null); setTick(t => t + 1); };

    const nameKey = { latin: 'full_name_latin', cyril: 'full_name_cyril', ru: 'full_name_ru' };
    const posKey  = { latin: 'position_latin',  cyril: 'position_cyril',  ru: 'position_ru'  };
    const subKey  = { latin: 'subject_latin',   cyril: 'subject_cyril',   ru: 'subject_ru'   };

    const catOptions = [
        { val: '', label: 'Barchasi' },
        ...Object.entries(CATEGORIES).map(([val, s]) => ({ val, label: s.label, color: s.color, bg: s.bg, border: s.border })),
    ];

    const actOptions = [
        { val: '',      label: 'Barchasi' },
        { val: 'true',  label: 'Faol',   color: C.green, bg: C.gBg, border: C.gBdr },
        { val: 'false', label: 'Nofaol', color: C.muted, bg: C.bg,  border: C.border },
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Xodimlar" subtitle={`Jami: ${total} ta xodim`}
                onAdd={() => setModal('create')} addLabel="Yangi xodim" />

            {/* filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Ism bo'yicha..." />

                {/* category */}
                <select value={catFilt} onChange={e => { setCatFilt(e.target.value); setPage(1); }}
                    style={{ padding: '8px 32px 8px 12px', borderRadius: 9, fontSize: 13, border: `1.5px solid ${catFilt ? C.brand : C.border}`, background: catFilt ? C.bBg : C.white, color: catFilt ? C.brand : C.sub, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                    <option value="">Kategoriya: Barchasi</option>
                    {Object.entries(CATEGORIES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>

                <FilterPills options={actOptions} value={actFilt} onChange={v => { setActFilt(v); setPage(1); }} />
            </div>

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Xodimlar topilmadi" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {items.map(item => {
                        const cat = CATEGORIES[item.category] || CATEGORIES.OTHER;
                        return (
                            <div key={item.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'box-shadow .15s, transform .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                {/* top accent */}
                                <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

                                <div style={{ padding: '16px 16px 12px' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                                        {/* photo */}
                                        <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 12, overflow: 'hidden', border: `2px solid ${cat.border}`, background: cat.bg }}>
                                            {item.photo ? (
                                                <img src={mediaUrl(item.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                </div>
                                            )}
                                        </div>
                                        {/* name + position */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item[nameKey[lang]] || item.full_name_latin || '—'}
                                            </p>
                                            <p style={{ fontSize: 12, color: C.sub, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item[posKey[lang]] || item.position_latin || '—'}
                                            </p>
                                            <StatusBadge label={cat.label} bg={cat.bg} color={cat.color} border={cat.border} />
                                        </div>
                                    </div>

                                    {/* subject */}
                                    {(item[subKey[lang]] || item.subject_latin) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                            <span style={{ fontSize: 12, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item[subKey[lang]] || item.subject_latin}
                                            </span>
                                        </div>
                                    )}

                                    {item.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            <span style={{ fontSize: 12, color: C.sub }}>{item.phone}</span>
                                        </div>
                                    )}

                                    {item.reception_days && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                            <span style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.reception_days}</span>
                                        </div>
                                    )}
                                </div>

                                {/* footer */}
                                <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <StatusBadge label={item.is_active ? 'Faol' : 'Nofaol'} bg={item.is_active ? C.gBg : C.bg} color={item.is_active ? C.green : C.muted} border={item.is_active ? C.gBdr : C.border} />
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand} onClick={() => setModal({ type: 'edit', item })}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </ABtn>
                                        <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red} onClick={() => setModal({ type: 'delete', item })}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                        </ABtn>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <StaffForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <StaffForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/staff/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return <DeleteConfirm title="Xodimni o'chirish"
        desc={<><strong style={{ color: C.text }}>{item.full_name_latin || 'Bu xodim'}</strong> o'chiriladi.</>}
        onClose={onClose} onConfirm={confirm} loading={loading} />;
}
