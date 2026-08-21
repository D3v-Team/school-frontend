import { useState, useEffect, useRef } from "react";
import { $api } from "../utils";
import {
    C, Spin, Lbl, iStyle,
    PBtn, GBtn, ABtn, Overlay, MBox, MFooter, DeleteConfirm,
    LoadingRow, EmptyRow, PageHeader, Toggle,
} from "../AdminComponents/ui";

/* ─── Form ────────────────────────────────────────────────────── */
function BellForm({ item, shift, onClose, onSaved }) {
    const isEdit = !!item;
    const [form, setForm] = useState({
        lesson_number:  item?.lesson_number  ?? '',
        start_time:     item?.start_time     || '',
        end_time:       item?.end_time       || '',
        break_minutes:  item?.break_minutes  ?? 0,
        shift:          item?.shift          ?? shift ?? 1,
        is_active:      item?.is_active      ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState('');
    const [errors, setErrors] = useState({});

    const fRef = useRef({});
    const [, tick] = useState(0);
    const sf = (k, v) => { fRef.current[k] = v; tick(n => n + 1); };
    const fc = k => !!fRef.current[k];
    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

    const handleSave = async () => {
        const errs = {};
        if (!form.lesson_number) errs.lesson_number = 'Majburiy';
        if (!form.start_time)    errs.start_time    = 'Majburiy';
        if (!form.end_time)      errs.end_time      = 'Majburiy';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true); setError('');
        try {
            const payload = {
                lesson_number: Number(form.lesson_number),
                start_time:    form.start_time,
                end_time:      form.end_time,
                break_minutes: Number(form.break_minutes) || 0,
                shift:         Number(form.shift),
                is_active:     form.is_active,
            };
            if (isEdit) await $api.patch(`/api/bell-schedules/${item.id}`, payload);
            else        await $api.post('/api/bell-schedules', payload);
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
        } finally { setSaving(false); }
    };

    return (
        <Overlay onClose={onClose}>
            <MBox title={isEdit ? 'Dars jadvalini tahrirlash' : 'Yangi dars vaqti'} onClose={onClose} width={480}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <Lbl req>Dars raqami</Lbl>
                            <input type="number" value={form.lesson_number} min={1} max={10}
                                onChange={e => set('lesson_number', e.target.value)}
                                onFocus={() => sf('ln', true)} onBlur={() => sf('ln', false)}
                                style={iStyle(fc('ln'), !!errors.lesson_number)} placeholder="1" />
                            {errors.lesson_number && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠ {errors.lesson_number}</div>}
                        </div>
                        <div>
                            <Lbl req>Smena</Lbl>
                            <select value={form.shift} onChange={e => set('shift', e.target.value)}
                                style={{ ...iStyle(false), padding: '8px 11px', cursor: 'pointer' }}>
                                <option value={1}>1-smena</option>
                                <option value={2}>2-smena</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                            <Lbl req>Boshlanish</Lbl>
                            <input type="time" value={form.start_time}
                                onChange={e => set('start_time', e.target.value)}
                                onFocus={() => sf('st', true)} onBlur={() => sf('st', false)}
                                style={iStyle(fc('st'), !!errors.start_time)} />
                            {errors.start_time && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠</div>}
                        </div>
                        <div>
                            <Lbl req>Tugash</Lbl>
                            <input type="time" value={form.end_time}
                                onChange={e => set('end_time', e.target.value)}
                                onFocus={() => sf('et', true)} onBlur={() => sf('et', false)}
                                style={iStyle(fc('et'), !!errors.end_time)} />
                            {errors.end_time && <div style={{ fontSize: 11, color: C.red, marginTop: 3 }}>⚠</div>}
                        </div>
                        <div>
                            <Lbl>Tanaffus (daqiqa)</Lbl>
                            <input type="number" value={form.break_minutes} min={0} max={60}
                                onChange={e => set('break_minutes', e.target.value)}
                                onFocus={() => sf('bm', true)} onBlur={() => sf('bm', false)}
                                style={iStyle(fc('bm'))} placeholder="10" />
                        </div>
                    </div>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? C.green : C.muted }}>
                            {form.is_active ? '✓ Faol' : '○ Nofaol'}
                        </span>
                        <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
                    </div>
                    {error && <div style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, background: C.rBg, border: `1px solid ${C.rBdr}`, color: C.red }}>⚠ {error}</div>}
                </div>
                <MFooter onClose={onClose} onSave={handleSave} saving={saving} label={isEdit ? 'Saqlash' : 'Qo\'shish'} />
            </MBox>
        </Overlay>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function BellSchedules() {
    const [shift,   setShift]   = useState(1);
    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null);
    const [tick,    setTick]    = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await $api.get('/api/bell-schedules', { params: { shift } });
                const d   = res.data;
                if (!cancelled) setItems((d?.data || d?.items || d || []).sort((a, b) => a.lesson_number - b.lesson_number));
            } catch { if (!cancelled) setItems([]); }
            finally { if (!cancelled) setLoading(false); }
        };
        load();
        return () => { cancelled = true; };
    }, [shift, tick]);

    const refresh = () => { setModal(null); setTick(t => t + 1); };

    return (
        <div style={{ minHeight: '100%' }}>
            <PageHeader title="Qo'ng'iroq jadvali" subtitle="Darslar vaqt jadvali"
                onAdd={() => setModal('create')} addLabel="Yangi qo'shish" />

            {/* Smena tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: '4px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, width: 'fit-content' }}>
                {[1, 2].map(s => (
                    <button key={s} onClick={() => setShift(s)}
                        style={{ padding: '7px 24px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: shift === s ? 700 : 500, background: shift === s ? C.brand : 'transparent', color: shift === s ? '#fff' : C.sub, transition: 'all .15s' }}>
                        {s}-smena
                    </button>
                ))}
            </div>

            {loading ? <LoadingRow /> : items.length === 0 ? <EmptyRow text="Dars vaqtlari topilmadi" /> : (
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                    {/* header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 110px 110px 90px 70px 80px', padding: '10px 18px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                        {['#', 'Dars', 'Boshlanish', 'Tugash', 'Tanaffus', 'Holat', ''].map((h, i) => (
                            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em', textAlign: i === 6 ? 'right' : 'left' }}>{h}</span>
                        ))}
                    </div>
                    {items.map((item, i) => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '60px 80px 110px 110px 90px 70px 80px', alignItems: 'center', padding: '12px 18px', borderBottom: i < items.length - 1 ? `1px solid #f1f5f9` : 'none', transition: 'background .1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span style={{ fontSize: 13, color: C.muted }}>{i + 1}</span>
                            <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 8, background: C.bBg, border: `1px solid ${C.bBdr}`, alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: C.brand }}>{item.lesson_number}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.start_time}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.end_time}</span>
                            <span style={{ fontSize: 12, color: C.sub }}>{item.break_minutes ? `${item.break_minutes} daq` : '—'}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: item.is_active ? C.gBg : C.bg, color: item.is_active ? C.green : C.muted, border: `1px solid ${item.is_active ? C.gBdr : C.border}`, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                {item.is_active ? 'Faol' : 'Nofaol'}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                                <ABtn title="Tahrirlash" bg={C.bBg} bdr={C.bBdr} color={C.brand} onClick={() => setModal({ type: 'edit', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </ABtn>
                                <ABtn title="O'chirish" bg={C.rBg} bdr={C.rBdr} color={C.red} onClick={() => setModal({ type: 'delete', item })}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                </ABtn>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal === 'create' && <BellForm shift={shift} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'edit' && <BellForm item={modal.item} shift={shift} onClose={() => setModal(null)} onSaved={refresh} />}
            {modal?.type === 'delete' && (
                <DelWrap item={modal.item} onClose={() => setModal(null)} onDeleted={refresh} />
            )}
        </div>
    );
}

function DelWrap({ item, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const confirm = async () => {
        setLoading(true);
        try { await $api.delete(`/api/bell-schedules/${item.id}`); onDeleted(); }
        catch { /**/ } finally { setLoading(false); }
    };
    return <DeleteConfirm title="O'chirishni tasdiqlang"
        desc={<>Dars <strong style={{ color: C.text }}>{item.lesson_number}</strong>-vaqti o'chiriladi.</>}
        onClose={onClose} onConfirm={confirm} loading={loading} />;
}
