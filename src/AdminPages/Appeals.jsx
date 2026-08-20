import { useState, useEffect, useRef, useCallback } from "react";
import { $api } from "../utils";
import {
    C, Spin, fmtDate, Lbl, iStyle, taStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    SearchBar, FilterPills, Pagination,
    TableHead, TableCard, LoadingRow, EmptyRow,
    PageHeader, StatusBadge,
} from "../AdminComponents/ui";

const LIMIT = 10;

const STATUS_CFG = {
    NEW:         { label: 'Yangi',            bg: C.blueBg,  color: C.blue,   border: C.blueBdr },
    IN_PROGRESS: { label: "Ko'rib chiqilmoqda", bg: C.yBg,  color: C.yellow, border: C.yBdr   },
    ANSWERED:    { label: 'Javob berildi',    bg: C.gBg,     color: C.green,  border: C.gBdr   },
};

const statusOptions = [
    { val: '', label: 'Barchasi' },
    ...Object.entries(STATUS_CFG).map(([val, s]) => ({ val, label: s.label, color: s.color, bg: s.bg, border: s.border })),
];

/* ─── Answer / Status modal ───────────────────────────────────── */
function AnswerModal({ item, onClose, onSaved }) {
    const [status,  setStatus]  = useState(item.status || 'NEW');
    const [answer,  setAnswer]  = useState(item.answer || '');
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState('');
    const [aFocused, setAF]     = useState(false);

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            await $api.patch(`/api/appeals/${item.id}`, { status, answer });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title="Murojaatga javob berish" onClose={onClose} width={500}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* applicant info */}
                    <div style={{ padding: 14, borderRadius: 10, background: C.bg,
                        border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
                            Murojaat ma'lumotlari
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                                ['Ism', item.full_name],
                                ['Telefon', item.phone],
                                ['Email', item.email || '—'],
                                ['Mavzu', item.subject],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase',
                                        letterSpacing: '.07em', fontWeight: 700 }}>{k}</div>
                                    <div style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{v || '—'}</div>
                                </div>
                            ))}
                        </div>
                        {item.message && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase',
                                    letterSpacing: '.07em', fontWeight: 700, marginBottom: 4 }}>Xabar</div>
                                <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, margin: 0 }}>{item.message}</p>
                            </div>
                        )}
                    </div>

                    {/* status selector */}
                    <div>
                        <Lbl>Holat</Lbl>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {Object.entries(STATUS_CFG).map(([key, s]) => (
                                <label key={key} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                                    border: `1.5px solid ${status === key ? s.color : C.border}`,
                                    background: status === key ? s.bg : C.bg,
                                    transition: 'all .15s',
                                }}>
                                    <input type="radio" name="status" value={key}
                                        checked={status === key} onChange={() => setStatus(key)}
                                        style={{ accentColor: s.color }} />
                                    <span style={{ fontSize: 13, fontWeight: status === key ? 700 : 400,
                                        color: status === key ? s.color : C.sub }}>
                                        {s.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* answer */}
                    <div>
                        <Lbl>Javob matni</Lbl>
                        <textarea rows={4} value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            onFocus={() => setAF(true)} onBlur={() => setAF(false)}
                            style={taStyle(aFocused)}
                            placeholder="Murojaatchiga javob yozing..." />
                    </div>

                    {error && (
                        <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12,
                            background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>
                            ⚠ {error}
                        </div>
                    )}
                    <MFooter onClose={onClose} onSave={handleSave} saving={saving} label="Saqlash" />
                </div>
            </MBox>
        </Overlay>
    );
}

