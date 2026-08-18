import { useTranslation } from "react-i18next";


export default function NewsHero({ data }) {
    const { i18n } = useTranslation();

    return (
        <section className="mt-[32px] mb-[30px] ">
            <div className="Container">
                <div dangerouslySetInnerHTML={{ __html: data?.summary[i18n.language] || data?.summary['uz'] }} />
            </div>
        </section >
    );
}
