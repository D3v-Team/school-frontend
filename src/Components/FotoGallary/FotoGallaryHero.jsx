import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import pub, { getLang, mediaUrl } from "../../utils/api";
import { Images, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const NAVY   = '#1f235b';
const ORANGE = '#ea6c0a';

export default function FotoGallaryHero() {
    const { i18n } = useTranslation();
    const [albums, setAlbums] = useState([]);
    const [active, setActive] = useState(null); // { album, items, index }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/api/media-albums', { params: { limit: 50, sortBy: 'created_at', sortOrder: 'desc', is_public: true } })
            .then(res => {
                const data = res.data?.data || res.data?.items || [];
                const photos = data.filter(a => !a.type || a.type === 'PHOTO' || a.type === 'photo');
                setAlbums(photos.length ? photos : data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const openLightbox = (album, items, index = 0) => setActive({ album, items, index });

    const closeLightbox = () => setActive(null);

    const goTo = useCallback((dir) => {
        setActive(prev => {
            if (!prev) return prev;
            const len = prev.items.length;
            const next = (prev.index + dir + len) % len;
            return { ...prev, index: next };
        });
    }, []);

    useEffect(() => {
        if (!active) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') goTo(1);
            if (e.key === 'ArrowLeft') goTo(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active, goTo]);

    if (loading) {
        return (
            <section className="mt-[35px] mb-[35px]">
                <div className="Container">
                    <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-8" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-[100px] py-12">
            <div className="Container">

                {/* ── heading ── */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3" style={{ color: NAVY }}>
                        <span className="w-1.5 h-7 rounded-full" style={{ background: ORANGE }} />
                        Foto galereya
                    </h2>
                    {albums.length > 0 && (
                        <span className="hidden sm:block text-sm text-gray-400">{albums.length} ta albom</span>
                    )}
                </div>

                {albums.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Images size={56} strokeWidth={1.3} className="mb-4 opacity-40" aria-hidden="true" />
                        <p className="text-lg">Ma'lumot yo'q</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {albums.map(album => {
                            const items = [
                                ...(album.cover_image ? [{ url: album.cover_image }] : []),
                                ...(album.items || [])
                            ];
                            if (items.length === 0) return null;

                            const coverItem = items[0];
                            const title = getLang(album, 'title', i18n.language) || 'Albom';

                            return (
                                <div
                                    key={album.id}
                                    onClick={() => openLightbox(album, items, 0)}
                                    className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-100 transition-all duration-300 hover:-translate-y-1"
                                    style={{ aspectRatio: '4 / 5', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}
                                >
                                    <img
                                        src={mediaUrl(coverItem.url || coverItem.image_url)}
                                        alt={title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* pastdan doimiy gradient — matn o'qilishi uchun */}
                                    <div className="absolute inset-x-0 bottom-0 h-2/3"
                                        style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.85), rgba(15,23,42,0.15) 55%, transparent)' }} />

                                    {/* rasmlar soni badge */}
                                    {items.length > 1 && (
                                        <span className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-white backdrop-blur-sm"
                                            style={{ background: 'rgba(15,23,42,0.55)' }}>
                                            <Images size={12} strokeWidth={2.2} aria-hidden="true" />
                                            {items.length}
                                        </span>
                                    )}

                                    {/* hover — kattalashtirish ikonkasi */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm"
                                            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                                            <Search size={18} color="#fff" strokeWidth={2} aria-hidden="true" />
                                        </span>
                                    </div>

                                    {/* albom nomi */}
                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">
                                            {title}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {active && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-5 right-5 text-white/80 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={26} aria-hidden="true" />
                    </button>

                    {active.items.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goTo(-1); }}
                                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft size={28} aria-hidden="true" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goTo(1); }}
                                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight size={28} aria-hidden="true" />
                            </button>
                        </>
                    )}

                    <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                        <img
                            src={mediaUrl(active.items[active.index].url || active.items[active.index].image_url)}
                            alt=""
                            className="w-full max-h-[80vh] object-contain rounded-xl mx-auto"
                        />
                        <div className="text-center mt-4">
                            {active.album && (
                                <p className="text-white font-medium">
                                    {getLang(active.album, 'title', i18n.language)}
                                </p>
                            )}
                            {active.items.length > 1 && (
                                <p className="text-white/50 text-sm mt-1">
                                    {active.index + 1} / {active.items.length}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}