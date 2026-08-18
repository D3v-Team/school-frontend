
import { useTranslation } from "react-i18next";
import UserMessage from "../others/UserMessage";

export default function CabinetHero({ data }) {
  const { i18n } = useTranslation();
  const { t } = useTranslation();


 



  return (
    <section className="cabinetHero mt-[30px] p-[20px]">
      <div className="Container">
        <div className="cabinet_face flex items-center justify-start gap-[30px]">
          <img
            className="w-[130px] h-[130px] rounded-[50%] object-cover"
            src={data?.image[0]?.url ? data?.image[0]?.url : ''} alt="" />
          <h1 className="font-semibold text-[20px]  text-[#0a0d12]">
            {data?.position[i18n?.language]}{" "}
            <span className="text-[#2d31a6]">
              {data?.name}
            </span>
            <br />
            {" "} {t('virtualqabulxonasi')}
          </h1>
        </div>
        <UserMessage />
      </div>
    </section>
  );
}
