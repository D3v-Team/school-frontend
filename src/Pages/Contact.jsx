import { useTranslation } from "react-i18next";
import ContactHero from "../Components/Contact/ContactHero";
import MiniHeader from "../Components/MiniHeader";

export default function Conatact() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('boglanish')} minititle={t('boglanish')} />
            <ContactHero />
        </div>
    )
}