import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { getLang, useLang } from "../utils/api";
import RichBox from "../AdminComponents/RichBox";
import {
    C, Lbl, iStyle, taStyle, LANGS,
    ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow,
    PageHeader, TableHead, TableCard,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Pages form modal ────────────────────────────────────────── */
function PageForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [form, setForm] = useState({
        slug:          item?.slug          || '',
        title_latin:   item?.title_latin   || '',
        title_cyril:   item?.title_cyril   || '',
        title_ru:      item?.title_ru      || '',
        content_latin: item?.content_latin || '',
        content_cyril: item?.content_cyril || '',
        content_ru:    item?.content_ru    || '',
    });
    const [activeLang, setActiveLang] = useState('latin');
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const lk = {
        latin: { title: 'title_latin', content: 'content_latin' },
        cyril: { title: 'title_cyril', content: 'content_cyril' },
        ru:    { title: 'title_ru',    content: 'content_ru'    },
    }[activeLang];

    const langDone = {
        latin: form.title_latin.trim().length > 0,
        cyril: form.title_cyril.trim().length > 0,
        ru:    form.title_ru.trim().length > 0,
    };

    const titleKey = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (!form.slug.trim())        errs.slug        = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const payload = { ...form };
            if (isEdit) await $api.patch(`/api/pages/${item.id}`, payload);
            else        await $api.post('/api/pages', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Sahifani tahrirlash' : 'Yangi sahifa'} onClose={onClose} width={720}>
                {/* slug — select for create, readonly for edit */}
                <div style={{ marginBottom: 14 }}>
                    <Lbl req>Sahifa turi (Slug)</Lbl>
                    {isEdit ? (
                        <div style={{ padding: '9px 12px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, fontFamily: 'monospace', fontWeight: 700 }}>
                            {form.slug}
                            <span style={{ fontSize: 11, color: C.muted, marginLeft: 8, fontFamily: 'inherit', fontWeight: 400 }}>O'zgartirib bo'lmaydi</span>
                        </div>
                    ) : (
                        <>
                            <select value={form.slug} onChange={e => set('slug', e.target.value)}
                                style={{
                                    width: '100%', padding: '9px 32px 9px 12px', borderRadius: 8,
                                    fontSize: 13, fontFamily: 'inherit', outline: 'none',
                                    background: C.bg, color: form.slug ? C.text : C.muted,
                                    boxSizing: 'border-box',
                                    border: `1.5px solid ${errors.slug ? C.red : C.border}`,
                                    cursor: 'pointer', appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                                }}>
                                <option value="">Sahifani tanlang...</option>
                                <option value="ABOUT">Biz haqimizda (ABOUT)</option>
                                <option value="CONTACT">Aloqa (CONTACT)</option>
                                <option value="ADMISSIONS">Qabul (ADMISSIONS)</option>
                                <option value="MISSION">Missiya (MISSION)</option>
                                <option value="VISION">Vizyon (VISION)</option>
                                <option value="HISTORY">Tarix (HISTORY)</option>
                                <option value="RULES">Qoidalar (RULES)</option>
                                <option value="PRIVACY">Maxfiylik (PRIVACY)</option>
                                <option value="FAQ">Ko'p so'raladigan savollar (FAQ)</option>
                                <option value="ANTI_CORRUPTION">Korrupsiyaga qarshi (ANTI_CORRUPTION)</option>
                                <option value="OTHER">Boshqa (OTHER)</option>
                            </select>
                            {errors.slug && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.slug}</div>}
                        </>
                    )}
                </div>

                {/* lang tabs */}
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
                <div style={{ border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <Lbl req={activeLang === 'latin'}>Sarlavha ({LANGS.find(l => l.key === activeLang)?.label})</Lbl>
                        <input type="text" value={form[lk.title]}
                            onChange={e => set(lk.title, e.target.value)}
                            onFocus={() => sf(lk.title, true)} onBlur={() => sf(lk.title, false)}
                            style={iStyle(fc(lk.title), !!errors[lk.title])}
                            placeholder="Sahifa sarlavhasi..." />
                        {errors[lk.title] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk.title]}</div>}
                    </div>
                    <div>
                        <Lbl>Kontent</Lbl>
                        <RichBox value={form[lk.content]} onChange={value => set(lk.content, value)} />
                    </div>
                    {/* char count */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Sarlavha: <b style={{ color: C.sub }}>{form[lk.title].length}</b></span>
                        <span style={{ fontSize: 11, color: C.muted }}>Kontent: <b style={{ color: C.sub }}>{form[lk.content].length}</b></span>
                    </div>
                </div>

                {/* lang strip */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {LANGS.map(({ key, flag, label }) => {
                        const done = langDone[key]; const hasErr = !!errors[titleKey[key]];
                        return (
                            <div key={key} onClick={() => setActiveLang(key)} style={{ flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', border: `1px solid ${hasErr ? C.rBdr : done ? C.gBdr : C.border}`, background: hasErr ? C.rBg : done ? C.gBg : C.bg }}>
                                <div style={{ fontSize: 14 }}>{flag}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: hasErr ? C.red : done ? C.green : C.muted }}>{hasErr ? '⚠ Xato' : done ? '✓ Tayyor' : label}</div>
                            </div>
                        );
                    })}
                </div>

                {error && <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>⚠ {error}</div>}
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Yaratish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminPagesPage() {
    const lang = useLang();
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);

    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await $api.get('/api/pages', { params: { page, limit: LIMIT } });
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
    const refresh = () => { setModal(null); setTick(t => t + 1); };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Sahifalar" subtitle={`Jami: ${total} ta sahifa`}
                onAdd={() => setModal('create')} addLabel="Yangi sahifa" />

            <div style={{ marginBottom: 14 }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Sarlavha yoki slug bo'yicha..." />
            </div>

            <TableCard>
                <TableHead gridCols="1fr 2fr 2fr 90px"
                    cols={['Slug', 'Sarlavha (Lotin)', 'Sarlavha (Rus)', { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Sahifalar topilmadi" /> : (
                    items.map((item, i) => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 90px', alignItems: 'center', padding: '12px 18px', borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none', transition: 'background .1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.brand, fontFamily: 'monospace' }}>
                                {item.slug || '—'}
                            </span>
                            <span style={{ fontSize: 13, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.title_latin || '—'}
                                                            {getLang(item, 'title', lang) || '—'}
                            </span>
                            <span style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.title_ru || '—'}
                                                            {getLang(item, 'content', lang)?.replace(/<[^>]+>/g, '').slice(0, 80) || '—'}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                                <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand} onClick={() => setModal({ type: 'edit', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </ABtn>
                                <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red} onClick={() => setModal({ type: 'delete', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                </ABtn>
                            </div>
                        </div>
                    ))
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <PageForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <PageForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => { setLoading(true); try { await $api.delete(`/api/pages/${item.id}`); onDeleted(); } catch { /**/ } finally { setLoading(false); } };
    return <DeleteConfirm title="Sahifani o'chirish" desc={<><strong style={{ color: C.text }}>{item.slug || item.title_latin}</strong> sahifasi o'chiriladi.</>} onClose={onClose} onConfirm={confirm} loading={loading} />;
}
