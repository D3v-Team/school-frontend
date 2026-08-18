import { useState, useEffect, forwardRef } from "react";

const VisionModal = forwardRef(({ isOpen }, ref) => {
    const [fontSize, setFontSize] = useState(100);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`;
    }, [fontSize]);

    useEffect(() => {
        document.body.style.zoom = `${zoom}%`;
    }, [zoom]);

    const setDefault = () => document.documentElement.classList.remove("theme-dark", "theme-gray");
    const setDark    = () => { document.documentElement.classList.add("theme-dark"); document.documentElement.classList.remove("theme-gray"); };
    const setGray    = () => { document.documentElement.classList.add("theme-gray"); document.documentElement.classList.remove("theme-dark"); };

    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className="visonModal absolute z-[99999]"
            style={{
                top: 52, right: 0,
                width: 280,
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
        >
            <h2 className="text-sm font-bold text-slate-100 mb-4">Tashqi ko&apos;rinish</h2>

            {/* Theme buttons */}
            <div className="flex items-center gap-2 mb-5">
                <button onClick={setDefault}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.12)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                    Oddiy
                </button>
                <button onClick={setDark}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                    Qora-oq
                </button>
                <button onClick={setGray}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                    Inversiya
                </button>
            </div>

            {/* Font size */}
            <label className="block mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">Shrift hajmi</span>
                    <span className="text-xs text-slate-500">{fontSize}%</span>
                </div>
                <input
                    type="range" min="70" max="160" value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                    style={{ accentColor: '#ea6c0a' }}
                />
            </label>

            {/* Zoom */}
            <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">Katta-kichiklik</span>
                    <span className="text-xs text-slate-500">{zoom}%</span>
                </div>
                <input
                    type="range" min="70" max="150" value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                    style={{ accentColor: '#ea6c0a' }}
                />
            </label>
        </div>
    );
});

export default VisionModal;
