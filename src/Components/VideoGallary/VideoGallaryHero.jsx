import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from 'react-loading';

export default function VideoGallaryHero() {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getVideoGallary = async () => {
        try {
            const response = await axios("/videos");
            setData(response?.data?.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getVideoGallary();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-[400px]">
                <ReactLoading type="spinningBubbles" color="#222555" height={100} width={100} />
            </div>
        );
    }

    return (
        <section className="mt-[35px] mb-[35px]">
            <div className="Container">
                <h1 className="text-[36px] font-[700]">
                    {t('Universitethayotidanvideolavhalar')}
                </h1>
                {data.length > 0 ? (
                    <div className="VdGallary mt-[34px]">
                        {data.map((video, index) => {
                            const embedUrl = video.url.replace("youtu.be/", "www.youtube.com/embed/");
                            return (
                                <div key={index} className="bg-black h-[380px] rounded-lg overflow-hidden">
                                    <iframe
                                        className="w-full h-full"
                                        src={embedUrl}
                                        title={video.title[i18n.language] || "Video"}
                                        allowFullScreen
                                    />
                                    <h2 className="text-white text-center mt-2">
                                        {video.title[i18n.language] || "Video"}
                                    </h2>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <h1>Ma'lumot yo'q</h1>
                    </div>
                )}
            </div>
        </section>
    );
}
