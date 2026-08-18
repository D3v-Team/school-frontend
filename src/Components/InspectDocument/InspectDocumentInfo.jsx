import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from 'react-loading';


export default function InspectDocumentInfo() {
    const { i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)

    const FetchData = async () => {
        try {
            const response = await axios.get("/review-proces");
            setData(response?.data?.data);
            console.log(response);
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
        <section className="my-[20px] md:my-[30px] lg:my-[40px]">
            <div className="Container">
                {data?.length > 0 ? (
                    data?.map((i, index) => (
                        <div key={index}>
                            <h1 className="mb-[10px] font-[var(--font-family)] font-semibold text-[30px] leading-[127%] text-[#181d27]">
                                {i?.title[i18n?.language]}
                            </h1>
                            <div dangerouslySetInnerHTML={{ __html: i?.description[i18n.language] }} />
                        </div>
                    ))
                ) : (
                    < div className="flex items-center justify-center w-full h-[400px]" >
                        <h1 className="text-[25px] opacity-[0.7]">
                            Malumot yo'q
                        </h1>
                    </div>
                )}

            </div>
        </section>
    );
}