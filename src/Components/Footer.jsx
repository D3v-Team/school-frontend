import FooterBot from "./others/FooterBot";
import FooterMain from "./others/FooterMain";

export default function Footer() {
    return (
        <footer style={{ background: '#0a0f1c', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="Container">
                <FooterMain />
                <FooterBot />
            </div>
        </footer>
    );
}
