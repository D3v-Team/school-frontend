import { useParams } from "react-router-dom";
import MiniHeader from "../Components/MiniHeader";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { getLang, formatDate, mediaUrl } from "../utils/api";

export default function NewDetail() {
    const { ID }    = useParams();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const { i18n }  = useTranslation();

    useEffect(() => {
        pub.get(`/api/news/${ID}`)
            .then(res => setData(res.data?.data || res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [ID]);

    if (loading) return (
        <div className="flex items-center justify-center w-full h-[400px]">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="flex items-center justify-center py-20">
            <p className="text-gray-400">Yangilik topilmadi</p>
        </div>
    );

    const title   = getLang(data, 'title',   i18n.language);
    const content = getLang(data, 'content', i18n.language);

    return (
        <div>
            <MiniHeader title={title} minititle={title} />
            <section className="mt-[32px] mb-[30px]">
                <div className="Container">
                    {data.cover_image && (
                        <img src={mediaUrl(data.cover_image)} alt={title}
                            className="w-full max-h-[400px] object-cover rounded-xl mb-6" />
                    )}
                    <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                        <span>{formatDate(data.created_at)}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
                    {content ? (
                        <div className="prose max-w-none text-gray-600"
                            dangerouslySetInnerHTML={{ __html: content }} />
                    ) : null}
                </div>
            </section>
        </div>
    );
}
