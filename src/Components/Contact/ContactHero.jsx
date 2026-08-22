import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { getLang, mediaUrl } from "../../utils/api";
import { $api } from "../../utils";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";

const NAVY   = '#1f235b';
const ORANGE = '#ea6c0a';

export default function ContactHero() {
    const { t, i18n } = useTranslation();
    const [info,    setInfo]    = useState(null);
    const [socials, setSocials] = useState([]);
    const [form,    setForm]    = useState({ full_name: '', email: '', phone: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent,    setSent]    = useState(false);
    const [error,   setError]   = useState('');

    useEffect(() => {
        pub.get('/api/contact/info')
            .then(res => setInfo(res.data?.data || res.data))
            .catch(() => {});
        pub.get('/api/contact/info/social-links')
            .then(res => setSocials(res.data?.data || res.data || []))
            .catch(() => {});
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.full_name.trim() || !form.phone.trim() || !form.message.trim()) {
            setError("Ism, telefon va xabar majburiy");
            return;
        }
        setSending(true); setError('');
        try {
            await $api.post('/api/contact/messages', form);
            setSent(true);
            setForm({ full_name: '', email: '', phone: '', message: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally { setSending(false); }
    };

    const address = info ? getLang(info, 'address', i18n.language) : '';

    const CONTACT_ROWS = [
        { icon: Mail,   label: t('Email') || 'Email',     value: info?.email },
        { icon: Phone,  label: t('Telefon') || 'Telefon',  value: info?.phone },
        { icon: MapPin, label: t('Manzil') || 'Manzil',    value: address },
    ].filter(row => row.value);

    return (
        <section className="contact relative overflow-hidden py-16" >
            {/* dekorativ blur doiralar */}

            <div className="Container relative">

                {/* ── heading ── */}
                <div className="max-w-2xl mb-12">
                   
                    <h1 className="font-extrabold text-3xl md:text-4xl leading-tight mb-3" style={{ color: NAVY }}>
                        {t('Savollaringizniyollang') || "Savollaringizni yo'llang"}
                    </h1>
                    <div className="w-14 h-1 rounded-full mb-4" style={{ background: ORANGE }} />
                    <p className="text-gray-500 text-base leading-relaxed">
                        {t('Biztezoradasizbilanboglanamiz') || "Biz tez orada siz bilan bog'lanamiz"}
                    </p>
                </div>

                <div className="grid lg:grid-cols-[380px_1fr] gap-6 mb-8">

                    {/* ── Contact info card ── */}
                    <div className="bg-white rounded-3xl p-7 flex flex-col gap-6"
                        style={{ border: '1px solid #eef0f4', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                        {CONTACT_ROWS.map((row, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#fff7ed', border: '1.5px solid #fed7aa' }}>
                                    <row.icon size={20} strokeWidth={1.8} color={ORANGE} aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                                        {row.label}
                                    </h3>
                                    <p className="font-semibold truncate" style={{ color: NAVY }}>{row.value}</p>
                                </div>
                            </div>
                        ))}

                        {/* Social links */}
                        {socials.length > 0 && (
                            <div className="pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                                    Ijtimoiy tarmoqlar
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {socials.map(s => (
                                        <a key={s.platform} href={s.url} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
                                            style={{ borderColor: '#eef0f4', color: '#64748b' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#eef0f4'; e.currentTarget.style.color = '#64748b'; }}
                                        >
                                            {s.icon_url && (
                                                <img src={mediaUrl(s.icon_url)} alt={s.platform} className="w-4 h-4 object-contain" />
                                            )}
                                            <span className="capitalize">{s.platform}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Map ── */}
                    <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid #eef0f4', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                        {info?.latitude && info?.longitude ? (
                            <iframe
                                className="w-full h-full min-h-[300px]"
                                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${info.longitude}!3d${info.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1suz!2s`}
                                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            />
                        ) : (
                            <iframe
                                className="w-full h-full min-h-[300px]"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2941.5948881208537!2d68.81028791216428!3d40.260872638163164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b2190e463cfec1%3A0xb544c6812684a012!2sToshkent%20kimyo-texnologiya%20instituti%20Yangiyer%20filiali!5e1!3m2!1sru!2s!4v1740749150665!5m2!1sru!2s"
                                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            />
                        )}
                    </div>
                </div>

                {/* ── Contact form ── */}
                <div className="bg-white rounded-3xl p-7 md:p-9 max-w-2xl"
                    style={{ border: '1px solid #eef0f4', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
                    <h2 className="text-xl font-bold mb-6" style={{ color: NAVY }}>Xabar yuborish</h2>

                    {sent ? (
                        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <CheckCircle2 size={22} color="#16a34a" className="flex-shrink-0" aria-hidden="true" />
                            <p className="text-green-700 font-medium text-sm">
                                Xabaringiz muvaffaqiyatli yuborildi! Tez orada javob beramiz.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        To'liq ism <span style={{ color: ORANGE }}>*</span>
                                    </label>
                                    <input type="text" value={form.full_name}
                                        onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                                        placeholder="Ism Familiya"
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                                        style={{ border: '1.5px solid #e2e8f0' }}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Telefon <span style={{ color: ORANGE }}>*</span>
                                    </label>
                                    <input type="tel" value={form.phone}
                                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+998901234567"
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                                        style={{ border: '1.5px solid #e2e8f0' }}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input type="email" value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="example@mail.com"
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                                    style={{ border: '1.5px solid #e2e8f0' }}
                                    onFocus={e => e.target.style.borderColor = ORANGE}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Xabar <span style={{ color: ORANGE }}>*</span>
                                </label>
                                <textarea rows={4} value={form.message}
                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                    placeholder="Xabaringizni yozing..."
                                    className="w-full rounded-xl px-4 py-2.5 text-sm resize-none outline-none transition-colors"
                                    style={{ border: '1.5px solid #e2e8f0' }}
                                    onFocus={e => e.target.style.borderColor = ORANGE}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: '#dc2626' }}>
                                    <AlertCircle size={16} aria-hidden="true" />
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={sending}
                                className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ background: ORANGE, color: '#fff', boxShadow: '0 6px 20px rgba(234,108,10,0.35)' }}
                                onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ORANGE; e.currentTarget.style.border = `2px solid ${ORANGE}`; e.currentTarget.style.padding = '10px 22px'; } }}
                                onMouseLeave={e => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = 'none'; e.currentTarget.style.padding = '12px 24px'; }}
                            >
                                {sending ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                                        Yuborilmoqda...
                                    </>
                                ) : (
                                    <>
                                        Yuborish
                                        <Send size={16} aria-hidden="true" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}