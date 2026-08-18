
import { useTranslation } from "react-i18next";
import '../../i18n/i18n';
export default function ProjectCard({img,title,Length,date}) {

       const { t, i18n } = useTranslation();
           const lan = localStorage.getItem('i18nextLng')    
           const changeLanguage = (lng) => {
               i18n.changeLanguage(lng); // Переключение языка
               setLan(lng)
            }
    return(
        <div className="project_card rounded-[5px]">
            <img className="w-[150px] object-cover rounded-[10px] h-[100px]" src={img} alt="" />
            <div className="project_content">
                <h1>{title}</h1>
                <ul>
                    <li>{t('Pro-Len')}</li>
                    <li>{Length}</li>
                </ul>
                <ul>
                    <li>{t('Pro-date')}</li>
                    <li>{date}</li>
                </ul>
            </div>
        </div>
    )
}