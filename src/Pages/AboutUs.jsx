import { useTranslation } from "react-i18next";
import AboutContent from "../Components/AboutUs/AboutContent";
import MiniHeader from "../Components/MiniHeader";

export default function AboutUs() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('biz_haqimizda')} minititle={t('biz_haqimizda')} />
            <AboutContent />
        </div>
    )
}