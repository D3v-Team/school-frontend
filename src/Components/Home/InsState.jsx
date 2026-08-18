import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Animated counter (no icon) ────────────────────────────── */
function AnimatedStat({ target, suffix = "+", label, index }) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
            { threshold: 0.3 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return;
        let frame = 0;
        const steps = 132;
        const id = setInterval(() => {
            frame++;
            const p = frame / steps;
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(target * eased));
            if (frame >= steps) { setCount(target); clearInterval(id); }
        }, 2200 / steps);
        return () => clearInterval(id);
    }, [started, target]);

    return (
        <div ref={ref}
            className="relative flex flex-col justify-between p-6 md:p-8 cursor-default group"
            style={{ background: '#0f1623', transition: 'background 0.25s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#111a2e'}
            onMouseLeave={e => e.currentTarget.style.background = '#0f1623'}
        >
            {/* index number watermark */}
            <span className="absolute top-4 right-5 text-[2.8rem] font-black tabular-nums select-none pointer-events-none"
                style={{ color: 'rgba(234,108,10,0.07)', lineHeight: 1 }}>
                {String(index + 1).padStart(2, '0')}
            </span>

            {/* label */}
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-4">{label}</p>

            {/* number */}
            <div className="flex items-baseline gap-0.5">
                <span className="text-[3rem] font-extrabold leading-none tabular-nums"
                    style={{ color: '#ea6c0a' }}>
                    {count.toLocaleString()}
                </span>
                <span className="text-2xl font-bold" style={{ color: '#f97316' }}>{suffix}</span>
            </div>

            {/* animated accent bar */}
            <div className="absolute bottom-0 left-0 h-[2px]"
                style={{
                    background: 'linear-gradient(90deg,#ea6c0a,transparent)',
                    width: started ? '100%' : '0%',
                    transition: 'width 1.8s cubic-bezier(0.22,1,0.36,1)',
                }} />
        </div>
    );
}

/* ─── Feature card (no emoji) ───────────────────────────────── */
function FeatureCard({ title, desc, accent, delay }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(ref.current,
            { opacity: 0, y: 28 },
            {
                opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', delay,
                scrollTrigger: { trigger: ref.current, start: 'top 90%', toggleActions: 'play none none none' },
            }
        );
    }, [delay]);

    return (
        <div ref={ref} className="relative rounded-2xl p-6 overflow-hidden"
            style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.06)', opacity: 0, transition: 'border-color 0.25s, transform 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}30`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {/* accent top line */}
            <div className="h-[2px] w-10 rounded-full mb-5" style={{ background: accent }} />
            <h4 className="text-slate-100 font-bold text-sm mb-2 leading-tight">{title}</h4>
            <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            {/* blob */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-8 pointer-events-none"
                style={{ background: `radial-gradient(circle,${accent} 0%,transparent 70%)` }} />
        </div>
    );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function InstituteStats() {
    const { t } = useTranslation();
    const headerRef = useRef(null);
    const statsRef  = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // header slide in
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 32 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
                  scrollTrigger: { trigger: headerRef.current, start: 'top 88%', toggleActions: 'play none none none' } }
            );
            // stats grid
            gsap.fromTo(
                statsRef.current?.querySelectorAll('.stat-cell') || [],
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
                  scrollTrigger: { trigger: statsRef.current, start: 'top 88%', toggleActions: 'play none none none' } }
            );
        });
        return () => ctx.revert();
    }, []);

    const stats = [
        { target: 1240, suffix: '+', label: t('Talabalarsoni')         },
        { target: 68,   suffix: '',  label: t('ProfessorOqituvchilar') },
        { target: 12,   suffix: '',  label: t('Fakultetlarsoni')       },
        { target: 24,   suffix: '+', label: t('Talimyonalishlari')     },
    ];

    const features = [
        { accent: '#f59e0b', title: "Olimpiada g'oliblari",    desc: "Har yili viloyat va respublika olimpiadalarida o'quvchilarimiz yuqori o'rinlarni egallaydi." },
        { accent: '#3b82f6', title: 'Zamonaviy laboratoriyalar', desc: "Fizika, kimyo va biologiya fanlaridan to'liq jihozlangan zamonaviy laboratoriya xonalari." },
        { accent: '#8b5cf6', title: "To'garaklar va seksiyalar", desc: "20 dan ortiq to'garak: musiqa, rasm, robototexnika, sport va ko'plab qiziqarli mashg'ulotlar." },
        { accent: '#10b981', title: "Onlayn xizmatlar",         desc: "Ariza topshirish, hujjatlar yuklab olish va direktor qabulxonasiga murojaat — to'liq onlayn." },
        { accent: '#ec4899', title: "Zamonaviy kutubxona",      desc: "10 000+ kitob, elektron resurslar va o'qish zali bilan boyitilgan maktab kutubxonasi." },
        { accent: '#14b8a6', title: 'Sport majmuasi',            desc: "Futbol maydoni, sport zali va suzish havzasi — sog'lom avlod uchun keng imkoniyatlar." },
    ];

    return (
        <section style={{ background: '#0a0f1c', padding: '80px 0' }}>
            <div className="Container">

                {/* header */}
                <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
                    style={{ opacity: 0 }}>
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
                            style={{ background: 'rgba(234,108,10,0.1)', border: '1px solid rgba(234,108,10,0.2)' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ea6c0a' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ea6c0a' }}>Raqamlarda</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 max-w-xl leading-tight">
                            {t('Institutfaoliyatiboyicharaqamlistatistika')}
                        </h2>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                        {t('Bugungikungaqadarfaoliyatimizgaoidraqamlarbilantanishishingizmumkin')}
                    </p>
                </div>

                {/* stats — borderless cells separated by 1px lines */}
                <div ref={statsRef}
                    className="grid grid-cols-2 lg:grid-cols-4 mb-16 rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.07)', gap: 1, background: 'rgba(255,255,255,0.07)' }}>
                    {stats.map((s, i) => (
                        <div key={i} className="stat-cell" style={{ opacity: 0 }}>
                            <AnimatedStat {...s} index={i} />
                        </div>
                    ))}
                </div>

                {/* divider */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <span className="text-[10px] text-slate-700 uppercase tracking-widest font-medium">Imkoniyatlarimiz</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>

                {/* feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((f, i) => (
                        <FeatureCard key={i} delay={i * 0.08} {...f} />
                    ))}
                </div>

            </div>
        </section>
    );
}
