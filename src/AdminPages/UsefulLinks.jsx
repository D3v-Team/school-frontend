import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { getLang, mediaUrl, useLang } from "../utils/api";
import {
    C, Lbl, iStyle, LANGS,
    ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow,
    PageHeader, StatusBadge, Toggle, TableHead, TableCard,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Form modal ──────────────────────────────────────────────── */
function LinkForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [form, setForm] = useState({
        title_latin: item?.title_latin || '',
        title_cyril: item?.title_cyril || '',
        title_ru:    item?.title_ru    || '',
        url:         item?.url         || '',
        icon:        item?.icon        || '',
        order:       item?.order       ?? 0,
        is_active:   item?.is_active   ?? true,
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

    const titleKey = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };
    const tk = titleKey[activeLang];

    const langDone = {
        latin: form.title_latin.trim().length > 0,
        cyril: form.title_cyril.trim().length > 0,
        ru:    form.title_ru.trim().length > 0,
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (!form.url.trim())         errs.url         = 'URL majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const payload = {
                title_latin: form.title_latin.trim(),
                title_cyril: form.title_cyril.trim(),
                title_ru:    form.title_ru.trim(),
                url:         form.url.trim(),
                icon:        form.icon.trim(),
                order:       Number(form.order),
                is_active:   form.is_active,
            };
            if (isEdit) await $api.patch(`/api/useful-links/${item.id}`, payload);
            else        await $api.post('/api/useful-links', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Havolani tahrirlash' : 'Yangi havola'} onClose={onClose} width={660}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16 }}>

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
                                placeholder="Havola sarlavhasi..." />
                            {errors[tk] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[tk]}</div>}
                        </div>

                        {/* lang strip */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, marginBottom: 14 }}>
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

                        {/* URL */}
                        <div>
                            <Lbl req>URL manzil</Lbl>
                            <input type="url" value={form.url}
                                onChange={e => set('url', e.target.value)}
                                onFocus={() => sf('url', true)} onBlur={() => sf('url', false)}
                                style={iStyle(fc('url'), !!errors.url)}
                                placeholder="https://..." />
                            {errors.url && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.url}</div>}
                        </div>
                    </div>

                    {/* RIGHT — meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* icon */}
                        <div>
                            <Lbl>Icon (emoji yoki URL)</Lbl>
                            <input type="text" value={form.icon}
                                onChange={e => set('icon', e.target.value)}
                                onFocus={() => sf('icon', true)} onBlur={() => sf('icon', false)}
                                style={iStyle(fc('icon'))}
                                placeholder="🔗 yoki https://..." />
                            {form.icon && (
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 11, color: C.muted }}>Ko'rinishi:</span>
                                    {form.icon.startsWith('http') || form.icon.startsWith('/') ? (
                                        <img src={mediaUrl(form.icon)} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: 20 }}>{form.icon}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* order */}
                        <div>
                            <Lbl>Tartib raqami</Lbl>
                            <input type="number" value={form.order} min={0}
                                onChange={e => set('order', e.target.value)}
                                onFocus={() => sf('order', true)} onBlur={() => sf('order', false)}
                                style={iStyle(fc('order'))}
                                placeholder="0, 1, 2..." />
                        </div>

                        {/* is_active */}
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? C.green : C.muted }}>
                                        {form.is_active ? '✓ Faol' : '○ Nofaol'}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                                        {form.is_active ? "Ko'rinadigan" : 'Yashirilgan'}
                                    </div>
                                </div>
                                <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
                            </div>
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
export default function UsefulLinks() {
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
                const res = await $api.get('/api/useful-links/all', { params });
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
            <PageHeader title="Foydali Linklar" subtitle={`Jami: ${total} ta havola`}
                onAdd={() => setModal('create')} addLabel="Yangi havola" />

            <div style={{ marginBottom: 14 }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Sarlavha bo'yicha..." />
            </div>

            <TableCard>
                <TableHead
                    gridCols="50px 44px 2fr 2fr 100px 80px 80px"
                    cols={['#', 'Icon', 'Sarlavha', 'URL', 'Holat', 'Sana', { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Havolalar topilmadi" /> : (
                    items.map((item, i) => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '50px 44px 2fr 2fr 100px 80px 80px', alignItems: 'center', padding: '10px 18px', borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none', transition: 'background .1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                            {/* order */}
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textAlign: 'center' }}>
                                {item.order ?? i + 1}
                            </span>

                            {/* icon */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.icon ? (
                                    item.icon.startsWith('http') || item.icon.startsWith('/') ? (
                                        <img src={mediaUrl(item.icon)} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                                    )
                                ) : (
                                    <span style={{ fontSize: 16, color: C.muted }}>—</span>
                                )}
                            </div>

                            {/* title */}
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {getLang(item, 'title', lang) || '—'}
                            </span>

                            {/* url */}
                            <a href={item.url} target="_blank" rel="noreferrer"
                                style={{ fontSize: 12, color: C.blue, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                {item.url || '—'}
                            </a>

                            {/* status */}
                            <StatusBadge
                                label={item.is_active ? 'Faol' : 'Nofaol'}
                                bg={item.is_active ? C.gBg : C.bg}
                                color={item.is_active ? C.green : C.muted}
                                border={item.is_active ? C.gBdr : C.border} />

                            {/* date — short */}
                            <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                                {item.created_at
                                    ? `${new Date(item.created_at).getDate()} ${new Date(item.created_at).toLocaleString('en-US', { month: 'short' })}`
                                    : '—'}
                            </span>

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

            {modal === 'create' && <LinkForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <LinkForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/useful-links/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm
            title="Havolani o'chirish"
            desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu havola'}</strong> o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
