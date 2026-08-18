import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import Bg from "../../img/Footer.png";
import gsap from 'gsap';
import axios from "axios";
import ReactLoading from "react-loading";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

/* Static fallback slides shown while backend is not connected */
const STATIC_SLIDES = [
    {
        id: 1,
        image: null, // will use gradient bg
        titleUz: "Surxondaryo viloyati umumta'lim maktabi",
        titleRu: "Общеобразовательная школа Сурхандарьинской области",
        titleEn: "Surxondaryo Region General Education School",
        titleKk: "Surxondaryo viloyati umumta'lim maktabi",
        descUz: "Bilimli avlod — kuchli jamiyat. Sifatli ta'lim, zamonaviy yondashuv.",
        descRu: "Образованное поколение — сильное общество. Качественное образование, современный подход.",
        descEn: "Educated generation — strong society. Quality education, modern approach.",
        descKk: "Bilimli avlod — kuchli jamiyat. Sifatli ta'lim, zamonaviy yondashuv.",
    },
    {
        id: 2,
        image: null,
        titleUz: "Direktor virtual qabulxonasiga murojaat qiling",
        titleRu: "Обратитесь в виртуальную приёмную директора",
        titleEn: "Contact the Director's Virtual Reception",
        titleKk: "Direktor virtual qabulxonasiga murojaat qiling",
        descUz: "Onlayn ariza topshiring, hujjatlar yuklab oling va savollaringizga javob oling.",
        descRu: "Подайте заявку онлайн, скачайте документы и получите ответы на вопросы.",
        descEn: "Submit applications online, download documents and get answers to your questions.",
        descKk: "Onlayn ariza topshiring, hujjatlar yuklab oling va savollaringizga javob oling.",
    },
    {
        id: 3,
        image: null,
        titleUz: "Yangiliklar, tadbirlar va to'garaklar",
        titleRu: "Новости, мероприятия и кружки",
        titleEn: "News, Events and Clubs",
        titleKk: "Yangiliklar, tadbirlar va to'garaklar",
        descUz: "Maktab hayotidan so'nggi yangiliklar, kelgusi tadbirlar jadvali va qo'shimcha mashg'ulotlar.",
        descRu: "Последние новости из жизни школы, расписание предстоящих мероприятий и дополнительные занятия.",
        descEn: "Latest news from school life, upcoming events schedule and extra-curricular activities.",
        descKk: "Maktab hayotidan so'nggi yangiliklar, kelgusi tadbirlar jadvali va qo'shimcha mashg'ulotlar.",
    },
];

export default function Hero() {
    const [loading, setLoading] = useState(true);
    const [data, setData]       = useState([]);
    const { i18n, t }           = useTranslation();

    useEffect(() => {
        gsap.fromTo('.Debtors',
            { opacity: 0, y: "10%" },
            { opacity: 1, duration: 1, ease: "power1.inOut", y: "0" }
        );
    }, []);

    useEffect(() => {
        getSlides();
    }, []);

    const getSlides = async () => {
        try {
            const response = await axios.get(`/carousel`);
            if (response?.data?.data?.length) {
                setData(response.data.data);
            } else {
                setData(STATIC_SLIDES);
            }
        } catch {
            // backend not ready — use static slides
            setData(STATIC_SLIDES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            gsap.fromTo(
                ".slide-content > *",
                { opacity: 0, x: "-50px" },
                { opacity: 1, x: "0", duration: 1, stagger: 0.3, ease: "power2.out" }
            );
        }
    }, [loading]);

    /* Helper: get localised text with fallback chain */
    const getText = (slide, field) => {
        const lang = i18n?.language || 'uz';
        // backend shape: slide.title / slide.description is an object {uz, ru, en, kk}
        if (slide?.title && typeof slide.title === 'object') {
            return field === 'title'
                ? (slide.title[lang] || slide.title.uz || '')
                : (slide.description?.[lang] || slide.description?.uz || '');
        }
        // static fallback shape
        const titleKey = `title${lang.charAt(0).toUpperCase() + lang.slice(1)}` || 'titleUz';
        const descKey  = `desc${lang.charAt(0).toUpperCase() + lang.slice(1)}`  || 'descUz';
        return field === 'title'
            ? (slide[titleKey] || slide.titleUz || '')
            : (slide[descKey]  || slide.descUz  || '');
    };

    const getLink = (slide) =>
        slide?.id && !STATIC_SLIDES.find(s => s.id === slide.id)
            ? `/yangilik/${slide.id}`
            : '/barcha-yangiliklar';

    if (loading) {
        return (
            <div
                className="flex items-center justify-center h-screen fixed inset-0 z-50"
                style={{
                    backgroundImage: `url(${Bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <ReactLoading type="spinningBubbles" color="#ea6c0a" height={90} width={90} />
            </div>
        );
    }

    return (
        <div className="Hero relative w-full h-[700px]">
            <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true, el: ".custom-pagination" }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="w-full h-full bg-cover bg-center"
            >
                {data.map((slide, index) => {
                    const bgImage = slide?.image?.[0]?.url || slide?.image || null;
                    const slideStyle = bgImage
                        ? {
                            backgroundImage: `linear-gradient(180deg, rgba(68, 76, 231, 0.2) 0%, #00044f 100%), url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {
                            background: `linear-gradient(135deg, #00044f 0%, #000635 100%)`,
                          };

                    return (
                        <SwiperSlide
                            key={index}
                            className="w-full h-full bg-cover bg-center relative"
                            style={slideStyle}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
                                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                                    <div className="max-w-2xl text-white slide-content">

                                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                                            Surxondaryo viloyati umumta&apos;lim maktabi
                                        </h1>

                                        <p className="mt-4 text-lg leading-relaxed">
                                            {getText(slide, 'desc')}
                                        </p>

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
