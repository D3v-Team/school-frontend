import { useTranslation } from "react-i18next";
import MiniHeader from "../Components/MiniHeader";
import VideoGallaryHero from "../Components/VideoGallary/VideoGallaryHero";

export default function VideoGallary() {

    const { t } = useTranslation()

    return (
        <div>
            <MiniHeader title={t('VideoGallary')} minititle={t('VideoGallary')} />
            <VideoGallaryHero />
        </div>

    )
}