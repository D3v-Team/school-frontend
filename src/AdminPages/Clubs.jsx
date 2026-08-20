import { useState, useEffect, useRef, useCallback } from "react";
import { $api } from "../utils";
import {
    C, Spin, fmtDate, Lbl, iStyle, taStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, FilterPills, Pagination,
    LoadingRow, EmptyRow, PageHeader, StatusBadge, Toggle, LANGS,
} from "../AdminComponents/ui";

const LIMIT = 10;

const CAT = {
    SPORT:      { label: 'Sport',        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    SCIENCE:    { label: 'Fan',          color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    ART:        { label: "San'at",       color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
    LANGUAGE:   { label: 'Til',          color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    TECHNOLOGY: { label: 'Texnologiya',  color: C.brand,   bg: C.bBg,    border: C.bBdr    },
    MUSIC:      { label: 'Musiqa',       color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
    OTHER:      { label: 'Boshqa',       color: C.sub,     bg: C.bg,     border: C.border   },
};

/* ─── Club Form Modal ─────────────────────────────────────────── */
function ClubForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const fileRef = useRef(null);

    const EMPTY = {
        name_latin: '', name_cyril: '', name_ru: '',
        category: 'OTHER',
        description_latin: '', description_cyril: '', description_ru: '',
        supervisor_name: '', age_group: '', location: '',
        schedule_latin: '', schedule_cyril: '', schedule_ru: '',
        is_active: true,
    };

    const [form,       setForm]       = useState(isEdit ? { ...EMPTY, ...item } : EMPTY);
    const [activeLang, setActiveLang] = useState('latin');
    const [coverFile,  setCoverFile]  = useState(null);
    const [preview,    setPreview]    = useState(isEdit ? item.cover_image || null : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    const fRef = useRef({});
    const [, tick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; tick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const langKeys = {
        latin: { name: 'name_latin', desc: 'description_latin', sched: 'schedule_latin' },
        cyril: { name: 'name_cyril', desc: 'description_cyril', sched: 'schedule_cyril' },
        ru:    { name: 'name_ru',    desc: 'description_ru',    sched: 'schedule_ru'    },
    };
    const lk = langKeys[activeLang];

    const langDone = {
        latin: form.name_latin.trim().length > 0,
        cyril: form.name_cyril.trim().length > 0,
        ru:    form.name_ru.trim().length > 0,
    };

    const handleFile = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError('Rasm 5MB dan oshmasin'); return; }
        setCoverFile(f); setPreview(URL.createObjectURL(f)); setError('');
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.name_latin.trim()) errs.name_latin = 'Majburiy';
        if (!form.category)          errs.category   = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const fd = new FormData();
            const textFields = [
                'name_latin','name_cyril','name_ru',
                'category',
                'description_latin','description_cyril','description_ru',
                'supervisor_name','age_group','location',
                'schedule_latin','schedule_cyril','schedule_ru',
            ];
            textFields.forEach(k => { if (form[k]) fd.append(k, form[k]); });
            fd.append('is_active', form.is_active);
            if (coverFile) fd.append('cover_image', coverFile);

            if (isEdit) await $api.patch(`/api/clubs/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else        await $api.post('/api/clubs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? "To'garakni tahrirlash" : "Yangi to'garak"} onClose={onClose} width={780}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>

                    {/* ── LEFT: lang tabs ── */}
                    <div>
                        {/* tab bar */}
                        <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}` }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const hasErr = errors[langKeys[key].name];
                                return (
                                    <button key={key} type="button" onClick={() => setActiveLang(key)}
                                        style={{
                                            flex: 1, padding: '10px 6px', border: 'none',
                                            borderRadius: active ? '10px 10px 0 0' : 0,
                                            background: active ? C.white : 'transparent',
                                            fontSize: 12, fontWeight: active ? 700 : 500,
                                            color: hasErr ? C.red : active ? C.brand : C.sub,
                                            borderBottom: `2.5px solid ${active ? C.brand : 'transparent'}`,
                                            cursor: 'pointer', transition: 'all .15s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                        }}>
                                        {flag} {label}
                                        {done && !hasErr && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />}
                                        {hasErr && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0 }} />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* tab body */}
                        <div style={{ border: `1px solid ${C.border}`, borderTop: 'none',
                            borderRadius: '0 0 10px 10px', padding: 14,
                            display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* name */}
                            <div>
                                <Lbl req={activeLang === 'latin'}>
                                    Nomi ({LANGS.find(l => l.key === activeLang)?.label})
                                </Lbl>
                                <input type="text" value={form[lk.name]}
                                    onChange={e => set(lk.name, e.target.value)}
                                    onFocus={() => sf(lk.name, true)} onBlur={() => sf(lk.name, false)}
                                    style={iStyle(fc(lk.name), errors[lk.name])}
                                    placeholder="To'garak nomi..." />
                                {errors[lk.name] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk.name]}</div>}
                            </div>
                            {/* description */}
                            <div>
                                <Lbl>Tavsif</Lbl>
                                <textarea rows={4} value={form[lk.desc]}
                                    onChange={e => set(lk.desc, e.target.value)}
                                    onFocus={() => sf(lk.desc, true)} onBlur={() => sf(lk.desc, false)}
                                    style={taStyle(fc(lk.desc))}
                                    placeholder="To'garak haqida qisqacha..." />
                            </div>
                            {/* schedule */}
                            <div>
                                <Lbl>Jadval</Lbl>
                                <input type="text" value={form[lk.sched]}
                                    onChange={e => set(lk.sched, e.target.value)}
                                    onFocus={() => sf(lk.sched, true)} onBlur={() => sf(lk.sched, false)}
                                    style={iStyle(fc(lk.sched))}
                                    placeholder="masalan: Dush, Chor 15:00-16:30" />
                            </div>
                        </div>

                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const done   = langDone[key];
                                const hasErr = errors[langKeys[key].name];
                                return (
                                    <div key={key} onClick={() => setActiveLang(key)} style={{
                                        flex: 1, padding: '6px 8px', borderRadius: 8,
                                        textAlign: 'center', cursor: 'pointer',
                                        border: `1px solid ${hasErr ? C.rBdr : done ? C.gBdr : C.border}`,
                                        background: hasErr ? C.rBg : done ? C.gBg : C.bg,
                                    }}>
                                        <div style={{ fontSize: 14 }}>{flag}</div>
                                        <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2,
                                            color: hasErr ? C.red : done ? C.green : C.muted }}>
                                            {hasErr ? '⚠ Xato' : done ? '✓ Tayyor' : label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── RIGHT: meta ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* cover */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
                            <Lbl>Muqova rasmi</Lbl>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="" style={{ width: '100%', height: 120,
                                        objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                                    <button type="button"
                                        onClick={() => { setCoverFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22,
                                            borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
                                            border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            ) : (
                                <div onClick={() => fileRef.current?.click()} style={{
                                    height: 100, borderRadius: 8, cursor: 'pointer',
                                    border: `2px dashed ${C.border}`, background: C.bg,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 5,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="1.8">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>Rasm tanlash</span>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                        </div>

                        {/* category */}
                        <div>
                            <Lbl req>Kategoriya</Lbl>
                            <select value={form.category} onChange={e => set('category', e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 11px', borderRadius: 8,
                                    fontSize: 13, fontFamily: 'inherit', outline: 'none',
                                    background: C.bg, color: C.text, boxSizing: 'border-box',
                                    border: `1.5px solid ${errors.category ? C.red : C.border}`,
                                    cursor: 'pointer',
                                }}>
                                {Object.entries(CAT).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                            {errors.category && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.category}</div>}
                        </div>

                        {/* supervisor */}
                        <div>
                            <Lbl>Rahbar</Lbl>
                            <input type="text" value={form.supervisor_name}
                                onChange={e => set('supervisor_name', e.target.value)}
                                onFocus={() => sf('supervisor_name', true)} onBlur={() => sf('supervisor_name', false)}
                                style={iStyle(fc('supervisor_name'))}
                                placeholder="F.I.O." />
                        </div>

                        {/* age_group */}
                        <div>
                            <Lbl>Yosh guruhi</Lbl>
                            <input type="text" value={form.age_group}
                                onChange={e => set('age_group', e.target.value)}
                                onFocus={() => sf('age_group', true)} onBlur={() => sf('age_group', false)}
                                style={iStyle(fc('age_group'))}
                                placeholder="masalan: 5-7-sinflar" />
                        </div>

                        {/* location */}
                        <div>
                            <Lbl>Manzil / Xona</Lbl>
                            <input type="text" value={form.location}
                                onChange={e => set('location', e.target.value)}
                                onFocus={() => sf('location', true)} onBlur={() => sf('location', false)}
                                style={iStyle(fc('location'))}
                                placeholder="masalan: 12-xona" />
                        </div>

                        {/* is_active */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, fontWeight: 600,
                                    color: form.is_active ? C.green : C.muted }}>
                                    {form.is_active ? '✓ Aktiv' : '○ Nofaol'}
                                </span>
                                <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12,
                                background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
                                ⚠ {error}
                            </div>
                        )}
                    </div>
                </div>
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Yaratish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Clubs() {
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [catFilt, setCatFilt] = useState('');
    const [actFilt, setActFilt] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
            if (search.trim()) params.search    = search.trim();
            if (catFilt)       params.category  = catFilt;
            if (actFilt !== '') params.is_active = actFilt;
            const res = await $api.get('/api/clubs', { params });
            const d   = res.data;
            setItems(d?.data || d?.items || []);
            setTotal(d?.total || d?.meta?.total || 0);
        } catch { setItems([]); } finally { setLoading(false); }
    }, [page, search, catFilt, actFilt]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = useCallback(v => { setSearch(v); setPage(1); }, []);
    const refresh = () => { setModal(null); fetchData(); };

    const catOptions = [
        { val: '', label: 'Barchasi' },
        ...Object.entries(CAT).map(([val, s]) => ({ val, label: s.label, color: s.color, bg: s.bg, border: s.border })),
    ];

    const actOptions = [
        { val: '',      label: 'Barchasi' },
        { val: 'true',  label: '✓ Aktiv',   color: C.green, bg: C.gBg, border: C.gBdr },
        { val: 'false', label: '○ Nofaol',  color: C.muted, bg: C.bg,  border: C.border },
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="To'garaklar va Sektsiyalar" subtitle={`Jami: ${total} ta to'garak`}
                onAdd={() => setModal('create')} addLabel="Yangi to'garak" />

            {/* filters row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="To'garak nomi bo'yicha..." />

                {/* category — select dropdown (8 variant, pills sig'maydi) */}
                <select value={catFilt} onChange={e => { setCatFilt(e.target.value); setPage(1); }}
                    style={{
                        padding: '8px 32px 8px 12px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                        border: `1.5px solid ${catFilt ? C.brand : C.border}`,
                        background: catFilt ? C.bBg : C.white,
                        color: catFilt ? C.brand : C.sub,
                        outline: 'none', cursor: 'pointer', appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                    }}>
                    <option value="">Kategoriya: Barchasi</option>
                    {Object.entries(CAT).map(([key, s]) => (
                        <option key={key} value={key}>{s.label}</option>
                    ))}
                </select>

                {/* active — 3 pill (compact) */}
                <div style={{ display: 'flex', gap: 5 }}>
                    {[
                        { val: '',      label: 'Barchasi' },
                        { val: 'true',  label: '✓ Aktiv',   color: C.green, bg: C.gBg, border: C.gBdr },
                        { val: 'false', label: '○ Nofaol',  color: C.muted, bg: C.bg,  border: C.border },
                    ].map(opt => {
                        const active = actFilt === opt.val;
                        return (
                            <button key={String(opt.val)} onClick={() => { setActFilt(opt.val); setPage(1); }}
                                style={{
                                    padding: '7px 12px', borderRadius: 20, fontSize: 12,
                                    fontWeight: active ? 700 : 500, cursor: 'pointer',
                                    border: `1.5px solid ${active && opt.border ? opt.border : active ? C.brand : C.border}`,
                                    background: active && opt.bg ? opt.bg : active ? C.bBg : C.white,
                                    color: active && opt.color ? opt.color : active ? C.brand : C.sub,
                                    transition: 'all .15s',
                                }}>
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="To'garaklar topilmadi" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {items.map(item => {
                        const cat = CAT[item.category] || CAT.OTHER;
                        return (
                            <div key={item.id} style={{
                                background: C.white, border: `1px solid ${C.border}`,
                                borderRadius: 12, overflow: 'hidden', transition: 'box-shadow .15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                {/* image */}
                                <div style={{ height: 140, position: 'relative' }}>
                                    {item.cover_image ? (
                                        <img src={item.cover_image} alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    ) : (
                                        <div style={{ height: '100%', background: cat.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 36 }}>
                                                {item.category === 'SPORT' ? '⚽' : item.category === 'SCIENCE' ? '🔬' :
                                                 item.category === 'ART' ? '🎨' : item.category === 'LANGUAGE' ? '🌍' :
                                                 item.category === 'TECHNOLOGY' ? '💻' : item.category === 'MUSIC' ? '🎵' : '📚'}
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: 8, left: 8 }}>
                                        <StatusBadge label={cat.label}
                                            bg={cat.bg} color={cat.color} border={cat.border} />
                                    </div>
                                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                        <StatusBadge label={item.is_active ? 'Aktiv' : 'Nofaol'}
                                            bg={item.is_active ? C.gBg : C.bg}
                                            color={item.is_active ? C.green : C.muted}
                                            border={item.is_active ? C.gBdr : C.border} />
                                    </div>
                                </div>

                                {/* body */}
                                <div style={{ padding: '12px 14px' }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 4px',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.name_latin || item.name_cyril || '—'}
                                    </p>
                                    {item.supervisor_name && (
                                        <p style={{ fontSize: 12, color: C.sub, margin: '0 0 2px' }}>
                                            👤 {item.supervisor_name}
                                        </p>
                                    )}
                                    {item.age_group && (
                                        <p style={{ fontSize: 12, color: C.muted, margin: '0 0 2px' }}>
                                            🎓 {item.age_group}
                                        </p>
                                    )}
                                    {item.schedule_latin && (
                                        <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            🕐 {item.schedule_latin}
                                        </p>
                                    )}
                                </div>

                                {/* actions */}
                                <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`,
                                    display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                    <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                        onClick={() => setModal({ type: 'edit', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </ABtn>
                                    <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red}
                                        onClick={() => setModal({ type: 'delete', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                            <path d="M10 11v6"/><path d="M14 11v6"/>
                                        </svg>
                                    </ABtn>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <ClubForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <ClubForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/clubs/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm title="To'garakni o'chirish"
            desc={<><strong style={{ color: C.text }}>{item.name_latin || "Bu to'garak"}</strong> o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
