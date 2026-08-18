import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const quickLinks = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
        label: "Rahbariyat",
        to: "/rahbariyat",
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
        ),
        label: "Hujjatlar",
        to: "/hujjatlar",
        bg: "bg-green-50",
        iconColor: "text-green-600",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z"/>
            </svg>
        ),
        label: "Direktor qabulxonasi",
        to: "/virtual-kabinet",
        bg: "bg-purple-50",
        iconColor: "text-purple-600",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
        ),
        label: "Fotogalereya",
        to: "/fotogalereya",
        bg: "bg-orange-50",
        iconColor: "text-orange-600",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
        ),
        label: "Ochiq ma'lumotlar",
        to: "/ochiq-ma'lumotlar",
        bg: "bg-teal-50",
        iconColor: "text-teal-600",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        ),
        label: "Manzil",
        to: "/contact",
        bg: "bg-red-50",
        iconColor: "text-red-600",
    },
];

export default function SchoolInfo() {
    const { t } = useTranslation();

    return (
        <section className="bg-white border-b border-gray-100">
            {/* Quick-access navigation strip */}
            <div className="Container py-5">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {quickLinks.map((link, i) => (
                        <NavLink
                            key={i}
                            to={link.to}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className={`group flex flex-col items-center gap-2 p-3 rounded-xl ${link.bg} hover:shadow-sm transition-all duration-200 text-center`}
                        >
                            <div className={`${link.iconColor} group-hover:scale-110 transition-transform`}>
                                {link.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-700 leading-tight">
                                {link.label}
                            </span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* About section */}
            <div className="bg-[#f8fafc] border-t border-gray-100">
                <div className="Container py-10">
                    <div className="flex flex-col md:flex-row gap-10 items-center">
                        {/* Text */}
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-2">Maktab haqida</p>
                            <h2 className="text-2xl font-bold text-[#1a3a5c] mb-3 leading-tight">
                                Surxondaryo viloyati umumta&apos;lim maktabi
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-5">
                                Maktabimiz Surxondaryo viloyatida zamonaviy ta&apos;lim beruvchi muassasa sifatida tanilgan. O&apos;quvchilarimiz uchun sifatli ta&apos;lim, to&apos;garaklar, sport va madaniy tadbirlar tashkil etilmoqda.
                            </p>
                            <NavLink
                                to="/biz-haqimizda"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a3a5c] hover:text-blue-600 transition-colors"
                            >
                                {t('Batafsil')}
                                <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
                                    <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </NavLink>
                        </div>

                        {/* Info cards */}
                        <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full md:w-auto">
                            {[
                                { label: "Ish vaqti", value: "8:00 – 18:00", icon: "🕗" },
                                { label: "Telefon", value: "+998 95 511 58 56", icon: "📞" },
                                { label: "Email", value: "info@maktab.uz", icon: "📧" },
                                { label: "Manzil", value: "Surxondaryo viloyati", icon: "📍" },
                            ].map((info, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 min-w-[160px]">
                                    <div className="text-lg mb-1">{info.icon}</div>
                                    <p className="text-xs text-gray-400">{info.label}</p>
                                    <p className="text-sm font-semibold text-[#1a3a5c]">{info.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
