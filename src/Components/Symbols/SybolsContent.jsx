import { useTranslation } from "react-i18next";

export default function SymbolsContent() {
    const { t } = useTranslation();
    
    return (
        <section className="symbols_content pt-[10px]">
            <div className="Container">
                <div className="symbol_flag">
                    <h1 className="font-semibold text-[30px] leading-[127%] text-[#181d27] mt-[20px] mb-[40px]">
                        {t("symbols_madhiy_title")}
                    </h1>
                    <p className="font-normal text-[16px] leading-[150%] text-[#535862]">
                      {t("symbols_flag_paragraph1")} <br />
                        {t("symbols_flag_paragraph2")} <br />
                        {t("symbols_flag_paragraph3")} <br />
                        {t("symbols_flag_paragraph4")} <br />
                        {t("symbols_flag_paragraph5")} <br />
                        {t("symbols_flag_paragraph6")} <br />
                        {t("symbols_flag_paragraph7")} <br />
                        {t("symbols_flag_paragraph8")} <br />
                        {t("symbols_flag_paragraph9")} <br />
                        {t("symbols_flag_paragraph10")}
                    </p>
                </div>
                <div className="symbol_g">
                    <h1 className="font-semibold text-[30px] leading-[127%] text-[#181d27] mt-[20px] mb-[40px]">
                        {t("symbols_gerb_title")}
                    </h1>
                    <p className="font-normal text-[16px] leading-[150%] text-[#535862]">
                    {t("symbols_gerb_paragraph1")} <br />
                    {t("symbols_gerb_paragraph2")} <br />
                    {t("symbols_gerb_paragraph3")} <br />
                     {t("symbols_gerb_paragraph4")} <br />
                     {t("symbols_gerb_paragraph5")}
                    </p>
                </div>
                <div className="symbol_m">
                    <h1 className="font-semibold text-[30px] leading-[127%] text-[#181d27] mt-[20px] mb-[40px]">
                        {t("symbols_madhiy_title")}
                    </h1>
                    <p className="font-normal mb-[10px] text-[16px] leading-[150%] text-[#535862]">
                        {t("symbols_madhiy_description")}
                    </p>
                    <p className="mb-[10px] font-bold text-[16px] leading-[150%] text-[#535862]">
                        {t("symbols_madhiy_music")}
                    </p>
                    <p className="mb-[10px] font-bold text-[16px] leading-[150%] text-[#535865]">
                        {t("symbols_madhiy_lyrics")}
                    </p>
                    <p className="font-custom font-normal text-[16px] leading-[150%] text-[#535862] mt-[10px]">
                        {t("symbols_madhiy_verse1_line1")} <br />
                        {t("symbols_madhiy_verse1_line2")} <br />
                        {t("symbols_madhiy_verse1_line3")} <br />
                        {t("symbols_madhiy_verse1_line4")} <br />
                        <br />
                        {t("symbols_madhiy_chorus_line1")} <br />
                        {t("symbols_madhiy_chorus_line2")} <br />
                        {t("symbols_madhiy_chorus_line3")} <br />
                        {t("symbols_madhiy_chorus_line4")} <br />
                        <br />
                        {t("symbols_madhiy_verse2_line1")} <br />
                        {t("symbols_madhiy_verse2_line2")} <br />
                        {t("symbols_madhiy_verse2_line3")} <br />
                        {t("symbols_madhiy_verse2_line4")} <br />
                        <br />
                        {t("symbols_madhiy_chorus_repeat_line1")} <br />
                        {t("symbols_madhiy_chorus_repeat_line2")} <br />
                        {t("symbols_madhiy_chorus_repeat_line3")} <br />
                        {t("symbols_madhiy_chorus_repeat_line4")} <br />
                    </p>
                </div>
            </div>
        </section>
    );
}
