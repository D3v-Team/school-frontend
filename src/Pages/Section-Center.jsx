import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ReactLoading from 'react-loading';
import { useTranslation } from "react-i18next";
import DefaultFoto from '../img/person.jpg'


export default function SectionCenter() {
    const { ID } = useParams()
    const [data, setData] = useState([])
    const [info, setInfo] = useState([])
    const { i18n } = useTranslation();

    const [loading, setLoading] = useState(true)

    const SectionCenterGetID = async () => {
        try {
            const response = await axios.get(`/department-center-first/${ID}`)
            setData(response?.data?.data);
            setInfo(response?.data?.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        SectionCenterGetID()
    }, [])

    


    if (loading) {
        return (
            < div className="flex items-center justify-center w-full h-[400px]" >
                <ReactLoading type="spinningBubbles" color='#fffff' height={100} width={100} />
            </div >
        )
    }


    return (
        <section className="mt-[30px]">
            <div className="Container">
                <div
                    className="staff_wr flex items-center bg-white  space-x-6 mb-[20px]"
                >
                    <img
                        src={data?.image?.length > 0 && data.image[0].url ? data.image[0].url : DefaultFoto}
                        alt={data?.name || "Default Image"}
                        className="w-[176px] h-[214px] object-cover"
                    />

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-[10px]">
                            {data?.name}
                        </h2>
                        <p className="staff_position text-gray-600">
                            {data?.position[i18n.language] || data?.position["uz"]}
                        </p>
                        <div className="staff_soci text-gray-700 space-y-4 mt-[30px]">
                            <p className="flex items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z" stroke="#717680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span className="font-medium">Qabul kunlari:</span> {data?.reception_days}
                            </p>
                            <p className="flex items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M4.85864 6C6.67357 4.14864 9.20268 3 12.0001 3C14.7975 3 17.3266 4.14864 19.1415 6M16.4723 9C15.3736 7.7725 13.777 7 12 7C10.223 7 8.62647 7.7725 7.52783 9M12 17C13.5105 17 14.9608 17.2576 16.3094 17.7313C16.3542 17.747 16.3767 17.7549 16.412 17.7705C16.7326 17.9118 16.9788 18.2591 17.0058 18.6084C17.0088 18.647 17.0088 18.6811 17.0088 18.7494C17.0088 18.9821 17.0088 19.0985 17.0185 19.1965C17.1122 20.1457 17.8631 20.8966 18.8123 20.9903C18.9103 21 19.0267 21 19.2594 21H19.5044C19.965 21 20.1952 21 20.3868 20.9622C21.1829 20.8053 21.8053 20.1829 21.9622 19.3868C22 19.1952 22 18.965 22 18.5044V18.3062C22 17.831 22 17.5933 21.9493 17.3209C21.8358 16.7119 21.3933 15.9583 20.9166 15.5624C20.7035 15.3854 20.5589 15.3048 20.2698 15.1435C17.822 13.7781 15.0019 13 12 13C8.99812 13 6.17797 13.7781 3.73021 15.1435C3.4411 15.3048 3.29654 15.3854 3.0834 15.5624C2.60675 15.9583 2.16421 16.7119 2.05074 17.3209C2 17.5933 2 17.831 2 18.3062V18.5044C2 18.965 2 19.1952 2.03776 19.3868C2.19469 20.1829 2.81709 20.8053 3.61321 20.9622C3.80476 21 4.03504 21 4.4956 21H4.74057C4.97332 21 5.0897 21 5.18773 20.9903C6.13689 20.8966 6.8878 20.1457 6.98152 19.1965C6.9912 19.0985 6.9912 18.9821 6.9912 18.7494C6.9912 18.6811 6.9912 18.647 6.99418 18.6084C7.02122 18.2591 7.2674 17.9118 7.58798 17.7705C7.62335 17.7549 7.64577 17.747 7.69061 17.7313C9.03921 17.2576 10.4895 17 12 17Z" stroke="#717680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span className="font-medium">Telefon:</span> {data?.phone}
                            </p>
                            <p className="flex items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 7L10.1649 12.7154C10.8261 13.1783 11.1567 13.4097 11.5163 13.4993C11.8339 13.5785 12.1661 13.5785 12.4837 13.4993C12.8433 13.4097 13.1739 13.1783 13.8351 12.7154L22 7M6.8 20H17.2C18.8802 20 19.7202 20 20.362 19.673C20.9265 19.3854 21.3854 18.9265 21.673 18.362C22 17.7202 22 16.8802 22 15.2V8.8C22 7.11984 22 6.27976 21.673 5.63803C21.3854 5.07354 20.9265 4.6146 20.362 4.32698C19.7202 4 18.8802 4 17.2 4H6.8C5.11984 4 4.27976 4 3.63803 4.32698C3.07354 4.6146 2.6146 5.07354 2.32698 5.63803C2 6.27976 2 7.11984 2 8.8V15.2C2 16.8802 2 17.7202 2.32698 18.362C2.6146 18.9265 3.07354 19.3854 3.63803 19.673C4.27976 20 5.11984 20 6.8 20Z" stroke="#717680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span className="font-medium">Email:</span> {data?.email}
                            </p>
                        </div>
                    </div>
                </div>
                <h1 className="mb-[10px] font-[var(--font-family)] text-[30px] leading-[127%] text-[#181d27]">
                    {info?.title[i18n?.language]}
                </h1>
                <div dangerouslySetInnerHTML={{ __html: info?.text[i18n.language] || i?.text['uz'] }} />
            </div>
        </section>
    )
}