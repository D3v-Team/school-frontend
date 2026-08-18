import { useTranslation } from "react-i18next";

export default function PostHero({ data }) {
    const { i18n } = useTranslation();


    return (
        <section className="aboutContent pt-[20px] pb-[20px]">
            <div className="Container">
                {data?.length > 0 ? (
                    data?.map((i, index) => {
                        return (
                            <div key={index}>
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
    )
}