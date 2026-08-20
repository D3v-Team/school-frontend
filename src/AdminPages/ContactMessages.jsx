import { useState, useEffect, useRef, useCallback } from "react";
import { $api } from "../utils";
import {
    C, Spin, fmtDate, Lbl,
    ABtn, Overlay, MBox, GBtn, DeleteConfirm,
    SearchBar, FilterPills, Pagination,
    TableHead, TableCard, LoadingRow, EmptyRow,
    PageHeader, StatusBadge,
} from "../AdminComponents/ui";

const LIMIT = 10;

/* ─── Detail modal ────────────────────────────────────────────── */
function DetailModal({ item, onClose, onDelete }) {
    return (
        <Overlay onClose={onClose}>
            <MBox title="Xabar tafsiloti" onClose={onClose} width={520}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* header row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <StatusBadge
                            label={item.is_read ? "O'qilgan" : "Yangi"}
                            bg={item.is_read ? C.bg : C.blueBg}
                            color={item.is_read ? C.muted : C.blue}
                            border={item.is_read ? C.border : C.blueBdr} />
                        <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>
                    </div>

                    {/* contact info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                        padding: 14, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                        {[
                            ['To\'liq ism', item.full_name],
                            ['Telefon',     item.phone || '—'],
                            ['Email', item.email || '—', 'span 2'],
                        ].map(([k, v, span]) => (
                            <div key={k} style={{ gridColumn: span || 'span 1' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                                    textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    {/* message */}
                    <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
                            Xabar matni
                        </div>
                        <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, margin: 0 }}>
                            {item.message}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                        <button onClick={() => onDelete(item)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                border: `1px solid ${C.rBdr}`, background: C.rBg, color: C.red, cursor: 'pointer' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ContactMessages() {
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [isRead,  setIsRead]  = useState('');
    const [loading, setLoading] = useState(true);
    const [detail,  setDetail]  = useState(null);
    const [delItem, setDelItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
            if (search.trim()) params.search  = search.trim();
            if (isRead !== '') params.is_read = isRead;
            const res = await $api.get('/api/contact/messages', { params });
            const d   = res.data;
            setItems(d?.data || d?.items || []);
            setTotal(d?.total || d?.meta?.total || 0);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }, [page, search, isRead]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = useCallback(v => { setSearch(v); setPage(1); }, []);

    const handleDelete = async (item) => {
        try {
            await $api.delete(`/api/contact/messages/${item.id}`);
            setDelItem(null);
            setDetail(null);
            fetchData();
        } catch { /* silent */ }
    };

    const unreadCount = items.filter(i => !i.is_read).length;

    const readOptions = [
        { val: '',      label: 'Barchasi' },
        { val: 'false', label: "🔵 O'qilmagan", color: C.blue,  bg: C.blueBg, border: C.blueBdr },
        { val: 'true',  label: "✓ O'qilgan",    color: C.muted, bg: C.bg,     border: C.border  },
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>Qayta aloqa xabarlari</h1>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                        Jami: <strong style={{ color: C.sub }}>{total}</strong> ta xabar
                        {unreadCount > 0 && (
                            <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 20, fontSize: 11,
                                fontWeight: 700, background: C.blueBg, color: C.blue, border: `1px solid ${C.blueBdr}` }}>
                                {unreadCount} ta yangi
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Ism yoki email bo'yicha..." />
                <FilterPills options={readOptions} value={isRead} onChange={v => { setIsRead(v); setPage(1); }} />
            </div>

            <TableCard>
                <TableHead
                    gridCols="2fr 1.2fr 1.4fr 2fr 110px 80px"
                    cols={["To'liq ism", 'Telefon', 'Email', 'Xabar', 'Sana', { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Xabarlar topilmadi" /> : (
                    items.map((item, i) => (
                        <div key={item.id}
                            onClick={() => setDetail(item)}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1.2fr 1.4fr 2fr 110px 80px',
                                alignItems: 'center', padding: '12px 18px',
                                borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none',
                                cursor: 'pointer', transition: 'background .1s',
                                background: !item.is_read ? '#fafeff' : 'transparent',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = !item.is_read ? '#fafeff' : 'transparent'}>

                            {/* name + read dot */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                {!item.is_read && (
                                    <span style={{ width: 7, height: 7, borderRadius: '50%',
                                        background: C.blue, flexShrink: 0 }} />
                                )}
                                <span style={{ fontSize: 13, fontWeight: !item.is_read ? 700 : 500,
                                    color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.full_name || '—'}
                                </span>
                            </div>

                            <span style={{ fontSize: 12, color: C.sub }}>{item.phone || '—'}</span>

                            <span style={{ fontSize: 12, color: C.muted,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.email || '—'}
                            </span>

                            <span style={{ fontSize: 12, color: C.muted,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                                {item.message?.slice(0, 60) || '—'}
                            </span>

                            <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>

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
