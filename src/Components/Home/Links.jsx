import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import DriftWall from "../DriftWall";
import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import pub, { getLang, mediaUrl } from "../../utils/api";

function isPhotoAlbum(a) {
    const t = (a.type || '').toUpperCase();
    return !t || t === 'PHOTO' || t === 'IMAGE';
}

function isVideoAlbum(a) {
    return (a.type || '').toUpperCase() === 'VIDEO';
}

export default function GallerySection() {
    const { t, i18n } = useTranslation();
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await pub.get('/api/media-albums', {
                    params: { limit: 30, is_public: true, sortBy: 'created_at', sortOrder: 'desc' },
                });
                const all = res.data?.data || res.data?.items || [];
                const media = all.filter(a => isPhotoAlbum(a) || isVideoAlbum(a));

                const detailed = await Promise.all(media.slice(0, 12).map(async album => {
                    if ((album.items || []).length) return album;
                    try {
                        const r = await pub.get(`/api/media-albums/${album.id}`);
                        return r.data?.data || r.data || album;
                    } catch {
                        return album;
                    }
                }));

                if (!cancelled) setAlbums(detailed);
            } catch {
                if (!cancelled) setAlbums([]);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const galleryItems = [];
    albums.forEach(album => {
        const title = getLang(album, 'title', i18n.language);
        if (album.cover_image) {
            galleryItems.push({ image: mediaUrl(album.cover_image), title });
        }
        (album.items || []).forEach(it => {
            const url = it.url || it.image_url || it.cover_image;
            if (!url) return;
            if (url.match(/\.(mp4|webm|mov)$/i)) return;
            galleryItems.push({ image: mediaUrl(url), title });
        });
    });
    const wallItems = galleryItems.slice(0, 24);

    return (
        <section style={{ background: '#0a0f1c' }} className="py-16">
            <div className="Container">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2"
                            style={{ color: '#ea6c0a' }}>
                            Media zona
                        </p>
                        <h2 className="text-3xl font-bold text-slate-100">
                            {t('Fotogalereya')}
                        </h2>
                    </div>
                    <NavLink
                        to="/fotogalereya"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-orange-400
                            transition-colors px-3 py-1.5 rounded-lg"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(234,108,10,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    >
                        Barchasini ko&apos;rish
                        <svg width="11" height="11" viewBox="0 0 14 15" fill="none">
                            <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </NavLink>
                </div>

                <div style={{ height: 560, borderRadius: 0, overflow: 'hidden', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
                    {wallItems.length > 0 ? (
                        <DriftWall
                            items={wallItems}
                            columns={6}
                            tileWidth={220}
                            tileHeight={145}
                            gap={12}
                            radius={10}
                            tilt={14}
                            turn={-12}
                            perspective={1200}
                            depth={100}
                            speed={38}
                            direction="up"
                            variance={0.4}
                            parallax={0.55}
                            lift={60}
                            fade={0.5}
                            dim={0.6}
                            grayscale={true}
                            overlayColor="#0a0f1c"
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600">
                            <Images size={42} strokeWidth={1.4} aria-hidden="true" />
                            <span className="text-sm">{t('MediaTopilmadi')}</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
