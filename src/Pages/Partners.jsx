import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import PartnersHero from "../Components/Partners/PartnersHero";

export default function Partners() {

    const { t } = useTranslation()

    return (
        <main>
            <MiniHeader title={t('hamkorlarimiz')} minititle={t('hamkorlarimiz')} />
            <PartnersHero />
        </main>
    )
}