import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { getLang, mediaUrl, useLang } from "../utils/api";
import {
    C, Spin, fmtDate, Lbl, iStyle, taStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, FilterPills, Pagination,
    LoadingRow, EmptyRow, PageHeader, StatusBadge, Toggle, LANGS,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Lang tabs (same pattern as Announcements) ──────────────── */
function BannerForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const fileRef = useRef(null);
    const EMPTY   = {
        title_latin: '', title_cyril: '', title_ru: '',
        link_url: '', order: '', is_active: true,
    };
    const [form,       setForm]       = useState(isEdit ? { ...EMPTY, ...item } : EMPTY);
    const [activeLang, setActiveLang] = useState('latin');
    const [imageFile,  setImageFile]  = useState(null);
    const [preview,    setPreview]    = useState(isEdit ? mediaUrl(item.image_url || item.image || null) : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    /* focus via ref — no remount */
    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const titleKey = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };
    const tk = titleKey[activeLang];

    const langDone = {
        latin: form.title_latin.trim().length > 0,
        cyril: form.title_cyril.trim().length > 0,
        ru:    form.title_ru.trim().length > 0,
    };

    const handleFile = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError('Rasm 5MB dan oshmasin'); return; }
        setImageFile(f); setPreview(URL.createObjectURL(f)); setError('');
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (!isEdit && !imageFile)   errs.image = 'Rasm majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const fd = new FormData();
            if (form.title_latin) fd.append('title_latin', form.title_latin);
            if (form.title_cyril) fd.append('title_cyril', form.title_cyril);
            if (form.title_ru)    fd.append('title_ru',    form.title_ru);
            if (form.link_url)    fd.append('link_url',    form.link_url);
            if (form.order !== '') fd.append('order', Number(form.order));
            fd.append('is_active', form.is_active);
            if (imageFile) fd.append('image_file', imageFile);

            if (isEdit) await $api.patch(`/api/banners/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else        await $api.post('/api/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Bannerni tahrirlash' : 'Yangi banner'} onClose={onClose} width={680}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>

                    {/* ── LEFT: lang tabs ── */}
                    <div>
                        {/* tab bar */}
                        <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}` }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const hasErr = errors[titleKey[key]];
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
                        <div style={{ border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14 }}>
                            <Lbl req={activeLang === 'latin'}>Sarlavha ({LANGS.find(l => l.key === activeLang)?.label})</Lbl>
                            <input
                                type="text"
                                value={form[tk]}
                                onChange={e => set(tk, e.target.value)}
                                onFocus={() => sf(tk, true)}
                                onBlur={() => sf(tk, false)}
                                style={iStyle(fc(tk), errors[tk])}
                                placeholder="Banner sarlavhasi..."
                            />
                            {errors[tk] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[tk]}</div>}
                        </div>

                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const done   = langDone[key];
                                const hasErr = errors[titleKey[key]];
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

                        {/* link + order */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                            <div>
                                <Lbl>Havola URL</Lbl>
                                <input type="url" value={form.link_url}
                                    onChange={e => set('link_url', e.target.value)}
                                    onFocus={() => sf('link_url', true)}
                                    onBlur={() => sf('link_url', false)}
                                    style={iStyle(fc('link_url'))}
                                    placeholder="https://..." />
                            </div>
                            <div>
                                <Lbl>Tartib raqami</Lbl>
                                <input type="number" value={form.order}
                                    onChange={e => set('order', e.target.value)}
                                    onFocus={() => sf('order', true)}
                                    onBlur={() => sf('order', false)}
                                    style={iStyle(fc('order'))}
                                    placeholder="1, 2, 3..." min={0} />
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: image + toggle ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                            <Lbl req={!isEdit}>Banner rasmi</Lbl>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="" style={{
                                        width: '100%', height: 140, objectFit: 'cover',
                                        borderRadius: 8, border: `1px solid ${C.border}`, display: 'block',
                                    }} />
                                    <button type="button"
                                        onClick={() => { setImageFile(null); setPreview(isEdit ? item.image_url || null : null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{
                                            position: 'absolute', top: 6, right: 6, width: 24, height: 24,
                                            borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
                                            border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>×</button>
                                </div>
                            ) : (
                                <div onClick={() => fileRef.current?.click()} style={{
                                    height: 120, borderRadius: 8, cursor: 'pointer',
                                    border: `2px dashed ${errors.image ? C.red : C.border}`,
                                    background: C.bg, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = errors.image ? C.red : C.border; e.currentTarget.style.background = C.bg; }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="1.8">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: C.brand }}>Rasm tanlash</span>
                                    <span style={{ fontSize: 10, color: C.muted }}>JPEG, PNG, WebP · max 5MB</span>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                            {errors.image && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>⚠ {errors.image}</div>}
                        </div>

                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                            <Lbl>Holati</Lbl>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? C.green : C.muted }}>
                                        {form.is_active ? '✓ Faol' : '○ Nofaol'}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                                        {form.is_active ? "Ko'rinadi" : 'Yashirilgan'}
                                    </div>
                                </div>
                                <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12,
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
export default function Banners() {
    const lang = useLang();
    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
    const [actFilt,  setActFilt]  = useState('');
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null);
    const [toggling, setToggling] = useState({});

    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim())  params.search    = search.trim();
                if (actFilt !== '') params.is_active = actFilt;
                const res = await $api.get('/api/banners', { params });
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
    }, [page, search, actFilt, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };

    const handleToggle = async item => {
        setToggling(p => ({ ...p, [item.id]: true }));
        try {
            await $api.patch(`/api/banners/${item.id}/active`, { is_active: !item.is_active });
            setItems(prev => prev.map(it => it.id === item.id ? { ...it, is_active: !it.is_active } : it));
        } catch { /**/ } finally { setToggling(p => ({ ...p, [item.id]: false })); }
    };

    const refresh = () => { setModal(null); setTick(t => t + 1); };

    const activeOpts = [
        { val: '',      label: 'Barchasi' },
        { val: 'true',  label: 'Faol',    color: C.green, bg: C.gBg, border: C.gBdr },
        { val: 'false', label: 'Nofaol',  color: C.muted, bg: C.bg,  border: C.border },
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Bannerlar" subtitle={`Jami: ${total} ta banner`}
                onAdd={() => setModal('create')} addLabel="Yangi banner" />

            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Sarlavha bo'yicha..." />
                <FilterPills options={activeOpts} value={actFilt} onChange={v => { setActFilt(v); setPage(1); }} />
            </div>

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Bannerlar topilmadi" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {items.map(item => (
                        <div key={item.id} style={{
                            background: C.white, border: `1px solid ${C.border}`,
                            borderRadius: 12, overflow: 'hidden', transition: 'box-shadow .15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            <div style={{ position: 'relative', height: 160 }}>
                                {item.image_url || item.image ? (
                                    <img src={mediaUrl(item.image_url || item.image)} alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <div style={{ height: '100%', background: '#f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                                    <StatusBadge label={item.is_active ? 'Faol' : 'Nofaol'}
                                        bg={item.is_active ? C.gBg : C.rBg}
                                        color={item.is_active ? C.green : C.red}
                                        border={item.is_active ? C.gBdr : C.rBdr} />
                                </div>
                                {item.order != null && (
                                    <div style={{ position: 'absolute', top: 8, right: 8,
                                        background: 'rgba(0,0,0,0.55)', borderRadius: 6,
                                        padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                                        #{item.order}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '12px 14px' }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 4px',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getLang(item, 'title', lang) || 'Sarlavsiz'}
                                </p>
                                {item.link_url && (
                                    <p style={{ fontSize: 11, color: C.blue, margin: '0 0 6px',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        🔗 {item.link_url}
                                    </p>
                                )}
                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{fmtDate(item.created_at)}</p>
                            </div>
                            <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <button onClick={() => handleToggle(item)} disabled={toggling[item.id]}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                                        cursor: toggling[item.id] ? 'default' : 'pointer',
                                        border: `1px solid ${item.is_active ? C.rBdr : C.gBdr}`,
                                        background: item.is_active ? C.rBg : C.gBg,
                                        color: item.is_active ? C.red : C.green,
                                    }}>
                                    {toggling[item.id] ? <Spin size={11} color={item.is_active ? C.red : C.green} /> : null}
                                    {item.is_active ? "O'chirish" : 'Faollashtirish'}
                                </button>
                                <div style={{ display: 'flex', gap: 5 }}>
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
                        </div>
                    ))}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <BannerForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <BannerForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/banners/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm title="Bannerni o'chirish"
            desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu banner'}</strong> o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
