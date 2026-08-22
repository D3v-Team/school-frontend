import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { useLang } from "../utils/api";
import { CalendarX2 } from "lucide-react";

const DAYS = [
    { key: 'MONDAY',    latin: 'Dushanba',   ru: 'Понедельник', cyril: 'Душанба',   short_latin: 'Du', short_ru: 'Пн', short_cyril: 'Ду' },
    { key: 'TUESDAY',   latin: 'Seshanba',   ru: 'Вторник',     cyril: 'Сешанба',   short_latin: 'Se', short_ru: 'Вт', short_cyril: 'Се' },
    { key: 'WEDNESDAY', latin: 'Chorshanba', ru: 'Среда',        cyril: 'Чоршанба',  short_latin: 'Ch', short_ru: 'Ср', short_cyril: 'Чо' },
    { key: 'THURSDAY',  latin: 'Payshanba',  ru: 'Четверг',      cyril: 'Пайшанба',  short_latin: 'Pa', short_ru: 'Чт', short_cyril: 'Па' },
    { key: 'FRIDAY',    latin: 'Juma',       ru: 'Пятница',      cyril: 'Жума',      short_latin: 'Ju', short_ru: 'Пт', short_cyril: 'Жу' },
    { key: 'SATURDAY',  latin: 'Shanba',     ru: 'Суббота',      cyril: 'Шанба',     short_latin: 'Sh', short_ru: 'Сб', short_cyril: 'Ша' },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ea6c0a', '#ec4899', '#10b981', '#f59e0b'];

/**
 * API dan kelgan har qanday strukturani flat lesson massivga o'giradi.
 *
 * Kutilgan formatlar:
 *  A) { data: [ { id, grade, schedule: { MONDAY: [lesson,...], ... } } ] }
 *  B) { data: [ { id, grade, day: 'MONDAY', lessons: [lesson,...] } ] }
 *  C) { data: [ { id, grade, day: 'MONDAY', lesson_number, subject_latin, ... } ] }
 *  D) [ ...same as above... ]   (top-level array)
 */
function normalizeScheduleResponse(payload) {
    // payload ni console da ko'rish uchun (dev mode)
    if (import.meta.env.DEV) {
        console.log('[ClassSchedule] raw API response:', JSON.stringify(payload)?.slice(0, 600));
    }

    // top-level array yoki data/items/items wrapper
    const source = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)   ? payload.data
        : Array.isArray(payload?.items)  ? payload.items
        : payload?.data   ? [payload.data]
        : [];

    const lessons = [];

    for (const record of source) {
        if (!record || typeof record !== 'object') continue;

        // ── Format A: record.schedule = { MONDAY: [{...},...], ... }
        if (record.schedule && typeof record.schedule === 'object' && !Array.isArray(record.schedule)) {
            for (const [dayKey, dayLessons] of Object.entries(record.schedule)) {
                if (!Array.isArray(dayLessons)) continue;
                for (const lesson of dayLessons) {
                    lessons.push({
                        ...lesson,
                        day:   String(dayKey).toUpperCase(),
                        grade: lesson.grade ?? record.grade ?? '',
                    });
                }
            }
            continue;
        }

        // ── Format B: record has day + lessons array
        if (record.day && Array.isArray(record.lessons)) {
            for (const lesson of record.lessons) {
                lessons.push({
                    ...lesson,
                    day:   String(record.day).toUpperCase(),
                    grade: lesson.grade ?? record.grade ?? '',
                });
            }
            continue;
        }

        // ── Format C: record itself is a lesson row with day field
        if (record.day && (record.subject_latin || record.lesson_number !== undefined)) {
            lessons.push({
                ...record,
                day:   String(record.day).toUpperCase(),
                grade: record.grade ?? '',
            });
            continue;
        }

        // ── Format D: record has grade + flat lessons array at top level
        if (Array.isArray(record.data)) {
            for (const lesson of record.data) {
                lessons.push({
                    ...lesson,
                    grade: lesson.grade ?? record.grade ?? '',
                });
            }
        }
    }

    return lessons;
}

