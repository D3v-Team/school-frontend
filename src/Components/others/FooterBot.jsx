import { useTranslation } from "react-i18next";

const SOCIALS = [
    {
        href: "https://t.me/tkti_yangiyerf",
        label: "Telegram",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M18.483 19.79v-.002l.018-.043L21.5 4.625v-.048c0-.377-.14-.706-.442-.903c-.265-.173-.57-.185-.784-.169a2.7 2.7 0 0 0-.586.12a3 3 0 0 0-.24.088l-.013.005l-16.72 6.559l-.005.002a1 1 0 0 0-.149.061a2.3 2.3 0 0 0-.341.19c-.215.148-.624.496-.555 1.048c.057.458.372.748.585.899a2 2 0 0 0 .403.22l.032.014l.01.003l.007.003l2.926.985q-.016.276.057.555l1.465 5.559a1.5 1.5 0 0 0 2.834.196l2.288-2.446l3.929 3.012l.056.024c.357.156.69.205.995.164c.305-.042.547-.17.729-.315a1.74 1.74 0 0 0 .49-.635l.008-.017l.003-.006zM7.135 13.875a.3.3 0 0 1 .13-.33l9.921-6.3s.584-.355.563 0c0 0 .104.062-.209.353c-.296.277-7.071 6.818-7.757 7.48a.3.3 0 0 0-.077.136L8.6 19.434z" clipRule="evenodd"/>
            </svg>
        ),
    },
    {
        href: "https://instagram.com/tkti_yangiyer",
        label: "Instagram",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6m-5 3a5 5 0 1 1 10 0a5 5 0 0 1-10 0" clipRule="evenodd"/>
            </svg>
        ),
    },
    {
        href: "https://youtube.com/channel/UCKSfVjm1xsSyCdbAB5kt7Uw",
        label: "YouTube",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M12 4.15c-1.191 0-2.58.028-3.934.066l-.055.002c-1.378.039-2.49.07-3.366.215c-.913.151-1.671.44-2.277 1.063c-.608.625-.873 1.398-.998 2.323c-.12.89-.12 2.018-.12 3.42v1.524c0 1.4 0 2.528.12 3.419c.124.925.39 1.698.998 2.323c.606.624 1.364.912 2.277 1.063c.876.145 1.988.176 3.366.215l.055.002c1.355.038 2.743.066 3.934.066s2.58-.028 3.934-.066l.055-.002c1.378-.039 2.49-.07 3.366-.215c.913-.151 1.671-.44 2.277-1.063c.608-.625.874-1.398.998-2.323c.12-.89.12-2.018.12-3.42v-1.524c0-1.401 0-2.529-.12-3.419c-.124-.925-.39-1.698-.998-2.323c-.606-.624-1.364-.912-2.277-1.063c-.876-.145-1.988-.176-3.367-.215l-.054-.002A145 145 0 0 0 12 4.15m-1.128 10.501A.75.75 0 0 1 9.75 14v-4a.75.75 0 0 1 1.122-.651l3.5 2a.75.75 0 0 1 0 1.302z" clipRule="evenodd"/>
            </svg>
        ),
    },
    {
        href: "https://www.facebook.com/tktiyangiyer",
        label: "Facebook",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.3315C24 5.70412 18.6274 0.331543 12 0.331543C5.37258 0.331543 0 5.70412 0 12.3315C0 18.321 4.3882 23.2855 10.125 24.1858V15.8003H7.07812V12.3315H10.125V9.68779C10.125 6.68029 11.9166 5.01904 14.6576 5.01904C15.9701 5.01904 17.3438 5.25342 17.3438 5.25342V8.20654H15.8306C14.34 8.20654 13.875 9.13162 13.875 10.0815V12.3315H17.2031L16.6711 15.8003H13.875V24.1858C19.6118 23.2855 24 18.321 24 12.3315Z"/>
            </svg>
        ),
    },
    {
        href: "https://x.com/tkti_yangiyer",
        label: "X",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512">
                <path fill="currentColor" d="M389.2 48h70.6L305.6 224.2L487 464H345L233.7 318.6L106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9zm-24.8 373.8h39.1L151.1 88h-42z"/>
            </svg>
        ),
    },
];

export default function FooterBot() {
    const { t } = useTranslation();

    return (
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* left — copyright */}
          

        </div>
    );
}
