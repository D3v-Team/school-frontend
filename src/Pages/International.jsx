import { useTranslation } from "react-i18next";
import InternationalHero from "../Components/International/InternationalHero";
import MiniHeader from "../Components/MiniHeader";

export default function International() {

    const { t } = useTranslation()

    return (
        <main>
            <MiniHeader title={t('xalqaro_aloqalar')} minititle={t('xalqaro_aloqalar')} />
            <InternationalHero />
        </main>
    )
}