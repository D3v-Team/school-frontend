import { useTranslation } from "react-i18next";
import CenterHero from "../Components/Center/CenterHero";
import MiniHeader from "../Components/MiniHeader";

export default function Center() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('bolim_markazlar')} minititle={t('bolim_markazlar')} />
            <CenterHero />
        </div>
    )
}