import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { mediaUrl, useLang } from "../utils/api";
import { UtensilsCrossed, Clock, Flame, Scale } from "lucide-react";

const NAVY   = '#1f235b';
const ORANGE = '#ea6c0a';

const WEEKDAYS = {
    latin: ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'],
    cyril: ['Душанба','Сешанба','Чоршанба','Пайшанба','Жума','Шанба','Якшанба'],
    ru:    ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
};

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const MEAL_META = {
    breakfast: { label: 'Nonushta',        order: 0 },
    lunch:     { label: 'Tushlik',         order: 1 },
    snack:     { label: "Yengil tamaddi",  order: 2 },
};
const MEAL_KEYS = Object.keys(MEAL_META);

function normalizeMenus(payload) {
    const source = payload?.data || payload?.items || payload;
    if (Array.isArray(source)) return source;
    if (!source || typeof source !== 'object') return [];

    return DAY_KEYS.flatMap((day, dayIndex) => {
        const dayData = source[day];
        if (!dayData || typeof dayData !== 'object') return [];
        const items = MEAL_KEYS.flatMap(meal => {
            const slot = dayData[meal];
            if (!slot || !Array.isArray(slot.foods)) return [];
            return slot.foods.map(food => ({
                ...food,
                meal,
                start_time: slot.start_time,
                end_time: slot.end_time,
            }));
        });
        return items.length ? [{ ...source, id: `${source.id || 'menu'}-${day}`, day_of_week: dayIndex, items }] : [];
    });
}

export default function CanteenMenuPage() {
    const { t } = useTranslation();
    const lang  = useLang(); // 'latin' | 'cyril' | 'ru' — reactive

    const [menus,      setMenus]      = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [activeDay,  setActiveDay]  = useState(null);

    useEffect(() => {
        pub.get('/api/canteen-menu/public/active')
            .then(res => {
                const normalized = normalizeMenus(res.data);
                setMenus(normalized);
                if (normalized.length) setActiveDay(normalized[0].day_of_week ?? 0);
            })
            .catch(() => setMenus([]))
            .finally(() => setLoading(false));
    }, []);

    const nk = `name_${lang}`;
    const dk = `description_${lang}`;

    function weekdayName(idx) {
        return (WEEKDAYS[lang] || WEEKDAYS.latin)[idx] || '';
    }

    const sortedMenus = useMemo(
        () => [...menus].sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0)),
        [menus]
    );

    const activeMenu = sortedMenus.find(m => (m.day_of_week ?? 0) === activeDay) || sortedMenus[0];

    const groupedMeals = useMemo(() => {
        if (!activeMenu) return [];
        const items = activeMenu.items || activeMenu.menu_items || [];
        const groups = {};
        items.forEach(item => {
            const key = item.meal || 'other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return Object.entries(groups).sort(
            (a, b) => (MEAL_META[a[0]]?.order ?? 99) - (MEAL_META[b[0]]?.order ?? 99)
        );
    }, [activeMenu]);

    return (
        <div>
            <section className="py-20" style={{ background: '#f8fafc', minHeight: '60vh', marginTop:'100px' }}>
                <div className="Container">

                    {/* ── heading ── */}
                    <div className="mb-9">
                        <span className="inline-flex items-center gap-2 font-semibold tracking-widest uppercase text-xs mb-2" style={{ color: ORANGE }}>
                            <UtensilsCrossed size={14} strokeWidth={2.2} aria-hidden="true" />
                            {t('Oshxonamenyusi') || 'Oshxona menyusi'}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: NAVY }}>
                            Haftalik ovqatlanish jadvali
                        </h1>
                        <div className="w-14 h-1 rounded-full mt-3" style={{ background: ORANGE }} />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : sortedMenus.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <UtensilsCrossed size={48} strokeWidth={1.5} className="mx-auto mb-4" aria-hidden="true" />
                            <p className="text-lg">Menyu topilmadi</p>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-[220px_1fr] gap-6">

                            {/* ── kun tanlash — chap tomonda vertikal, mobil'da gorizontal ── */}
                            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                                {sortedMenus.map((menu, idx) => {
                                    const dIdx = menu.day_of_week ?? idx;
                                    const active = dIdx === activeDay;
                                    return (
                                <></>
                                    );
                                })}
                            </div>

                            {/* ── tanlangan kunning menyusi ── */}
                            {activeMenu && (
                                <div className="bg-white rounded-3xl overflow-hidden w-full" style={{ border: '1px solid #fed7aa', boxShadow: '0 4px 16px rgba(15,23,42,0.05)' }}>

                                    {/* cover image (agar bo'lsa) */}
                                    {activeMenu.cover_image && (
                                        <div className="relative h-44 overflow-hidden">
                                            <img src={mediaUrl(activeMenu.cover_image)} alt=""
                                                className="w-full h-full object-cover" />
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,35,91,0.55), transparent 60%)' }} />
                                            <h2 className="absolute bottom-4 left-5 text-white font-bold text-xl">
                                                {weekdayName(activeMenu.day_of_week)}
                                            </h2>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {!activeMenu.cover_image && (
                                            <h2 className="font-bold text-xl mb-5" style={{ color: NAVY }}>
                                                {weekdayName(activeMenu.day_of_week)}
                                            </h2>
                                        )}

                                        {groupedMeals.length === 0 ? (
                                            <p className="text-gray-400 text-sm py-6 text-center">Bu kun uchun taomlar kiritilmagan</p>
                                        ) : (
                                            <div className="flex flex-col gap-6">
                                                {groupedMeals.map(([mealKey, foods]) => (
                                                    <div key={mealKey}>
                                                        {/* meal section header */}
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                                style={{ background: '#fff7ed', color: ORANGE }}>
                                                                <UtensilsCrossed size={14} strokeWidth={2} aria-hidden="true" />
                                                            </span>
                                                            <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: ORANGE }}>
                                                                {t(MEAL_META[mealKey]?.label) || MEAL_META[mealKey]?.label || mealKey}
                                                            </h3>
                                                            {foods[0]?.start_time && foods[0]?.end_time && foods[0].start_time !== '00:00' && (
                                                                <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                                                    <Clock size={12} aria-hidden="true" />
                                                                    {foods[0].start_time} – {foods[0].end_time}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* food items */}
                                                        <div className="flex flex-col gap-2">
                                                            {foods.map((item, i) => (
                                                                <div key={i}
                                                                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                                                                    style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="block text-gray-800 font-semibold text-sm truncate">
                                                                            {item[nk] || item.name_latin || item.name || '—'}
                                                                        </span>
                                                                        {(item.calories || item.weight) && (
                                                                            <span className="flex items-center gap-3 text-gray-400 text-xs mt-1">
                                                                                {item.weight && (
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Scale size={11} aria-hidden="true" /> {item.weight}g
                                                                                    </span>
                                                                                )}
                                                                                {item.calories && (
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Flame size={11} aria-hidden="true" /> {item.calories} kkal
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.price && (
                                                                        <span className="text-sm font-bold flex-shrink-0" style={{ color: ORANGE }}>
                                                                            {item.price.toLocaleString()} so'm
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* description */}
                                        {activeMenu[dk] && (
                                            <p className="mt-5 text-sm text-gray-500">{activeMenu[dk]}</p>
                                        )}

                                        {/* total price */}
                                        {activeMenu.total_price && (
                                            <div className="mt-6 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid #f1f5f9' }}>
                                                <span className="text-sm text-gray-500">Kunlik jami narx</span>
                                                <span className="font-bold text-lg" style={{ color: ORANGE }}>
                                                    {activeMenu.total_price.toLocaleString()} so'm
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}