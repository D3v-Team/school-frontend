import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from 'react-loading';

export default function FototGallaryHero() {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const GetFotoGallary = async () => {
        try {
            const response = await axios("/photos");
            setData(response?.data?.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetFotoGallary();
    }, []);

    const closeModal = () => {
        setSelectedPhoto(null);
    };

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
                    {t('Universitethayotidanfotolavhalar')}
                </h1>

                {data.length > 0 ? (
                    <div className="mt-[35px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className={`relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer ${index % 5 === 0 ? 'col-span-2 row-span-2' : ''}`}
                                onClick={() => setSelectedPhoto(item)}
                            >
                                <img
                                    src={item?.image[0]?.url}
                                    alt={item.title || "Photo"}
                                    className="w-full h-full object-cover rounded-lg"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <h1>Ma'lumot yo'q</h1>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-[#474747ea] rounded-[4px] max-w-[90%] sm:max-w-[800px] shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedPhoto?.image[0]?.url}
                            alt={selectedPhoto?.title[i18n.language]}
                            className="w-full h-auto rounded-t-[4px]"
                        />
                        <div className="p-[21px]">
                            <h2 className="text-start text-[white] mt-2 text-lg font-semibold">{selectedPhoto?.title[i18n?.language]}</h2>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}