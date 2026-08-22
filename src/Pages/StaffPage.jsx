import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub, { mediaUrl, useLang } from "../utils/api";
import DefaultFoto from "../img/person.jpg";

// Barcha kategoriyalar bir xil "orange" rang sxemasida — faqat label farq qiladi
const ORANGE = { color: '#ea6c0a', bg: '#fff7ed', border: '#fed7aa' };

const CATEGORIES = {
    DIRECTOR:        { label: 'Direktor',             ...ORANGE },
    DEPUTY_DIRECTOR: { label: "Direktor o'rinbosari", ...ORANGE },
    TEACHER:         { label: "O'qituvchi",           ...ORANGE },
    ADMINISTRATION:  { label: 'Ma\'muriyat',          ...ORANGE },
    OTHER:           { label: 'Boshqa',               ...ORANGE },
};

const CAT_ORDER = ['DIRECTOR','DEPUTY_DIRECTOR','TEACHER','ADMINISTRATION','OTHER'];

export default function StaffPage() {
    const { i18n, t } = useTranslation();
    const lang = useLang(); // 'latin' | 'cyril' | 'ru'
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [catFilt, setCatFilt] = useState('');
    const [search,  setSearch]  = useState('');
    const [openId,  setOpenId]  = useState(null); // qaysi kartochka "ochilgan" (batafsil)

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
                    <div className="flex flex-wrap gap-3 mb-10 items-center">
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
                        <div
                            className="grid gap-6"
                            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
                        >
                            {filtered.map((person, idx) => {
                                const cat = CATEGORIES[person.category] || CATEGORIES.OTHER;
                                const photo = person.photo_url
                                    ? mediaUrl(person.photo_url)
                                    : person.photo
                                    ? mediaUrl(person.photo)
                                    : person.image?.[0]?.url
                                    ? mediaUrl(person.image[0].url)
                                    : DefaultFoto;
                                const id = person.id || idx;
                                const isOpen = openId === id;

                                const hasContacts = person.reception_days || person.phone || person.email || person[degk] || person.degree_latin;

                                return (
                                    <div
                                        key={id}
                                        onClick={() => hasContacts && setOpenId(isOpen ? null : id)}
                                        className="group relative rounded-2xl overflow-hidden bg-white transition-all duration-300"
                                        style={{
                                            border: `1.5px solid ${cat.border}`,
                                            boxShadow: isOpen ? '0 12px 28px -8px rgba(15,23,42,0.18)' : '0 1px 2px rgba(15,23,42,0.04)',
                                            transform: isOpen ? 'translateY(-4px)' : 'translateY(0)',
                                            cursor: hasContacts ? 'pointer' : 'default',
                                        }}
                                    >
                                        {/* ── Photo (to'liq eni, tepada) ── */}
                                        <div className="relative overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
                                            <img
                                                src={photo}
                                                alt={person[nk] || person.full_name_latin || ''}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={e => { e.target.src = DefaultFoto; }}
                                            />
                                            {/* pastdan qorong'i gradient — matn o'qilishi uchun */}
                                            <div
                                                className="absolute inset-x-0 bottom-0"
                                                style={{ height: '55%', background: 'linear-gradient(to top, rgba(15,23,42,0.88), rgba(15,23,42,0.35) 60%, transparent)' }}
                                            />
                                            {/* kategoriya belgisi */}
                                            <span
                                                className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
                                                style={{ background: `${cat.color}e6`, color: '#fff' }}
                                            >
                                                {cat.label}
                                            </span>

                                            {/* ism / lavozim — rasm ustida */}
                                            <div className="absolute inset-x-0 bottom-0 p-4">
                                                <h2 className="text-white font-bold text-base leading-tight mb-1 drop-shadow">
                                                    {person[nk] || person.full_name_latin || '—'}
                                                </h2>
                                                <p className="text-sm font-medium" style={{ color: '#fed7aa' }}>
                                                    {person[pk] || person.position_latin || ''}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ── Fan (doim ko'rinadi, agar bo'lsa) ── */}
                                        {(person[sk] || person.subject_latin) && (
                                            <div className="px-4 pt-3 flex items-center gap-2 text-sm text-gray-600">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2" className="flex-shrink-0">
                                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                                </svg>
                                                <span className="truncate">{person[sk] || person.subject_latin}</span>
                                            </div>
                                        )}

                                        {/* ── Batafsil (bosilganda ochiladi) ── */}
                                        {hasContacts && (
                                            <div
                                                className="overflow-hidden transition-all duration-300"
                                                style={{ maxHeight: isOpen ? 200 : 0 }}
                                            >
                                                <div className="px-4 pt-3 pb-4 flex flex-col gap-2 text-sm text-gray-600 border-t mt-3" style={{ borderColor: cat.border }}>
                                                    {person.reception_days && (
                                                        <div className="flex items-center gap-2">
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <path d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.88 22 18.72 22 19.36 21.67C19.93 21.39 20.39 20.93 20.67 20.36C21 19.72 21 18.88 21 17.2V8.8C21 7.12 21 6.28 20.67 5.64C20.39 5.07 19.93 4.61 19.36 4.33C18.72 4 17.88 4 16.2 4H7.8C6.12 4 5.28 4 4.64 4.33C4.07 4.61 3.61 5.07 3.33 5.64C3 6.28 3 7.12 3 8.8V17.2C3 18.88 3 19.72 3.33 20.36C3.61 20.93 4.07 21.39 4.64 21.67C5.28 22 6.12 22 7.8 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <span className="truncate">{person.reception_days}</span>
                                                        </div>
                                                    )}
                                                    {person.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.44 16a2 2 0 0 1 .56.92z" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <a href={`tel:${person.phone}`} onClick={e => e.stopPropagation()} className="hover:text-orange-500 transition-colors truncate">{person.phone}</a>
                                                        </div>
                                                    )}
                                                    {person.email && (
                                                        <div className="flex items-center gap-2">
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <path d="M2 7L10.16 12.72C10.83 13.18 11.16 13.41 11.52 13.5C11.83 13.58 12.17 13.58 12.48 13.5C12.84 13.41 13.17 13.18 13.84 12.72L22 7M6.8 20H17.2C18.88 20 19.72 20 20.36 19.67C20.93 19.39 21.39 18.93 21.67 18.36C22 17.72 22 16.88 22 15.2V8.8C22 7.12 22 6.28 21.67 5.64C21.39 5.07 20.93 4.61 20.36 4.33C19.72 4 18.88 4 17.2 4H6.8C5.12 4 4.28 4 3.64 4.33C3.07 4.61 2.61 5.07 2.33 5.64C2 6.28 2 7.12 2 8.8V15.2C2 16.88 2 17.72 2.33 18.36C2.61 18.93 3.07 19.39 3.64 19.67C4.28 20 5.12 20 6.8 20Z" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <a href={`mailto:${person.email}`} onClick={e => e.stopPropagation()} className="hover:text-orange-500 transition-colors truncate">{person.email}</a>
                                                        </div>
                                                    )}
                                                    {(person[degk] || person.degree_latin) && (
                                                        <div className="flex items-center gap-2">
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <circle cx="12" cy="8" r="6"/>
                                                                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                                                            </svg>
                                                            <span className="truncate">{person[degk] || person.degree_latin}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {hasContacts && (
                                            <div className="px-4 pb-3 flex items-center justify-center">
                                                <span className="text-[11px] font-medium" style={{ color: cat.color }}>
                                                    {isOpen ? "Yopish ▲" : "Batafsil ▼"}
                                                </span>
                                            </div>
                                        )}
                                        {!hasContacts && <div className="pb-2" />}
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