import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import pub, { getLang, mediaUrl } from "../../utils/api";

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

    const openLightbox = (album, items, index) => setActive({ album, items, index });

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
            <section className=" mt-[35px] mb-[35px]">
                <div className="Container">
                    <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-8" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className=" mb-[35px]">
            <div className="Container">
        

                {albums.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <svg className="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5zm0 0l5.15-5.15a2.25 2.25 0 013.18 0l2.17 2.17m0 0l1.65-1.65a2.25 2.25 0 013.18 0L21 15m-9-3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p className="text-lg">Ma'lumot yo'q</p>
                    </div>
                ) : (
                    albums.map(album => {
                        const items = [
                            ...(album.cover_image ? [{ url: album.cover_image }] : []),
                            ...(album.items || [])
                        ];
                        if (items.length === 0) return null;

                        return (
                            <div key={album.id} className="mb-14">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                        {getLang(album, 'title', i18n.language) || 'Albom'}
                                    </h2>
                                    <span className="text-sm text-gray-400">{items.length} ta rasm</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[160px]">
                                    {items.slice(0, 9).map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => openLightbox(album, items, idx)}
                                            className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${
                                                idx === 0 ? 'col-span-2 row-span-2' : ''
                                            }`}
                                        >
                                            <img
                                                src={mediaUrl(item.url || item.image_url)}
                                                alt=""
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <svg className="w-9 h-9 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                                </svg>
                                            </div>
                                            {idx === 8 && items.length > 9 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
                                                    +{items.length - 9}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
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
                        className="absolute top-5 right-5 text-white/80 hover:text-white text-4xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        ×
                    </button>

                    {active.items.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goTo(-1); }}
                                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goTo(1); }}
                                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
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