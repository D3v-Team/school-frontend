import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import WorkHero from "../Components/Work/WorkHero";

export default function WorkPage() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('bosh_ish_orni')} minititle={t('bosh_ish_orni')} />
            <WorkHero />
        </div>
    )
}