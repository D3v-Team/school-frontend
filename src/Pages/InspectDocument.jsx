import { useTranslation } from "react-i18next";
import InspectDocumentInfo from "../Components/InspectDocument/InspectDocumentInfo";
import MiniHeader from "../Components/MiniHeader";

export default function InspectDocument() {

    const { t } = useTranslation()

    return (
        <main>
            <MiniHeader title={t('murojaatlar')} minititle={t('murojaatlar')} />
            <InspectDocumentInfo />
        </main>
    )
}