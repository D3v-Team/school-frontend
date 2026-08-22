import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { getLang, mediaUrl } from "../../utils/api";

export default function VideoGallaryHero() {
    const { i18n }  = useTranslation();
    const [albums,  setAlbums]  = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/api/media-albums', { params: { limit: 50, sortBy: 'created_at', sortOrder: 'desc', is_public: true } })
            .then(res => {
                const data = res.data?.data || res.data?.items || [];
                const videos = data.filter(a => a.type === 'VIDEO' || a.type === 'video');
                setAlbums(videos.length ? videos : data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[400px]">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <section className="mt-[100px] py-12">
            <div className="Container">
                <h1 className="text-[36px] font-[700] mb-8">Videogalereya</h1>

                {albums.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">Ma'lumot yo'q</p>
                ) : (
                    albums.map(album => {
                        const videoItems = (album.items || []).filter(i =>
                            i.url?.includes('youtube') || i.url?.includes('youtu.be') || i.url?.match(/\.(mp4|webm|mov)$/i)
                        );
                        if (videoItems.length === 0 && !album.cover_image) return null;
                        return (
                            <div key={album.id} className="mb-10">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                    {getLang(album, 'title', i18n.language) || 'Video albom'}
                                </h2>
                                <div className="VdGallary">
                                    {videoItems.map((video, idx) => {
                                        const isYt = video.url?.includes('youtube') || video.url?.includes('youtu.be');
                                        const embedUrl = isYt
                                            ? video.url.replace('youtu.be/', 'www.youtube.com/embed/').replace('watch?v=', 'embed/')
                                            : null;
                                        return (
                                            <div key={idx} className="bg-black h-[380px] rounded-lg overflow-hidden">
                                                {embedUrl ? (
                                                    <iframe className="w-full h-full" src={embedUrl}
                                                        title={getLang(album, 'title', i18n.language) || 'Video'}
                                                        allowFullScreen />
                                                ) : (
                                                    <video src={mediaUrl(video.url)} controls className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
