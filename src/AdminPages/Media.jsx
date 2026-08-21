import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { getLang, mediaUrl, useLang } from "../utils/api";
import {
    C, Spin, fmtDate, Lbl, iStyle, LANGS,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, Toggle, TableHead, TableCard,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Album form ──────────────────────────────────────────────── */
function AlbumForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const imgRef  = useRef(null);

    const [form, setForm] = useState({
        title_latin: item?.title_latin || '',
        title_cyril: item?.title_cyril || '',
        title_ru:    item?.title_ru    || '',
        type:        item?.type        || '',
        is_public:   item?.is_public   ?? true,
    });
    const [activeLang, setActiveLang] = useState('latin');
    const [coverFile,  setCoverFile]  = useState(null);
    const [preview,    setPreview]    = useState(item?.cover_image ? mediaUrl(item.cover_image) : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

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

    const handleImg = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        setCoverFile(f); setPreview(URL.createObjectURL(f));
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const fd = new FormData();
            fd.append('title_latin', form.title_latin.trim());
            fd.append('title_cyril', form.title_cyril.trim());
            fd.append('title_ru',    form.title_ru.trim());
            if (form.type) fd.append('type', form.type);
            fd.append('is_public', String(form.is_public));
            if (coverFile) fd.append('cover_image', coverFile);

            if (isEdit) await $api.patch(`/api/media-albums/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else        await $api.post('/api/media-albums', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Albomni tahrirlash' : 'Yangi albom'} onClose={onClose} width={660}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>
                    {/* LEFT — lang tabs */}
                    <div>
                        <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}` }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const hasErr = !!errors[titleKey[key]];
                                return (
                                    <button key={key} type="button" onClick={() => setActiveLang(key)}
                                        style={{ flex: 1, padding: '10px 6px', border: 'none', borderRadius: active ? '10px 10px 0 0' : 0, background: active ? C.white : 'transparent', fontSize: 12, fontWeight: active ? 700 : 500, color: hasErr ? C.red : active ? C.brand : C.sub, borderBottom: `2.5px solid ${active ? C.brand : 'transparent'}`, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                        {flag} {label}
                                        {done && !hasErr && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />}
                                        {hasErr && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0 }} />}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14 }}>
                            <Lbl req={activeLang === 'latin'}>Sarlavha ({LANGS.find(l => l.key === activeLang)?.label})</Lbl>
                            <input type="text" value={form[tk]}
                                onChange={e => set(tk, e.target.value)}
                                onFocus={() => sf(tk, true)} onBlur={() => sf(tk, false)}
                                style={iStyle(fc(tk), !!errors[tk])}
                                placeholder="Albom nomi..." />
                            {errors[tk] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[tk]}</div>}
                        </div>
                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const done = langDone[key]; const hasErr = !!errors[titleKey[key]];
                                return (
                                    <div key={key} onClick={() => setActiveLang(key)} style={{ flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', border: `1px solid ${hasErr ? C.rBdr : done ? C.gBdr : C.border}`, background: hasErr ? C.rBg : done ? C.gBg : C.bg }}>
                                        <div style={{ fontSize: 14 }}>{flag}</div>
                                        <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: hasErr ? C.red : done ? C.green : C.muted }}>{hasErr ? '⚠' : done ? '✓' : label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* cover */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                            <Lbl>Muqova rasmi</Lbl>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                                    <button type="button" onClick={() => { setCoverFile(null); setPreview(null); if (imgRef.current) imgRef.current.value = ''; }}
                                        style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            ) : (
                                <div onClick={() => imgRef.current?.click()} style={{ height: 100, borderRadius: 8, cursor: 'pointer', border: `2px dashed ${C.border}`, background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>Rasm tanlash</span>
                                </div>
                            )}
                            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
                        </div>

                        {/* type — select */}
                        <div>
                            <Lbl>Tur</Lbl>
                            <select value={form.type} onChange={e => set('type', e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 32px 8px 11px', borderRadius: 8,
                                    fontSize: 13, fontFamily: 'inherit', outline: 'none',
                                    background: C.bg, color: form.type ? C.text : C.muted,
                                    boxSizing: 'border-box', border: `1.5px solid ${C.border}`,
                                    cursor: 'pointer', appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                                }}>
                                <option value="">Turni tanlang...</option>
                                <option value="PHOTO">📷 Foto</option>
                                <option value="VIDEO">🎥 Video</option>
                                <option value="PRESENTATION">📊 Prezentatsiya</option>
                            </select>
                        </div>

                        {/* is_public */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: form.is_public ? C.green : C.muted }}>
                                    {form.is_public ? '✓ Ochiq' : '○ Yashirin'}
                                </span>
                                <Toggle value={form.is_public} onChange={v => set('is_public', v)} />
                            </div>
                        </div>

                        {error && <div style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>⚠ {error}</div>}
                    </div>
                </div>
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Yaratish'} />
            </MBox>
        </Overlay>
    );
}

