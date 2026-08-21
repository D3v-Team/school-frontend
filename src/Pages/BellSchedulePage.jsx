import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub from "../utils/api";

export default function BellSchedulePage() {
    const [shift,   setShift]   = useState(1);
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        pub.get('/api/bell-schedules', { params: { shift } })
            .then(res => {
                const d = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
                setItems(d.filter(i => i.is_active !== false).sort((a, b) => a.lesson_number - b.lesson_number));
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [shift]);

    function duration(start, end) {
        if (!start || !end) return null;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    }

    return (
        <div>
            <MiniHeader title="Qo'ng'iroq jadvali" minititle="Darslar vaqt jadvali" />
            <section style={{ background: '#f8fafc', minHeight: '60vh' }} className="py-12">
                <div className="Container" style={{ maxWidth: 760, margin: '0 auto' }}>

                    {/* smena tabs */}
                    <div className="flex gap-3 mb-10 justify-center">
                        {[1, 2].map(s => (
                            <button key={s} onClick={() => setShift(s)}
                                className="flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm transition-all"
                                style={{
                                    background: shift === s ? '#ea6c0a' : '#fff',
                                    color: shift === s ? '#fff' : '#64748b',
                                    border: `2px solid ${shift === s ? '#ea6c0a' : '#e2e8f0'}`,
                                    boxShadow: shift === s ? '0 6px 20px rgba(234,108,10,0.28)' : 'none',
                                }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {s}-smena
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-6xl mb-4">🔔</div>
                            <p className="text-lg font-medium">Jadval topilmadi</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                            {/* table head */}
                            <div className="flex items-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400"
                                style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', gap: 0 }}>
                                <span style={{ width: 44 }}>#</span>
                                <span style={{ width: 52 }}>Dars</span>
                                <span className="flex-1">Boshlanish</span>
                                <span className="flex-1">Tugash</span>
                                <span style={{ width: 100 }}>Davomiyligi</span>
                                <span style={{ width: 110 }}>Tanaffus</span>
                            </div>

                            {items.map((item, i) => {
                                const mins   = duration(item.start_time, item.end_time);
                                const isLast = i === items.length - 1;
                                return (
                                    <div key={item.id || i}
                                        className="flex items-center px-6 py-4 transition-colors hover:bg-orange-50/40"
                                        style={{ borderBottom: isLast ? 'none' : '1px solid #f1f5f9', gap: 0 }}>

                                        {/* row num */}
                                        <span className="text-sm text-gray-400 font-medium" style={{ width: 44 }}>
                                            {i + 1}
                                        </span>

                                        {/* lesson badge */}
                                        <div style={{ width: 52 }}>
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base"
                                                style={{ background: '#fff7ed', color: '#ea6c0a', border: '2px solid #fed7aa' }}>
                                                {item.lesson_number}
                                            </div>
                                        </div>

                                        {/* start */}
                                        <div className="flex-1">
                                            <span className="text-xl font-black text-gray-900 tabular-nums">
                                                {item.start_time}
                                            </span>
                                        </div>

                                        {/* end */}
                                        <div className="flex-1">
                                            <span className="text-xl font-black text-gray-900 tabular-nums">
                                                {item.end_time}
                                            </span>
                                        </div>

                                        {/* duration */}
                                        <div style={{ width: 100 }}>
                                            {mins ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                                                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                                    </svg>
                                                    {mins} daq
                                                </span>
                                            ) : '—'}
                                        </div>

                                        {/* break */}
                                        <div style={{ width: 110 }}>
                                            {item.break_minutes > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                                                    style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                                                    {item.break_minutes} daq
                                                </span>
                                            ) : '—'}
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
