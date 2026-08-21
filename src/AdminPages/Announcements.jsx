import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { getLang, mediaUrl, useLang } from "../utils/api";
import {
    C, Spin, fmtDate, Lbl, iStyle, taStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, FilterPills, Pagination,
    TableHead, TableCard, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, Toggle, LANGS,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Create / Edit modal ─────────────────────────────────────── */
function AnnouncementForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const fileRef = useRef(null);
    const EMPTY   = {
        title_latin: '', title_cyril: '', title_ru: '',
        content_latin: '', content_cyril: '', content_ru: '',
        is_public: true,
    };
    const [form,       setForm]       = useState(isEdit ? { ...EMPTY, ...item } : EMPTY);
    const [activeLang, setActiveLang] = useState('latin');
    const [coverFile,  setCoverFile]  = useState(null);
    const [preview,    setPreview]    = useState(isEdit ? (item.cover_image ? mediaUrl(item.cover_image) : null) : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    /* focus tracking via ref — prevents remount */
    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const keys = {
        latin: { t: 'title_latin',  c: 'content_latin'  },
        cyril: { t: 'title_cyril',  c: 'content_cyril'  },
        ru:    { t: 'title_ru',     c: 'content_ru'      },
    };
    const tk = keys[activeLang];

    const langDone = {
        latin: form.title_latin.trim() && form.content_latin.trim(),
        cyril: form.title_cyril.trim() && form.content_cyril.trim(),
        ru:    form.title_ru.trim()    && form.content_ru.trim(),
    };

    const handleFile = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError("Rasm 5MB dan oshmasin"); return; }
        setCoverFile(f); setPreview(URL.createObjectURL(f)); setError('');
    };

    const validate = () => {
        const e = {};
        if (!form.title_latin.trim())   e.title_latin   = 'Majburiy';
        if (!form.title_cyril.trim())   e.title_cyril   = 'Majburiy';
        if (!form.title_ru.trim())      e.title_ru      = 'Majburiy';
        if (!form.content_latin.trim()) e.content_latin = 'Majburiy';
        if (!form.content_cyril.trim()) e.content_cyril = 'Majburiy';
        if (!form.content_ru.trim())    e.content_ru    = 'Majburiy';
        return e;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            if (errs.title_latin || errs.content_latin)      setActiveLang('latin');
            else if (errs.title_cyril || errs.content_cyril) setActiveLang('cyril');
            else                                              setActiveLang('ru');
            return;
        }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            ['title_latin','title_cyril','title_ru','content_latin','content_cyril','content_ru']
                .forEach(k => fd.append(k, form[k].trim()));
            fd.append('is_public', form.is_public);
            if (coverFile) fd.append('cover_image', coverFile);
            if (isEdit) await $api.patch(`/api/announcements/${item.id}`, fd);
            else        await $api.post('/api/announcements', fd);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? "E'lonni tahrirlash" : "Yangi e'lon"} onClose={onClose}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 264px', gap: 16 }}>

                    {/* LEFT — lang tabs */}
                    <div>
                        {/* tab bar */}
                        <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0',
                            borderBottom: `1px solid ${C.border}` }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const hasErr = errors[keys[key].t] || errors[keys[key].c];
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
                                        {hasErr          && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red,   flexShrink: 0 }} />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* tab body */}
                        <div style={{ border: `1px solid ${C.border}`, borderTop: 'none',
                            borderRadius: '0 0 10px 10px', padding: 14,
                            display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <Lbl req>Sarlavha</Lbl>
                                <input type="text" value={form[tk.t]}
                                    onChange={e => set(tk.t, e.target.value)}
                                    onFocus={() => sf(tk.t, true)} onBlur={() => sf(tk.t, false)}
                                    style={iStyle(fc(tk.t), errors[tk.t])}
                                    placeholder="Sarlavha kiriting..." />
                                {errors[tk.t] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[tk.t]}</div>}
                            </div>
                            <div>
                                <Lbl req>Matn</Lbl>
                                <textarea rows={7} value={form[tk.c]}
                                    onChange={e => set(tk.c, e.target.value)}
                                    onFocus={() => sf(tk.c, true)} onBlur={() => sf(tk.c, false)}
                                    style={taStyle(fc(tk.c))}
                                    placeholder="Matn kiriting..." />
                                {errors[tk.c] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[tk.c]}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end',
                                paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
                                <span style={{ fontSize: 11, color: C.muted }}>Sarlavha: <b>{form[tk.t].length}</b></span>
                                <span style={{ fontSize: 11, color: C.muted }}>Matn: <b>{form[tk.c].length}</b></span>
                            </div>
                        </div>

                        {/* lang status strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const done   = langDone[key];
                                const hasErr = errors[keys[key].t] || errors[keys[key].c];
                                return (
                                    <div key={key} onClick={() => setActiveLang(key)} style={{
                                        flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
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

                    {/* RIGHT — meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* cover */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                            <Lbl>Muqova rasmi</Lbl>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="" style={{ width: '100%', height: 130,
                                        objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}`, display: 'block' }} />
                                    <button type="button"
                                        onClick={() => { setCoverFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24,
                                            borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none',
                                            color: '#fff', fontSize: 14, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            ) : (
                                <div onClick={() => fileRef.current?.click()}
                                    style={{ height: 110, borderRadius: 8, cursor: 'pointer',
                                        border: `2px dashed ${C.border}`, background: C.bg,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', gap: 6,
                                        transition: 'all .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="1.8">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: C.brand }}>Rasm tanlash</span>
                                    <span style={{ fontSize: 10, color: C.muted }}>max 5 MB</span>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                            {error && <p style={{ fontSize: 11, color: C.red, marginTop: 5 }}>⚠ {error}</p>}
                        </div>

                        {/* is_public */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                            <Lbl>Ko'rinishi</Lbl>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600,
                                        color: form.is_public ? C.green : C.muted }}>
                                        {form.is_public ? '✓ Aktiv' : '○ Yashirin'}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                                        {form.is_public ? 'Hammaga ko\'rinadigan' : 'Hech kimga ko\'rinmaydi'}
                                    </div>
                                </div>
                                <Toggle value={form.is_public} onChange={v => set('is_public', v)} />
                            </div>
                        </div>

                        {/* hint */}
                        <div style={{ border: `1px solid ${C.bBdr}`, borderRadius: 12, padding: 12, background: C.bBg }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#9a3412',
                                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>💡 Eslatma</p>
                            <ul style={{ fontSize: 11, color: '#9a3412', paddingLeft: 14, lineHeight: 1.8, margin: 0 }}>
                                <li>Barcha 3 til majburiy</li>
                                <li>Rasm ixtiyoriy (max 5MB)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <MFooter onClose={onClose} onSave={handleSave} saving={saving}
                    label={isEdit ? 'Saqlash' : "Yaratish"} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function Announcements() {
    const lang = useLang();
    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
    const [pubFilt,  setPubFilt]  = useState('');
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
                if (pubFilt !== '') params.is_public = pubFilt;
                const res = await $api.get('/api/announcements/admin', { params });
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
    }, [page, search, pubFilt, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };

    const handleToggle = async item => {
        setToggling(p => ({ ...p, [item.id]: true }));
        try {
            await $api.patch(`/api/announcements/${item.id}/toggle-publish`, { is_public: !item.is_public });
            setItems(prev => prev.map(it => it.id === item.id ? { ...it, is_public: !it.is_public } : it));
        } catch { /* silent */ }
        finally { setToggling(p => ({ ...p, [item.id]: false })); }
    };

    const refresh = () => { setModal(null); setTick(t => t + 1); };

    const pubOptions = [
        { val: '',      label: 'Barchasi' },
        { val: 'true',  label: 'Aktiv',    color: C.green,  bg: C.gBg,  border: C.gBdr },
        { val: 'false', label: 'Yashirin', color: C.muted,  bg: C.bg,   border: C.border },
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="E'lonlar" subtitle={`Jami: ${total} ta e'lon`}
                onAdd={() => setModal('create')} addLabel="Yangi e'lon" />

            {/* filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Sarlavha bo'yicha qidirish..." />
                <FilterPills options={pubOptions} value={pubFilt}
                    onChange={v => { setPubFilt(v); setPage(1); }} />
            </div>

            {/* table */}
            <TableCard>
                <TableHead
                    gridCols="2.5fr 2fr 100px 110px 120px"
                    cols={['Sarlavha', 'Mazmun', 'Holat', 'Sana', { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="E'lonlar topilmadi" /> : (
                    items.map((item, i) => (
                        <div key={item.id}
                            style={{
                                display: 'grid', gridTemplateColumns: '2.5fr 2fr 100px 110px 120px',
                                alignItems: 'center', padding: '12px 18px',
                                borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none',
                                transition: 'background .1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                            {/* thumb + title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                {item.cover_image ? (
                                    <img src={mediaUrl(item.cover_image)} alt="" style={{ width: 38, height: 26,
                                        objectFit: 'cover', borderRadius: 6, border: `1px solid ${C.border}`, flexShrink: 0 }} />
                                ) : (
                                    <div style={{ width: 38, height: 26, borderRadius: 6, flexShrink: 0,
                                        background: '#f1f5f9', border: `1px solid ${C.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                )}
                                <span style={{ fontSize: 13, fontWeight: 600, color: C.text,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getLang(item, 'title', lang) || '—'}
                                </span>
                            </div>

                            {/* content preview */}
                            <span style={{ fontSize: 12, color: C.muted,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 10 }}>
                                {getLang(item, 'content', lang)?.replace(/<[^>]+>/g, '').slice(0, 60) || '—'}
                            </span>

                            {/* status badge */}
                            <span>
                                <StatusBadge
                                    label={item.is_public ? 'Aktiv' : 'Yashirin'}
                                    bg={item.is_public ? C.gBg : C.bg}
                                    color={item.is_public ? C.green : C.muted}
                                    border={item.is_public ? C.gBdr : C.border} />
                            </span>

                            {/* date */}
                            <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>

                            {/* actions */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                                {/* toggle */}
                                <ABtn
                                    title={item.is_public ? 'Yashirish' : 'Chop etish'}
                                    bg={item.is_public ? C.gBg : C.bg}
                                    bdr={item.is_public ? C.gBdr : C.border}
                                    color={item.is_public ? C.green : C.muted}
                                    loading={toggling[item.id]}
                                    onClick={() => handleToggle(item)}>
                                    {toggling[item.id] ? <Spin size={11} color={item.is_public ? C.green : C.muted} /> :
                                        item.is_public ? (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                </ABtn>
                                {/* edit */}
                                <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                    onClick={() => setModal({ type: 'edit', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </ABtn>
                                {/* delete */}
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
                    ))
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {/* modals */}
            {modal === 'create' && <AnnouncementForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit'   && <AnnouncementForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && (
                <DeleteConfirmWrapper item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />
            )}
        </div>
    );
}

function DeleteConfirmWrapper({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/announcements/${item.id}`); onDeleted(); }
        catch { /* silent */ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm
            title="O'chirishni tasdiqlang"
            desc={<>
                <strong style={{ color: '#0f172a' }}>{(item.title_latin || "Bu e'lon").slice(0, 50)}</strong>
                {' '}o'chiriladi. Bu amalni qaytarib bo'lmaydi.
            </>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
