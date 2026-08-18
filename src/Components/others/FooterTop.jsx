import { useTranslation } from 'react-i18next'
import Foto from '../../img/2025.png'

export default function FooterTop() {

    const { t } = useTranslation()

    return (
        <div className="footertop flex items-center justify-between h-[158px] py-[48px]">
            <div className="footertop_content">
                <h1 class="font-[var(--font-family)] font-semibold text-[20px] leading-[150%] text-white">
                    {t('Yangiliklargaazobolishniistaysizmi')}
                </h1>
                <p class="mt-[10px] font-[var(--font-family)] font-normal text-[16px] leading-[150%] text-[#a4a7ae]">
                    {t('Doimsiznixabardorqilishimizmumkin')}
                </p>
            </div>
            <div className="footertop_sub ">
                <img className='w-[400px]' src={Foto} alt="" />
            </div>
        </div>
    )
}