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
function MeetingForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [form, setForm] = useState({
        title_latin:       item?.title_latin       || '',
        title_cyril:       item?.title_cyril       || '',
        title_ru:          item?.title_ru          || '',
        description_latin: item?.description_latin || '',
        description_cyril: item?.description_cyril || '',
        description_ru:    item?.description_ru    || '',
        grade:             item?.grade             || '',
        meeting_date:      item?.meeting_date
            ? item.meeting_date.slice(0, 16)
            : '',
        location:          item?.location          || '',
    });
    const [activeLang, setActiveLang] = useState('latin');
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [errors,     setErrors]     = useState({});

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
        if (!form.title_latin.trim()) errs.title_latin   = 'Majburiy';
        if (!form.meeting_date)       errs.meeting_date  = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true); setError('');
        try {
            const payload = {};
            [
                'title_latin','title_cyril','title_ru',
                'description_latin','description_cyril','description_ru',
                'grade','location',
            ].forEach(k => { if (form[k].trim()) payload[k] = form[k].trim(); });

            if (form.meeting_date) payload.meeting_date = form.meeting_date;

            if (isEdit) await $api.patch(`/api/meetings/${item.id}`, payload);
            else        await $api.post('/api/meetings', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox
                title={isEdit ? 'Uchrashuvni tahrirlash' : 'Yangi uchrashuv'}
                onClose={onClose}
                width={680}
            >
                {/* ── Row 1: date / grade / location ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                        <Lbl req>Sana va vaqt</Lbl>
                        <input
                            type="datetime-local"
                            value={form.meeting_date}
                            onChange={e => set('meeting_date', e.target.value)}
                            onFocus={() => sf('md', true)}
                            onBlur={() => sf('md', false)}
                            style={iStyle(fc('md'), !!errors.meeting_date)}
                        />
                        {errors.meeting_date && (
                            <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.meeting_date}</div>
                        )}
                    </div>
                    <div>
                        <Lbl>Sinf</Lbl>
                        <input
                            type="text"
                            value={form.grade}
                            onChange={e => set('grade', e.target.value)}
                            onFocus={() => sf('gr', true)}
                            onBlur={() => sf('gr', false)}
                            style={iStyle(fc('gr'))}
                            placeholder="5A, 7B ..."
                        />
                    </div>
                    <div>
                        <Lbl>Manzil / Xona</Lbl>
                        <input
                            type="text"
                            value={form.location}
                            onChange={e => set('location', e.target.value)}
                            onFocus={() => sf('loc', true)}
                            onBlur={() => sf('loc', false)}
                            style={iStyle(fc('loc'))}
                            placeholder="Aktiv zal, 12-xona ..."
                        />
                    </div>
                </div>

                {/* ── Lang tabs ── */}
                <div style={{
                    display: 'flex',
                    background: C.bg,
                    borderRadius: '10px 10px 0 0',
                    borderBottom: `1px solid ${C.border}`,
                }}>
                    {LANGS.map(({ key, flag, label }) => {
                        const active = activeLang === key;
                        const done   = langDone[key];
                        const hasErr = !!errors[lk[key].title];
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
                                {done && !hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />}
                                {hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red }} />}
                            </button>
                        );
                    })}
                </div>

                <div style={{
                    border: `1px solid ${C.border}`, borderTop: 'none',
                    borderRadius: '0 0 10px 10px', padding: 14,
                    display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                    <div>
                        <Lbl req={activeLang === 'latin'}>Sarlavha</Lbl>
                        <input
                            type="text"
                            value={form[lk[activeLang].title]}
                            onChange={e => set(lk[activeLang].title, e.target.value)}
                            onFocus={() => sf(lk[activeLang].title, true)}
                            onBlur={() => sf(lk[activeLang].title, false)}
                            style={iStyle(fc(lk[activeLang].title), !!errors[lk[activeLang].title])}
                            placeholder="Uchrashuv nomi..."
                        />
                        {errors[lk[activeLang].title] && (
                            <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors[lk[activeLang].title]}</div>
                        )}
                    </div>
                    <div>
                        <Lbl>Tavsif</Lbl>
                        <textarea
                            rows={4}
                            value={form[lk[activeLang].desc]}
                            onChange={e => set(lk[activeLang].desc, e.target.value)}
                            onFocus={() => sf(lk[activeLang].desc, true)}
                            onBlur={() => sf(lk[activeLang].desc, false)}
                            style={taStyle(fc(lk[activeLang].desc))}
                            placeholder="Qo'shimcha ma'lumot..."
                        />
                    </div>
                </div>

                {/* ── Lang completion strip ── */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {LANGS.map(({ key, flag, label }) => (
                        <div key={key} onClick={() => setActiveLang(key)} style={{
                            flex: 1, padding: '6px 8px', borderRadius: 8,
                            textAlign: 'center', cursor: 'pointer',
                            border: `1px solid ${errors[lk[key].title] ? C.rBdr : langDone[key] ? C.gBdr : C.border}`,
                            background: errors[lk[key].title] ? C.rBg : langDone[key] ? C.gBg : C.bg,
                        }}>
                            <div style={{ fontSize: 14 }}>{flag}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: errors[lk[key].title] ? C.red : langDone[key] ? C.green : C.muted }}>
                                {errors[lk[key].title] ? '⚠' : langDone[key] ? '✓' : label}
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
                        ⚠ {error}
                    </div>
                )}
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Qo\'shish'} />
            </MBox>
        </Overlay>
    );
}

