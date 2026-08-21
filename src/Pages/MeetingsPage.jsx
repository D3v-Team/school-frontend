import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub, { useLang } from "../utils/api";

export default function MeetingsPage() {
    const { t } = useTranslation();
    const lang  = useLang(); // 'latin' | 'cyril' | 'ru' — reactive

    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/api/meetings', { params: { limit: 50, is_public: true } })
            .then(res => setItems(res.data?.data || res.data?.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const tk = `title_${lang}`;
    const dk = `description_${lang}`;

    const MONTH_SHORT = {
        latin: ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'],
        cyrl:  ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
        ru:    ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
    };
    function monthShort(d) {
        return (MONTH_SHORT[lang] || MONTH_SHORT.latin)[d.getMonth()] || '';
    }

    const sorted = [...items].sort((a, b) => {
        const da = new Date(a.meeting_date || a.date || a.event_date || 0);
        const db = new Date(b.meeting_date || b.date || b.event_date || 0);
        return db - da;
    });

    return (
        <div>
            <MiniHeader title="Ota-ona uchrashuvlari" minititle="Uchrashuvlar jadvali" />
            <section style={{ background: '#f8fafc', minHeight: '60vh' }} className="py-12">
                <div className="Container max-w-4xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : sorted.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-6xl mb-4">👨‍👩‍👧</div>
                            <p className="text-lg font-medium">Uchrashuvlar topilmadi</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {sorted.map((item, idx) => {
                                const rawDate = item.meeting_date || item.date || item.event_date;
                                const d = rawDate ? new Date(rawDate) : null;
                                const valid = d && !isNaN(d);
                                const now = new Date();
                                const isPast   = valid && d < now;
                                const isToday  = valid && d.toDateString() === now.toDateString();
                                const isActive = valid && d >= now;

                                const statusLabel = isToday  ? 'Bugun'
                                    : isPast   ? "O'tdi"
                                    : isActive ? 'Kutilmoqda' : '';
                                const statusStyle = isToday
                                    ? { bg: '#fff7ed', color: '#ea6c0a', border: '#fed7aa' }
                                    : isPast
                                    ? { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' }
                                    : { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };

                                return (
                                    <div key={item.id || idx}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        style={{ border: `1.5px solid ${isToday ? '#ea6c0a44' : '#e2e8f0'}` }}>
                                        {/* top accent */}
                                        {isToday && <div style={{ height: 3, background: 'linear-gradient(90deg,#ea6c0a,transparent)' }} />}

                                        <div className="flex items-start gap-0">
                                            {/* date sidebar */}
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center px-5 py-5"
                                                style={{ minWidth: 80, borderRight: '1px solid #f1f5f9', background: isPast ? '#fafafa' : '#fff7ed' }}>
                                                {valid ? (
                                                    <>
                                                        <span className="text-3xl font-black leading-none"
                                                            style={{ color: isPast ? '#94a3b8' : '#ea6c0a' }}>
                                                            {d.getDate()}
                                                        </span>
                                                        <span className="text-xs font-bold uppercase mt-0.5"
                                                            style={{ color: isPast ? '#94a3b8' : '#ea6c0a' }}>
                                                            {monthShort(d)}
                                                        </span>
                                                        <span className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                                                            {d.getFullYear()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl">📅</span>
                                                )}
                                            </div>

                                            {/* content */}
                                            <div className="flex-1 px-5 py-4 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <h3 className="font-bold text-gray-900 text-base">
                                                        {item[tk] || item.title_latin || 'Uchrashuv'}
                                                    </h3>
                                                    {statusLabel && (
                                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                                            style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                                                            {statusLabel}
                                                        </span>
                                                    )}
                                                </div>

                                                {item[dk] && (
                                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item[dk]}</p>
                                                )}

                                                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                                    {(item.start_time || item.time) && (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea6c0a" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="10"/>
                                                                <polyline points="12 6 12 12 16 14"/>
                                                            </svg>
                                                            <span className="font-semibold text-gray-700">{item.start_time || item.time}</span>
                                                        </span>
                                                    )}
                                                    {item.location && (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea6c0a" strokeWidth="2">
                                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                                <circle cx="12" cy="10" r="3"/>
                                                            </svg>
                                                            <span className="text-gray-600">{item.location}</span>
                                                        </span>
                                                    )}
                                                    {item.grade && (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea6c0a" strokeWidth="2">
                                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                            </svg>
                                                            <span className="text-gray-600">{item.grade}-sinf</span>
                                                        </span>
                                                    )}
                                                    {item.teacher_name && (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea6c0a" strokeWidth="2">
                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                                <circle cx="12" cy="7" r="4"/>
                                                            </svg>
                                                            <span className="text-gray-600">{item.teacher_name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
