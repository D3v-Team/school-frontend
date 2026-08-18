import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from 'react-loading';


export default function AboutContent() {
    const { i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)

    const FetchData = async () => {
        try {
            const response = await axios.get("/aboutme");
            setData(response?.data?.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        FetchData();
    }, []);

    if (loading) {
        return (
            < div className="flex items-center justify-center w-full h-[400px]" >
                <ReactLoading type="spinningBubbles" color='#fffff' height={100} width={100} />
            </div >
        )
    }



    return (
        <section className="aboutContent pt-[20px] pb-[20px]">
            <div className="Container">
                {data?.length > 0 ? (
                    data?.map((i, index) => {
                        return (
                            <div key={index} className="mb-[30px]">
                                <h1 className="mb-[10px] font-bold text-[30px] leading-[127%] text-[#181d27]">
                                    {i?.title[i18n?.language]}
                                </h1>
                                <div dangerouslySetInnerHTML={{ __html: i?.text[i18n.language] || i?.text['uz'] }} />
                            </div>
                        )
                    })
                ) : (
                    < div className="flex items-center justify-center w-full h-[400px]" >
                        <h1 className="text-[25px] opacity-[0.7]">
                            Ma'lumot yo'q
                        </h1>
                    </div>
                )}

            </div>
        </section>
    );
}
