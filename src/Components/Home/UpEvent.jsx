import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BG     = '#0a0f1c';
const ACCENT = '#ea6c0a';

const staticEvents = [
    { date: "20.08.2026", start_time: "09:00:00", end_time: "11:00:00", titleUz: "Yangi o'quv yili tantanali ochilish marosimi",   statusColor: "green"  },
    { date: "22.08.2026", start_time: "14:00:00", end_time: "16:00:00", titleUz: "Ota-onalar uchun tashkiliy yig'ilish",              statusColor: "green"  },
    { date: "25.08.2026", start_time: "10:00:00", end_time: "12:00:00", titleUz: "O'qituvchilar metodologik seminar",                 statusColor: "green"  },
    { date: "01.09.2026", start_time: "08:00:00", end_time: "10:00:00", titleUz: "Bilimlar bayrami — 1-sentabr",                      statusColor: "orange" },
    { date: "05.09.2026", start_time: "15:00:00", end_time: "17:00:00", titleUz: "Fanlar olimpiadasi boshlandi",                      statusColor: "blue"   },
];

const monthNames = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const weekdays   = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];

const STATUS = {
    green:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'Rejalashtirilgan' },
    blue:   { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', label: 'Kuzatilmoqda'     },
    orange: { bg: 'rgba(234,108,10,0.12)',  color: ACCENT,    label: 'Tayyorgarlik'     },
};

/* ── Mini Calendar ───────────────────────────────────────────── */
function MiniCalendar() {
    const today = new Date();
    const [sel, setSel] = useState(new Date());
    const { t } = useTranslation();
    const m = sel.getMonth(), y = sel.getFullYear();

    const dim    = (yr, mo) => new Date(yr, mo + 1, 0).getDate();
    const fdIdx  = (yr, mo) => { const d = new Date(yr, mo, 1).getDay(); return d === 0 ? 6 : d - 1; };

    const days = () => {
        const total = dim(y, m), fd = fdIdx(y, m);
        const prev  = dim(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1);
        const arr   = [];
        for (let i = fd - 1; i >= 0; i--)  arr.push({ d: prev - i, cur: false });
        for (let i = 1; i <= total; i++)    arr.push({ d: i, cur: true, date: new Date(y, m, i) });
        for (let i = 1; arr.length < 42; i++) arr.push({ d: i, cur: false });
        return arr;
    };

    const isToday = dt => dt && dt.toDateString() === today.toDateString();
    const isSel   = dt => dt && dt.toDateString() === sel.toDateString();
    const prev    = () => setSel(new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, 1));
    const next    = () => setSel(new Date(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, 1));

    return (
        <div className="rounded-xl p-4"
            style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* nav */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={prev} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-slate-500 hover:text-white">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <p className="text-sm font-semibold text-slate-200">{monthNames[m]} {y}</p>
                <button onClick={next} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-slate-500 hover:text-white">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
            </div>

            <div className="flex justify-end mb-2">
                <button onClick={() => setSel(new Date())}
                    className="text-[10px] px-2 py-0.5 rounded-full text-slate-500 hover:text-white transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    {t('Bugun')}
                </button>
            </div>

            {/* weekday headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {weekdays.map(d => <div key={d} className="text-center text-[10px] text-slate-600 py-0.5">{d}</div>)}
            </div>

            {/* day cells */}
            <div className="grid grid-cols-7 gap-0.5">
                {days().map((item, i) => (
                    <button key={i}
                        onClick={() => item.date && setSel(item.date)}
                        className={`w-7 h-7 mx-auto rounded-full text-[11px] flex items-center justify-center transition-all duration-150
                            ${!item.cur ? 'text-slate-700' : 'text-slate-400 hover:bg-white/10'}
                            ${item.date && isSel(item.date)  ? '!text-white' : ''}
                            ${item.date && isToday(item.date) && !isSel(item.date) ? 'ring-1 ring-orange-500' : ''}
                        `}
                        style={item.date && isSel(item.date) ? { background: ACCENT } : {}}>
                        {item.d}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ── Event row ───────────────────────────────────────────────── */
function EventRow({ event }) {
    const [day, month] = event.date.split(".");
    const monthShort   = monthNames[parseInt(month) - 1]?.slice(0, 3).toUpperCase();
    const s = STATUS[event.statusColor] || STATUS.green;

    return (
        <div className="flex items-center gap-3 rounded-xl p-3.5 transition-all duration-200 cursor-default"
            style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${ACCENT}30`; e.currentTarget.style.background = '#141d2e'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#0f1623'; }}>

            {/* date badge */}
            <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}28` }}>
                <span className="text-base font-extrabold leading-none" style={{ color: ACCENT }}>{day}</span>
                <span className="text-[9px] font-semibold text-slate-600 mt-0.5">{monthShort}</span>
            </div>

            {/* info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {event.start_time.slice(0,5)} – {event.end_time.slice(0,5)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <p className="font-semibold text-slate-200 text-xs leading-snug line-clamp-1">{event.titleUz}</p>
            </div>
        </div>
    );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function CustomCalendar() {
    const { t } = useTranslation();
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // header
            gsap.fromTo('.upevent-header',
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
                  scrollTrigger: { trigger: '.upevent-header', start: 'top 90%', toggleActions: 'play none none none' } }
            );
            // event rows stagger
            gsap.fromTo('.upevent-row',
                { opacity: 0, x: -24 },
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out',
                  scrollTrigger: { trigger: '.upevent-list', start: 'top 88%', toggleActions: 'play none none none' } }
            );
            // calendar + stats slide in from right
            gsap.fromTo('.upevent-calendar',
                { opacity: 0, x: 32 },
                { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out',
                  scrollTrigger: { trigger: '.upevent-calendar', start: 'top 88%', toggleActions: 'play none none none' } }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} style={{ background: BG }} className="py-16">
            <div className="Container">
                {/* header */}
                <div className="upevent-header mb-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2"
                        style={{ color: ACCENT }}>Jadval</p>
                    <h2 className="text-3xl font-bold text-slate-100">{t('Kutilayotgantadbirlar')}</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left — events list */}
                    <div className="flex-1 flex flex-col gap-2.5 upevent-list">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 mb-1">
                            Kelgusi tadbirlar
                        </p>
                        {staticEvents.map((ev, i) => (
                            <div key={i} className="upevent-row">
                                <EventRow event={ev} />
                            </div>
                        ))}
                    </div>

                    {/* Right — calendar */}
                    <div className="upevent-calendar flex-shrink-0 w-full lg:w-[280px]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 mb-3">
                            Taqvim
                        </p>
                        <MiniCalendar />
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {[
                                { label: "Bu oyda", value: "5", sub: "tadbir" },
                                { label: "Keyingi", value: "3", sub: "kun qoldi" },
                            ].map((s, i) => (
                                <div key={i} className="rounded-xl p-3 text-center"
                                    style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <p className="text-xl font-extrabold" style={{ color: ACCENT }}>{s.value}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                                    <p className="text-[9px] text-slate-700">{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

