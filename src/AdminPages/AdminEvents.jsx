import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { mediaUrl, useLang } from "../utils/api";
import {
    C, Spin, fmtDate, Lbl, iStyle, taStyle, LANGS,
    PBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, FilterPills, Pagination,
    LoadingRow, EmptyRow, PageHeader, StatusBadge, Toggle, TableHead, TableCard, LangPills,
} from "../AdminComponents/ui";

const LIMIT = 10;

const EVENT_TYPE = {
    SCHOOL_EVENT: { label: 'Maktab tadbirи',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    HOLIDAY:      { label: 'Bayram',           color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
    COMPETITION:  { label: 'Musobaqa',         color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    OTHER:        { label: 'Boshqa',           color: C.sub,     bg: C.bg,     border: C.border   },
};

/* ─── Event form ──────────────────────────────────────────────── */
function EventForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const imgRef  = useRef(null);

    const [form, setForm] = useState({
        title_latin:       item?.title_latin       || '',
        title_cyril:       item?.title_cyril       || '',
        title_ru:          item?.title_ru          || '',
        description_latin: item?.description_latin || '',
        description_cyril: item?.description_cyril || '',
        description_ru:    item?.description_ru    || '',
        location_latin:    item?.location_latin    || '',
        location_cyril:    item?.location_cyril    || '',
        location_ru:       item?.location_ru       || '',
        event_date:        item?.event_date        || '',
        type:              item?.type              || 'OTHER',
        is_public:         item?.is_public         ?? true,
    });
    const [activeLang, setActiveLang] = useState('latin');
    const [imgFile,    setImgFile]    = useState(null);
    const [preview,    setPreview]    = useState(item?.cover_image ? mediaUrl(item.cover_image) : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const lk = {
        latin: { title: 'title_latin', desc: 'description_latin', loc: 'location_latin' },
        cyril: { title: 'title_cyril', desc: 'description_cyril', loc: 'location_cyril' },
        ru:    { title: 'title_ru',    desc: 'description_ru',    loc: 'location_ru'    },
    }[activeLang];

    const langDone = {
        latin: form.title_latin.trim().length > 0,
        cyril: form.title_cyril.trim().length > 0,
        ru:    form.title_ru.trim().length > 0,
    };

    const handleImg = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        setImgFile(f); setPreview(URL.createObjectURL(f));
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (!form.event_date)         errs.event_date  = 'Majburiy';
        if (!isEdit && !imgFile)      errs.cover       = 'Rasm majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const fd = new FormData();
            const textFields = [
                'title_latin','title_cyril','title_ru',
                'description_latin','description_cyril','description_ru',
                'location_latin','location_cyril','location_ru',
                'event_date','type',
            ];
            textFields.forEach(k => { if (form[k]) fd.append(k, form[k]); });
            fd.append('is_public', String(form.is_public));
            if (imgFile) fd.append('cover_image', imgFile);

            if (isEdit) await $api.patch(`/api/events/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else        await $api.post('/api/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    const selectSt = () => ({
        width: '100%', padding: '8px 32px 8px 11px', borderRadius: 8,
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
        background: C.bg, color: C.text, boxSizing: 'border-box',
        border: `1.5px solid ${C.border}`, cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    });

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Tadbirni tahrirlash' : 'Yangi tadbir'} onClose={onClose} width={720}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>

                    {/* LEFT — lang tabs */}
                    <div>
                        <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}` }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const lKeys  = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };
                                const hasErr = !!errors[lKeys[key]];
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
                        <div style={{ border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <Lbl req={activeLang === 'latin'}>Sarlavha</Lbl>
                                <input type="text" value={form[lk.title]}
                                    onChange={e => set(lk.title, e.target.value)}
                                    onFocus={() => sf(lk.title, true)} onBlur={() => sf(lk.title, false)}
                                    style={iStyle(fc(lk.title), !!errors[lk.title])}
                                    placeholder="Tadbir sarlavhasi..." />
                                {errors[lk.title] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk.title]}</div>}
                            </div>
                            <div>
                                <Lbl>Tavsif</Lbl>
                                <textarea rows={4} value={form[lk.desc]}
                                    onChange={e => set(lk.desc, e.target.value)}
                                    onFocus={() => sf(lk.desc, true)} onBlur={() => sf(lk.desc, false)}
                                    style={taStyle(fc(lk.desc))}
                                    placeholder="Tadbir haqida qisqacha..." />
                            </div>
                            <div>
                                <Lbl>Manzil / Joy</Lbl>
                                <input type="text" value={form[lk.loc]}
                                    onChange={e => set(lk.loc, e.target.value)}
                                    onFocus={() => sf(lk.loc, true)} onBlur={() => sf(lk.loc, false)}
                                    style={iStyle(fc(lk.loc))}
                                    placeholder="masalan: Aktoviy zal..." />
                            </div>
                        </div>

                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const done = langDone[key];
                                const lKeys = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };
                                const hasErr = !!errors[lKeys[key]];
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
                                            {hasErr ? '⚠ Xato' : done ? '✓' : label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT — meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* cover */}
                        <div style={{ border: `1px solid ${errors.cover ? C.rBdr : C.border}`, borderRadius: 12, padding: 14 }}>
                            <Lbl req={!isEdit}>Muqova rasmi</Lbl>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                                    <button type="button"
                                        onClick={() => { setImgFile(null); setPreview(isEdit ? (item?.cover_image ? mediaUrl(item.cover_image) : null) : null); if (imgRef.current) imgRef.current.value = ''; }}
                                        style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            ) : (
                                <div onClick={() => imgRef.current?.click()} style={{ height: 100, borderRadius: 8, cursor: 'pointer', border: `2px dashed ${errors.cover ? C.rBdr : C.border}`, background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = errors.cover ? C.rBdr : C.border; e.currentTarget.style.background = C.bg; }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="1.8">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>Rasm tanlash</span>
                                </div>
                            )}
                            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
                            {errors.cover && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>⚠ {errors.cover}</div>}
                        </div>

                        {/* event_date */}
                        <div>
                            <Lbl req>Tadbir sanasi</Lbl>
                            <input type="date" value={form.event_date}
                                onChange={e => set('event_date', e.target.value)}
                                onFocus={() => sf('event_date', true)} onBlur={() => sf('event_date', false)}
                                style={iStyle(fc('event_date'), !!errors.event_date)} />
                            {errors.event_date && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.event_date}</div>}
                        </div>

                        {/* type */}
                        <div>
                            <Lbl>Tadbir turi</Lbl>
                            <select value={form.type} onChange={e => set('type', e.target.value)}
                                style={{ width: '100%', padding: '8px 32px 8px 11px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: C.bg, color: C.text, boxSizing: 'border-box', border: `1.5px solid ${C.border}`, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                {Object.entries(EVENT_TYPE).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* is_public */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: form.is_public ? C.green : C.muted }}>
                                        {form.is_public ? '✓ Ochiq' : '○ Yashirin'}
                                    </div>
                                </div>
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

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminEvents() {
    const lang = useLang();
    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
    const [typeFilt, setTypeFilt] = useState('');
    const [pubFilt,  setPubFilt]  = useState('');
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null);

    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim())  params.search    = search.trim();
                if (typeFilt)       params.type      = typeFilt;
                if (pubFilt !== '') params.is_public = pubFilt;
                const res = await $api.get('/api/events/admin', { params });
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
    }, [page, search, typeFilt, pubFilt, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };
    const refresh = () => { setModal(null); setTick(t => t + 1); };

    const selectSt = active => ({
        padding: '8px 32px 8px 12px', borderRadius: 9, fontSize: 13,
        border: `1.5px solid ${active ? C.brand : C.border}`,
        background: active ? C.bBg : C.white, color: active ? C.brand : C.sub,
        outline: 'none', cursor: 'pointer', appearance: 'none', fontWeight: active ? 700 : 500,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    });

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Tadbirlar" subtitle={`Jami: ${total} ta tadbir`}
                onAdd={() => setModal('create')} addLabel="Yangi tadbir" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Sarlavha bo'yicha..." />
                <select value={typeFilt} onChange={e => { setTypeFilt(e.target.value); setPage(1); }} style={selectSt(!!typeFilt)}>
                    <option value="">Tur: Barchasi</option>
                    {Object.entries(EVENT_TYPE).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>
                <div style={{ display: 'flex', gap: 5 }}>
                    {[
                        { val: '',      label: 'Barchasi' },
                        { val: 'true',  label: 'Ochiq',    color: C.green, bg: C.gBg, border: C.gBdr  },
                        { val: 'false', label: 'Yashirin', color: C.muted, bg: C.bg,  border: C.border },
                    ].map(opt => {
                        const active = pubFilt === opt.val;
                        return (
                            <button key={String(opt.val)} onClick={() => { setPubFilt(opt.val); setPage(1); }}
                                style={{ padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', border: `1.5px solid ${active && opt.border ? opt.border : active ? C.brand : C.border}`, background: active && opt.bg ? opt.bg : active ? C.bBg : C.white, color: active && opt.color ? opt.color : active ? C.brand : C.sub, transition: 'all .15s' }}>
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <TableCard>
                <TableHead gridCols="2.5fr 1fr 1fr 110px 120px 80px"
                    cols={['Sarlavha', 'Tur', 'Sana', 'Holat', 'Yaratildi', { label: '', right: true }]} />
                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Tadbirlar topilmadi" /> : (
                    items.map((item, i) => {
                        const tp = EVENT_TYPE[item.type] || EVENT_TYPE.OTHER;
                        return (
                            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 110px 120px 80px', alignItems: 'center', padding: '12px 18px', borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none', transition: 'background .1s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    {item.cover_image ? (
                                        <img src={mediaUrl(item.cover_image)} alt="" style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 6, border: `1px solid ${C.border}`, flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: 40, height: 28, borderRadius: 6, flexShrink: 0, background: tp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 14 }}>📅</span>
                                        </div>
                                    )}
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item[`title_${lang}`] || item.title_latin || '—'}
                                    </span>
                                </div>
                                <StatusBadge label={tp.label} bg={tp.bg} color={tp.color} border={tp.border} />
                                <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>{item.event_date || '—'}</span>
                                <StatusBadge label={item.is_public ? 'Ochiq' : 'Yashirin'} bg={item.is_public ? C.gBg : C.bg} color={item.is_public ? C.green : C.muted} border={item.is_public ? C.gBdr : C.border} />
                                <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                                    <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand} onClick={() => setModal({ type: 'edit', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </ABtn>
                                    <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red} onClick={() => setModal({ type: 'delete', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                    </ABtn>
                                </div>
                            </div>
                        );
                    })
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <EventForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <EventForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => { setLoading(true); try { await $api.delete(`/api/events/${item.id}`); onDeleted(); } catch { /**/ } finally { setLoading(false); } };
    return <DeleteConfirm title="Tadbirni o'chirish" desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu tadbir'}</strong> o'chiriladi.</>} onClose={onClose} onConfirm={confirm} loading={loading} />;
}
