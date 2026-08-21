import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import pub, { getLang, mediaUrl, useLang } from "../utils/api";
import { UtensilsCrossed } from "lucide-react";

const WEEKDAYS = {
    latin: ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'],
    cyril: ['Душанба','Сешанба','Чоршанба','Пайшанба','Жума','Шанба','Якшанба'],
    ru:    ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
};

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_KEYS = ['breakfast', 'lunch', 'snack'];

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

    const [menus,   setMenus]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/api/canteen-menu/public/active')
            .then(res => setMenus(normalizeMenus(res.data)))
            .catch(() => setMenus([]))
            .finally(() => setLoading(false));
    }, []);

    const nk = `name_${lang}`;
    const dk = `description_${lang}`;

    function weekdayName(idx) {
        return (WEEKDAYS[lang] || WEEKDAYS.latin)[idx] || '';
    }

    return (
        <div>
            <MiniHeader title="Oshxona menyusi" minititle="Kunlik ovqat taomlari" />
            <section className="py-14" style={{ background: 'linear-gradient(180deg,#f8fafc 0%,#fff7ed 100%)', minHeight: '60vh' }}>
                <div className="Container">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : menus.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <UtensilsCrossed size={48} strokeWidth={1.5} className="mx-auto mb-4" aria-hidden="true" />
                            <p className="text-lg">Menyu topilmadi</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {menus.map((menu, idx) => {
                                const items = menu.items || menu.menu_items || [];
                                return (
                                    <div key={menu.id || idx} className="bg-white rounded-3xl overflow-hidden shadow-sm transition-shadow hover:shadow-lg"
                                        style={{ border: '1px solid #fed7aa' }}>
                                        {/* header */}
                                        <div className="px-5 py-5 flex items-center gap-3"
                                            style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
                                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'rgba(234,108,10,0.16)', border: '1px solid rgba(251,146,60,0.35)' }}>
                                                <UtensilsCrossed size={21} color="#fb923c" aria-hidden="true" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.16em] text-orange-300 mb-1">{t('Oshxonamenyusi')}</p>
                                                <h3 className="font-bold text-white text-base leading-tight">
                                                    {weekdayName(menu.day_of_week) || `Menyu ${idx + 1}`}
                                                </h3>
                                                {menu.date && (
                                                    <span className="text-xs text-slate-400">{menu.date}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* image */}
                                        {menu.cover_image && (
                                            <img src={mediaUrl(menu.cover_image)} alt=""
                                                className="w-full h-36 object-cover" />
                                        )}

                                        {/* items list */}
                                        {items.length > 0 && (
                                            <ul className="px-4 py-4 space-y-2.5">
                                                {items.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 rounded-2xl px-3 py-3 text-sm"
                                                        style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                        <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                            style={{ background: '#fff7ed', color: '#ea6c0a' }}>
                                                            <UtensilsCrossed size={15} strokeWidth={1.8} aria-hidden="true" />
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-gray-800 font-semibold">
                                                                {item.meal && <span className="text-orange-500 mr-1 text-xs uppercase tracking-wide">{t(item.meal === 'breakfast' ? 'Nonushta' : item.meal === 'lunch' ? 'Tushlik' : 'Yengil_tamaddi')}:</span>}
                                                                {item[nk] || item.name_latin || item.name || '—'}
                                                            </span>
                                                            {item.start_time && item.end_time && item.start_time !== '00:00' && (
                                                                <span className="text-gray-400 text-xs ml-2">{item.start_time} - {item.end_time}</span>
                                                            )}
                                                            {(item.calories || item.weight) && (
                                                                <span className="text-gray-400 text-xs ml-2">
                                                                    {item.weight && `${item.weight}g`}
                                                                    {item.weight && item.calories && ' · '}
                                                                    {item.calories && `${item.calories} kkal`}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.price && (
                                                            <span className="text-xs font-bold text-orange-500 flex-shrink-0">
                                                                {item.price.toLocaleString()} so'm
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* description */}
                                        {menu[dk] && (
                                            <p className="px-5 pb-4 text-sm text-gray-500">{menu[dk]}</p>
                                        )}

                                        {/* total price */}
                                        {menu.total_price && (
                                            <div className="px-5 py-3 flex justify-between items-center"
                                                style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                                                <span className="text-sm text-gray-500">Jami narx</span>
                                                <span className="font-bold text-orange-500">
                                                    {menu.total_price.toLocaleString()} so'm
                                                </span>
                                            </div>
                                        )}
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
