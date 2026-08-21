import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { getLang, useLang } from "../utils/api";
import {
    C, Lbl, iStyle, taStyle, LANGS,
    PBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, Toggle, TableHead, TableCard,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Form modal ──────────────────────────────────────────────── */
function ReqDocForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [form, setForm] = useState({
        title_latin:       item?.title_latin       || '',
        title_cyril:       item?.title_cyril       || '',
        title_ru:          item?.title_ru          || '',
        description_latin: item?.description_latin || '',
        description_cyril: item?.description_cyril || '',
        description_ru:    item?.description_ru    || '',
        order:             item?.order             ?? 0,
        is_active:         item?.is_active         ?? true,
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
        latin: { title: 'title_latin', desc: 'description_latin' },
        cyril: { title: 'title_cyril', desc: 'description_cyril' },
        ru:    { title: 'title_ru',    desc: 'description_ru'    },
    }[activeLang];

    const titleKey = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };

    const langDone = {
        latin: form.title_latin.trim().length > 0,
        cyril: form.title_cyril.trim().length > 0,
        ru:    form.title_ru.trim().length > 0,
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const payload = { ...form, order: Number(form.order) };
            if (isEdit) await $api.patch(`/api/required-documents/${item.id}`, payload);
            else        await $api.post('/api/required-documents', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Hujjatni tahrirlash' : 'Yangi talab qilinadigan hujjat'} onClose={onClose} width={700}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>

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
                        <div style={{ border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <Lbl req={activeLang === 'latin'}>Sarlavha ({LANGS.find(l => l.key === activeLang)?.label})</Lbl>
                                <input type="text" value={form[lk.title]}
                                    onChange={e => set(lk.title, e.target.value)}
                                    onFocus={() => sf(lk.title, true)} onBlur={() => sf(lk.title, false)}
                                    style={iStyle(fc(lk.title), !!errors[lk.title])}
                                    placeholder="Hujjat nomi..." />
                                {errors[lk.title] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk.title]}</div>}
                            </div>
                            <div>
                                <Lbl>Tavsif</Lbl>
                                <textarea rows={5} value={form[lk.desc]}
                                    onChange={e => set(lk.desc, e.target.value)}
                                    onFocus={() => sf(lk.desc, true)} onBlur={() => sf(lk.desc, false)}
                                    style={taStyle(fc(lk.desc))}
                                    placeholder="Hujjat haqida qo'shimcha ma'lumot..." />
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
                    </div>

                    {/* RIGHT — meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* order */}
                        <div>
                            <Lbl>Tartib raqami</Lbl>
                            <input type="number" value={form.order} min={0}
                                onChange={e => set('order', e.target.value)}
                                onFocus={() => sf('order', true)} onBlur={() => sf('order', false)}
                                style={iStyle(fc('order'))}
                                placeholder="0, 1, 2..." />
                            <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                                Kichik raqam yuqorida ko'rinadi
                            </p>
                        </div>

                        {/* is_active */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? C.green : C.muted }}>
                                    {form.is_active ? '✓ Faol' : '○ Nofaol'}
                                </span>
                                <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
                            </div>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                {form.is_active ? "Qabul sahifasida ko'rinadi" : 'Yashirilgan'}
                            </p>
                        </div>

                        {error && (
                            <div style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
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
export default function RequiredDocuments() {
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
                const params = { page, limit: LIMIT, sortBy: 'order', sortOrder: 'asc' };
                if (search.trim()) params.search = search.trim();
                const res = await $api.get('/api/required-documents/admin', { params });
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
            <PageHeader title="Qabul Hujjatlari" subtitle={`Jami: ${total} ta hujjat`}
                onAdd={() => setModal('create')} addLabel="Yangi hujjat" />

            <div style={{ marginBottom: 14 }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Sarlavha bo'yicha..." />
            </div>

            <TableCard>
                <TableHead
                    gridCols="50px 2fr 2fr 100px 80px"
                    cols={['#', 'Sarlavha (Lotin)', 'Sarlavha (Rus)', 'Holat', { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Hujjatlar topilmadi" /> : (
                    items.map((item, i) => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '50px 2fr 2fr 100px 80px', alignItems: 'center', padding: '12px 18px', borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none', transition: 'background .1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                            {/* order */}
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.muted, textAlign: 'center' }}>
                                {item.order ?? i + 1}
                            </span>

                            {/* latin title */}
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getLang(item, 'title', lang) || '—'}
                                </p>
                                {getLang(item, 'description', lang) && (
                                    <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {getLang(item, 'description', lang)}
                                    </p>
                                )}
                            </div>

                            {/* ru title */}
                            <span style={{ fontSize: 12, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.title_ru || '—'}
                            </span>

                            {/* status */}
                            <StatusBadge
                                label={item.is_active ? 'Faol' : 'Nofaol'}
                                bg={item.is_active ? C.gBg : C.bg}
                                color={item.is_active ? C.green : C.muted}
                                border={item.is_active ? C.gBdr : C.border} />

                            {/* actions */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                                <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                    onClick={() => setModal({ type: 'edit', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </ABtn>
                                <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red}
                                    onClick={() => setModal({ type: 'delete', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                </ABtn>
                            </div>
                        </div>
                    ))
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <ReqDocForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <ReqDocForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => { setLoading(true); try { await $api.delete(`/api/required-documents/${item.id}`); onDeleted(); } catch { /**/ } finally { setLoading(false); } };
    return <DeleteConfirm title="Hujjatni o'chirish" desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu hujjat'}</strong> o'chiriladi.</>} onClose={onClose} onConfirm={confirm} loading={loading} />;
}
