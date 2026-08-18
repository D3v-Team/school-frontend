import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSelect() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        {
            code: "uz", label: "UZ", flag:
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
                    <path fill="#0099b5" d="M0 9v4h36V9a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4"></path>
                    <path fill="#1eb53a" d="M36 27v-4H0v4a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4"></path>
                    <path fill="#ce1126" d="M0 13h36v1.5H0zm0 8.5h36V23H0z"></path>
                    <path fill="#eee" d="M0 18v3.5h36v-7H0z"></path>
                    <path fill="#fff" d="M4.2 9.16a3.12 3.12 0 0 1 2.6-3.076a3.12 3.12 0 1 0 0 6.152A3.12 3.12 0 0 1 4.2 9.16m4.683 2.303l-.14-.431l-.14.431h-.454l.367.267l-.14.431l.367-.267l.366.267l-.14-.431l.367-.267zm2.702 0l-.14-.431l-.14.431h-.453l.367.267l-.14.431l.366-.267l.367.267l-.14-.431l.367-.267zm-.14-2.927l-.14.431h-.453l.367.267l-.14.431l.366-.267l.367.267l-.14-.431l.367-.267h-.454zm2.843 2.927l-.14-.431l-.14.431h-.453l.366.267l-.14.431l.367-.267l.367.267l-.14-.431l.366-.267zm-.14-2.927l-.14.431h-.453l.366.267l-.14.431l.367-.267l.367.267l-.14-.431l.366-.267h-.453zm0-2.496l-.14.431h-.453l.366.267l-.14.431l.367-.267l.367.267l-.14-.431l.366-.267h-.453zm2.843 5.423l-.14-.431l-.14.431h-.454l.367.267l-.14.431l.367-.267l.366.267l-.14-.431l.367-.267zm-.14-2.927l-.14.431h-.454l.367.267l-.14.431l.367-.267l.366.267l-.14-.431l.367-.267h-.453zm0-2.496l-.14.431h-.454l.367.267l-.14.431l.367-.267l.366.267l-.14-.431l.367-.267h-.453zm2.842 5.423l-.14-.431l-.14.431h-.453l.367.267l-.14.431l.366-.267l.367.267l-.14-.431l.367-.267zm-.14-2.927l-.14.431h-.453l.367.267l-.14.431l.366-.267l.367.267l-.14-.431l.367-.267h-.454zm0-2.496l-.14.431h-.453l.367.267l-.14.431l.366-.267l.367.267l-.14-.431l.367-.267h-.454z"></path>
                </svg>
        },
        {
            code: "ru", label: "RU", flag:
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
                    <path fill="#ce2028" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-4h36z"></path>
                    <path fill="#22408c" d="M0 13h36v10H0z"></path>
                    <path fill="#eee" d="M32 5H4a4 4 0 0 0-4 4v4h36V9a4 4 0 0 0-4-4"></path>
                </svg>
        },
        {
            code: "en", label: "EN", flag:
                <svg xmlns="http://www.w3.org/2000/svg" width="1.34em" height="1em" viewBox="0 0 32 24">
                    <g fill="none">
                        <path fill="#2e42a5" fillRule="evenodd" d="M0 0v24h32V0z" clipRule="evenodd" />
                        <mask id="flagpackGbUkm0" width={32} height={24} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: 'luminance' }}>
                            <path fill="#fff" fillRule="evenodd" d="M0 0v24h32V0z" clipRule="evenodd" />
                        </mask>
                        <g mask="url(#flagpackGbUkm0)">
                            <path fill="#fff" d="m-3.563 22.285l7.042 2.979l28.68-22.026l3.715-4.426l-7.53-.995l-11.698 9.491l-9.416 6.396z" />
                            <path fill="#f50100" d="M-2.6 24.372L.989 26.1L34.54-1.599h-5.037z" />
                            <path fill="#fff" d="m35.563 22.285l-7.042 2.979L-.159 3.238l-3.715-4.426l7.53-.995l11.698 9.491l9.416 6.396z" />
                            <path fill="#f50100" d="m35.323 23.783l-3.588 1.728l-14.286-11.86l-4.236-1.324l-17.445-13.5H.806l17.434 13.18l4.631 1.588z" />
                            <mask id="flagpackGbUkm1" style={{ fill: '#fff' }}>
                                <path fillRule="evenodd" d="M19.778-2h-7.556V8H-1.972v8h14.194v10h7.556V16h14.25V8h-14.25z" clipRule="evenodd" />
                            </mask>
                            <path fill="#f50100" fillRule="evenodd" d="M19.778-2h-7.556V8H-1.972v8h14.194v10h7.556V16h14.25V8h-14.25z" clipRule="evenodd" />
                            <path fill="#fff" d="M12.222-2v-2h-2v2zm7.556 0h2v-2h-2zM12.222 8v2h2V8zM-1.972 8V6h-2v2zm0 8h-2v2h2zm14.194 0h2v-2h-2zm0 10h-2v2h2zm7.556 0v2h2v-2zm0-10v-2h-2v2zm14.25 0v2h2v-2zm0-8h2V6h-2zm-14.25 0h-2v2h2zm-7.556-8h7.556v-4h-7.556zm2 8V-2h-4V8zm-16.194 2h14.194V6H-1.972zm2 6V8h-4v8zm12.194-2H-1.972v4h14.194zm2 12V16h-4v10zm5.556-2h-7.556v4h7.556zm-2-8v10h4V16zm16.25-2h-14.25v4h14.25zm-2-6v8h4V8zm-12.25 2h14.25V6h-14.25zm-2-12V8h4V-2z" mask="url(#flagpackGbUkm1)" />
                        </g>
                    </g>
                </svg>
        },
        {
            code: "kk", label: "CHI", flag:
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
                    <path fill="#de2910" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4z"></path>
                    <path fill="#ffde02" d="m11.136 8.977l.736.356l.589-.566l-.111.81l.72.386l-.804.144l-.144.804l-.386-.72l-.81.111l.566-.589zm4.665 2.941l-.356.735l.566.59l-.809-.112l-.386.721l-.144-.805l-.805-.144l.721-.386l-.112-.809l.59.566zm-.957 3.779l.268.772l.817.017l-.651.493l.237.783l-.671-.467l-.671.467l.236-.783l-.651-.493l.817-.017zm-3.708 3.28l.736.356l.589-.566l-.111.81l.72.386l-.804.144l-.144.804l-.386-.72l-.81.111l.566-.589zM7 10.951l.929 2.671l2.826.058l-2.253 1.708l.819 2.706L7 16.479l-2.321 1.615l.819-2.706l-2.253-1.708l2.826-.058z"></path>
                </svg>
        },
    ];

    useEffect(() => {
        if (i18n.language) {
            i18n.changeLanguage(i18n?.language);
        }
    }, [i18n]);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Находим выбранный язык
    const selectedLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

    return (
        <div className="relative z-[10000] w-[100px]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="outline-none h-[30px] w-full rounded-[50px] px-3 py-1 text-xs font-semibold flex items-center justify-between transition-all"
                style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#e2e8f0',
                }}>
                <div className="flex items-center gap-[5px]">
                    {selectedLanguage.flag}
                    {selectedLanguage.label}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M30 12L16 24L2 12"></path>
                </svg>
            </button>
            {isOpen && (
                <ul className="absolute z-[10000] top-[35px] left-0 w-full shadow-xl rounded-[10px] overflow-hidden"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {languages.map((language) => (
                        <li
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className="px-3 py-2 text-xs cursor-pointer flex items-center gap-[5px] transition-colors"
                            style={{ color: '#cbd5e1' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {language.flag}
                            {language.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}