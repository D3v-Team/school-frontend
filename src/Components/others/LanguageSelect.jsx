import { useTranslation } from "react-i18next";

const UZ_FLAG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 36 27">
        <rect width="36" height="9" fill="#0099b5"/>
        <rect y="9" width="36" height="9" fill="#fff"/>
        <rect y="18" width="36" height="9" fill="#1eb53a"/>
        <rect y="8" width="36" height="1.5" fill="#ce1126"/>
        <rect y="17.5" width="36" height="1.5" fill="#ce1126"/>
        <circle cx="6" cy="4.5" r="3" fill="#fff"/>
        <circle cx="7.2" cy="4.5" r="2.4" fill="#0099b5"/>
    </svg>
);

const RU_FLAG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 36 27">
        <rect width="36" height="9" fill="#fff"/>
        <rect y="9" width="36" height="9" fill="#0039a6"/>
        <rect y="18" width="36" height="9" fill="#d52b1e"/>
    </svg>
);

const LANGS = [
    { code: "uz",   label: "UZ",    flag: UZ_FLAG },
    { code: "cyrl", label: "КРЛ",   flag: UZ_FLAG },
    { code: "ru",   label: "RU",    flag: RU_FLAG },
];

export default function LanguageSelect() {
    const { i18n } = useTranslation();

    const raw = (i18n.language || "uz").split("-")[0];
    const current = raw === "kk" ? "cyrl" : (["uz","cyrl","ru"].includes(raw) ? raw : "uz");

    const change = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '3px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
        }}>
            {LANGS.map(lang => {
                const isActive = current === lang.code;
                return (
                    <button
                        key={lang.code}
                        type="button"
                        onClick={() => change(lang.code)}
                        title={lang.label}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: isActive ? 700 : 500,
                            background: isActive ? '#ea6c0a' : 'transparent',
                            color: isActive ? '#fff' : '#94a3b8',
                            transition: 'all .15s',
                            whiteSpace: 'nowrap',
                            lineHeight: 1,
                        }}
                        onMouseEnter={e => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.color = '#fff';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#94a3b8';
                            }
                        }}
                    >
                        {lang.flag}
                        {lang.label}
                    </button>
                );
            })}
        </div>
    );
}
