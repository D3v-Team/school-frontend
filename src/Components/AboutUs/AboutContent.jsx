import { useTranslation } from "react-i18next";
import { Trophy, FlaskConical, Palette, Globe2, BookOpen, Dumbbell } from "lucide-react";

const NAVY   = '#1f235b';
const ORANGE = '#ea6c0a';

/* ── Fake multilingual data ── */
const DATA = {
    latin: {
        label:    "Maktabimiz haqida",
        title:    "Biz haqimizda",
        text:     `Maktabimiz Surxondaryo viloyatida joylashgan bo'lib, farzandlarimizga
sifatli ta'lim berib kelmoqda. Bugungi kunda yuzlab o'quvchi va malakali
o'qituvchi jamoamizda faoliyat yuritmoqda. Maqsadimiz — har bir bolaga zamonaviy bilim,
ma'naviy tarbiya va kelajakka ishonch berish.`,
        features: [
            { icon: Trophy,       title: "Olimpiada g'oliblari",     text: "Har yili viloyat va respublika olimpiadalarida o'quvchilarimiz yuqori o'rinlarni egallaydi." },
            { icon: FlaskConical, title: "Zamonaviy laboratoriyalar", text: "Fizika, kimyo va biologiya fanlaridan to'liq jihozlangan zamonaviy laboratoriya xonalari." },
            { icon: Palette,      title: "To'garaklar va seksiyalar", text: "20 dan ortiq to'garak: musiqa, rasm, robototexnika, sport va ko'plab qiziqarli mashg'ulotlar." },
            { icon: Globe2,       title: "Onlayn xizmatlar",          text: "Ariza topshirish, hujjatlar yuklab olish va direktor qabulxonasiga murojaat — to'liq onlayn." },
            { icon: BookOpen,     title: "Zamonaviy kutubxona",       text: "10 000+ kitob, elektron resurslar va o'qish zali bilan boyitilgan maktab kutubxonasi." },
            { icon: Dumbbell,     title: "Sport majmuasi",            text: "Futbol maydoni, sport zali va suzish havzasi — sog'lom avlod uchun keng imkoniyatlar." },
        ],
    },
    cyril: {
        label:    "Мактабимиз ҳақида",
        title:    "Биз ҳақимизда",
        text:     `Мактабимиз Сурхондарё вилоятида жойлашган бўлиб, фарзандларимизга
сифатли таълим бериб келмоқда. Бугунги кунда юзлаб ўқувчи ва малакали
ўқитувчи жамоамизда фаолият юритмоқда. Мақсадимиз — ҳар бир болага замонавий билим,
маънавий тарбия ва келажакка ишонч бериш.`,
        features: [
            { icon: Trophy,       title: "Олимпиада ғолиблари",       text: "Ҳар йили вилоят ва республика олимпиадаларида ўқувчиларимиз юқори ўринларни эгаллайди." },
            { icon: FlaskConical, title: "Замонавий лабораториялар",   text: "Физика, кимё ва биология фанларидан тўлиқ жиҳозланган замонавий лаборатория хоналари." },
            { icon: Palette,      title: "Тўгараклар ва секциялар",   text: "20 дан ортиқ тўгарак: мусиқа, расм, робототехника, спорт ва кўплаб қизиқарли машғулотлар." },
            { icon: Globe2,       title: "Онлайн хизматлар",          text: "Ариза топшириш, ҳужжатлар юклаб олиш ва директор қабулхонасига мурожаат — тўлиқ онлайн." },
            { icon: BookOpen,     title: "Замонавий кутубхона",       text: "10 000+ китоб, электрон ресурслар ва ўқиш зали билан бойитилган мактаб кутубхонаси." },
            { icon: Dumbbell,     title: "Спорт мажмуаси",            text: "Футбол майдони, спорт зали ва сузиш ҳавзаси — соғлом авлод учун кенг имкониятлар." },
        ],
    },
    ru: {
        label:    "О нашей школе",
        title:    "О нас",
        text:     `Наша школа расположена в Сурхандарьинской области и обеспечивает детей
качественным образованием. Сегодня в нашем коллективе работают сотни учеников
и высококвалифицированных учителей. Наша цель — дать каждому ребёнку современные знания,
нравственное воспитание и уверенность в будущем.`,
        features: [
            { icon: Trophy,       title: "Победители олимпиад",       text: "Ежегодно наши ученики занимают призовые места на областных и республиканских олимпиадах." },
            { icon: FlaskConical, title: "Современные лаборатории",   text: "Полностью оснащённые лаборатории по физике, химии и биологии." },
            { icon: Palette,      title: "Кружки и секции",           text: "Более 20 кружков: музыка, рисование, робототехника, спорт и многое другое." },
            { icon: Globe2,       title: "Онлайн-услуги",             text: "Подача заявлений, скачивание документов и обращение к директору — полностью онлайн." },
            { icon: BookOpen,     title: "Современная библиотека",     text: "Более 10 000 книг, электронные ресурсы и читальный зал." },
            { icon: Dumbbell,     title: "Спортивный комплекс",       text: "Футбольное поле, спортзал и бассейн — широкие возможности для здорового поколения." },
        ],
    },
};

function normalizeLang(lang) {
    const code = (lang || 'uz').split('-')[0].toLowerCase();
    if (code === 'ru') return 'ru';
    if (['cyrl', 'kk'].includes(code)) return 'cyril';
    return 'latin';
}

export default function AboutContent() {
    const { i18n } = useTranslation();
    const key = normalizeLang(i18n.language);
    const d   = DATA[key];

    return (
        <section className="aboutContent relative overflow-hidden py-16 " style={{ background: '#f8fafc' }}>
            {/* decorative blurs */}
            <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-70 blur-3xl"
                style={{ background: '#fff2e3' }} />
            <div className="pointer-events-none absolute top-60 -left-24 w-80 h-80 rounded-full opacity-70 blur-3xl"
                style={{ background: '#eef0fb' }} />

            <div className="Container relative">

                {/* ── Intro ── */}
                <div className="max-w-3xl mb-14 margin-top-[40px]">
                    <span className="inline-flex items-center gap-2 font-semibold tracking-widest uppercase text-xs mb-3"
                        style={{ color: ORANGE }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ORANGE }} />
                        {d.label}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight" style={{ color: NAVY }}>
                        {d.title}
                    </h1>
                    <div className="w-14 h-1 rounded-full mb-6" style={{ background: ORANGE }} />
                    <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                        {d.text}
                    </p>
                </div>

                {/* ── Features grid ── */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {d.features.map((f, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-white rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5"
                            style={{ border: '1px solid #eef0f4', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 40px -14px rgba(15,23,42,0.16)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.05)'}
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                                style={{ background: '#fff7ed', border: '1.5px solid #fed7aa' }}>
                                <f.icon size={26} strokeWidth={1.8} color={ORANGE} aria-hidden="true" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 leading-snug" style={{ color: NAVY }}>
                                {f.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {f.text}
                            </p>
                            <div className="absolute bottom-0 left-7 right-7 h-[3px] rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                                style={{ background: ORANGE }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
