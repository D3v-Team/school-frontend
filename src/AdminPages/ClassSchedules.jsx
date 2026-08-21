/**
 * Admin — Dars jadvali
 * API: /api/class-schedule  (singular, not plural)
 *   POST   { grade, start_date, end_date, is_active, schedule: { monday:[...], ... } }
 *   PATCH  /{id}/day/{day}  body: [ lesson items array ]
 *   PATCH  /{id}/activate
 *   DELETE /{id}
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { $api } from "../utils";
import { useLang } from "../utils/api";
import {
    C, Spin, Lbl, iStyle, LANGS,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, LoadingRow, EmptyRow, PageHeader, StatusBadge, Toggle, Pagination,
} from "../AdminComponents/ui";

const LIMIT = 12;

const DAYS = [
    { key: 'monday',    label: 'Dushanba'   },
    { key: 'tuesday',   label: 'Seshanba'   },
    { key: 'wednesday', label: 'Chorshanba' },
    { key: 'thursday',  label: 'Payshanba'  },
    { key: 'friday',    label: 'Juma'       },
    { key: 'saturday',  label: 'Shanba'     },
];

const DAY_COLORS = {
    monday:    { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    tuesday:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    wednesday: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
    thursday:  { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
    friday:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    saturday:  { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
};

/* ─── Empty lesson ─────────────────────────────────────────────── */
function emptyLesson(num = 1) {
    return {
        lesson_number: num,
        subject_latin: '', subject_cyril: '', subject_ru: '',
        teacher_id: '', room: '', start_time: '', end_time: '',
    };
}

function emptySchedule() {
    return DAYS.reduce((acc, d) => {
        acc[d.key] = [];
        return acc;
    }, {});
}