/* ─── Album items modal ───────────────────────────────────────── */
function AlbumItemsModal({ album, onClose }) {
    const multiRef = useRef(null);
    const [items,    setItems]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting,  setDeleting]  = useState({});

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await $api.get(`/api/media-albums/${album.id}`);
            const d = res.data?.data || res.data;
            setItems(d?.items || d?.media || []);
        } catch { setItems([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, [album.id]);

    const handleUpload = async e => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append('file', file);
                await $api.post(`/api/media-albums/${album.id}/items`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            fetchItems();
        } catch { /**/ }
        finally { setUploading(false); if (multiRef.current) multiRef.current.value = ''; }
    };

    const handleDelete = async (itemId) => {
        setDeleting(p => ({ ...p, [itemId]: true }));
        try {
            await $api.delete(`/api/media-albums/${album.id}/items`, { data: { itemId } });
            setItems(prev => prev.filter(i => i.id !== itemId));
        } catch { /**/ }
        finally { setDeleting(p => ({ ...p, [itemId]: false })); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={`Albom: ${album.title_latin || album.title_cyril || 'Albom'}`} onClose={onClose} width={860}>
                {/* upload bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>Media fayllar</p>
                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{items.length} ta element</p>
                    </div>
                    <PBtn onClick={() => multiRef.current?.click()} loading={uploading}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Rasm / Video yuklash
                    </PBtn>
                    <input ref={multiRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
                </div>

                {/* items grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spin size={24} /></div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
                        <p style={{ fontSize: 13 }}>Hali media yo'q. Yuklang!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, maxHeight: '55vh', overflowY: 'auto' }}>
                        {items.map(it => (
                            <div key={it.id} style={{ position: 'relative', borderRadius: 9, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.bg }}>
                                {it.url?.match(/\.(mp4|webm|mov)$/i) ? (
                                    <video src={mediaUrl(it.url)} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <img src={mediaUrl(it.url || it.image_url)} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                                )}
                                <button type="button" onClick={() => handleDelete(it.id)}
                                    disabled={deleting[it.id]}
                                    style={{ position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: '50%', background: 'rgba(220,38,38,0.85)', border: 'none', color: '#fff', cursor: deleting[it.id] ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                    {deleting[it.id] ? <Spin size={10} color="#fff" /> : '×'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <GBtn onClick={onClose}>Yopish</GBtn>
                </div>
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Media() {
    const lang = useLang();
    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
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
                if (search.trim()) params.search = search.trim();
                const res = await $api.get('/api/media-albums', { params });
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
    }, [page, search, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };

    const handleTogglePublic = async item => {
        setToggling(p => ({ ...p, [item.id]: true }));
        try {
            await $api.patch(`/api/media-albums/${item.id}/public`, { is_public: !item.is_public });
            setItems(prev => prev.map(it => it.id === item.id ? { ...it, is_public: !it.is_public } : it));
        } catch { /**/ }
        finally { setToggling(p => ({ ...p, [item.id]: false })); }
    };

    const refresh = () => { setModal(null); setTick(t => t + 1); };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Media Albomlar" subtitle={`Jami: ${total} ta albom`}
                onAdd={() => setModal('create')} addLabel="Yangi albom" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Albom nomi bo'yicha..." />
            </div>

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Albomlar topilmadi" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {items.map(item => (
                        <div key={item.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', transition: 'box-shadow .15s' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            {/* cover */}
                            <div style={{ height: 150, position: 'relative' }}>
                                {item.cover_image ? (
                                    <img src={mediaUrl(item.cover_image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <div style={{ height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 36 }}>🖼️</span>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                                    <StatusBadge label={item.is_public ? 'Ochiq' : 'Yashirin'} bg={item.is_public ? C.gBg : C.rBg} color={item.is_public ? C.green : C.red} border={item.is_public ? C.gBdr : C.rBdr} />
                                </div>
                                {item.type && (
                                    <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.55)', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                                        {item.type}
                                    </div>
                                )}
                            </div>
                            {/* body */}
                            <div style={{ padding: '12px 14px' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getLang(item, 'title', lang) || 'Sarlavsiz'}
                                </p>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{fmtDate(item.created_at)}</p>
                            </div>
                            {/* actions */}
                            <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <button onClick={() => setModal({ type: 'items', item })}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.blueBdr}`, background: C.blueBg, color: C.blue }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    Media
                                </button>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <ABtn title={item.is_public ? 'Yashirish' : 'Ochiq'} bg={item.is_public ? C.rBg : C.gBg} bdr={item.is_public ? C.rBdr : C.gBdr} color={item.is_public ? C.red : C.green} loading={toggling[item.id]} onClick={() => handleTogglePublic(item)}>
                                        {toggling[item.id] ? <Spin size={11} color={item.is_public ? C.red : C.green} /> :
                                            item.is_public ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg> :
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        }
                                    </ABtn>
                                    <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand} onClick={() => setModal({ type: 'edit', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </ABtn>
                                    <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red} onClick={() => setModal({ type: 'delete', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                    </ABtn>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <AlbumForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <AlbumForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'items' && <AlbumItemsModal album={modal.item} onClose={() => setModal(null)} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => { setLoading(true); try { await $api.delete(`/api/media-albums/${item.id}`); onDeleted(); } catch { /**/ } finally { setLoading(false); } };
    return <DeleteConfirm title="Albomni o'chirish" desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu albom'}</strong> va barcha media fayllar o'chiriladi.</>} onClose={onClose} onConfirm={confirm} loading={loading} />;
}
