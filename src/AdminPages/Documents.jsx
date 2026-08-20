import { useState, useEffect, useRef, useCallback } from "react";
import { $api } from "../utils";
import {
    C, Spin, fmtDate, Lbl, iStyle, LANGS,
    PBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, Toggle, TableHead, TableCard,
} from "../AdminComponents/ui";

const LIMIT = 10;

const DOC_CAT = {
    CHARTER:         { label: 'Ustav',                  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    LICENSE:         { label: 'Litsenziya',             color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    SELF_ASSESSMENT: { label: "O'z-o'zini baholash",    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    ORDER:           { label: 'Buyruq',                 color: C.brand,   bg: C.bBg,    border: C.bBdr    },
    REPORT:          { label: 'Hisobot',                color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
    OTHER:           { label: 'Boshqa',                 color: C.sub,     bg: C.bg,     border: C.border  },
};

/* ─── File type icon ──────────────────────────────────────────── */
function FileIcon({ url }) {
    const ext = (url || '').split('.').pop().toLowerCase();
    const colors = { pdf: '#ef4444', doc: '#2563eb', docx: '#2563eb' };
    const color  = colors[ext] || C.muted;
    return (
        <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: color + '18', border: `1px solid ${color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <span style={{ fontSize: 9, fontWeight: 800, color, textTransform: 'uppercase' }}>
                {ext || 'DOC'}
            </span>
        </div>
    );
}

/* ─── Create / Edit modal ─────────────────────────────────────── */
function DocForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const fileRef = useRef(null);

    const [form, setForm] = useState({
        title_latin: item?.title_latin || '',
        title_cyril: item?.title_cyril || '',
        title_ru:    item?.title_ru    || '',
        category:    item?.category    || 'OTHER',
        is_public:   item?.is_public   ?? true,
    });
    const [activeLang, setActiveLang] = useState('latin');
    const [docFile,    setDocFile]    = useState(null);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    /* focus tracking */
    const fRef = useRef({});
    const [, tick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; tick(n => n + 1); };
    const fc = k => !!fRef.current[k];

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        setErrors(p => ({ ...p, [k]: '' }));
    };

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
        if (f.size > 10 * 1024 * 1024) { setError('Fayl 10MB dan oshmasin'); return; }
        setDocFile(f); setError('');
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (!isEdit && !docFile)      errs.file        = 'Fayl majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const fd = new FormData();
            fd.append('title_latin', form.title_latin.trim());
            fd.append('title_cyril', form.title_cyril.trim());
            fd.append('title_ru',    form.title_ru.trim());
            fd.append('category',    form.category);
            fd.append('is_public',   String(form.is_public));
            if (docFile) fd.append('file', docFile);

            if (isEdit) {
                await $api.patch(`/api/documents/${item.id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await $api.post('/api/documents', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    const selectStyle = (hasErr) => ({
        width: '100%', padding: '8px 32px 8px 11px', borderRadius: 8,
        fontSize: 13, fontFamily: 'inherit', outline: 'none',
        background: C.bg, color: C.text, boxSizing: 'border-box',
        border: `1.5px solid ${hasErr ? C.red : C.border}`,
        cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    });

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Hujjatni tahrirlash' : 'Yangi hujjat'} onClose={onClose} width={680}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>

                    {/* ── LEFT: lang tabs ── */}
                    <div>
                        {/* tab bar */}
                        <div style={{
                            display: 'flex', background: C.bg,
                            borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}`,
                        }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const active = activeLang === key;
                                const done   = langDone[key];
                                const hasErr = !!errors[titleKey[key]];
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
                                        {done && !hasErr && (
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                                        )}
                                        {hasErr && (
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0 }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* tab body */}
                        <div style={{
                            border: `1px solid ${C.border}`, borderTop: 'none',
                            borderRadius: '0 0 10px 10px', padding: 14,
                        }}>
                            <Lbl req={activeLang === 'latin'}>
                                Sarlavha ({LANGS.find(l => l.key === activeLang)?.label})
                            </Lbl>
                            <input
                                type="text"
                                value={form[tk]}
                                onChange={e => set(tk, e.target.value)}
                                onFocus={() => sf(tk, true)}
                                onBlur={() => sf(tk, false)}
                                style={iStyle(fc(tk), !!errors[tk])}
                                placeholder="Hujjat sarlavhasi..."
                            />
                            {errors[tk] && (
                                <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[tk]}</div>
                            )}
                        </div>

                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {LANGS.map(({ key, flag, label }) => {
                                const done   = langDone[key];
                                const hasErr = !!errors[titleKey[key]];
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

                        {/* file upload */}
                        <div style={{
                            border: `1px solid ${errors.file ? C.rBdr : C.border}`,
                            borderRadius: 12, padding: 14,
                        }}>
                            <Lbl req={!isEdit}>Fayl (PDF, DOC, DOCX · max 10MB)</Lbl>

                            {docFile ? (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '8px 10px', borderRadius: 8,
                                    background: C.gBg, border: `1px solid ${C.gBdr}`,
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke={C.green} strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    <span style={{
                                        fontSize: 11, color: C.green, fontWeight: 600, flex: 1,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {docFile.name}
                                    </span>
                                    <button type="button"
                                        onClick={() => { setDocFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer',
                                            color: C.muted, fontSize: 16, lineHeight: 1, padding: 2 }}>
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {isEdit && item?.file_url && (
                                        <div style={{
                                            marginBottom: 8, padding: '6px 10px', borderRadius: 7,
                                            background: C.bg, border: `1px solid ${C.border}`,
                                            fontSize: 11, color: C.muted,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            📎 {item.file_url.split('/').pop()}
                                        </div>
                                    )}
                                    <div onClick={() => fileRef.current?.click()} style={{
                                        height: 80, borderRadius: 8, cursor: 'pointer',
                                        border: `2px dashed ${errors.file ? C.rBdr : C.border}`,
                                        background: C.bg,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', gap: 5,
                                        transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = errors.file ? C.rBdr : C.border; e.currentTarget.style.background = C.bg; }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                            stroke={C.brand} strokeWidth="1.8">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="17 8 12 3 7 8"/>
                                            <line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>
                                            {isEdit ? 'Yangi fayl tanlash' : 'Fayl yuklash'}
                                        </span>
                                        <span style={{ fontSize: 10, color: C.muted }}>PDF, DOC, DOCX</span>
                                    </div>
                                </>
                            )}
                            <input ref={fileRef} type="file"
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }} onChange={handleFile} />
                            {errors.file && (
                                <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>⚠ {errors.file}</div>
                            )}
                        </div>

                        {/* category */}
                        <div>
                            <Lbl req>Kategoriya</Lbl>
                            <select value={form.category} onChange={e => set('category', e.target.value)}
                                style={selectStyle(false)}>
                                {Object.entries(DOC_CAT).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* is_public toggle */}
                        <div style={{
                            border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600,
                                        color: form.is_public ? C.green : C.muted }}>
                                        {form.is_public ? '✓ Ochiq' : '○ Yashirin'}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                                        {form.is_public ? "Hammaga ko'rinadigan" : 'Faqat adminlarga'}
                                    </div>
                                </div>
                                <Toggle value={form.is_public} onChange={v => set('is_public', v)} />
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
                <MFooter onClose={onClose} onSave={handleSave} saving={saving}
                    label={isEdit ? 'Saqlash' : 'Yaratish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function AdminDocuments() {
    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
    const [catFilt,  setCatFilt]  = useState('');
    const [pubFilt,  setPubFilt]  = useState('');
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null);
    const [toggling, setToggling] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
            if (search.trim())  params.search    = search.trim();
            if (catFilt)        params.category  = catFilt;
            if (pubFilt !== '') params.is_public = pubFilt;
            const res = await $api.get('/api/documents/admin', { params });
            const d   = res.data;
            setItems(d?.data || d?.items || []);
            setTotal(d?.total || d?.meta?.total || 0);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }, [page, search, catFilt, pubFilt]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = useCallback(v => { setSearch(v); setPage(1); }, []);

    const handleTogglePublic = async item => {
        setToggling(p => ({ ...p, [item.id]: true }));
        try {
            await $api.patch(`/api/documents/${item.id}/public`, { is_public: !item.is_public });
            setItems(prev => prev.map(it =>
                it.id === item.id ? { ...it, is_public: !it.is_public } : it
            ));
        } catch { /**/ }
        finally { setToggling(p => ({ ...p, [item.id]: false })); }
    };

    const refresh = () => { setModal(null); fetchData(); };

    const selectSt = active => ({
        padding: '8px 32px 8px 12px', borderRadius: 9, fontSize: 13, fontWeight: 500,
        border: `1.5px solid ${active ? C.brand : C.border}`,
        background: active ? C.bBg : C.white, color: active ? C.brand : C.sub,
        outline: 'none', cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    });

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Hujjatlar" subtitle={`Jami: ${total} ta hujjat`}
                onAdd={() => setModal('create')} addLabel="Yangi hujjat" />

            {/* filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Sarlavha bo'yicha..." />

                {/* category select */}
                <select value={catFilt} onChange={e => { setCatFilt(e.target.value); setPage(1); }}
                    style={selectSt(!!catFilt)}>
                    <option value="">Kategoriya: Barchasi</option>
                    {Object.entries(DOC_CAT).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>

                {/* public filter pills */}
                <div style={{ display: 'flex', gap: 5 }}>
                    {[
                        { val: '',      label: 'Barchasi' },
                        { val: 'true',  label: '✓ Ochiq',    color: C.green, bg: C.gBg, border: C.gBdr  },
                        { val: 'false', label: '○ Yashirin', color: C.muted, bg: C.bg,  border: C.border },
                    ].map(opt => {
                        const active = pubFilt === opt.val;
                        return (
                            <button key={String(opt.val)} onClick={() => { setPubFilt(opt.val); setPage(1); }}
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

            {/* table */}
            <TableCard>
                <TableHead
                    gridCols="2.5fr 1fr 100px 90px 120px 130px"
                    cols={[
                        'Sarlavha', 'Kategoriya', 'Holat', 'Tur', 'Sana',
                        { label: '', right: true },
                    ]} />

                {loading ? <LoadingRow /> :
                 items.length === 0 ? <EmptyRow text="Hujjatlar topilmadi" /> : (
                    items.map((item, i) => {
                        const cat = DOC_CAT[item.category] || DOC_CAT.OTHER;
                        return (
                            <div key={item.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2.5fr 1fr 100px 90px 120px 130px',
                                alignItems: 'center', padding: '12px 18px',
                                borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none',
                                transition: 'background .1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                {/* title + icon */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <FileIcon url={item.file_url} />
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{
                                            fontSize: 13, fontWeight: 600, color: C.text, margin: 0,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {item.title_latin || item.title_cyril || '—'}
                                        </p>
                                        {item.file_url && (
                                            <a href={item.file_url} target="_blank" rel="noreferrer"
                                                style={{ fontSize: 11, color: C.blue, textDecoration: 'none' }}>
                                                Ko'rish ↗
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* category */}
                                <span>
                                    <StatusBadge label={cat.label} bg={cat.bg} color={cat.color} border={cat.border} />
                                </span>

                                {/* public badge */}
                                <span>
                                    <StatusBadge
                                        label={item.is_public ? 'Ochiq' : 'Yashirin'}
                                        bg={item.is_public ? C.gBg : C.bg}
                                        color={item.is_public ? C.green : C.muted}
                                        border={item.is_public ? C.gBdr : C.border} />
                                </span>

                                {/* file type */}
                                <span style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>
                                    {(item.file_url || '').split('.').pop().toUpperCase() || '—'}
                                </span>

                                {/* date */}
                                <span style={{ fontSize: 12, color: C.muted }}>
                                    {fmtDate(item.created_at)}
                                </span>

                                {/* actions */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                                    {/* toggle public */}
                                    <ABtn
                                        title={item.is_public ? 'Yashirish' : 'Ochiq qilish'}
                                        bg={item.is_public ? C.rBg : C.gBg}
                                        bdr={item.is_public ? C.rBdr : C.gBdr}
                                        color={item.is_public ? C.red : C.green}
                                        loading={toggling[item.id]}
                                        onClick={() => handleTogglePublic(item)}>
                                        {toggling[item.id] ? (
                                            <Spin size={11} color={item.is_public ? C.red : C.green} />
                                        ) : item.is_public ? (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2.5">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2.5">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </ABtn>
                                    {/* edit */}
                                    <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                        onClick={() => setModal({ type: 'edit', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </ABtn>
                                    {/* delete */}
                                    <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red}
                                        onClick={() => setModal({ type: 'delete', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                            <path d="M10 11v6"/><path d="M14 11v6"/>
                                        </svg>
                                    </ABtn>
                                </div>
                            </div>
                        );
                    })
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && (
                <DocForm onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'edit' && (
                <DocForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'delete' && (
                <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />
            )}
        </div>
    );
}

/* ─── Delete confirm ──────────────────────────────────────────── */
function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/documents/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm
            title="Hujjatni o'chirish"
            desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu hujjat'}</strong> o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
