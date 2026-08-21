import { useState, useEffect, useCallback } from "react";
import { $api } from "../utils";
import {
    C, fmtDate,
    ABtn, Overlay, MBox, GBtn, DeleteConfirm,
    SearchBar, Pagination,
    TableCard, LoadingRow, EmptyRow,
    PageHeader, StatusBadge,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Detail modal ────────────────────────────────────────────── */
function DetailModal({ item, onClose, onDelete }) {
    return (
        <Overlay onClose={onClose}>
            <MBox title="Xabar tafsiloti" onClose={onClose} width={520}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <StatusBadge
                            label={item.is_read ? "O'qilgan" : "Yangi"}
                            bg={item.is_read ? C.bg : C.blueBg}
                            color={item.is_read ? C.muted : C.blue}
                            border={item.is_read ? C.border : C.blueBdr} />
                        <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>
                    </div>

                    {/* contact info */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                        padding: 14, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`,
                    }}>
                        {[
                            ["To'liq ism", item.full_name],
                            ['Telefon',    item.phone || '—'],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                                    textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{v}</div>
                            </div>
                        ))}
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>Email</div>
                            <div style={{ fontSize: 13, color: C.text }}>{item.email || '—'}</div>
                        </div>
                    </div>

                    {/* message */}
                    <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                            Xabar
                        </div>
                        <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.75, margin: 0 }}>
                            {item.message}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4,
                        borderTop: `1px solid ${C.border}` }}>
                        <button onClick={() => onDelete(item)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            border: `1px solid ${C.rBdr}`, background: C.rBg, color: C.red, cursor: 'pointer',
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                            </svg>
                            O'chirish
                        </button>
                        <GBtn onClick={onClose}>Yopish</GBtn>
                    </div>
                </div>
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ContactMessages() {
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [isRead,  setIsRead]  = useState('');
    const [loading, setLoading] = useState(true);
    const [tick,    setTick]    = useState(0);
    const [detail,  setDetail]  = useState(null);
    const [delItem, setDelItem] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
                if (search.trim()) params.search  = search.trim();
                if (isRead !== '') params.is_read = isRead;
                const res = await $api.get('/api/contact/messages', { params });
                const d   = res.data;
                if (!cancelled) {
                    setItems(d?.data || d?.items || []);
                    setTotal(d?.total || d?.meta?.total || 0);
                }
            } catch { if (!cancelled) setItems([]); }
            finally  { if (!cancelled) setLoading(false); }
        };
        load();
        return () => { cancelled = true; };
    }, [page, search, isRead, tick]);

    const handleSearch = v => { setSearch(v); setPage(1); };

    const handleDelete = async (item) => {
        try {
            await $api.delete(`/api/contact/messages/${item.id}`);
            setDelItem(null);
            setDetail(null);
            setTick(t => t + 1);
        } catch { /**/ }
    };

    const unreadCount = items.filter(i => !i.is_read).length;

    return (
        <div style={{ minHeight: '100%' }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>
                        Qayta aloqa xabarlari
                    </h1>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                        Jami: <strong style={{ color: C.sub }}>{total}</strong> ta xabar
                        {unreadCount > 0 && (
                            <span style={{
                                marginLeft: 8, padding: '2px 10px', borderRadius: 20,
                                fontSize: 11, fontWeight: 700,
                                background: C.blueBg, color: C.blue, border: `1px solid ${C.blueBdr}`,
                            }}>
                                {unreadCount} yangi
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                    { label: 'Yangi (o\'qilmagan)', count: items.filter(i => !i.is_read).length, color: C.blue, bg: C.blueBg, border: C.blueBdr, val: 'false' },
                    { label: 'O\'qilgan',             count: items.filter(i => i.is_read).length,  color: C.green, bg: C.gBg, border: C.gBdr, val: 'true' },
                ].map(s => (
                    <div key={s.val}
                        onClick={() => { setIsRead(isRead === s.val ? '' : s.val); setPage(1); }}
                        style={{
                            padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                            border: `1.5px solid ${isRead === s.val ? s.color : C.border}`,
                            background: isRead === s.val ? s.bg : C.white,
                            transition: 'all .15s',
                        }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 4px' }}>
                            {s.label}
                        </p>
                        <p style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: 0 }}>
                            {s.count}
                        </p>
                    </div>
                ))}
            </div>

            {/* filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Ism yoki email bo'yicha..." />
                <div style={{ display: 'flex', gap: 5 }}>
                    {[
                        { val: '',      label: 'Barchasi' },
                        { val: 'false', label: "O'qilmagan", color: C.blue,  bg: C.blueBg, border: C.blueBdr },
                        { val: 'true',  label: "O'qilgan",   color: C.muted, bg: C.bg,     border: C.border  },
                    ].map(opt => {
                        const active = isRead === opt.val;
                        return (
                            <button key={opt.val}
                                onClick={() => { setIsRead(opt.val); setPage(1); }}
                                style={{
                                    padding: '7px 14px', borderRadius: 20, fontSize: 12,
                                    fontWeight: active ? 700 : 500, cursor: 'pointer',
                                    border: `1.5px solid ${active && opt.border ? opt.border : active ? C.brand : C.border}`,
                                    background: active && opt.bg ? opt.bg : active ? C.bBg : C.white,
                                    color: active && opt.color ? opt.color : active ? C.brand : C.sub,
                                    transition: 'all .15s',
                                }}>
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* table */}
            <TableCard>
                <div style={{
                    display: 'grid', gridTemplateColumns: '14px 1.8fr 1.2fr 1.4fr 2fr 100px 50px',
                    padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg,
                }}>
                    {['', "To'liq ism", 'Telefon', 'Email', 'Xabar', 'Sana', ''].map((h, i) => (
                        <span key={i} style={{
                            fontSize: 11, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '.07em',
                            textAlign: i === 6 ? 'right' : 'left',
                        }}>{h}</span>
                    ))}
                </div>

                {loading ? <LoadingRow /> : items.length === 0 ? (
                    <EmptyRow text="Xabarlar topilmadi" />
                ) : (
                    items.map((item, i) => (
                        <div key={item.id}
                            onClick={() => setDetail(item)}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '14px 1.8fr 1.2fr 1.4fr 2fr 100px 50px',
                                alignItems: 'center', padding: '11px 18px',
                                borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none',
                                cursor: 'pointer', transition: 'background .1s',
                                background: !item.is_read ? '#f8fbff' : 'transparent',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'}
                            onMouseLeave={e => e.currentTarget.style.background = !item.is_read ? '#f8fbff' : 'transparent'}>

                            {/* unread dot */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {!item.is_read && (
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blue, flexShrink: 0 }} />
                                )}
                            </div>

                            {/* name */}
                            <span style={{
                                fontSize: 13, fontWeight: !item.is_read ? 700 : 500, color: C.text,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {item.full_name || '—'}
                            </span>

                            <span style={{ fontSize: 12, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.phone || '—'}
                            </span>

                            <span style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.email || '—'}
                            </span>

                            <span style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                                {item.message?.slice(0, 55) || '—'}
                            </span>

                            <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                                {fmtDate(item.created_at)}
                            </span>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}
                                onClick={e => e.stopPropagation()}>
                                <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red}
                                    onClick={() => setDelItem(item)}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6"/><path d="M14 11v6"/>
                                    </svg>
                                </ABtn>
                            </div>
                        </div>
                    ))
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {detail && (
                <DetailModal item={detail} onClose={() => setDetail(null)}
                    onDelete={item => { setDelItem(item); setDetail(null); }} />
            )}
            {delItem && (
                <DeleteConfirm
                    title="Xabarni o'chirish"
                    desc={<><strong style={{ color: C.text }}>{delItem.full_name}</strong> xabari o'chiriladi.</>}
                    onClose={() => setDelItem(null)}
                    onConfirm={() => handleDelete(delItem)}
                    loading={false} />
            )}
        </div>
    );
}
