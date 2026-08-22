import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { mediaUrl, useLang } from "../utils/api";
import { BookOpen, Code2, Dumbbell, Globe2, MapPin, Music2, Palette, Search, Clock, Users2 } from "lucide-react";

// Bitta orange rang sxemasi — faqat ikonka va label kategoriya bo'yicha farqlanadi
const ORANGE = { color: '#ea6c0a', bg: '#fff7ed', border: '#fed7aa' };

const CAT = {
    SPORT:      { label: 'Sport',        icon: Dumbbell, ...ORANGE },
    SCIENCE:    { label: 'Fan',          icon: BookOpen, ...ORANGE },
    ART:        { label: "San'at",       icon: Palette,  ...ORANGE },
    LANGUAGE:   { label: 'Til',          icon: Globe2,   ...ORANGE },
    TECHNOLOGY: { label: 'Texnologiya',  icon: Code2,    ...ORANGE },
    MUSIC:      { label: 'Musiqa',       icon: Music2,   ...ORANGE },
    OTHER:      { label: 'Boshqa',       icon: BookOpen, ...ORANGE },
};

export default function ClubsPage() {
    const { t } = useTranslation();
    const lang  = useLang(); // 'latin' | 'cyril' | 'ru'
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [catFilt, setCatFilt] = useState('');
    const [search,  setSearch]  = useState('');

    useEffect(() => {
        pub.get('/api/clubs/public', { params: { limit: 100 } })
            .then(res => setItems(res.data?.data || res.data?.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const nk = `name_${lang}`;
    const dk = `description_${lang}`;
    const sk = `schedule_${lang}`;

    const usedCats = [...new Set(items.map(i => i.category))];

    const filtered = items.filter(i =>
        (!catFilt || i.category === catFilt) &&
        (!search || (i[nk] || i.name_latin || '').toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <section style={{ background: '#f8fafc', minHeight: '60vh' }} className="py-12">
                <div className="Container">

                    {/* ── heading ── */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">To'garaklar</h1>
                        <p className="text-sm text-gray-500">O'quvchilar uchun mavjud to'garaklar ro'yxati</p>
                    </div>

                    {/* ── filters ── */}
                    <div className="flex flex-wrap gap-3 mb-9 items-center">
                        <div className="relative" style={{ maxWidth: 320, flex: '1 1 220px' }}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} strokeWidth={2.5} color="#94a3b8" aria-hidden="true" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Qidirish..."
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
                                const c = CAT[cat] || CAT.OTHER;
                                const active = catFilt === cat;
                                return (
                                    <button key={cat} onClick={() => setCatFilt(cat)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                        style={{ background: active ? c.color : c.bg, color: active ? '#fff' : c.color, border: `1.5px solid ${c.border}` }}>
                                        <c.icon size={13} strokeWidth={2.2} aria-hidden="true" /> {c.label}
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
                            <BookOpen size={48} strokeWidth={1.5} className="mx-auto mb-4" aria-hidden="true" />
                            <p className="text-lg font-medium">To'garaklar topilmadi</p>
                        </div>
                    ) : (
                        <div
                            className="grid gap-5"
                            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
                        >
                            {filtered.map((item, idx) => {
                                const cat = CAT[item.category] || CAT.OTHER;
                                return (
                                    <div key={item.id || idx}
                                        className="group relative bg-white rounded-2xl transition-all duration-300 hover:-translate-y-1"
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderLeft: `4px solid ${cat.color}`,
                                            boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                                        }}
                                    >
                                        <div className="p-5">
                                            {/* ── icon + badge row ── */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div
                                                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                                                    style={{ width: 52, height: 52, background: cat.bg, border: `1.5px solid ${cat.border}` }}
                                                >
                                                    {item.cover_image ? (
                                                        <img src={mediaUrl(item.cover_image)} alt=""
                                                            className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <cat.icon size={24} strokeWidth={1.8} color={cat.color} aria-hidden="true" />
                                                    )}
                                                </div>
                                                <span
                                                    className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                                                    style={{ background: cat.bg, color: cat.color }}
                                                >
                                                    <cat.icon size={12} strokeWidth={2.2} aria-hidden="true" /> {cat.label}
                                                </span>
                                            </div>

                                            {/* ── name + description ── */}
                                            <h2 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">
                                                {item[nk] || item.name_latin || '—'}
                                            </h2>
                                            {item[dk] && (
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                                    {item[dk]}
                                                </p>
                                            )}

                                            {/* ── info chips ── */}
                                            <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px dashed #e2e8f0' }}>
                                                {item.supervisor_name && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Users2 size={15} strokeWidth={2} color={cat.color} className="flex-shrink-0" aria-hidden="true" />
                                                        <span className="truncate">{item.supervisor_name}</span>
                                                    </div>
                                                )}
                                                {item.age_group && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2" className="flex-shrink-0">
                                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                                        </svg>
                                                        <span className="truncate">{item.age_group}</span>
                                                    </div>
                                                )}
                                                {item[sk] && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock size={15} strokeWidth={2} color={cat.color} className="flex-shrink-0" aria-hidden="true" />
                                                        <span className="truncate">{item[sk]}</span>
                                                    </div>
                                                )}
                                                {item.location && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin size={15} strokeWidth={2} color={cat.color} className="flex-shrink-0" aria-hidden="true" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                )}
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