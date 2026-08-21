import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub, { mediaUrl, useLang } from "../utils/api";
import { BookOpen, Code2, Dumbbell, Globe2, Music2, Palette, Search, UsersRound } from "lucide-react";

const CAT = {
    SPORT:      { label: 'Sport', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: Dumbbell },
    SCIENCE:    { label: 'Fan', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: BookOpen },
    ART:        { label: "San'at", color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8', icon: Palette },
    LANGUAGE:   { label: 'Til', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: Globe2 },
    TECHNOLOGY: { label: 'Texnologiya', color: '#ea6c0a', bg: '#fff7ed', border: '#fed7aa', icon: Code2 },
    MUSIC:      { label: 'Musiqa', color: '#ca8a04', bg: '#fefce8', border: '#fef08a', icon: Music2 },
    OTHER:      { label: 'Boshqa', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: BookOpen },
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
            <MiniHeader title="To'garaklar" minititle="To'garaklar va seksiyalar" />
            <section style={{ background: '#f8fafc', minHeight: '60vh' }} className="py-12">
                <div className="Container">

                    {/* ── filters ── */}
                    <div className="flex flex-wrap gap-3 mb-8 items-center">
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
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                        style={{ background: active ? c.color : c.bg, color: active ? '#fff' : c.color, border: `1.5px solid ${c.border}` }}>
                                        <c.icon size={14} strokeWidth={2} aria-hidden="true" /> {c.label}
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
                        <div className="flex flex-col gap-5">
                            {filtered.map((item, idx) => {
                                const cat = CAT[item.category] || CAT.OTHER;
                                return (
                                    <div key={item.id || idx}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        style={{ border: '1px solid #e2e8f0' }}>
                                        {/* top accent */}
                                        <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, transparent 70%)` }} />

                                        <div className="flex items-start gap-6 p-6">
                                            {/* ── Image / icon ── */}
                                            <div className="flex-shrink-0 w-[150px] h-[150px] rounded-xl overflow-hidden"
                                                style={{ border: `2px solid ${cat.border}`, background: cat.bg }}>
                                                {item.cover_image ? (
                                                    <img src={mediaUrl(item.cover_image)} alt=""
                                                        className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                        <cat.icon size={44} strokeWidth={1.5} color={cat.color} aria-hidden="true" />
                                                        <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Details ── */}
                                            <div className="flex-1 min-w-0">
                                                {/* badge + name */}
                                                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2"
                                                    style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                                                    <cat.icon size={14} strokeWidth={2} aria-hidden="true" /> {cat.label}
                                                </span>
                                                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                                                    {item[nk] || item.name_latin || '—'}
                                                </h2>

                                                {/* description */}
                                                {item[dk] && (
                                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                                        {item[dk]}
                                                    </p>
                                                )}

                                                {/* info grid */}
                                                <div className="flex flex-col gap-2">
                                                    {item.supervisor_name && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                                <circle cx="12" cy="7" r="4"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">Rahbar:</span>
                                                            {item.supervisor_name}
                                                        </div>
                                                    )}
                                                    {item.age_group && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">Yosh guruhi:</span>
                                                            {item.age_group}
                                                        </div>
                                                    )}
                                                    {item[sk] && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">Jadval:</span>
                                                            {item[sk]}
                                                        </div>
                                                    )}
                                                    {item.location && (
                                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                                <circle cx="12" cy="10" r="3"/>
                                                            </svg>
                                                            <span className="font-medium text-gray-700">Manzil:</span>
                                                            {item.location}
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
