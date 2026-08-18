import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ACCENT = '#ea6c0a';

const COL1 = [
    { to: '/biz-haqimizda',      key: 'biz_haqimizda' },
    { to: '/rahbariyat',          key: 'rahbariyat' },
    { to: "/bo'lim-markazlar",    key: 'bolim_markazlar' },
    { to: '/rekvizitlar',         key: 'rekvizitlar' },
    { to: '/virtual-kabinet',     key: 'virtual_kabinet' },
];

const COL2 = [
    { to: "/ochiq-ma'lumotlar",   key: 'ochiq_malumotlar' },
    { to: '/korrupsiyaga-kurash', key: 'korrupsiya_kurash' },
    { to: '/hujjatlar',           key: 'hujjatlar' },
    { to: '/bosh-ish-orni',       key: 'bosh_ish_orni' },
    { to: '/xalqaro-aloqalar',    key: 'xalqaro_aloqalar' },
    { to: '/hamkorlarimiz',       key: 'hamkorlarimiz' },
];

const linkCls = 'block text-sm text-slate-400 hover:text-white transition-colors py-1';
const headCls = 'text-white text-sm font-semibold mb-3 uppercase tracking-wider';

export default function FooterMain() {
    const { t } = useTranslation();

    return (
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Col 1 — school info */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: ACCENT }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                    </div>
                    <span className="text-white font-bold text-sm leading-tight">
                        Surxondaryo viloyati<br/>umumta&apos;lim maktabi
                    </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                    Maktab haqida ma&apos;lumot, rahbariyat, yangiliklar va onlayn xizmatlar.
                </p>
                <div className="flex flex-col gap-2">
                    <a href="tel:+998955115856"
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z"/>
                        </svg>
                        +998 (95) 511 58 56
                    </a>
                    <a href="mailto:info@maktab.uz"
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        info@maktab.uz
                    </a>
                </div>
            </div>

            {/* Col 2 — Umumiy ma'lumot */}
            <div>
                <p className={headCls}>{t('Umumiy_malumot')}</p>
                <ul>
                    {COL1.map(link => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className={linkCls}>
                                {t(link.key)}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Col 3 — More links */}
            <div>
                <p className={headCls}>Xizmatlar</p>
                <ul>
                    {COL2.map(link => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className={linkCls}>
                                {t(link.key)}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Col 4 — Contact */}
            <div>
                <p className={headCls}>{t('boglanish')}</p>
                <ul className="space-y-1">
                    <li><span className="text-sm text-slate-400">+998 (95) 511 58 56</span></li>
                    <li><span className="text-sm text-slate-400">info@maktab.uz</span></li>
                    <li><span className="text-sm text-slate-400">{t('manzil2')}</span></li>
                </ul>
                <NavLink to="/contact"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm
                        font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: ACCENT }}>
                    Murojaat yuborish
                    <svg width="12" height="12" viewBox="0 0 14 15" fill="none">
                        <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334"
                            stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </NavLink>
            </div>
        </div>
    );
}