export default function ClassSchedulePage() {
    const { t }  = useTranslation();
    const lang   = useLang();

    const [rawData,   setRawData]   = useState(null);  // debug uchun
    const [allGrades, setAllGrades] = useState([]);    // birinchi so'rovdan sinflar
    const [items,     setItems]     = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [grade,     setGrade]     = useState('');
    const [activeDay, setActiveDay] = useState('');

    // ── Birinchi yuklanishda barcha sinflarni olish
    useEffect(() => {
        pub.get('/api/class-schedule/public')
            .then(res => {
                setRawData(res.data);
                const normalized = normalizeScheduleResponse(res.data);
                // Noyob sinflar ro'yxati
                const grades = [...new Set(normalized.map(i => i.grade).filter(Boolean))].sort();
                setAllGrades(grades);
                setItems(normalized);
            })
            .catch(() => { setAllGrades([]); setItems([]); })
            .finally(() => setLoading(false));
    }, []);

    // ── Grade filter o'zgarganda qayta so'rov
    useEffect(() => {
        if (!allGrades.length) return; // birinchi yuklanish hali tugamagan
        setLoading(true);
        setActiveDay('');
        pub.get('/api/class-schedule/public', { params: grade ? { grade } : {} })
            .then(res => setItems(normalizeScheduleResponse(res.data)))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grade]);

    const sk = `subject_${lang}`;

    const dayLabel = d => d[lang]              || d.latin;
    const dayShort = d => d[`short_${lang}`]   || d.short_latin;

    const grouped = DAYS.reduce((acc, d) => {
        const dayItems = items
            .filter(i => i.day === d.key)
            .sort((a, b) => (a.lesson_number ?? 0) - (b.lesson_number ?? 0));
        if (dayItems.length) acc[d.key] = dayItems;
        return acc;
    }, {});

    const visibleDays = DAYS.filter(d => grouped[d.key]);
    const displayDay  = activeDay || visibleDays[0]?.key || '';

    return (
        <div>
            <section style={{ background: '#f8fafc', minHeight: '60vh', marginTop: '20px' }} className="py-12">
                <div className="Container">

                    {/* ── Grade filter pills ── */}
                    {allGrades.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8 justify-center">
                            <button
                                onClick={() => setGrade('')}
                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: !grade ? '#ea6c0a' : '#fff',
                                    color:      !grade ? '#fff'    : '#64748b',
                                    border:     `2px solid ${!grade ? '#ea6c0a' : '#e2e8f0'}`,
                                    boxShadow:  !grade ? '0 4px 12px rgba(234,108,10,0.25)' : 'none',
                                }}>
                                Barchasi
                            </button>
                            {allGrades.map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGrade(g)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        background: grade === g ? '#ea6c0a' : '#fff',
                                        color:      grade === g ? '#fff'    : '#64748b',
                                        border:     `2px solid ${grade === g ? '#ea6c0a' : '#e2e8f0'}`,
                                        boxShadow:  grade === g ? '0 4px 12px rgba(234,108,10,0.25)' : 'none',
                                    }}>
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Loading ── */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>

                    /* ── Empty ── */
                    ) : visibleDays.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <CalendarX2 size={48} strokeWidth={1.5} className="mx-auto mb-4" aria-hidden="true" />
                            <p className="text-lg font-medium">Dars jadvali topilmadi</p>
                            {/* DEV: raw data ko'rsatish */}
                            {import.meta.env.DEV && rawData && (
                                <details className="mt-6 text-left max-w-2xl mx-auto">
                                    <summary className="text-xs text-gray-400 cursor-pointer">
                                        Raw API response (dev only)
                                    </summary>
                                    <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-60">
                                        {JSON.stringify(rawData, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>

                    /* ── Schedule ── */
                    ) : (
                        <div>
                            {/* Day tabs */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                                {visibleDays.map((d, i) => {
                                    const color  = COLORS[i % COLORS.length];
                                    const active = displayDay === d.key;
                                    return (
                                        <button
                                            key={d.key}
                                            onClick={() => setActiveDay(d.key)}
                                            className="flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                                            style={{
                                                background: active ? color : '#fff',
                                                color:      active ? '#fff' : '#64748b',
                                                border:     `2px solid ${active ? color : '#e2e8f0'}`,
                                                boxShadow:  active ? `0 6px 18px ${color}44` : 'none',
                                                minWidth: 70,
                                            }}>
                                            <span className="text-[10px] font-bold uppercase opacity-70">{dayShort(d)}</span>
                                            <span className="text-xs font-bold mt-0.5">{dayLabel(d)}</span>
                                            <span className="text-[10px] mt-0.5 opacity-70">
                                                {grouped[d.key]?.length || 0} dars
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Table */}
                            {(() => {
                                const dayItems = grouped[displayDay];
                                if (!dayItems) return null;
                                const dInfo = DAYS.find(d => d.key === displayDay);
                                const color = COLORS[visibleDays.findIndex(d => d.key === displayDay) % COLORS.length];
                                return (
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm"
                                        style={{ border: `1.5px solid ${color}30` }}>

                                        {/* day header */}
                                        <div className="flex items-center gap-3 px-6 py-4"
                                            style={{ background: color + '0e', borderBottom: `2px solid ${color}20` }}>
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                            <span className="font-bold text-base" style={{ color }}>
                                                {dInfo ? dayLabel(dInfo) : displayDay}
                                            </span>
                                            {grade && (
                                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full ml-1"
                                                    style={{ background: '#fff7ed', color: '#ea6c0a', border: '1px solid #fed7aa' }}>
                                                    {grade}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 ml-auto bg-white px-2 py-0.5 rounded-full"
                                                style={{ border: `1px solid ${color}30` }}>
                                                {dayItems.length} ta dars
                                            </span>
                                        </div>

                                        {/* col headers */}
                                        <div className="grid px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400"
                                            style={{ gridTemplateColumns: '44px 36px 1fr 150px 80px 110px', gap: '0 12px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                                            <span>#</span>
                                            <span>№</span>
                                            <span>Fan</span>
                                            <span>O'qituvchi</span>
                                            <span>Xona</span>
                                            <span>Vaqt</span>
                                        </div>

                                        {dayItems.map((item, i) => (
                                            <div key={item.id || i}
                                                className="grid items-center px-6 py-3.5 transition-colors hover:bg-gray-50"
                                                style={{ gridTemplateColumns: '44px 36px 1fr 150px 80px 110px', gap: '0 12px', borderBottom: i < dayItems.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                                                <span className="text-sm text-gray-400">{i + 1}</span>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                                                    style={{ background: color + '15', color, border: `1.5px solid ${color}30` }}>
                                                    {item.lesson_number ?? '—'}
                                                </div>
                                                <span className="font-semibold text-gray-900 text-sm truncate">
                                                    {item[sk] || item.subject_latin || item.subject || '—'}
                                                </span>
                                                <span className="text-xs text-gray-500 truncate">
                                                    {item.teacher_name || '—'}
                                                </span>
                                                {item.room ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg text-center"
                                                        style={{ background: '#f1f5f9', color: '#475569' }}>
                                                        {item.room}
                                                    </span>
                                                ) : <span />}
                                                {(item.start_time || item.end_time) ? (
                                                    <span className="text-xs font-bold tabular-nums" style={{ color }}>
                                                        {item.start_time} – {item.end_time}
                                                    </span>
                                                ) : <span />}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
