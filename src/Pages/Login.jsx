import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
    const [phone_number, setPhone]    = useState("");
    const [password, setPassword]     = useState("");
    const [showPass, setShowPass]     = useState(false);
    const [error, setError]           = useState("");
    const [loading, setLoading]       = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e?.preventDefault();
        if (!phone_number.trim() || !password.trim()) {
            setError("Telefon raqam va parolni kiriting");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await axios.post("/api/auth/login", { phone_number, password });
            const data = res.data;

            const token = data?.tokens?.access_token;
            const refreshToken = data?.tokens?.refresh_token;
            const role  = data?.user?.role  || "ADMIN";
            const user  = data?.user || {};

            if (!token) throw new Error("Token topilmadi");

            localStorage.setItem("token", token);
            localStorage.setItem("refresh_token", refreshToken || "");
            localStorage.setItem("role",  role);
            localStorage.setItem("auth-user", JSON.stringify({
                id:    user?.id    || "",
                name:  user?.name  || user?.full_name || "",
                phone: user?.phone_number || phone_number,
                role,
            }));

            navigate("/admin");
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Xatolik yuz berdi";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Input va placeholder ranglari uchun umumiy inline style — Tailwind
    // klasslariga bog'liq bo'lmasligi uchun (agar Tailwind ulanmagan bo'lsa
    // ham matn har doim ko'rinadigan bo'lishi kerak)
    const inputStyle = {
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#f1f5f9',
        caretColor: '#f1f5f9',
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative"
            style={{ background: '#0a0f1c' }}>

            {/* placeholder rangini kafolatlash uchun global qoida */}
            <style>{`
                .login-input::placeholder {
                    color: #64748b;
                    opacity: 1;
                }
                .login-input:-webkit-autofill,
                .login-input:-webkit-autofill:hover,
                .login-input:-webkit-autofill:focus {
                    -webkit-text-fill-color: #f1f5f9 !important;
                    -webkit-box-shadow: 0 0 0px 1000px #1e293b inset !important;
                    transition: background-color 9999s ease-in-out 0s;
                }
            `}</style>

            {/* background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle,#ea6c0a,transparent 70%)' }}/>
                <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle,#3b82f6,transparent 70%)' }}/>
            </div>

            <div className="relative w-full max-w-md mx-4">
                {/* Card */}
                <div className="rounded-2xl p-8"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

                    {/* Logo / title */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: '#ea6c0a' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Admin panel</h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Tizimga kirish</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                style={{ color: '#94a3b8' }}>
                                Telefon raqam
                            </label>
                            <input
                                type="tel"
                                placeholder="+998901234567"
                                value={phone_number}
                                onChange={e => setPhone(e.target.value)}
                                className="login-input w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'rgba(234,108,10,0.6)'}
                                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                style={{ color: '#94a3b8' }}>
                                Parol
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="login-input w-full px-4 py-2.5 pr-11 rounded-xl text-sm outline-none transition-all"
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'rgba(234,108,10,0.6)'}
                                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    required
                                />
                                <button type="button" tabIndex={-1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: '#64748b' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#cbd5e1'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                                    onClick={() => setShowPass(v => !v)}>
                                    {showPass ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                                hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            style={{ background: loading ? '#c2410c' : '#ea6c0a', boxShadow: '0 4px 20px rgba(234,108,10,0.3)', color: '#ffffff' }}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Yuklanmoqda...
                                </span>
                            ) : "Kirish"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs mt-5" style={{ color: '#334155' }}>
                    Surxondaryo viloyati umumta&apos;lim maktabi
                </p>
            </div>
        </div>
    );
}