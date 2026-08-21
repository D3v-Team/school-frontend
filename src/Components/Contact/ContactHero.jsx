import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { getLang, mediaUrl } from "../../utils/api";
import { $api } from "../../utils";

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

    return (
        <section className="contact py-10">
            <div className="Container">
                <div className="contact_title mb-10">
                    <h1 className="font-semibold text-[36px] leading-[122%] mb-2 tracking-[-0.02em] text-[#181d27]">
                        {t('Savollaringizniyollang') || "Savollaringizni yollang"}
                    </h1>
                    <p className="font-normal text-[20px] leading-[150%] text-[#535862]">
                        {t('Biztezoradasizbilanboglanamiz') || "Biz tez orada siz bilan bog'lanamiz"}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-10 mb-10">
                    {/* Contact info */}
                    <div className="w-full md:w-1/3 space-y-8">
                        {info?.email && (
                            <div className="flex items-center gap-6">
                                <div className="w-[48px] h-[48px] flex items-center border-[8px] border-[#eef4ff] rounded-[28px] bg-[#e0eaff] justify-center">
                                    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 4L9.16492 9.71544C9.82609 10.1783 10.1567 10.4097 10.5163 10.4993C10.8339 10.5785 11.1661 10.5785 11.4837 10.4993C11.8433 10.4097 12.1739 10.1783 12.8351 9.71544L21 4M5.8 17H16.2C17.8802 17 18.7202 17 19.362 16.673C19.9265 16.3854 20.3854 15.9265 20.673 15.362C21 14.7202 21 13.8802 21 12.2V5.8C21 4.11984 21 3.27976 20.673 2.63803C20.3854 2.07354 19.9265 1.6146 19.362 1.32698C18.7202 1 17.8802 1 16.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V12.2C1 13.8802 1 14.7202 1.32698 15.362C1.6146 15.9265 2.07354 16.3854 2.63803 16.673C3.27976 17 4.11984 17 5.8 17Z" stroke="#444CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-lg font-semibold text-[#181d27]">{t('Email') || 'Email'}</h3>
                                    <p className="text-[#535862]">{info.email}</p>
                                </div>
                            </div>
                        )}

                        {info?.phone && (
                            <div className="flex items-center gap-6">
                                <div className="w-[48px] h-[48px] flex items-center border-[8px] border-[#eef4ff] rounded-[28px] bg-[#e0eaff] justify-center">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.38028 7.85323C8.07627 9.30285 9.02506 10.6615 10.2266 11.8631C11.4282 13.0646 12.7869 14.0134 14.2365 14.7094C14.3612 14.7693 14.4235 14.7992 14.5024 14.8222C14.7828 14.904 15.127 14.8453 15.3644 14.6752C15.4313 14.6274 15.4884 14.5702 15.6027 14.4559C15.9523 14.1063 16.1271 13.9315 16.3029 13.8172C16.9658 13.3862 17.8204 13.3862 18.4833 13.8172C18.6591 13.9315 18.8339 14.1063 19.1835 14.4559L19.3783 14.6508C19.9098 15.1822 20.1755 15.448 20.3198 15.7333C20.6069 16.3009 20.6069 16.9712 20.3198 17.5387C20.1755 17.8241 19.9098 18.0898 19.3783 18.6213L19.2207 18.7789C18.6911 19.3085 18.4263 19.5733 18.0662 19.7756C17.6667 20 17.0462 20.1614 16.588 20.16C16.1751 20.1588 15.8928 20.0787 15.3284 19.9185C12.295 19.0575 9.43264 17.433 7.04466 15.045C4.65668 12.6571 3.03221 9.79471 2.17124 6.76131C2.01103 6.19687 1.93092 5.91464 1.9297 5.5017C1.92833 5.04347 2.08969 4.42298 2.31411 4.02348C2.51636 3.66345 2.78117 3.39863 3.3108 2.86901L3.46843 2.71138C3.99987 2.17993 4.2656 1.91421 4.55098 1.76987C5.11854 1.4828 5.7888 1.4828 6.35636 1.76987C6.64174 1.91421 6.90747 2.17993 7.43891 2.71138L7.63378 2.90625C7.98338 3.25585 8.15819 3.43065 8.27247 3.60643C8.70347 4.26932 8.70347 5.1239 8.27247 5.78679C8.15819 5.96257 7.98338 6.13738 7.63378 6.48698C7.51947 6.60129 7.46231 6.65845 7.41447 6.72526C7.24446 6.96269 7.18576 7.30695 7.26748 7.5873C7.29048 7.6662 7.32041 7.72854 7.38028 7.85323Z" stroke="#444CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-lg font-semibold text-[#181d27]">{t('Telefon') || 'Telefon'}</h3>
                                    <p className="text-[#535862]">{info.phone}</p>
                                </div>
                            </div>
                        )}

                        {address && (
                            <div className="flex items-center gap-6">
                                <div className="w-[48px] h-[48px] flex items-center border-[8px] border-[#eef4ff] rounded-[28px] bg-[#e0eaff] justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 12.5C13.6569 12.5 15 11.1569 15 9.5C15 7.84315 13.6569 6.5 12 6.5C10.3431 6.5 9 7.84315 9 9.5C9 11.1569 10.3431 12.5 12 12.5Z" stroke="#444CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 22C14 18 20 15.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 15.4183 10 18 12 22Z" stroke="#444CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="mb-1 text-lg font-semibold text-[#181d27]">{t('Manzil') || 'Manzil'}</h3>
                                    <p className="text-[#535862]">{address}</p>
                                </div>
                            </div>
                        )}

                        {/* Social links */}
                        {socials.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-[#181d27] mb-3">Ijtimoiy tarmoqlar</h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {socials.map(s => (
                                        <a key={s.platform} href={s.url} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-all text-sm text-gray-600 font-medium">
                                            {s.icon_url ? (
                                                <img src={mediaUrl(s.icon_url)} alt={s.platform} className="w-4 h-4 object-contain" />
                                            ) : null}
                                            <span className="capitalize">{s.platform}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="w-full md:w-2/3">
                        {info?.latitude && info?.longitude ? (
                            <iframe
                                className="w-full h-[300px] md:h-[350px] rounded-lg shadow-lg"
                                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${info.longitude}!3d${info.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1suz!2s`}
                                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            />
                        ) : (
                            <iframe
                                className="w-full h-[300px] md:h-[350px] rounded-lg shadow-lg"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2941.5948881208537!2d68.81028791216428!3d40.260872638163164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38b2190e463cfec1%3A0xb544c6812684a012!2sToshkent%20kimyo-texnologiya%20instituti%20Yangiyer%20filiali!5e1!3m2!1sru!2s!4v1740749150665!5m2!1sru!2s"
                                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            />
                        )}
                    </div>
                </div>

                {/* Contact form */}
                <div className="mt-8 max-w-2xl">
                    <h2 className="text-xl font-semibold text-[#181d27] mb-6">Xabar yuborish</h2>
                    {sent ? (
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
                            Xabaringiz muvaffaqiyatli yuborildi! Tez orada javob beramiz.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        To'liq ism <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" value={form.full_name}
                                        onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                                        placeholder="Ism Familiya"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefon <span className="text-red-500">*</span>
                                    </label>
                                    <input type="tel" value={form.phone}
                                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+998901234567"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="example@mail.com"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Xabar <span className="text-red-500">*</span>
                                </label>
                                <textarea rows={4} value={form.message}
                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                    placeholder="Xabaringizni yozing..."
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-orange-400 transition-colors" />
                            </div>
                            {error && (
                                <p className="text-sm text-red-500">⚠ {error}</p>
                            )}
                            <button type="submit" disabled={sending}
                                className="px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-60">
                                {sending ? 'Yuborilmoqda...' : 'Yuborish'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
