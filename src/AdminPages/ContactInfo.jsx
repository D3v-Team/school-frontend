import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import { mediaUrl } from "../utils/api";
import {
    C, Spin, Lbl, iStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    PageHeader, StatusBadge,
} from "../AdminComponents/ui";

/* ─── Social link form modal ──────────────────────────────────── */
function SocialForm({ item, onClose, onSaved }) {
    const isEdit  = !!item;
    const fileRef = useRef(null);
    const [form, setForm]     = useState({
        platform: item?.platform || '',
        url:      item?.url      || '',
    });
    const [iconFile, setIconFile] = useState(null);
    const [preview,  setPreview]  = useState(item?.icon_url ? mediaUrl(item.icon_url) : null);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');

    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleFile = e => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 1 * 1024 * 1024) { setError("Icon 1MB dan oshmasin"); return; }
        setIconFile(f); setPreview(URL.createObjectURL(f)); setError('');
    };

    const handleSave = async () => {
        if (!form.platform.trim()) { setError("Platform nomi majburiy"); return; }
        if (!form.url.trim())      { setError("URL majburiy"); return; }
        setSaving(true); setError('');
        try {
            const fd = new FormData();
            fd.append('platform', form.platform.trim());
            fd.append('url', form.url.trim());
            if (iconFile) fd.append('icon_image', iconFile);

            if (isEdit) {
                await $api.patch(`/api/contact/info/social-links/${item.platform}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await $api.post('/api/contact/info/social-links', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Ijtimoiy tarmoqni tahrirlash' : 'Yangi ijtimoiy tarmoq'}
                onClose={onClose} width={440}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* platform */}
                    <div>
                        <Lbl req>Platform nomi</Lbl>
                        <input type="text" value={form.platform}
                            onChange={e => set('platform', e.target.value)}
                            onFocus={() => sf('platform', true)} onBlur={() => sf('platform', false)}
                            style={iStyle(fc('platform'))}
                            placeholder="masalan: instagram, telegram, facebook..."
                            disabled={isEdit}
                        />
                        {isEdit && (
                            <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                                Platform nomi o'zgartirib bo'lmaydi
                            </p>
                        )}
                    </div>

                    {/* url */}
                    <div>
                        <Lbl req>URL manzil</Lbl>
                        <input type="url" value={form.url}
                            onChange={e => set('url', e.target.value)}
                            onFocus={() => sf('url', true)} onBlur={() => sf('url', false)}
                            style={iStyle(fc('url'))}
                            placeholder="https://..." />
                    </div>

                    {/* icon */}
                    <div>
                        <Lbl>Icon rasmi (PNG, SVG · max 1MB)</Lbl>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="icon"
                                        style={{ width: 48, height: 48, objectFit: 'contain',
                                            borderRadius: 8, border: `1px solid ${C.border}` }} />
                                    <button type="button"
                                        onClick={() => { setIconFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                                            borderRadius: '50%', background: C.red, border: 'none',
                                            color: '#fff', fontSize: 11, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 8,
                                    border: `2px dashed ${C.border}`, background: C.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer' }}
                                    onClick={() => fileRef.current?.click()}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.8">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                </div>
                            )}
                            <div>
                                <PBtn onClick={() => fileRef.current?.click()}
                                    style={{ padding: '6px 14px', fontSize: 12 }}>
                                    Icon tanlash
                                </PBtn>
                                {iconFile && <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{iconFile.name}</p>}
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/png,image/svg+xml"
                            style={{ display: 'none' }} onChange={handleFile} />
                    </div>

                    {error && (
                        <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12,
                            background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
                            ⚠ {error}
                        </div>
                    )}
                    <MFooter onClose={onClose} onSave={handleSave} saving={saving}
                        label={isEdit ? 'Saqlash' : "Qo'shish"} />
                </div>
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ContactInfo() {
    /* contact info state */
    const [info,       setInfo]       = useState(null);
    const [infoLoad,   setInfoLoad]   = useState(true);
    const [infoSaving, setInfoSaving] = useState(false);
    const [infoMsg,    setInfoMsg]    = useState(''); // 'ok' | error string

    /* social links state */
    const [links,      setLinks]      = useState([]);
    const [linksLoad,  setLinksLoad]  = useState(true);
    const [modal,      setModal]      = useState(null);
    const [delModal,   setDelModal]   = useState(null);

    /* focus tracking */
    const fRef = useRef({});
    const [, forceTick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; forceTick(n => n + 1); };
    const fc = k => !!fRef.current[k];

    /* contact form */
    const EMPTY_INFO = {
        address_latin: '', address_cyril: '', address_ru: '',
        phone: '', email: '', latitude: '', longitude: '',
    };
    const [form, setForm] = useState(EMPTY_INFO);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    /* fetch contact info */
    const fetchInfo = async () => {
        setInfoLoad(true);
        try {
            const res = await $api.get('/api/contact/info');
            const d = res.data?.data || res.data;
            if (d) {
                setInfo(d);
                setForm({
                    address_latin: d.address_latin || '',
                    address_cyril: d.address_cyril || '',
                    address_ru:    d.address_ru    || '',
                    phone:         d.phone         || '',
                    email:         d.email         || '',
                    latitude:      d.latitude      || '',
                    longitude:     d.longitude     || '',
                });
            }
        } catch { /* silent */ }
        finally { setInfoLoad(false); }
    };

    /* fetch social links */
    const fetchLinks = async () => {
        setLinksLoad(true);
        try {
            const res = await $api.get('/api/contact/info/social-links');
            const d = res.data?.data || res.data;
            setLinks(Array.isArray(d) ? d : []);
        } catch { setLinks([]); }
        finally { setLinksLoad(false); }
    };

    useEffect(() => { fetchInfo(); fetchLinks(); }, []);

    /* save contact info */
    const handleSaveInfo = async () => {
        setInfoSaving(true); setInfoMsg('');
        try {
            const payload = {
                address_latin: form.address_latin.trim(),
                address_cyril: form.address_cyril.trim(),
                address_ru:    form.address_ru.trim(),
                phone:         form.phone.trim(),
                email:         form.email.trim(),
            };
            const lat = Number(String(form.latitude).replace(',', '.').trim());
            const lng = Number(String(form.longitude).replace(',', '.').trim());
            if (Number.isFinite(lat) && lat >= -90 && lat <= 90) payload.latitude = lat;
            if (Number.isFinite(lng) && lng >= -180 && lng <= 180) payload.longitude = lng;
            await $api.patch('/api/contact/info', payload);
            setInfoMsg('ok');
            setTimeout(() => setInfoMsg(''), 3000);
        } catch (err) {
            setInfoMsg(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally { setInfoSaving(false); }
    };

    /* delete social link */
    const handleDeleteLink = async (platform) => {
        try {
            await $api.delete(`/api/contact/info/social-links/${platform}`);
            setLinks(prev => prev.filter(l => l.platform !== platform));
        } catch { /* silent */ }
        finally { setDelModal(null); }
    };

    const inputSt = k => iStyle(fc(k));

    /* address tab */
    const [addrTab, setAddrTab] = useState('latin');
    const addrKeys = {
        latin: 'address_latin',
        cyril: 'address_cyril',
        ru:    'address_ru',
    };
    const addrLangs = [
        { key: 'latin', flag: '🇺🇿', label: 'Lotin' },
        { key: 'cyril', flag: '🇺🇿', label: 'Krill' },
        { key: 'ru',    flag: '🇷🇺', label: 'Rus'   },
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Aloqa ma'lumotlari" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>

                {/* ── LEFT: contact info form ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Address — lang tabs */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14 }}>
                        <div style={{ padding: '14px 18px 0', borderBottom: `1px solid ${C.border}` }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>
                                📍 Manzil
                            </p>
                            {/* addr tabs */}
                            <div style={{ display: 'flex', gap: 0 }}>
                                {addrLangs.map(({ key, flag, label }) => {
                                    const active = addrTab === key;
                                    const done   = form[addrKeys[key]].trim().length > 0;
                                    return (
                                        <button key={key} type="button" onClick={() => setAddrTab(key)}
                                            style={{
                                                padding: '8px 14px', border: 'none',
                                                borderRadius: '8px 8px 0 0',
                                                background: active ? C.bg : 'transparent',
                                                fontSize: 12, fontWeight: active ? 700 : 400,
                                                color: active ? C.brand : C.sub,
                                                borderBottom: `2px solid ${active ? C.brand : 'transparent'}`,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                            }}>
                                            {flag} {label}
                                            {done && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ padding: '14px 18px' }}>
                            <textarea
                                rows={3}
                                value={form[addrKeys[addrTab]]}
                                onChange={e => set(addrKeys[addrTab], e.target.value)}
                                onFocus={() => sf(`addr_${addrTab}`, true)}
                                onBlur={() => sf(`addr_${addrTab}`, false)}
                                placeholder="Manzilni kiriting..."
                                style={{
                                    width: '100%', padding: '8px 11px', borderRadius: 8,
                                    fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                                    background: C.bg, color: C.text, boxSizing: 'border-box',
                                    border: `1.5px solid ${fc(`addr_${addrTab}`) ? C.brand : C.border}`,
                                    transition: 'border-color .15s',
                                }}
                            />
                        </div>
                    </div>

                    {/* Phone + Email */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
                            📞 Aloqa
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <Lbl>Telefon</Lbl>
                                <input type="tel" value={form.phone}
                                    onChange={e => set('phone', e.target.value)}
                                    onFocus={() => sf('phone', true)} onBlur={() => sf('phone', false)}
                                    style={inputSt('phone')}
                                    placeholder="+998 XX XXX XX XX" />
                            </div>
                            <div>
                                <Lbl>Email</Lbl>
                                <input type="email" value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    onFocus={() => sf('email', true)} onBlur={() => sf('email', false)}
                                    style={inputSt('email')}
                                    placeholder="info@example.uz" />
                            </div>
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
                            🗺️ Koordinatalar
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <Lbl>Kenglik (Latitude)</Lbl>
                                <input type="number" step="any" value={form.latitude}
                                    onChange={e => set('latitude', e.target.value)}
                                    onFocus={() => sf('lat', true)} onBlur={() => sf('lat', false)}
                                    style={inputSt('lat')}
                                    placeholder="41.299496" />
                            </div>
                            <div>
                                <Lbl>Uzunlik (Longitude)</Lbl>
                                <input type="number" step="any" value={form.longitude}
                                    onChange={e => set('longitude', e.target.value)}
                                    onFocus={() => sf('lon', true)} onBlur={() => sf('lon', false)}
                                    style={inputSt('lon')}
                                    placeholder="69.240073" />
                            </div>
                        </div>
                        {form.latitude && form.longitude && (
                            <a href={`https://maps.google.com/?q=${form.latitude},${form.longitude}`}
                                target="_blank" rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                                    marginTop: 10, fontSize: 12, color: C.blue, textDecoration: 'none' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                Google Mapsda ko'rish
                            </a>
                        )}
                    </div>

                    {/* save button + msg */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <PBtn onClick={handleSaveInfo} loading={infoSaving}>
                            Saqlash
                        </PBtn>
                        {infoMsg === 'ok' && (
                            <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>✓ Saqlandi</span>
                        )}
                        {infoMsg && infoMsg !== 'ok' && (
                            <span style={{ fontSize: 13, color: C.red }}>⚠ {infoMsg}</span>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: social links ── */}
                <div>
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: C.bg }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>
                                🔗 Ijtimoiy tarmoqlar
                            </p>
                            <PBtn onClick={() => setModal('create')}
                                style={{ padding: '6px 14px', fontSize: 12 }}>
                                + Qo'shish
                            </PBtn>
                        </div>

                        {linksLoad ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                                <Spin />
                            </div>
                        ) : links.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 16px', color: C.muted }}>
                                <p style={{ fontSize: 13 }}>Hali ijtimoiy tarmoq qo'shilmagan</p>
                            </div>
                        ) : (
                            <div style={{ padding: '8px 0' }}>
                                {links.map(link => (
                                    <div key={link.platform} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 16px',
                                        borderBottom: `1px solid #f8fafc`,
                                        transition: 'background .1s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        {/* icon */}
                                        {link.icon_url ? (
                                            <img src={mediaUrl(link.icon_url)} alt={link.platform}
                                                style={{ width: 32, height: 32, objectFit: 'contain',
                                                    borderRadius: 8, border: `1px solid ${C.border}`,
                                                    background: C.bg, padding: 4, flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: 32, height: 32, borderRadius: 8,
                                                background: C.bBg, border: `1px solid ${C.bBdr}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 14, flexShrink: 0 }}>
                                                🔗
                                            </div>
                                        )}

                                        {/* info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text,
                                                margin: 0, textTransform: 'capitalize' }}>
                                                {link.platform}
                                            </p>
                                            <a href={link.url} target="_blank" rel="noreferrer"
                                                style={{ fontSize: 11, color: C.blue, textDecoration: 'none',
                                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap', display: 'block' }}>
                                                {link.url}
                                            </a>
                                        </div>

                                        {/* actions */}
                                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                            <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand}
                                                onClick={() => setModal({ type: 'edit', item: link })}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="2.2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </ABtn>
                                            <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red}
                                                onClick={() => setDelModal(link)}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="2.2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                    <path d="M10 11v6"/><path d="M14 11v6"/>
                                                </svg>
                                            </ABtn>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* modals */}
            {modal === 'create' && (
                <SocialForm onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); fetchLinks(); }} />
            )}
            {modal?.type === 'edit' && (
                <SocialForm item={modal.item} onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); fetchLinks(); }} />
            )}
            {delModal && (
                <DeleteLinkConfirm
                    item={delModal}
                    onClose={() => setDelModal(null)}
                    onConfirm={() => handleDeleteLink(delModal.platform)} />
            )}
        </div>
    );
}

/* ─── Delete confirm for social link ─────────────────────────── */
function DeleteLinkConfirm({ item, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false);
    const handle = async () => { setLoading(true); await onConfirm(); setLoading(false); };
    return (
        <Overlay onClose={onClose}>
            <div style={{
                width: '100%', maxWidth: 360, background: C.white,
                borderRadius: 16, border: `1px solid ${C.border}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: 28, textAlign: 'center',
            }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 14px',
                    background: C.rBg, border: `1px solid ${C.rBdr}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke={C.red} strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                    O'chirishni tasdiqlang
                </h3>
                <p style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.6 }}>
                    <strong style={{ color: C.text, textTransform: 'capitalize' }}>{item.platform}</strong> ijtimoiy tarmoqi o'chiriladi.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <GBtn onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Bekor</GBtn>
                    <PBtn onClick={handle} loading={loading} color={C.red}
                        style={{ flex: 1, justifyContent: 'center' }}>O'chirish</PBtn>
                </div>
            </div>
        </Overlay>
    );
}