/* ─── Detail view modal ───────────────────────────────────────── */
function DetailModal({ item, onClose, onEdit }) {
    const s = STATUS_CFG[item.status] || STATUS_CFG.NEW;
    return (
        <Overlay onClose={onClose}>
            <MBox title="Murojaat tafsiloti" onClose={onClose} width={520}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <StatusBadge label={s.label} bg={s.bg} color={s.color} border={s.border} />
                        <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                        padding: 14, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                        {[
                            ['To\'liq ism', item.full_name],
                            ['Telefon',     item.phone],
                            ['Email',       item.email || '—'],
                            ['Mavzu',       item.subject],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                                    textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13, color: C.text }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    {item.message && (
                        <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Xabar</div>
                            <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.7, margin: 0 }}>{item.message}</p>
                        </div>
                    )}

                    {item.answer && (
                        <div style={{ padding: 14, borderRadius: 10,
                            border: `1px solid ${C.gBdr}`, background: C.gBg }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.green,
                                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
                                ✓ Admin javobi
                            </div>
                            <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.7, margin: 0 }}>{item.answer}</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10,
                        paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                        <GBtn onClick={onClose}>Yopish</GBtn>
                        <PBtn onClick={onEdit}>Javob berish</PBtn>
                    </div>
                </div>
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function Appeals() {
    const [items,   setItems]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState('');
    const [status,  setStatus]  = useState('');
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT, sortBy: 'created_at', sortOrder: 'desc' };
            if (search.trim()) params.search = search.trim();
            if (status)        params.status = status;
            const res = await $api.get('/api/appeals', { params });
            const d   = res.data;
            setItems(d?.data || d?.items || []);
            setTotal(d?.total || d?.meta?.total || 0);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }, [page, search, status]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = useCallback(v => { setSearch(v); setPage(1); }, []);
    const refresh = () => { setModal(null); fetchData(); };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader
                title="Direktor Qabulxonasiga Murojaatlar"
                subtitle={`Jami: ${total} ta murojaat`} />

            {/* summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {Object.entries(STATUS_CFG).map(([key, s]) => {
                    const count = items.filter(it => it.status === key).length;
                    return (
                        <div key={key} onClick={() => { setStatus(status === key ? '' : key); setPage(1); }}
                            style={{
                                background: C.white, border: `1.5px solid ${status === key ? s.color : C.border}`,
                                borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                                transition: 'all .15s',
                                boxShadow: status === key ? `0 0 0 3px ${s.border}` : 'none',
                            }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                                textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
                                {s.label}
                            </p>
                            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: 0 }}>{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Ism yoki mavzu bo'yicha..." />
                <FilterPills options={statusOptions} value={status}
                    onChange={v => { setStatus(v); setPage(1); }} />
            </div>

            <TableCard>
                <TableHead
                    gridCols="1.8fr 1.2fr 1fr 1.5fr 100px 110px 90px"
                    cols={['To\'liq ism', 'Telefon', 'Mavzu', 'Xabar', 'Holat', 'Sana', { label: '', right: true }]} />

                {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Murojaatlar topilmadi" /> : (
                    items.map((item, i) => {
                        const s = STATUS_CFG[item.status] || STATUS_CFG.NEW;
                        return (
                            <div key={item.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.8fr 1.2fr 1fr 1.5fr 100px 110px 90px',
                                    alignItems: 'center', padding: '12px 18px',
                                    borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none',
                                    cursor: 'pointer', transition: 'background .1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                onClick={() => setModal({ type: 'detail', item })}>

                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>
                                        {item.full_name || '—'}
                                    </p>
                                    {item.email && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{item.email}</p>}
                                </div>
                                <span style={{ fontSize: 12, color: C.sub }}>{item.phone || '—'}</span>
                                <span style={{ fontSize: 12, color: C.sub,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.subject || '—'}
                                </span>
                                <span style={{ fontSize: 12, color: C.muted,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                                    {item.message?.slice(0, 55) || '—'}
                                </span>
                                <span><StatusBadge label={s.label} bg={s.bg} color={s.color} border={s.border} /></span>
                                <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(item.created_at)}</span>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}
                                    onClick={e => e.stopPropagation()}>
                                    <ABtn title="Javob berish" bg={C.blueBg} bdr={C.blueBdr} color={C.blue}
                                        onClick={() => setModal({ type: 'answer', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </ABtn>
                                    <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red}
                                        onClick={() => setModal({ type: 'delete', item })}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                            <path d="M10 11v6"/><path d="M14 11v6"/>
                                        </svg>
                                    </ABtn>
                                </div>
                            </div>
                        );
                    })
                )}
            </TableCard>

            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

            {/* modals */}
            {modal?.type === 'detail' && (
                <DetailModal item={modal.item} onClose={() => setModal(null)}
                    onEdit={() => setModal({ type: 'answer', item: modal.item })} />
            )}
            {modal?.type === 'answer' && (
                <AnswerModal item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />
            )}
            {modal?.type === 'delete' && (
                <DeleteWrapper item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />
            )}
        </div>
    );
}

function DeleteWrapper({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/appeals/${item.id}`); onDeleted(); }
        catch { /* silent */ } finally { setLoading(false); }
    };
    return (
        <DeleteConfirm
            title="O'chirishni tasdiqlang"
            desc={<><strong style={{ color: '#0f172a' }}>{item.full_name}</strong> murojaati o'chiriladi.</>}
            onClose={onClose} onConfirm={confirm} loading={loading} />
    );
}
