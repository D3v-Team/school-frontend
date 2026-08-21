import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { getLang, mediaUrl, useLang } from "../utils/api";
import {
    C, Spin, fmtDate, Lbl, iStyle, LANGS,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, Toggle, TableHead, TableCard,
} from "../AdminComponents/ui";

const LIMIT = 12;

/* ─── Form modal ──────────────────────────────────────────────── */
function NewspaperForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const fileRef = useRef(null);
    const pdfRef  = useRef(null);

    const [form, setForm] = useState({
        title_latin: item?.title_latin || '',
        title_cyril: item?.title_cyril || '',
        title_ru:    item?.title_ru    || '',
        issue_number: item?.issue_number || '',
    });
    const [activeLang, setActiveLang] = useState('latin');
    const [coverFile,  setCoverFile]  = useState(null);
    const [pdfFile,    setPdfFile]    = useState(null);
    const [preview,    setPreview]    = useState(item?.cover_image ? mediaUrl(item.cover_image) : null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    const fRef = useRef({});
    const [, tick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; tick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const tk = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };
    const langDone = { latin: !!form.title_latin.trim(), cyril: !!form.title_cyril.trim(), ru: !!form.title_ru.trim() };

    const handleImg = e => {
        const f = e.target.files?.[0]; if (!f) return;
        setCoverFile(f); setPreview(URL.createObjectURL(f));
    };
    const handlePdf = e => { const f = e.target.files?.[0]; if (f) setPdfFile(f); };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (!isEdit && !pdfFile)      errs.pdf = 'PDF fayl majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            if (form.title_latin) fd.append('title_latin', form.title_latin.trim());
            if (form.title_cyril) fd.append('title_cyril', form.title_cyril.trim());
            if (form.title_ru)    fd.append('title_ru',    form.title_ru.trim());
            if (form.issue_number !== '') fd.append('issue_number', Number(form.issue_number));
            if (coverFile) fd.append('cover_image', coverFile);
            if (pdfFile)   fd.append('file', pdfFile);

            if (isEdit) await $api.patch(`/api/newspapers/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else        await $api.post('/api/newspapers', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Gazetani tahrirlash' : 'Yangi gazeta'} onClose={onClose} width={700}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>
                    {/* LEFT — lang tabs */}
                    <div>
                        <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}` }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const hasErr = !!errors[tk[key]];
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
                            <input type="text" value={form[tk[activeLang]]}
                                onChange={e => set(tk[activeLang], e.target.value)}
                                onFocus={() => sf(tk[activeLang], true)} onBlur={() => sf(tk[activeLang], false)}
                                style={iStyle(fc(tk[activeLang]), !!errors[tk[activeLang]])}
                                placeholder="Gazeta sarlavhasi..." />
                            {errors[tk[activeLang]] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[tk[activeLang]]}</div>}
                        </div>
                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => (
                                <div key={key} onClick={() => setActiveLang(key)} style={{ flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', border: `1px solid ${errors[tk[key]] ? C.rBdr : langDone[key] ? C.gBdr : C.border}`, background: errors[tk[key]] ? C.rBg : langDone[key] ? C.gBg : C.bg }}>
                                    <div style={{ fontSize: 14 }}>{flag}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: errors[tk[key]] ? C.red : langDone[key] ? C.green : C.muted }}>
                                        {errors[tk[key]] ? '⚠' : langDone[key] ? '✓' : label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Son raqami */}
                        <div style={{ marginTop: 14 }}>
                            <Lbl>Son raqami</Lbl>
                            <input type="number" value={form.issue_number}
                                onChange={e => set('issue_number', e.target.value)}
                                onFocus={() => sf('issue_num', true)} onBlur={() => sf('issue_num', false)}
                                style={iStyle(fc('issue_num'))}
                                placeholder="masalan: 42" min={1} />
                        </div>

                        {/* PDF */}
                        <div style={{ marginTop: 14 }}>
                            <Lbl req={!isEdit}>PDF fayl</Lbl>
                            <div onClick={() => pdfRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: `1.5px dashed ${errors.pdf ? C.red : pdfFile ? C.green : C.border}`, background: pdfFile ? C.gBg : C.bg, cursor: 'pointer', transition: 'all .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = errors.pdf ? C.red : pdfFile ? C.green : C.border; }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={pdfFile ? C.green : C.muted} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                <span style={{ fontSize: 12, fontWeight: 600, color: pdfFile ? C.green : C.muted }}>
                                    {pdfFile ? pdfFile.name : isEdit ? 'Yangi PDF yuklash (ixtiyoriy)' : 'PDF tanlash'}
                                </span>
                            </div>
                            <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdf} />
                            {errors.pdf && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.pdf}</div>}
                        </div>
                    </div>

                    {/* RIGHT — cover */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                            <Lbl>Muqova rasmi</Lbl>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                                    <button type="button" onClick={() => { setCoverFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            ) : (
                                <div onClick={() => fileRef.current?.click()} style={{ height: 180, borderRadius: 8, cursor: 'pointer', border: `2px dashed ${C.border}`, background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>Rasm tanlash</span>
                                    <span style={{ fontSize: 10, color: C.muted }}>JPEG, PNG · max 5MB</span>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
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
export default function Newspapers() {
    const lang = useLang();
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);
    const [tick,    setTick]    = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim()) params.search = search.trim();
                const res = await $api.get('/api/newspapers', { params });
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

    const refresh = () => { setModal(null); setTick(t => t + 1); };
    const titleKey = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Gazetalar" subtitle={`Jami: ${total} ta gazeta`}
                onAdd={() => setModal('create')} addLabel="Yangi gazeta" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Sarlavha bo'yicha..." />
            </div>

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Gazetalar topilmadi" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {items.map(item => (
                        <div key={item.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', transition: 'box-shadow .15s, transform .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                            {/* cover */}
                            <div style={{ height: 200, position: 'relative', background: '#f1f5f9' }}>
                                {item.cover_image ? (
                                    <img src={mediaUrl(item.cover_image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        <span style={{ fontSize: 11, color: C.muted }}>Muqova yo'q</span>
                                    </div>
                                )}
                                {item.issue_number && (
                                    <div style={{ position: 'absolute', top: 8, left: 8, background: C.brand, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                        #{item.issue_number}
                                    </div>
                                )}
                                {/* PDF link */}
                                {item.file_url && (
                                    <a href={mediaUrl(item.file_url)} target="_blank" rel="noreferrer"
                                        style={{ position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                                        title="PDF yuklab olish">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    </a>
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
                            <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand} onClick={() => setModal({ type: 'edit', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </ABtn>
                                <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red} onClick={() => setModal({ type: 'delete', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                </ABtn>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <NewspaperForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <NewspaperForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && (
                <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />
            )}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/newspapers/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return <DeleteConfirm title="Gazetani o'chirish"
        desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu gazeta'}</strong> o'chiriladi.</>}
        onClose={onClose} onConfirm={confirm} loading={loading} />;
}
