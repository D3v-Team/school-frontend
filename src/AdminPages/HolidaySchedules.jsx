import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { useLang } from "../utils/api";
import {
    C, fmtDate, Lbl, iStyle, taStyle, LANGS,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, LoadingRow, EmptyRow, PageHeader, Pagination,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Form ────────────────────────────────────────────────────── */
function HolidayForm({ item, onClose, onSaved }) {
    const isEdit = !!item;
    const [form, setForm] = useState({
        title_latin:       item?.title_latin       || '',
        title_cyril:       item?.title_cyril       || '',
        title_ru:          item?.title_ru          || '',
        start_date:        item?.start_date        || '',
        end_date:          item?.end_date          || '',
        description_latin: item?.description_latin || '',
        description_cyril: item?.description_cyril || '',
        description_ru:    item?.description_ru    || '',
    });
    const [activeLang, setActiveLang] = useState('latin');
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState('');
    const [errors, setErrors] = useState({});

    const fRef = useRef({});
    const [, tick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; tick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const lk = {
        latin: { title: 'title_latin', desc: 'description_latin' },
        cyril: { title: 'title_cyril', desc: 'description_cyril' },
        ru:    { title: 'title_ru',    desc: 'description_ru'    },
    };
    const langDone = {
        latin: !!form.title_latin.trim(),
        cyril: !!form.title_cyril.trim(),
        ru:    !!form.title_ru.trim(),
    };

    const handleSave = async () => {
        const errs = {};
        if (!form.title_latin.trim()) errs.title_latin = 'Majburiy';
        if (!form.start_date)         errs.start_date  = 'Majburiy';
        if (!form.end_date)           errs.end_date    = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true); setError('');
        try {
            const payload = {};
            ['title_latin','title_cyril','title_ru','description_latin','description_cyril','description_ru','start_date','end_date']
                .forEach(k => { if (form[k]) payload[k] = form[k]; });
            if (isEdit) await $api.patch(`/api/holiday-schedules/${item.id}`, payload);
            else        await $api.post('/api/holiday-schedules', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Ta\'tilni tahrirlash' : 'Yangi ta\'til'} onClose={onClose} width={660}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                        <Lbl req>Boshlanish sanasi</Lbl>
                        <input type="date" value={form.start_date}
                            onChange={e => set('start_date', e.target.value)}
                            onFocus={() => sf('sd', true)} onBlur={() => sf('sd', false)}
                            style={iStyle(fc('sd'), !!errors.start_date)} />
                        {errors.start_date && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.start_date}</div>}
                    </div>
                    <div>
                        <Lbl req>Tugash sanasi</Lbl>
                        <input type="date" value={form.end_date}
                            onChange={e => set('end_date', e.target.value)}
                            onFocus={() => sf('ed', true)} onBlur={() => sf('ed', false)}
                            style={iStyle(fc('ed'), !!errors.end_date)} />
                        {errors.end_date && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.end_date}</div>}
                    </div>
                </div>

                {/* Lang tabs */}
                <div style={{ display: 'flex', background: C.bg, borderRadius: '10px 10px 0 0', borderBottom: `1px solid ${C.border}` }}>
                    {LANGS.map(({ key, flag, label }) => {
                        const active = activeLang === key;
                        const done   = langDone[key];
                        const hasErr = !!errors[lk[key].title];
                        return (
                            <button key={key} type="button" onClick={() => setActiveLang(key)}
                                style={{ flex: 1, padding: '10px 6px', border: 'none', borderRadius: active ? '10px 10px 0 0' : 0, background: active ? C.white : 'transparent', fontSize: 12, fontWeight: active ? 700 : 500, color: hasErr ? C.red : active ? C.brand : C.sub, borderBottom: `2.5px solid ${active ? C.brand : 'transparent'}`, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                {flag} {label}
                                {done && !hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />}
                                {hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red }} />}
                            </button>
                        );
                    })}
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <Lbl req={activeLang === 'latin'}>Sarlavha</Lbl>
                        <input type="text" value={form[lk[activeLang].title]}
                            onChange={e => set(lk[activeLang].title, e.target.value)}
                            onFocus={() => sf(lk[activeLang].title, true)} onBlur={() => sf(lk[activeLang].title, false)}
                            style={iStyle(fc(lk[activeLang].title), !!errors[lk[activeLang].title])}
                            placeholder="Ta'til nomi..." />
                        {errors[lk[activeLang].title] && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk[activeLang].title]}</div>}
                    </div>
                    <div>
                        <Lbl>Tavsif</Lbl>
                        <textarea rows={4} value={form[lk[activeLang].desc]}
                            onChange={e => set(lk[activeLang].desc, e.target.value)}
                            onFocus={() => sf(lk[activeLang].desc, true)} onBlur={() => sf(lk[activeLang].desc, false)}
                            style={taStyle(fc(lk[activeLang].desc))}
                            placeholder="Qo'shimcha ma'lumot..." />
                    </div>
                </div>

                {/* lang strip */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {LANGS.map(({ key, flag, label }) => (
                        <div key={key} onClick={() => setActiveLang(key)} style={{ flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', border: `1px solid ${errors[lk[key].title] ? C.rBdr : langDone[key] ? C.gBdr : C.border}`, background: errors[lk[key].title] ? C.rBg : langDone[key] ? C.gBg : C.bg }}>
                            <div style={{ fontSize: 14 }}>{flag}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: errors[lk[key].title] ? C.red : langDone[key] ? C.green : C.muted }}>
                                {errors[lk[key].title] ? '⚠' : langDone[key] ? '✓' : label}
                            </div>
                        </div>
                    ))}
                </div>

                {error && <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>⚠ {error}</div>}
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Qo\'shish'} />
            </MBox>
        </Overlay>
    );
}

