import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import DriftWall from "../DriftWall";

/* Static gallery images — backend will be connected later */
const galleryItems = [
    { image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', title: "Maktab binosi" },
    { image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', title: "Ta'lim jarayoni" },
    { image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80', title: "Darslar" },
    { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', title: "Sport" },
    { image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', title: "Olimpiada" },
    { image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80', title: "Texnologiya" },
    { image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80', title: "Kutubxona" },
    { image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', title: "Tadbirlar" },
    { image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&q=80', title: "Sinf xonasi" },
    { image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', title: "Guruhli ishlar" },
    { image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80', title: "Tabiat" },
    { image: 'https://images.unsplash.com/photo-1551958219-acbc595f14e2?w=600&q=80', title: "Robototexnika" },
    { image: 'https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=600&q=80', title: "Musiqa" },
    { image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=80', title: "Laboratoriya" },
    { image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&q=80', title: "San'at" },
];

export default function GallerySection() {
    const { t } = useTranslation();

    return (
        <section style={{ background: '#0a0f1c' }} className="py-16">
            <div className="Container">
                {/* Header */}
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

                {/* DriftWall — full width, Container dan tashqarida */}
                <div style={{ height: 560, borderRadius: 0, overflow: 'hidden', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
                    <DriftWall
                        items={galleryItems}
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
                </div>
            </div>
        </section>
    );
}
