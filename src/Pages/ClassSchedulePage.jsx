import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
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

const COLORS = ['#3b82f6','#8b5cf6','#ea6c0a','#ec4899','#10b981','#f59e0b'];

function normalizeScheduleResponse(payload) {
    const source = payload?.data || payload?.items || payload;
    const records = Array.isArray(source) ? source : source ? [source] : [];
    return records.flatMap(record => {
        if (!record?.schedule || typeof record.schedule !== 'object') {
            return record?.day ? [record] : [];
        }
        return Object.entries(record.schedule).flatMap(([day, lessons]) => (
            Array.isArray(lessons) ? lessons.map(lesson => ({
                ...lesson,
                day: String(day).toUpperCase(),
                grade: lesson.grade || record.grade,
            })) : []
        ));
    });
}

export default function ClassSchedulePage() {
    const { t } = useTranslation();
    const lang  = useLang(); // 'latin' | 'cyril' | 'ru' — reactive

    const [items,     setItems]     = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [grade,     setGrade]     = useState('');
    const [activeDay, setActiveDay] = useState('');

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (grade) params.grade = grade;
        pub.get('/api/class-schedule/public', { params })
            .then(res => setItems(normalizeScheduleResponse(res.data)))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [grade]);

    const sk = `subject_${lang}`;

    const grades   = [...new Set(items.map(i => i.grade))].sort();
    const dayLabel = d => d[lang] || d.latin;
    const dayShort = d => d[`short_${lang}`] || d.short_latin;

    const grouped = DAYS.reduce((acc, d) => {
        const dayItems = items.filter(i => i.day === d.key).sort((a, b) => a.lesson_number - b.lesson_number);
        if (dayItems.length) acc[d.key] = dayItems;
        return acc;
    }, {});

    const visibleDays = DAYS.filter(d => grouped[d.key]);
    const displayDay  = activeDay || visibleDays[0]?.key || '';

    return (
        <div>
            <MiniHeader title="Dars jadvali" minititle="Sinf darslari tartibi" />
            <section style={{ background: '#f8fafc', minHeight: '60vh' }} className="py-12">
                <div className="Container">

                    {/* ── grade filter ── */}
                    {grades.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                            <button onClick={() => setGrade('')}
                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                style={{ background: !grade ? '#ea6c0a' : '#fff', color: !grade ? '#fff' : '#64748b', border: `2px solid ${!grade ? '#ea6c0a' : '#e2e8f0'}`, boxShadow: !grade ? '0 4px 12px rgba(234,108,10,0.25)' : 'none' }}>
                                Barchasi
                            </button>
                            {grades.map(g => (
                                <button key={g} onClick={() => setGrade(g)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                    style={{ background: grade === g ? '#ea6c0a' : '#fff', color: grade === g ? '#fff' : '#64748b', border: `2px solid ${grade === g ? '#ea6c0a' : '#e2e8f0'}`, boxShadow: grade === g ? '0 4px 12px rgba(234,108,10,0.25)' : 'none' }}>
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : visibleDays.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <CalendarX2 size={48} strokeWidth={1.5} className="mx-auto mb-4" aria-hidden="true" />
                            <p className="text-lg font-medium">Dars jadvali topilmadi</p>
                        </div>
                    ) : (
                        <div>
                            {/* ── day tabs ── */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                                {visibleDays.map((d, i) => {
                                    const color  = COLORS[i % COLORS.length];
                                    const active = displayDay === d.key;
                                    return (
                                        <button key={d.key} onClick={() => setActiveDay(d.key)}
                                            className="flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                                            style={{
                                                background: active ? color : '#fff',
                                                color: active ? '#fff' : '#64748b',
                                                border: `2px solid ${active ? color : '#e2e8f0'}`,
                                                boxShadow: active ? `0 6px 18px ${color}44` : 'none',
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

                            {/* ── schedule table for selected day ── */}
                            {(() => {
                                const dayItems = grouped[displayDay];
                                if (!dayItems) return null;
                                const dInfo  = DAYS.find(d => d.key === displayDay);
                                const color  = COLORS[visibleDays.findIndex(d => d.key === displayDay) % COLORS.length];
                                return (
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: `1.5px solid ${color}30` }}>
                                        {/* day header */}
                                        <div className="flex items-center gap-3 px-6 py-4"
                                            style={{ background: color + '0e', borderBottom: `2px solid ${color}20` }}>
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                            <span className="font-bold text-base" style={{ color }}>
                                                {dInfo ? dayLabel(dInfo) : displayDay}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-auto bg-white px-2 py-0.5 rounded-full"
                                                style={{ border: `1px solid ${color}30` }}>
                                                {dayItems.length} ta dars
                                            </span>
                                        </div>

                                        {/* col headers */}
                                        <div className="grid px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400"
                                            style={{ gridTemplateColumns: '48px 32px 1fr 150px 80px 110px', gap: '0 12px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                                            <span>#</span>
                                            <span></span>
                                            <span>Fan</span>
                                            <span>O'qituvchi</span>
                                            <span>Xona</span>
                                            <span>Vaqt</span>
                                        </div>

                                        {dayItems.map((item, i) => (
                                            <div key={item.id || i}
                                                className="grid items-center px-6 py-3.5 transition-colors hover:bg-gray-50"
                                                style={{ gridTemplateColumns: '48px 32px 1fr 150px 80px 110px', gap: '0 12px', borderBottom: i < dayItems.length - 1 ? '1px solid #f9fafb' : 'none' }}>

                                                {/* row num */}
                                                <span className="text-sm text-gray-400">{i + 1}</span>

                                                {/* lesson badge */}
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                                                    style={{ background: color + '15', color, border: `1.5px solid ${color}30` }}>
                                                    {item.lesson_number}
                                                </div>

                                                {/* subject */}
                                                <span className="font-semibold text-gray-900 text-sm truncate">
                                                    {item[sk] || item.subject_latin || '—'}
                                                </span>

                                                {/* teacher */}
                                                <span className="text-xs text-gray-500 truncate">
                                                    {item.teacher_name || '—'}
                                                </span>

                                                {/* room */}
                                                {item.room ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg text-center"
                                                        style={{ background: '#f1f5f9', color: '#475569' }}>
                                                        {item.room}-xona
                                                    </span>
                                                ) : <span />}

                                                {/* time */}
                                                {(item.start_time || item.end_time) ? (
                                                    <span className="text-xs font-bold tabular-nums"
                                                        style={{ color }}>
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
