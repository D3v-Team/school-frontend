import { useTranslation } from "react-i18next";
import DocumentsHero from "../Components/Documents/DocumentsHero";
import MiniHeader from "../Components/MiniHeader";

export default function Documents() {

    const { t } = useTranslation()

    return (
        <main>
            <MiniHeader title={t('hujjatlar')} minititle={t('hujjatlar')} />
            <DocumentsHero />
        </main>
    )
}