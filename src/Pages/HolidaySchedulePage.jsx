import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub, { useLang } from "../utils/api";

function diffDays(start, end) {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e)) return null;
    return Math.round((e - s) / 86400000) + 1;
}

function statusOf(start, end) {
    const now = new Date(), s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e)) return 'unknown';
    if (now < s) return 'upcoming';
    if (now > e) return 'past';
    return 'active';
}

export default function HolidaySchedulePage() {
    const { t } = useTranslation();
    const lang  = useLang(); // 'latin' | 'cyril' | 'ru' — reactive

    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/api/holiday-schedules', { params: { limit: 50 } })
            .then(res => {
                const d = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
                setItems(d.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)));
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const tk = `title_${lang}`;
    const dk = `description_${lang}`;

    const localeStr = lang === 'ru' ? 'ru-RU' : lang === 'cyril' ? 'ru-RU' : 'uz-UZ';

    const STATUS_STYLES = {
        active:   { label: lang === 'ru' ? 'Сейчас' : lang === 'cyril' ? 'Ҳозир' : 'Hozir',           bg: '#fff7ed', color: '#ea6c0a', border: '#fed7aa' },
        upcoming: { label: lang === 'ru' ? 'Ожидается' : lang === 'cyril' ? 'Кутилмоқда' : 'Kutilmoqda', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
        past:     { label: lang === 'ru' ? "Прошло" : lang === 'cyril' ? "Ўтди" : "O'tdi",              bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
        unknown:  { label: '',                                                                             bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
    };

    return (
        <div>
            <MiniHeader title="Ta'til jadvali" minititle="O'quv yili ta'tillari" />
            <section className="py-12" style={{ background: '#f8fafc', minHeight: '60vh' }}>
                <div className="Container max-w-4xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-5xl mb-4">🎉</div>
                            <p>Ta'til jadvali topilmadi</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {items.map((item, idx) => {
                                const status = statusOf(item.start_date, item.end_date);
                                const ss = STATUS_STYLES[status];
                                const days = diffDays(item.start_date, item.end_date);
                                const sDate = item.start_date ? new Date(item.start_date) : null;
                                const eDate = item.end_date   ? new Date(item.end_date)   : null;
                                const fmt = d => d && !isNaN(d) ? d.toLocaleDateString(
                                    localeStr,
                                    { day: '2-digit', month: 'long' }
                                ) : '—';
                                return (
                                    <div key={item.id || idx}
                                        className="bg-white rounded-2xl p-5 shadow-sm flex gap-5 items-start transition-shadow hover:shadow-md"
                                        style={{ border: `1.5px solid ${status === 'active' ? '#ea6c0a44' : '#e2e8f0'}` }}>
                                        {/* left date column */}
                                        <div className="flex-shrink-0 text-center" style={{ minWidth: 72 }}>
                                            <div className="text-3xl font-black leading-none"
                                                style={{ color: status === 'past' ? '#94a3b8' : '#ea6c0a' }}>
                                                {sDate && !isNaN(sDate) ? sDate.getDate() : '—'}
                                            </div>
                                            <div className="text-xs font-bold uppercase tracking-wide mt-0.5"
                                                style={{ color: status === 'past' ? '#94a3b8' : '#ea6c0a' }}>
                                                {sDate && !isNaN(sDate)
                                                    ? sDate.toLocaleString(localeStr, { month: 'short' })
                                                    : ''}
                                            </div>
                                            {sDate && eDate && item.start_date !== item.end_date && (
                                                <>
                                                    <div className="text-gray-300 text-sm leading-none my-1">↓</div>
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {eDate.getDate()}
                                                        <span className="text-xs font-normal text-gray-400 ml-0.5">
                                                            {eDate.toLocaleString(localeStr, { month: 'short' })}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-bold text-gray-900">
                                                    {item[tk] || item.title_latin || 'Ta\'til'}
                                                </h3>
                                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                                    style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                                                    {ss.label}
                                                </span>
                                                {days && (
                                                    <span className="text-xs text-gray-400">{days} kun</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {fmt(sDate)}
                                                {eDate && item.start_date !== item.end_date && ` — ${fmt(eDate)}`}
                                            </p>
                                            {item[dk] && (
                                                <p className="text-sm text-gray-500 line-clamp-2">{item[dk]}</p>
                                            )}
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
