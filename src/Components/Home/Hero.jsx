import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import pub, { getLang, mediaUrl } from '../../utils/api';

function bannerHref(url) {
    const u = (url || '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u) || u.startsWith('/')) return u;
    if (u.includes('.') && !/\s/.test(u)) return `https://${u}`;
    return u;
}

export default function Hero() {
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        let cancelled = false;
        pub.get('/api/banners/public', { params: { sortBy: 'order', sortOrder: 'asc' } })
            .then(res => {
                if (cancelled) return;
                const list = res.data?.data || res.data?.items || [];
                const sorted = [...list]
                    .filter(b => b.is_active !== false)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                setBanners(sorted);
            })
            .catch(() => { if (!cancelled) setBanners([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="Hero relative w-full h-[700px] flex items-center justify-center"
                style={{ background: '#0a0f1c' }}>
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const slides = banners.length ? banners : [{ id: 'empty', title_latin: t('Logo') }];

    return (
        <div className="Hero relative w-full h-[700px]">
            <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true, el: ".custom-pagination" }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="w-full h-full bg-cover bg-center"
            >
                {slides.map((banner) => {
                    const bgImageUrl = mediaUrl(banner.image_url || banner.image);
                    const title = getLang(banner, 'title', i18n.language) || t('Logo');
                    const href = bannerHref(banner.link_url);
                    const slideStyle = bgImageUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg, rgba(10,15,28,0.25) 0%, rgba(10,15,28,0.85) 100%), url(${bgImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { background: 'linear-gradient(135deg, #0a0f1c 0%, #000635 100%)' };

                    return (
                        <SwiperSlide
                            key={banner.id}
                            className="w-full h-full bg-cover bg-center relative"
                            style={slideStyle}
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                                    <div className="max-w-2xl text-white">
                                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                                            {title}
                                        </h1>
                                        {href && (
                                            <a
                                                href={href}
                                                target={href.startsWith('http') ? '_blank' : undefined}
                                                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                                style={{ background: '#ea6c0a' }}
                                            >
                                                {t('Batafsil') || "Batafsil"}
                                                <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
                                                    <path d="M1.16666 7.50002H12.8333M12.8333 7.50002L6.99999 1.66669M12.8333 7.50002L6.99999 13.3334"
                                                        stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            <div className="custom-pagination" />
        </div>
    );
}
