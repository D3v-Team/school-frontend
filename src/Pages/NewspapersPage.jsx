import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub, { formatDate, mediaUrl, useLang } from "../utils/api";

export default function NewspapersPage() {
    const { t } = useTranslation();
    const lang  = useLang(); // reactive — re-renders on language change
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/api/newspapers', { params: { limit: 50, sortBy: 'created_at', sortOrder: 'desc' } })
            .then(res => setItems(res.data?.data || res.data?.items || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    // lang: 'latin' | 'cyril' | 'ru'  → maps to title_latin / title_cyril / title_ru
    const titleKey = `title_${lang}`;

    return (
        <div>
            <MiniHeader title="Maktab gazetasi" minititle="Sonlar arxivi" />
            <section className="py-12" style={{ background: '#f8fafc', minHeight: '60vh' }}>
                <div className="Container">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-5xl mb-4">📰</div>
                            <p className="text-lg">Gazetalar topilmadi</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {items.map((item, idx) => (
                                <div key={item.id || idx}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                    style={{ border: '1px solid #e2e8f0' }}>
                                    {/* cover */}
                                    <div className="relative overflow-hidden" style={{ height: 220, background: '#f1f5f9' }}>
                                        {item.cover_image ? (
                                            <img src={mediaUrl(item.cover_image)} alt=""
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                                </svg>
                                                <span className="text-xs text-gray-400">PDF</span>
                                            </div>
                                        )}
                                        {item.issue_number && (
                                            <div className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded"
                                                style={{ background: '#ea6c0a' }}>
                                                #{item.issue_number}
                                            </div>
                                        )}
                                        {item.file_url && (
                                            <a href={mediaUrl(item.file_url)} target="_blank" rel="noreferrer"
                                                className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }}
                                                onClick={e => e.stopPropagation()}>
                                                <span className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                                                    style={{ background: '#ea6c0a' }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                    Yuklab olish
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">
                                            {item[titleKey] || item.title_latin || 'Gazeta'}
                                        </p>
                                        <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