/* ─── Lesson row editor ────────────────────────────────────────── */
function LessonRow({ lesson, onChange, onRemove, idx, activeLang, fRef, forceTick }) {
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const subKey = { latin: 'subject_latin', cyril: 'subject_cyril', ru: 'subject_ru' };
    const sk = subKey[activeLang] || 'subject_latin';

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 90px 70px 70px 28px',
            gap: 6, alignItems: 'center',
            padding: '8px 10px', borderRadius: 8,
            background: C.bg, border: `1px solid ${C.border}`,
        }}>
            {/* lesson # */}
            <input type="number" value={lesson.lesson_number} min={1} max={10}
                onChange={e => onChange({ ...lesson, lesson_number: Number(e.target.value) })}
                style={{ ...iStyle(false), padding: '5px 6px', textAlign: 'center', fontSize: 12 }} />

            {/* subject */}
            <input type="text" value={lesson[sk] || ''}
                onChange={e => onChange({ ...lesson, [sk]: e.target.value })}
                onFocus={() => sf(`s_${idx}`, true)} onBlur={() => sf(`s_${idx}`, false)}
                placeholder="Fan nomi..."
                style={{ ...iStyle(fc(`s_${idx}`)), padding: '5px 8px', fontSize: 12 }} />

            {/* room */}
            <input type="text" value={lesson.room || ''}
                onChange={e => onChange({ ...lesson, room: e.target.value })}
                onFocus={() => sf(`r_${idx}`, true)} onBlur={() => sf(`r_${idx}`, false)}
                placeholder="Xona"
                style={{ ...iStyle(fc(`r_${idx}`)), padding: '5px 8px', fontSize: 12 }} />

            {/* start */}
            <input type="time" value={lesson.start_time || ''}
                onChange={e => onChange({ ...lesson, start_time: e.target.value })}
                style={{ ...iStyle(false), padding: '5px 6px', fontSize: 11 }} />

            {/* end */}
            <input type="time" value={lesson.end_time || ''}
                onChange={e => onChange({ ...lesson, end_time: e.target.value })}
                style={{ ...iStyle(false), padding: '5px 6px', fontSize: 11 }} />

            {/* remove */}
            <button type="button" onClick={onRemove}
                style={{ width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer', background: C.rBg, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    );
}

/* ─── Day editor panel ──────────────────────────────────────────── */
function DayEditor({ day, lessons, onChange, activeLang }) {
    const colors = DAY_COLORS[day] || { bg: C.bg, color: C.sub, border: C.border };
    const label  = DAYS.find(d => d.key === day)?.label || day;
    const fRef   = useRef({});
    const [, forceTick] = useState(0);

    const addLesson = () => {
        const nextNum = lessons.length > 0 ? Math.max(...lessons.map(l => l.lesson_number)) + 1 : 1;
        onChange([...lessons, emptyLesson(nextNum)]);
    };

    const updateLesson = (idx, updated) => {
        const copy = [...lessons];
        copy[idx] = updated;
        onChange(copy);
    };

    const removeLesson = (idx) => onChange(lessons.filter((_, i) => i !== idx));

    return (
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {/* day header */}
            <div style={{ padding: '8px 12px', background: colors.bg, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.color }}>{label}</span>
                <span style={{ fontSize: 11, color: colors.color, opacity: 0.7 }}>{lessons.length} ta dars</span>
            </div>

            {/* column headers */}
            {lessons.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 90px 70px 70px 28px', gap: 6, padding: '4px 10px', background: '#fafafa', borderBottom: `1px solid ${C.border}` }}>
                    {['#', 'Fan', 'Xona', 'Boshlanish', 'Tugash', ''].map((h, i) => (
                        <span key={i} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
                    ))}
                </div>
            )}

            {/* lessons */}
            <div style={{ padding: lessons.length ? '8px 8px' : '0 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {lessons
                    .slice()
                    .sort((a, b) => a.lesson_number - b.lesson_number)
                    .map((lesson, idx) => (
                        <LessonRow
                            key={idx} idx={idx}
                            lesson={lesson}
                            onChange={updated => updateLesson(lessons.indexOf(lesson), updated)}
                            onRemove={() => removeLesson(lessons.indexOf(lesson))}
                            activeLang={activeLang}
                            fRef={fRef}
                            forceTick={forceTick}
                        />
                    ))}
            </div>

            {/* add lesson */}
            <div style={{ padding: '6px 8px 8px' }}>
                <button type="button" onClick={addLesson}
                    style={{ width: '100%', padding: '6px', borderRadius: 7, border: `1.5px dashed ${C.border}`, background: 'transparent', color: C.brand, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.bBg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent'; }}>
                    + Dars qo'shish
                </button>
            </div>
        </div>
    );
}

/* ─── Create/Edit Form Modal ────────────────────────────────────── */
function ScheduleForm({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const buildInitialSchedule = () => {
        if (!isEdit) return emptySchedule();
        const sched = emptySchedule();
        DAYS.forEach(d => {
            if (item.schedule?.[d.key]) {
                sched[d.key] = item.schedule[d.key].map(l => ({ ...l }));
            } else {
                sched[d.key] = [];
            }
        });
        return sched;
    };

    const [grade,      setGrade]      = useState(item?.grade      || '');
    const [startDate,  setStartDate]  = useState(item?.start_date || '');
    const [endDate,    setEndDate]    = useState(item?.end_date   || '');
    const [isActive,   setIsActive]   = useState(item?.is_active  ?? true);
    const [schedule,   setSchedule]   = useState(buildInitialSchedule);
    const [activeLang, setActiveLang] = useState('latin');
    const [activeDay,  setActiveDay]  = useState('monday');
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');

    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];

    const updateDay = (dayKey, lessons) => {
        setSchedule(p => ({ ...p, [dayKey]: lessons }));
    };

    /* Build full multilang payload — copy active lang to others if empty */
    const buildPayload = () => {
        const fullSchedule = {};
        DAYS.forEach(d => {
            fullSchedule[d.key] = (schedule[d.key] || []).map(lesson => {
                const l = { ...lesson };
                    if (!l.teacher_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(l.teacher_id)) {
                        delete l.teacher_id;
                    }
                // fill missing lang from active
                const sk = { latin: 'subject_latin', cyril: 'subject_cyril', ru: 'subject_ru' };
                LANGS.forEach(({ key }) => {
                    if (!l[sk[key]] && l[sk[activeLang]]) l[sk[key]] = l[sk[activeLang]];
                });
                return l;
            });
        });
        return {
            grade:      grade.trim(),
            start_date: startDate || undefined,
            end_date:   endDate   || undefined,
            is_active:  isActive,
            schedule:   fullSchedule,
        };
    };

    const handleSave = async () => {
        if (!grade.trim()) { setError('Sinf majburiy'); return; }
        setSaving(true); setError('');
        try {
            const payload = buildPayload();
            if (isEdit) {
                // update each day separately
                for (const d of DAYS) {
                    await $api.patch(`/api/class-schedule/${item.id}/day/${d.key}`, payload.schedule[d.key]);
                }
            } else {
                await $api.post('/api/class-schedule', payload);
            }
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    const totalLessons = DAYS.reduce((s, d) => s + (schedule[d.key]?.length || 0), 0);

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Jadvalni tahrirlash' : 'Yangi dars jadvali'} onClose={onClose} width={900}>

                {/* top meta row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 14 }}>
                    <div>
                        <Lbl req>Sinf</Lbl>
                        <input type="text" value={grade}
                            onChange={e => setGrade(e.target.value)}
                            onFocus={() => sf('gr', true)} onBlur={() => sf('gr', false)}
                            style={iStyle(fc('gr'), !grade && !!error)}
                            placeholder="masalan: 5-A" />
                    </div>
                    <div>
                        <Lbl>Boshlanish sanasi</Lbl>
                        <input type="date" value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={iStyle(false)} />
                    </div>
                    <div>
                        <Lbl>Tugash sanasi</Lbl>
                        <input type="date" value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            style={iStyle(false)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg }}>
                            <Toggle value={isActive} onChange={setIsActive} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? C.green : C.muted }}>
                                {isActive ? 'Faol' : 'Nofaol'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* lang tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {LANGS.map(({ key, flag, label }) => (
                        <button key={key} type="button" onClick={() => setActiveLang(key)}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeLang === key ? 700 : 500, background: activeLang === key ? C.brand : C.bg, color: activeLang === key ? '#fff' : C.sub, transition: 'all .15s' }}>
                            {flag} {label}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted, alignSelf: 'center' }}>
                        Jami: <strong style={{ color: C.text }}>{totalLessons}</strong> ta dars
                    </span>
                </div>

                {/* day tabs */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 12, overflowX: 'auto' }}>
                    {DAYS.map(d => {
                        const cnt    = schedule[d.key]?.length || 0;
                        const colors = DAY_COLORS[d.key];
                        const active = activeDay === d.key;
                        return (
                            <button key={d.key} type="button" onClick={() => setActiveDay(d.key)}
                                style={{
                                    flex: '0 0 auto', padding: '6px 14px', borderRadius: 8,
                                    border: `1.5px solid ${active ? colors.color : C.border}`,
                                    background: active ? colors.bg : C.white,
                                    color: active ? colors.color : C.sub,
                                    fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer',
                                    transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5,
                                }}>
                                {d.label}
                                {cnt > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: active ? colors.color : C.muted, color: '#fff' }}>
                                        {cnt}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* active day editor */}
                <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                    <DayEditor
                        key={activeDay}
                        day={activeDay}
                        lessons={schedule[activeDay] || []}
                        onChange={lessons => updateDay(activeDay, lessons)}
                        activeLang={activeLang}
                    />
                </div>

                {error && (
                    <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
                        ⚠ {error}
                    </div>
                )}
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Yaratish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ClassSchedules() {
    const lang = useLang(); // 'latin' | 'cyril' | 'ru' — reacts to Navbar lang

    const [items,    setItems]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [search,   setSearch]   = useState('');
    const [loading,  setLoading]  = useState(true);
    const [modal,    setModal]    = useState(null);
    const [toggling, setToggling] = useState({});
    const [tick,     setTick]     = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim()) params.search = search.trim();
                const res = await $api.get('/api/class-schedule', { params });
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

    const handleToggle = async (item) => {
        setToggling(p => ({ ...p, [item.id]: true }));
        try {
            await $api.patch(`/api/class-schedule/${item.id}/activate`);
            setItems(prev => prev.map(it => it.id === item.id ? { ...it, is_active: !it.is_active } : it));
        } catch { /**/ }
        finally { setToggling(p => ({ ...p, [item.id]: false })); }
    };

    /* subject key by current navbar lang */
    const sk = `subject_${lang}`;

    /* count total lessons across all days */
    const countLessons = (item) => {
        if (!item.schedule) return 0;
        return DAYS.reduce((s, d) => s + (item.schedule[d.key]?.length || 0), 0);
    };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader
                title="Dars jadvali"
                subtitle={`Jami: ${total} ta jadval`}
                onAdd={() => setModal('create')}
                addLabel="Yangi jadval"
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Sinf bo'yicha qidirish..." />
            </div>

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Jadvallar topilmadi" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                    {items.map(item => {
                        const total_lessons = countLessons(item);
                        return (
                            <div key={item.id} style={{ background: C.white, border: `1.5px solid ${item.is_active ? C.gBdr : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'box-shadow .15s' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                                {/* top accent */}
                                <div style={{ height: 3, background: item.is_active ? `linear-gradient(90deg,${C.green},transparent)` : `linear-gradient(90deg,${C.border},transparent)` }} />

                                <div style={{ padding: '14px 16px' }}>
                                    {/* grade + status */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bBg, border: `1.5px solid ${C.bBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: C.brand }}>
                                                {item.grade || '?'}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>{item.grade} — sinf</p>
                                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                                    {total_lessons} ta dars
                                                    {item.start_date && ` · ${item.start_date}`}
                                                    {item.end_date && ` → ${item.end_date}`}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusBadge
                                            label={item.is_active ? 'Faol' : 'Nofaol'}
                                            bg={item.is_active ? C.gBg : C.bg}
                                            color={item.is_active ? C.green : C.muted}
                                            border={item.is_active ? C.gBdr : C.border}
                                        />
                                    </div>

                                    {/* day indicators */}
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                                        {DAYS.map(d => {
                                            const cnt    = item.schedule?.[d.key]?.length || 0;
                                            const colors = DAY_COLORS[d.key];
                                            return (
                                                <div key={d.key} title={`${d.label}: ${cnt} ta dars`}
                                                    style={{ flex: 1, borderRadius: 4, padding: '3px 0', textAlign: 'center', background: cnt ? colors.bg : '#f8fafc', border: `1px solid ${cnt ? colors.border : C.border}` }}>
                                                    <div style={{ fontSize: 9, fontWeight: 700, color: cnt ? colors.color : C.muted, textTransform: 'uppercase' }}>
                                                        {d.key.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div style={{ fontSize: 11, fontWeight: 800, color: cnt ? colors.color : C.muted }}>
                                                        {cnt || '—'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* preview first lesson of monday */}
                                    {(() => {
                                        const firstLesson = DAYS.reduce((found, d) => {
                                            if (found) return found;
                                            const lessons = item.schedule?.[d.key] || [];
                                            return lessons.length ? lessons[0] : null;
                                        }, null);
                                        if (!firstLesson) return null;
                                        return (
                                            <div style={{ padding: '6px 10px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12, color: C.sub, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="2">
                                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                </svg>
                                                <span style={{ fontWeight: 600, color: C.text }}>
                                                    {firstLesson[sk] || firstLesson.subject_latin || '—'}
                                                </span>
                                                {firstLesson.room && <span>· {firstLesson.room}-xona</span>}
                                                {firstLesson.start_time && <span>· {firstLesson.start_time}</span>}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* actions */}
                                <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <button onClick={() => handleToggle(item)} disabled={toggling[item.id]}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: toggling[item.id] ? 'default' : 'pointer', border: `1px solid ${item.is_active ? C.rBdr : C.gBdr}`, background: item.is_active ? C.rBg : C.gBg, color: item.is_active ? C.red : C.green }}>
                                        {toggling[item.id] ? <Spin size={11} color={item.is_active ? C.red : C.green} /> : null}
                                        {item.is_active ? "O'chirish" : 'Faollashtirish'}
                                    </button>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <ABtn title="Ko'rish / Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                            onClick={() => setModal({ type: 'view', item })}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        </ABtn>
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
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {/* View modal — read-only with day tabs */}
            {modal?.type === 'view' && (
                <ViewModal item={modal.item} lang={lang} onClose={() => setModal(null)} onEdit={() => setModal({ type: 'edit', item: modal.item })} />
            )}

            {modal === 'create' && (
                <ScheduleForm onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'edit' && (
                <ScheduleForm item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'delete' && (
                <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />
            )}
        </div>
    );
}

/* ─── View modal ────────────────────────────────────────────────── */
function ViewModal({ item, lang, onClose, onEdit }) {
    const [activeDay, setActiveDay] = useState('monday');
    const sk = `subject_${lang}`;

    const dayLessons = (item.schedule?.[activeDay] || [])
        .slice()
        .sort((a, b) => a.lesson_number - b.lesson_number);

    return (
        <Overlay onClose={onClose}>
            <div style={{ width: '100%', maxWidth: 740, background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* header */}
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>{item.grade} — sinf jadvali</h3>
                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                            {item.start_date && `${item.start_date} → ${item.end_date || '...'}`}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.bBdr}`, background: C.bBg, color: C.brand, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Tahrirlash
                        </button>
                        <button onClick={onClose} style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 7, background: C.white, cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>

                <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
                    {/* day tabs */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 14, overflowX: 'auto' }}>
                        {DAYS.map(d => {
                            const cnt    = item.schedule?.[d.key]?.length || 0;
                            const colors = DAY_COLORS[d.key];
                            const active = activeDay === d.key;
                            return (
                                <button key={d.key} onClick={() => setActiveDay(d.key)}
                                    style={{ flex: '0 0 auto', padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${active ? colors.color : C.border}`, background: active ? colors.bg : C.white, color: active ? colors.color : C.sub, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s' }}>
                                    {d.label}
                                    {cnt > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: active ? colors.color : C.muted, color: '#fff' }}>{cnt}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* lessons table */}
                    {dayLessons.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted, fontSize: 13 }}>
                            Bu kun uchun darslar qo'shilmagan
                        </div>
                    ) : (
                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '44px 36px 1fr 120px 70px 90px 90px', gap: '0 8px', padding: '8px 14px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                                {['#', 'Dars', 'Fan', "O'qituvchi ID", 'Xona', 'Boshlanish', 'Tugash'].map((h, i) => (
                                    <span key={i} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
                                ))}
                            </div>
                            {dayLessons.map((lesson, i) => {
                                const colors = DAY_COLORS[activeDay];
                                return (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 36px 1fr 120px 70px 90px 90px', gap: '0 8px', alignItems: 'center', padding: '10px 14px', borderBottom: i < dayLessons.length - 1 ? `1px solid #f9fafb` : 'none', transition: 'background .1s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <span style={{ fontSize: 12, color: C.muted }}>{i + 1}</span>
                                        <div style={{ width: 28, height: 28, borderRadius: 7, background: colors?.bg, border: `1px solid ${colors?.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: colors?.color }}>
                                            {lesson.lesson_number}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {lesson[sk] || lesson.subject_latin || '—'}
                                        </span>
                                        <span style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {lesson.teacher_id ? lesson.teacher_id.slice(0, 8) + '...' : '—'}
                                        </span>
                                        <span style={{ fontSize: 12, color: C.sub }}>{lesson.room || '—'}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{lesson.start_time || '—'}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>{lesson.end_time || '—'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Overlay>
    );
}

/* ─── Delete confirm ────────────────────────────────────────────── */
function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/class-schedule/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm
            title="Jadvalni o'chirish"
            desc={<><strong style={{ color: C.text }}>{item.grade}-sinf</strong> jadvali o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading}
        />
    );
}
