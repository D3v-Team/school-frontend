import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import {
    C, Spin, fmtDate, Lbl, iStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, Pagination, LoadingRow, EmptyRow, PageHeader, StatusBadge, Toggle,
} from "../AdminComponents/ui";

const LIMIT = 10;

const DAYS = [
    { key: 'monday',    label: 'Dushanba' },
    { key: 'tuesday',   label: 'Seshanba'  },
    { key: 'wednesday', label: 'Chorshanba'},
    { key: 'thursday',  label: 'Payshanba' },
    { key: 'friday',    label: 'Juma'      },
    { key: 'saturday',  label: 'Shanba'    },
];

const MEALS = [
    { key: 'breakfast', label: '🍳 Nonushta', color: '#ea6c0a' },
    { key: 'lunch',     label: '🍱 Tushlik',  color: '#2563eb' },
    { key: 'snack',     label: '🍵 Kechki',   color: '#16a34a' },
];

const emptyMeal = () => ({ start_time: '', end_time: '', foods: [] });
const emptyDay  = () => ({ breakfast: emptyMeal(), lunch: emptyMeal(), snack: emptyMeal() });
const emptyWeek = () => Object.fromEntries(DAYS.map(d => [d.key, emptyDay()]));

/* ─── Canteen Form Modal ──────────────────────────────────────── */
function CanteenForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const buildInitial = () => {
        if (!isEdit) return { start_date: '', end_date: '', is_active: false, ...emptyWeek() };
        const base = { start_date: item.start_date || '', end_date: item.end_date || '', is_active: item.is_active ?? false };
        DAYS.forEach(d => {
            base[d.key] = item[d.key] ? {
                breakfast: { ...emptyMeal(), ...item[d.key].breakfast },
                lunch:     { ...emptyMeal(), ...item[d.key].lunch     },
                snack:     { ...emptyMeal(), ...item[d.key].snack     },
            } : emptyDay();
            // ensure foods arrays exist
            MEALS.forEach(m => {
                if (!base[d.key][m.key].foods) base[d.key][m.key].foods = [];
            });
        });
        return base;
    };

    const [form,    setForm]    = useState(buildInitial);
    const [activeDay, setActiveDay] = useState('monday');
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState('');

    /* focus ref */
    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];

    /* setters */
    const setTop = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const setMealTime = (day, meal, field, val) =>
        setForm(p => ({ ...p, [day]: { ...p[day], [meal]: { ...p[day][meal], [field]: val } } }));

    const setFoodField = (day, meal, idx, field, val) =>
        setForm(p => {
            const foods = [...p[day][meal].foods];
            foods[idx] = { ...foods[idx], [field]: val };
            return { ...p, [day]: { ...p[day], [meal]: { ...p[day][meal], foods } } };
        });

    const addFood = (day, meal) =>
        setForm(p => ({
            ...p, [day]: { ...p[day], [meal]: {
                ...p[day][meal],
                foods: [...p[day][meal].foods, { name_latin: '', name_cyril: '', name_ru: '' }],
            }},
        }));

    const removeFood = (day, meal, idx) =>
        setForm(p => {
            const foods = p[day][meal].foods.filter((_, i) => i !== idx);
            return { ...p, [day]: { ...p[day], [meal]: { ...p[day][meal], foods } } };
        });

    /* clean payload before sending:
       - remove id from foods (server assigns UUID)
       - if start_time or end_time empty → set to "00:00"
       - if a meal has no foods and no times → keep minimal valid structure */
    const buildPayload = () => {
        const cleanMeal = meal => {
            const foods = meal.foods
                .filter(f => f.name_latin.trim() || f.name_cyril.trim() || f.name_ru.trim())
                .map(({ id, ...rest }) => rest); // strip id field
            return {
                start_time: meal.start_time || '00:00',
                end_time:   meal.end_time   || '00:00',
                foods,
            };
        };
        const payload = {
            start_date: form.start_date,
            end_date:   form.end_date,
            is_active:  form.is_active,
        };
        DAYS.forEach(d => {
            payload[d.key] = {
                breakfast: cleanMeal(form[d.key].breakfast),
                lunch:     cleanMeal(form[d.key].lunch),
                snack:     cleanMeal(form[d.key].snack),
            };
        });
        return payload;
    };

    const handleSave = async () => {
        if (!form.start_date || !form.end_date) { setError('Boshlanish va tugash sanasi majburiy'); return; }
        setSaving(true); setError('');
        try {
            const payload = buildPayload();
            if (isEdit) await $api.patch(`/api/canteen-menu/${item.id}`, payload);
            else        await $api.post('/api/canteen-menu', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : msg || 'Xatolik yuz berdi');
        } finally { setSaving(false); }
    };

    /* day completion */
    const dayHasData = day => MEALS.some(m => form[day][m.key].foods.length > 0);

    const inputSt = k => iStyle(fc(k));
    const timeSt  = k => ({
        width: '100%', padding: '6px 9px', borderRadius: 7,
        fontSize: 12, fontFamily: 'inherit', outline: 'none',
        background: C.bg, color: C.text, boxSizing: 'border-box',
        border: `1.5px solid ${fc(k) ? C.brand : C.border}`,
        transition: 'border-color .15s',
    });

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Menyuni tahrirlash' : 'Yangi haftalik menyu'} onClose={onClose} width={960}>
                {/* top row: dates + toggle */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                        <Lbl req>Boshlanish sanasi</Lbl>
                        <input type="date" value={form.start_date}
                            onChange={e => setTop('start_date', e.target.value)}
                            onFocus={() => sf('start_date', true)} onBlur={() => sf('start_date', false)}
                            style={inputSt('start_date')} />
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                        <Lbl req>Tugash sanasi</Lbl>
                        <input type="date" value={form.end_date}
                            onChange={e => setTop('end_date', e.target.value)}
                            onFocus={() => sf('end_date', true)} onBlur={() => sf('end_date', false)}
                            style={inputSt('end_date')} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 2 }}>
                        <span style={{ fontSize: 13, color: C.sub, fontWeight: 500 }}>Holat:</span>
                        <Toggle value={form.is_active} onChange={v => setTop('is_active', v)} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: form.is_active ? C.green : C.muted }}>
                            {form.is_active ? 'Aktiv' : 'Nofaol'}
                        </span>
                    </div>
                </div>

                {/* day tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.bg,
                    borderRadius: '10px 10px 0 0', overflowX: 'auto' }}>
                    {DAYS.map(({ key, label }) => {
                        const active = activeDay === key;
                        const has    = dayHasData(key);
                        return (
                            <button key={key} type="button" onClick={() => setActiveDay(key)}
                                style={{
                                    flex: '0 0 auto', padding: '10px 16px', border: 'none',
                                    borderRadius: active ? '10px 10px 0 0' : 0,
                                    background: active ? C.white : 'transparent',
                                    fontSize: 12, fontWeight: active ? 700 : 500,
                                    color: active ? C.brand : C.sub,
                                    borderBottom: `2.5px solid ${active ? C.brand : 'transparent'}`,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                    whiteSpace: 'nowrap',
                                }}>
                                {label}
                                {has && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />}
                            </button>
                        );
                    })}
                </div>

                {/* day content — 3 meal columns */}
                <div style={{
                    border: `1px solid ${C.border}`, borderTop: 'none',
                    borderRadius: '0 0 10px 10px', padding: 14,
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
                    maxHeight: '46vh', overflowY: 'auto',
                }}>
                    {MEALS.map(({ key: mKey, label: mLabel, color }) => {
                        const meal = form[activeDay][mKey];
                        return (
                            <div key={mKey} style={{
                                border: `1px solid ${C.border}`, borderRadius: 10,
                                padding: 12, background: C.bg,
                            }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color,
                                    margin: '0 0 10px', borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                                    {mLabel}
                                </p>

                                {/* times */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
                                            Boshlanish
                                        </div>
                                        <input type="time" value={meal.start_time}
                                            onChange={e => setMealTime(activeDay, mKey, 'start_time', e.target.value)}
                                            onFocus={() => sf(`${activeDay}_${mKey}_st`, true)}
                                            onBlur={() => sf(`${activeDay}_${mKey}_st`, false)}
                                            style={timeSt(`${activeDay}_${mKey}_st`)} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
                                            Tugash
                                        </div>
                                        <input type="time" value={meal.end_time}
                                            onChange={e => setMealTime(activeDay, mKey, 'end_time', e.target.value)}
                                            onFocus={() => sf(`${activeDay}_${mKey}_et`, true)}
                                            onBlur={() => sf(`${activeDay}_${mKey}_et`, false)}
                                            style={timeSt(`${activeDay}_${mKey}_et`)} />
                                    </div>
                                </div>

                                {/* foods */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {meal.foods.map((food, idx) => (
                                        <div key={idx} style={{
                                            background: C.white, border: `1px solid ${C.border}`,
                                            borderRadius: 8, padding: '8px 10px',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'center', marginBottom: 5 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                                                    textTransform: 'uppercase' }}>Taom #{idx + 1}</span>
                                                <button type="button" onClick={() => removeFood(activeDay, mKey, idx)}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer',
                                                        color: C.red, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                                            </div>
                                            {['name_latin', 'name_cyril', 'name_ru'].map(field => (
                                                <input key={field}
                                                    type="text"
                                                    value={food[field] || ''}
                                                    onChange={e => setFoodField(activeDay, mKey, idx, field, e.target.value)}
                                                    onFocus={() => sf(`f_${activeDay}_${mKey}_${idx}_${field}`, true)}
                                                    onBlur={() => sf(`f_${activeDay}_${mKey}_${idx}_${field}`, false)}
                                                    placeholder={field === 'name_latin' ? 'Lotin' : field === 'name_cyril' ? 'Krill' : 'Rus'}
                                                    style={{
                                                        ...timeSt(`f_${activeDay}_${mKey}_${idx}_${field}`),
                                                        marginBottom: 4,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <button type="button" onClick={() => addFood(activeDay, mKey)}
                                    style={{
                                        marginTop: 8, width: '100%', padding: '6px',
                                        borderRadius: 7, border: `1.5px dashed ${C.border}`,
                                        background: 'transparent', color: C.brand,
                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent'; }}>
                                    + Taom qo'shish
                                </button>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, fontSize: 12,
                        background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
                        ⚠ {error}
                    </div>
                )}
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Yaratish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function CanteenMenu() {
    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null);
    const [toggling, setToggling] = useState({});

    /* date filters */
    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const [startDate, setStartDate] = useState('');
    const [endDate,   setEndDate]   = useState('');

    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim()) params.search     = search.trim();
                if (startDate)     params.start_date = startDate;
                if (endDate)       params.end_date   = endDate;
                const res = await $api.get('/api/canteen-menu', { params });
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
    }, [page, search, startDate, endDate, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };

    const handleToggle = async item => {
        setToggling(p => ({ ...p, [item.id]: true }));
        try {
            await $api.patch(`/api/canteen-menu/${item.id}/activate`);
            setItems(prev => prev.map(it => it.id === item.id ? { ...it, is_active: !it.is_active } : it));
        } catch { /**/ } finally { setToggling(p => ({ ...p, [item.id]: false })); }
    };

    const refresh = () => { setModal(null); setTick(t => t + 1); };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Haftalik Menyu" subtitle={`Jami: ${total} ta menyu`}
                onAdd={() => setModal('create')} addLabel="Yangi menyu" />

            {/* filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Qidirish..." />
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                        textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>
                        Sana oralig'i
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="date" value={startDate}
                            onChange={e => { setStartDate(e.target.value); setPage(1); }}
                            onFocus={() => sf('sd', true)} onBlur={() => sf('sd', false)}
                            style={{
                                padding: '7px 10px', borderRadius: 8, fontSize: 12,
                                border: `1.5px solid ${fc('sd') ? C.brand : C.border}`,
                                background: C.white, color: C.text, outline: 'none',
                            }} />
                        <span style={{ color: C.muted, fontSize: 12 }}>—</span>
                        <input type="date" value={endDate}
                            onChange={e => { setEndDate(e.target.value); setPage(1); }}
                            onFocus={() => sf('ed', true)} onBlur={() => sf('ed', false)}
                            style={{
                                padding: '7px 10px', borderRadius: 8, fontSize: 12,
                                border: `1.5px solid ${fc('ed') ? C.brand : C.border}`,
                                background: C.white, color: C.text, outline: 'none',
                            }} />
                        {(startDate || endDate) && (
                            <button onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                                style={{ padding: '6px 10px', borderRadius: 7, border: `1px solid ${C.border}`,
                                    background: C.white, color: C.muted, fontSize: 12, cursor: 'pointer' }}>
                                Tozalash
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* cards */}
            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Menyu topilmadi" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                    {items.map(item => {
                        const filledDays = DAYS.filter(d => item[d.key] &&
                            MEALS.some(m => item[d.key][m.key]?.foods?.length > 0)).length;
                        return (
                            <div key={item.id} style={{
                                background: C.white, border: `1px solid ${item.is_active ? C.gBdr : C.border}`,
                                borderRadius: 12, overflow: 'hidden', transition: 'box-shadow .15s',
                                borderTop: `3px solid ${item.is_active ? C.green : C.border}`,
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                <div style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <StatusBadge label={item.is_active ? 'Aktiv' : 'Nofaol'}
                                            bg={item.is_active ? C.gBg : C.bg}
                                            color={item.is_active ? C.green : C.muted}
                                            border={item.is_active ? C.gBdr : C.border} />
                                        <span style={{ fontSize: 11, color: C.muted }}>{fmtDate(item.created_at)}</span>
                                    </div>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>
                                        📅 {item.start_date || '—'} → {item.end_date || '—'}
                                    </p>
                                    {/* day indicators */}
                                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                                        {DAYS.map(d => {
                                            const has = item[d.key] && MEALS.some(m => item[d.key][m.key]?.foods?.length > 0);
                                            return (
                                                <div key={d.key} title={d.label} style={{
                                                    flex: 1, height: 4, borderRadius: 2,
                                                    background: has ? C.green : C.border,
                                                }} />
                                            );
                                        })}
                                    </div>
                                    <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                                        {filledDays}/{DAYS.length} kun to'ldirilgan
                                    </p>
                                </div>
                                <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <button onClick={() => handleToggle(item)} disabled={toggling[item.id]}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                                            cursor: toggling[item.id] ? 'default' : 'pointer',
                                            border: `1px solid ${item.is_active ? C.rBdr : C.gBdr}`,
                                            background: item.is_active ? C.rBg : C.gBg,
                                            color: item.is_active ? C.red : C.green,
                                        }}>
                                        {toggling[item.id] ? <Spin size={11} color={item.is_active ? C.red : C.green} /> : null}
                                        {item.is_active ? 'Nofaol' : 'Faollashtirish'}
                                    </button>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                            onClick={() => setModal({ type: 'edit', item })}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </ABtn>
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
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {modal === 'create' && <CanteenForm onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <CanteenForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/canteen-menu/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm title="Menyuni o'chirish"
            desc={<>Ushbu haftalik menyu <strong style={{ color: C.text }}>({item.start_date} → {item.end_date})</strong> o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
