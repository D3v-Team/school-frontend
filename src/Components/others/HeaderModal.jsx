import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HederModal({ isActive, onClose }) {
    const { t,  } = useTranslation();



    const location = useLocation();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const isActivePath = (path) => location.pathname === path;

    return (
        <>
            <div className={`headerModalShadow ${isActive ? "db_shadow" : ''}`}>
                <div className={`headerModal ${isActive ? 'db' : ''}`}>
                    <div className="headerModalContent">
                        <div className="logo">
                            <h1 className="text-[35px] text-[white]">
                                Jizzax Construction
                            </h1>
                        </div>
                        <ul>
                            <li onClick={() => { scrollToTop(); onClose(); }}>
                                <NavLink className={isActivePath('/') ? 'activeLink' : ''} to="/">
                                    {t('Home')}
                                </NavLink>
                            </li>
                            <li onClick={() => { scrollToTop(); onClose(); }}>
                                <NavLink className={isActivePath('/news') ? 'activeLink' : ''} to="/news">
                                    {t('New')}
                                </NavLink>
                            </li>
                            <li onClick={() => { scrollToTop(); onClose(); }}>
                                <NavLink className={isActivePath('/aboutus') ? 'activeLink' : ''} to="/aboutus">
                                    {t('AboutUs')}
                                </NavLink>
                            </li>
                            <li onClick={() => { scrollToTop(); onClose(); }}>
                                <NavLink className={isActivePath('/service') ? 'activeLink' : ''} to="/service">
                                    {t('Service')}
                                </NavLink>
                            </li>
                            <li onClick={() => { scrollToTop(); onClose(); }}>
                                <NavLink className={isActivePath('/projects') ? 'activeLink' : ''} to="/projects">
                                    {t('Project')}
                                </NavLink>
                            </li>
                            <li onClick={() => { scrollToTop(); onClose(); }} className="mb-[20px]">
                                <NavLink className={isActivePath('/social') ? 'activeLink' : ''} to="/social">
                                    {t('Social')}
                                </NavLink>
                            </li>
                            <li onClick={() => { scrollToTop(); onClose(); }} className="py-[10px] px-[20px] bg-[white] inline rounded-[10px] border-none">
                                <NavLink className={'text-[#134A9B] font-bold'} to="/contact">
                                    {t('Contact')}
                                </NavLink>
                            </li>
                          
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
