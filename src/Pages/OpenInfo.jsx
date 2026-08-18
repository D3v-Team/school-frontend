import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import OpenInfoHero from "../Components/OpenInfo/OpenInfoHero";

export default function OpenInfo() {

    const { t } = useTranslation()

    return (
        <main>
            <MiniHeader title={t('ochiq_malumotlar')} minititle={t('ochiq_malumotlar')} />
            <OpenInfoHero />
        </main>
    )
}