/* ─── Duration badge ──────────────────────────────────────────── */
function durationDays(start, end) {
    if (!start || !end) return null;
    const s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e)) return null;
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function HolidaySchedules() {
    const lang = useLang();
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);
    const [tick,    setTick]    = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await $api.get('/api/holiday-schedules', { params: { page, limit: LIMIT } });
                const d   = res.data;
                if (!cancelled) {
                    setItems(d?.data || d?.items || d || []);
                    setTotal(d?.total || d?.meta?.total || 0);
                }
            } catch { if (!cancelled) setItems([]); }
            finally { if (!cancelled) setLoading(false); }
        };
        load();
        return () => { cancelled = true; };
    }, [page, tick]);

    const refresh = () => { setModal(null); setTick(t => t + 1); };
    const titleKey = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };
    const descKey  = { latin: 'description_latin', cyril: 'description_cyril', ru: 'description_ru' };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Ta'til jadvali" subtitle={`Jami: ${total} ta ta'til`}
                onAdd={() => setModal('create')} addLabel="Yangi ta'til" />

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Ta'tillar topilmadi" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((item) => {
                        const days = durationDays(item.start_date, item.end_date);
                        const now  = new Date();
                        const s    = new Date(item.start_date);
                        const e    = new Date(item.end_date);
                        const active = now >= s && now <= e;
                        const future = now < s;
                        return (
                            <div key={item.id} style={{ background: C.white, border: `1px solid ${active ? C.brand + '44' : C.border}`, borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 16, transition: 'box-shadow .15s', boxShadow: active ? `0 0 0 2px ${C.bBdr}` : 'none' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = active ? `0 0 0 2px ${C.bBdr}` : 'none'}>
                                {/* date column */}
                                <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 80 }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: active ? C.brand : C.text, lineHeight: 1 }}>
                                        {new Date(item.start_date).getDate()}
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
                                        {new Date(item.start_date).toLocaleString('uz-UZ', { month: 'short' })}
                                    </div>
                                    {item.end_date !== item.start_date && (
                                        <>
                                            <div style={{ fontSize: 10, color: C.muted, margin: '3px 0 2px' }}>—</div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>
                                                {new Date(item.end_date).getDate()} {new Date(item.end_date).toLocaleString('uz-UZ', { month: 'short' })}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>
                                            {item[titleKey[lang]] || item.title_latin || 'Sarlavsiz'}
                                        </h3>
                                        {active && (
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: C.bBg, color: C.brand, border: `1px solid ${C.bBdr}`, textTransform: 'uppercase' }}>Hozir</span>
                                        )}
                                        {future && (
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: C.gBg, color: C.green, border: `1px solid ${C.gBdr}`, textTransform: 'uppercase' }}>Kutilmoqda</span>
                                        )}
                                        {!active && !future && (
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, textTransform: 'uppercase' }}>O'tdi</span>
                                        )}
                                        {days && (
                                            <span style={{ fontSize: 11, color: C.muted }}>{days} kun</span>
                                        )}
                                    </div>
                                    {item[descKey[lang]] && (
                                        <p style={{ fontSize: 12, color: C.sub, margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item[descKey[lang]]}
                                        </p>
                                    )}
                                </div>

                                {/* actions */}
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand} onClick={() => setModal({ type: 'edit', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </ABtn>
                                    <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red} onClick={() => setModal({ type: 'delete', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                    </ABtn>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <HolidayForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <HolidayForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/holiday-schedules/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return <DeleteConfirm title="Ta'tilni o'chirish"
        desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu ta\'til'}</strong> o'chiriladi.</>}
        onClose={onClose} onConfirm={confirm} loading={loading} />;
}
