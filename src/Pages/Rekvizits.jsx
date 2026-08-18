import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import RekvisitsHero from "../Components/Rekvizits/RekvisitsHero";


export default function Rekvizits() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('rekvizitlar')} minititle={t('rekvizitlar')} />
            <RekvisitsHero />
        </div>
    )
}