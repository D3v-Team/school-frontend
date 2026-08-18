import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactLoading from 'react-loading';
import img_def from '../../img/default_image.jpg';

export default function PartnersHero() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const getNews = async () => {
        try {
            const response = await axios.get(`/our-partner`);
            setData(response?.data?.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNews();
    }, []);

    return (
        <section className="mt-8 mb-8">
            <div className="Container">

                {loading ? (
                    <div className="flex items-center justify-center w-full h-[400px]">
                        <ReactLoading type="spinningBubbles" color="#000" height={100} width={100} />
                    </div>
                ) : (
                    data?.length && true > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {data.map((item, index) => (
                                <div
                                    key={index}
                                    className=" bg-[#FDFDFD] py-[20px]  hover:shadow-lg cursor-pointer duration-500 border  flex items-center justify-center border-[#F5F5F5] rounded-lg"
                                >
                                    <a
                                        href={item?.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img src={item?.image[0]?.url || img_def} alt={`Partner ${index + 1}`} className="max-w-[300px] max-h-[122px] h-full w-full h-auto object-contain" />
                                    </a>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <h1>
                                Empty data
                            </h1>
                        </div>
                    ))}
            </div>
        </section>
    );
}
