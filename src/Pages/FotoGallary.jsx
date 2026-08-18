import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import FototGallaryHero from "../Components/FotoGallary/FotoGallaryHero";

export default function FotoGallary() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('Fotogalereya')} minititle={t('Fotogalereya')} />
            <FototGallaryHero />
        </div>

    )
}