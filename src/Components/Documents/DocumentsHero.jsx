import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import pub, { getLang } from "../../utils/api";

export default function DocumentsHero() {
    const { i18n } = useTranslation();
    const [data,    setData]    = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/api/documents', { params: { limit: 100, sortBy: 'created_at', sortOrder: 'desc' } })
            .then(res => setData(res.data?.data || res.data?.items || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center w-full h-[300px]">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <section className="py-12 mt-[100px] min-h-[60vh]">
            <div className="Container">
                <div className="flex items-center justify-center flex-col gap-[16px] w-full">
                    {data.length === 0 ? (
                        <p className="text-gray-400 py-10">Hujjatlar topilmadi</p>
                    ) : (
                        data.map(item => (
                            <div key={item.id}
                                className="w-full border px-[24px] py-[18px] bg-white cursor-pointer hover:shadow-lg duration-300 rounded-lg flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* file type badge */}
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50 border border-red-100">
                                        <span className="text-[9px] font-black text-red-500 uppercase">
                                            {item.file_url?.split('.').pop()?.toUpperCase() || 'DOC'}
                                        </span>
                                    </div>
                                    <span className="text-gray-800 font-medium text-[15px] truncate">
                                        {getLang(item, 'title', i18n.language) || 'Hujjat'}
                                    </span>
                                </div>

                                {item.file_url && (
                                    <a href={item.file_url} target="_blank" rel="noopener noreferrer"
                                        className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7 10 12 15 17 10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        Yuklab olish
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