/* ─── Status helpers ──────────────────────────────────────────── */
function getStatus(dateStr) {
    if (!dateStr) return 'unknown';
    const d = new Date(dateStr);
    if (isNaN(d)) return 'unknown';
    const now = new Date();
    const diff = d - now;
    if (diff < 0) return 'past';
    if (diff < 1000 * 60 * 60 * 24) return 'today';
    return 'upcoming';
}
const STATUS_MAP = {
    today:   { label: 'Bugun',       bg: '#fff7ed', color: '#ea6c0a', bdr: '#fed7aa' },
    upcoming:{ label: 'Kutilmoqda',  bg: '#f0fdf4', color: '#16a34a', bdr: '#bbf7d0' },
    past:    { label: "O'tdi",       bg: '#f8fafc', color: '#94a3b8', bdr: '#e2e8f0' },
    unknown: { label: '',            bg: '#f8fafc', color: '#94a3b8', bdr: '#e2e8f0' },
};

function fmtDateTime(str) {
    if (!str) return '—';
    const d = new Date(str);
    if (isNaN(d)) return str;
    const day   = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('uz-UZ', { month: 'short' });
    const year  = d.getFullYear();
    const hh    = String(d.getHours()).padStart(2, '0');
    const mm    = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hh}:${mm}`;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Meetings() {
    const lang    = useLang();
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
                const res = await $api.get('/api/meetings', {
                    params: { page, limit: LIMIT },
                });
                const d = res.data;
                if (!cancelled) {
                    setItems(d?.data || d?.items || d || []);
                    setTotal(d?.total || d?.meta?.total || 0);
                }
            } catch { if (!cancelled) setItems([]); }
            finally  { if (!cancelled) setLoading(false); }
        };
        load();
        return () => { cancelled = true; };
    }, [page, tick]);

    const refresh = () => { setModal(null); setTick(t => t + 1); };

    const titleKey = { latin: 'title_latin', cyril: 'title_cyril', ru: 'title_ru' };
    const descKey  = { latin: 'description_latin', cyril: 'description_cyril', ru: 'description_ru' };

    const filtered = search.trim()
        ? items.filter(i =>
            (i.title_latin || '').toLowerCase().includes(search.toLowerCase()) ||
            (i.grade || '').toLowerCase().includes(search.toLowerCase()) ||
            (i.location || '').toLowerCase().includes(search.toLowerCase())
          )
        : items;

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader
                title="Ota-ona uchrashuvlari"
                subtitle={`Jami: ${total} ta uchrashuv`}
                onAdd={() => setModal('create')}
                addLabel="Yangi uchrashuv"
            />

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Sarlavha, sinf yoki manzil bo'yicha..."
            />

            {loading ? <LoadingRow /> : filtered.length === 0 ? <EmptyRow text="Uchrashuvlar topilmadi" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(item => {
                        const status = getStatus(item.meeting_date);
                        const ss     = STATUS_MAP[status];
                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: C.white,
                                    border: `1px solid ${status === 'today' ? C.bBdr : C.border}`,
                                    borderRadius: 12,
                                    padding: '14px 16px',
                                    marginTop: 6,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 14,
                                    transition: 'box-shadow .15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                {/* ── Date block ── */}
                                <div style={{
                                    flexShrink: 0, textAlign: 'center', minWidth: 56,
                                    padding: '8px 0',
                                    borderRight: `1px solid ${C.border}`, paddingRight: 14,
                                }}>
                                    {item.meeting_date ? (
                                        <>
                                            <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, color: status === 'past' ? C.muted : C.brand }}>
                                                {new Date(item.meeting_date).getDate()}
                                            </div>
                                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: C.muted, marginTop: 2 }}>
                                                {new Date(item.meeting_date).toLocaleString('uz-UZ', { month: 'short' })}
                                            </div>
                                            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                                                {String(new Date(item.meeting_date).getHours()).padStart(2,'0')}:
                                                {String(new Date(item.meeting_date).getMinutes()).padStart(2,'0')}
                                            </div>
                                        </>
                                    ) : (
                                        <span style={{ fontSize: 20 }}>📅</span>
                                    )}
                                </div>

                                {/* ── Content ── */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* title row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>
                                            {item[titleKey[lang]] || item.title_latin || 'Sarlavsiz'}
                                        </h3>
                                        {ss.label && (
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: ss.bg, color: ss.color, border: `1px solid ${ss.bdr}`, textTransform: 'uppercase' }}>
                                                {ss.label}
                                            </span>
                                        )}
                                        {item.grade && (
                                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                                                {item.grade}-sinf
                                            </span>
                                        )}
                                    </div>

                                    {/* description */}
                                    {item[descKey[lang]] && (
                                        <p style={{ fontSize: 12, color: C.sub, margin: '0 0 6px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item[descKey[lang]]}
                                        </p>
                                    )}

                                    {/* meta row */}
                                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
                                        {item.meeting_date && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted }}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                                {fmtDateTime(item.meeting_date)}
                                            </span>
                                        )}
                                        {item.location && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted }}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                {item.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ── Actions ── */}
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignSelf: 'center' }}>
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

            {modal === 'create'      && <MeetingForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit'  && <MeetingForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete'&& <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

/* ─── Delete confirm wrapper ──────────────────────────────────── */
function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/meetings/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm
            title="Uchrashuvni o'chirish"
            desc={<><strong style={{ color: C.text }}>{item.title_latin || 'Bu uchrashuv'}</strong> o'chiriladi. Bu amalni qaytarib bo'lmaydi.</>}
            onClose={onClose}
            onConfirm={confirm}
            loading={loading}
        />
    );
}
