import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import MoneyHero from "../Components/MoneyPage/MoneyHero";
export default function Money() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('korrupsiya_kurash')} minititle={t('korrupsiya_kurash')} />
            <MoneyHero />
        </div>
    )
}