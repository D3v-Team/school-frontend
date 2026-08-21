import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub, { mediaUrl, useLang } from "../utils/api";
import DefaultFoto from "../img/person.jpg";

const CATEGORIES = {
    DIRECTOR:        { label: 'Direktor',             color: '#ea6c0a', bg: '#fff7ed', border: '#fed7aa' },
    DEPUTY_DIRECTOR: { label: "Direktor o'rinbosari", color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    TEACHER:         { label: "O'qituvchi",           color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
    ADMINISTRATION:  { label: 'Ma\'muriyat',          color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    OTHER:           { label: 'Boshqa',               color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

const CAT_ORDER = ['DIRECTOR','DEPUTY_DIRECTOR','TEACHER','ADMINISTRATION','OTHER'];

export default function StaffPage() {
    const { i18n, t } = useTranslation();
    const lang = useLang(); // 'latin' | 'cyril' | 'ru'
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [catFilt, setCatFilt] = useState('');
    const [search,  setSearch]  = useState('');

    useEffect(() => {
        pub.get('/api/staff', { params: { limit: 100, is_active: true, sortBy: 'order', sortOrder: 'asc' } })
            .then(res => setItems(res.data?.data || res.data?.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const nk = `full_name_${lang}`;
    const pk = `position_${lang}`;
    const sk = `subject_${lang}`;
    const degk = `degree_${lang}`;

    const usedCats = CAT_ORDER.filter(c => items.some(i => i.category === c));

    const filtered = items.filter(i =>
        (!catFilt || i.category === catFilt) &&
        (!search || (i[nk] || i.full_name_latin || '').toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <MiniHeader title="Xodimlar" minititle="Professor-o'qituvchilar tarkibi" />
            <section style={{ background: '#f8fafc', minHeight: '60vh' }} className="py-12">
                <div className="Container">

                    {/* ── filters ── */}
                    <div className="flex flex-wrap gap-3 mb-8 items-center">
                        <div className="relative" style={{ maxWidth: 320, flex: '1 1 220px' }}>
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14"
                                viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Ism bo'yicha qidirish..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl outline-none text-sm text-gray-700"
                                style={{ border: '1.5px solid #e2e8f0', background: '#fff' }} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setCatFilt('')}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                style={{ background: !catFilt ? '#ea6c0a' : '#fff', color: !catFilt ? '#fff' : '#64748b', border: `1.5px solid ${!catFilt ? '#ea6c0a' : '#e2e8f0'}` }}>
                                Barchasi
                            </button>
                            {usedCats.map(cat => {
                                const c = CATEGORIES[cat];
                                const active = catFilt === cat;
                                return (
                                    <button key={cat} onClick={() => setCatFilt(cat)}
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                        style={{ background: active ? c.color : c.bg, color: active ? '#fff' : c.color, border: `1.5px solid ${c.border}` }}>
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── content ── */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-5xl mb-4">👤</div>
                            <p className="text-lg">Xodimlar topilmadi</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {filtered.map((person, idx) => {
                                const cat = CATEGORIES[person.category] || CATEGORIES.OTHER;
                                const photo = person.photo
                                    ? mediaUrl(person.photo)
                                    : (person.image?.[0]?.url ? mediaUrl(person.image[0].url) : DefaultFoto);

                                return (
                                    <div key={person.id || idx}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        style={{ border: '1px solid #e2e8f0' }}>
                                        {/* top accent */}
                                        <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, transparent 70%)` }} />

                                        <div className="flex items-start gap-6 p-6">
                                            {/* ── Photo ── */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={photo}
                                                    alt={person[nk] || person.full_name_latin || ''}
                                                    className="object-cover rounded-xl"
                                                    style={{ width: 150, height: 185, border: `2px solid ${cat.border}` }}
                                                    onError={e => { e.target.src = DefaultFoto; }}
                                                />
                                            </div>

                                            {/* ── Info ── */}
                                            <div className="flex-1 min-w-0">
                                                {/* category badge */}
                                                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
                                                    style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                                                    {cat.label}
                                                </span>

                                                {/* name */}
                                                <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                                                    {person[nk] || person.full_name_latin || '—'}
                                                </h2>

                                                {/* position */}
                                                <p className="text-sm font-medium mb-4" style={{ color: cat.color }}>
                                                    {person[pk] || person.position_latin || ''}
                                                </p>

                                                {/* subject */}
                                                {(person[sk] || person.subject_latin) && (
                                                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                                        </svg>
                                                        <span className="font-medium text-gray-700">Fan:</span>
                                                        {person[sk] || person.subject_latin}
                                                    </p>
                                                )}

                                                {/* contacts grid */}
                                                <div className="flex flex-col gap-2.5">
                                                    {person.reception_days && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                                <path d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.88 22 18.72 22 19.36 21.67C19.93 21.39 20.39 20.93 20.67 20.36C21 19.72 21 18.88 21 17.2V8.8C21 7.12 21 6.28 20.67 5.64C20.39 5.07 19.93 4.61 19.36 4.33C18.72 4 17.88 4 16.2 4H7.8C6.12 4 5.28 4 4.64 4.33C4.07 4.61 3.61 5.07 3.33 5.64C3 6.28 3 7.12 3 8.8V17.2C3 18.88 3 19.72 3.33 20.36C3.61 20.93 4.07 21.39 4.64 21.67C5.28 22 6.12 22 7.8 22Z" stroke="#717680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">{t('Qabulkunlari') || 'Qabul kunlari'}:</span>
                                                            {person.reception_days}
                                                        </div>
                                                    )}
                                                    {person.phone && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z" stroke="#717680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">{t('Telefon') || 'Telefon'}:</span>
                                                            <a href={`tel:${person.phone}`} className="hover:text-orange-500 transition-colors">{person.phone}</a>
                                                        </div>
                                                    )}
                                                    {person.email && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                                <path d="M2 7L10.16 12.72C10.83 13.18 11.16 13.41 11.52 13.5C11.83 13.58 12.17 13.58 12.48 13.5C12.84 13.41 13.17 13.18 13.84 12.72L22 7M6.8 20H17.2C18.88 20 19.72 20 20.36 19.67C20.93 19.39 21.39 18.93 21.67 18.36C22 17.72 22 16.88 22 15.2V8.8C22 7.12 22 6.28 21.67 5.64C21.39 5.07 20.93 4.61 20.36 4.33C19.72 4 18.88 4 17.2 4H6.8C5.12 4 4.28 4 3.64 4.33C3.07 4.61 2.61 5.07 2.33 5.64C2 6.28 2 7.12 2 8.8V15.2C2 16.88 2 17.72 2.33 18.36C2.61 18.93 3.07 19.39 3.64 19.67C4.28 20 5.12 20 6.8 20Z" stroke="#717680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">{t('Email') || 'Email'}:</span>
                                                            <a href={`mailto:${person.email}`} className="hover:text-orange-500 transition-colors">{person.email}</a>
                                                        </div>
                                                    )}
                                                    {/* degree */}
                                                    {(person[degk] || person.degree_latin) && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <circle cx="12" cy="8" r="6"/>
                                                                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">Ilmiy daraja:</span>
                                                            {person[degk] || person.degree_latin}
                                                        </div>
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
