import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';

const DEFAULTS = { maxVerticalRotationDeg: 5, dragSensitivity: 20, enlargeTransitionMs: 300, segments: 35 };
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => { const a = (((deg + 180) % 360) + 360) % 360; return a - 180; };
const getDataNumber = (el, name, fallback) => { const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`); const n = attr == null ? NaN : parseFloat(attr); return Number.isFinite(n) ? n : fallback; };

function buildItems(pool, seg) {
    const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
    const evenYs = [-4, -2, 0, 2, 4], oddYs = [-3, -1, 1, 3, 5];
    const coords = xCols.flatMap((x, c) => (c % 2 === 0 ? evenYs : oddYs).map(y => ({ x, y, sizeX: 2, sizeY: 2 })));
    const totalSlots = coords.length;
    if (!pool.length) return coords.map(c => ({ ...c, src: '', alt: '' }));
    const norm = pool.map(img => typeof img === 'string' ? { src: img, alt: '' } : { src: img.src || '', alt: img.alt || '' });
    const used = Array.from({ length: totalSlots }, (_, i) => norm[i % norm.length]);
    for (let i = 1; i < used.length; i++) {
        if (used[i].src === used[i - 1].src) {
            for (let j = i + 1; j < used.length; j++) {
                if (used[j].src !== used[i].src) { const tmp = used[i]; used[i] = used[j]; used[j] = tmp; break; }
            }
        }
    }
    return coords.map((c, i) => ({ ...c, src: used[i].src, alt: used[i].alt }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
    const unit = 360 / segments / 2;
    return { rotateY: unit * (offsetX + (sizeX - 1) / 2), rotateX: unit * (offsetY - (sizeY - 1) / 2) };
}

export default function DomeGallery({
    images = [],
    fit = 0.5, fitBasis = 'auto', minRadius = 600, maxRadius = Infinity, padFactor = 0.25,
    overlayBlurColor = '#0a0f1c',
    maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
    dragSensitivity = DEFAULTS.dragSensitivity,
    enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
    segments = DEFAULTS.segments, dragDampening = 2,
    openedImageWidth = '400px', openedImageHeight = '400px',
    imageBorderRadius = '30px', openedImageBorderRadius = '30px',
    grayscale = true,
}) {
    const rootRef = useRef(null), mainRef = useRef(null), sphereRef = useRef(null);
    const frameRef = useRef(null), viewerRef = useRef(null), scrimRef = useRef(null);
    const focusedElRef = useRef(null), originalTilePositionRef = useRef(null);
    const rotationRef = useRef({ x: 0, y: 0 }), startRotRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef(null), draggingRef = useRef(false), cancelTapRef = useRef(false);
    const movedRef = useRef(false), inertiaRAF = useRef(null), pointerTypeRef = useRef('mouse');
    const tapTargetRef = useRef(null), openingRef = useRef(false), openStartedAtRef = useRef(0);
    const lastDragEndAt = useRef(0), scrollLockedRef = useRef(false), lockedRadiusRef = useRef(null);

    const lockScroll = useCallback(() => { if (scrollLockedRef.current) return; scrollLockedRef.current = true; document.body.classList.add('dg-scroll-lock'); }, []);
    const unlockScroll = useCallback(() => { if (!scrollLockedRef.current || rootRef.current?.getAttribute('data-enlarging') === 'true') return; scrollLockedRef.current = false; document.body.classList.remove('dg-scroll-lock'); }, []);
    const items = useMemo(() => buildItems(images, segments), [images, segments]);
    const applyTransform = (xDeg, yDeg) => { const el = sphereRef.current; if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`; };

    useEffect(() => {
        const root = rootRef.current; if (!root) return;
        const ro = new ResizeObserver(entries => {
            const cr = entries[0].contentRect, w = Math.max(1, cr.width), h = Math.max(1, cr.height);
            const minDim = Math.min(w, h), maxDim = Math.max(w, h), aspect = w / h;
            let basis = fitBasis === 'min' ? minDim : fitBasis === 'max' ? maxDim : fitBasis === 'width' ? w : fitBasis === 'height' ? h : aspect >= 1.3 ? w : minDim;
            let radius = clamp(Math.min(basis * fit, h * 1.35), minRadius, maxRadius);
            lockedRadiusRef.current = Math.round(radius);
            root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
            root.style.setProperty('--viewer-pad', `${Math.max(8, Math.round(minDim * padFactor))}px`);
            root.style.setProperty('--overlay-blur-color', overlayBlurColor);
            root.style.setProperty('--tile-radius', imageBorderRadius);
            root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
            root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
            applyTransform(rotationRef.current.x, rotationRef.current.y);
        });
        ro.observe(root); return () => ro.disconnect();
    }, [fit, fitBasis, minRadius, maxRadius, padFactor, overlayBlurColor, grayscale, imageBorderRadius, openedImageBorderRadius]);

    useEffect(() => { applyTransform(rotationRef.current.x, rotationRef.current.y); }, []);

    const stopInertia = useCallback(() => { if (inertiaRAF.current) { cancelAnimationFrame(inertiaRAF.current); inertiaRAF.current = null; } }, []);

    const startInertia = useCallback((vx, vy) => {
        let vX = clamp(vx, -1.4, 1.4) * 80, vY = clamp(vy, -1.4, 1.4) * 80, frames = 0;
        const d = clamp(dragDampening ?? 0.6, 0, 1), frictionMul = 0.94 + 0.055 * d;
        const stopThreshold = 0.015 - 0.01 * d, maxFrames = Math.round(90 + 270 * d);
        const step = () => {
            vX *= frictionMul; vY *= frictionMul;
            if ((Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) || ++frames > maxFrames) { inertiaRAF.current = null; return; }
            const nx = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
            const ny = wrapAngleSigned(rotationRef.current.y + vX / 200);
            rotationRef.current = { x: nx, y: ny }; applyTransform(nx, ny);
            inertiaRAF.current = requestAnimationFrame(step);
        };
        stopInertia(); inertiaRAF.current = requestAnimationFrame(step);
    }, [dragDampening, maxVerticalRotationDeg, stopInertia]);

    const openItemFromElement = useCallback(el => {
        if (openingRef.current) return;
        openingRef.current = true; openStartedAtRef.current = performance.now(); lockScroll();
        const parent = el.parentElement; focusedElRef.current = el;
        const offsetX = getDataNumber(parent, 'offsetX', 0), offsetY = getDataNumber(parent, 'offsetY', 0);
        const sizeX = getDataNumber(parent, 'sizeX', 2), sizeY = getDataNumber(parent, 'sizeY', 2);
        const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
        const parentY = normalizeAngle(parentRot.rotateY), globalY = normalizeAngle(rotationRef.current.y);
        let rotY = -(parentY + globalY) % 360; if (rotY < -180) rotY += 360;
        parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
        parent.style.setProperty('--rot-x-delta', `${-parentRot.rotateX - rotationRef.current.x}deg`);
        const refDiv = document.createElement('div'); refDiv.className = 'item__image item__image--reference opacity-0';
        refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
        parent.appendChild(refDiv); void refDiv.offsetHeight;
        const tileR = refDiv.getBoundingClientRect(), mainR = mainRef.current?.getBoundingClientRect(), frameR = frameRef.current?.getBoundingClientRect();
        if (!mainR || !frameR || tileR.width <= 0) { openingRef.current = false; focusedElRef.current = null; parent.removeChild(refDiv); unlockScroll(); return; }
        originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
        el.style.visibility = 'hidden'; el.style.zIndex = 0;
        const overlay = document.createElement('div'); overlay.className = 'enlarge';
        Object.assign(overlay.style, { position: 'absolute', left: frameR.left - mainR.left + 'px', top: frameR.top - mainR.top + 'px', width: frameR.width + 'px', height: frameR.height + 'px', opacity: '0', zIndex: '30', transformOrigin: 'top left', transition: `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`, borderRadius: openedImageBorderRadius, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,.35)' });
        const img = document.createElement('img');
        img.src = parent.dataset.src || el.querySelector('img')?.src || '';
        img.alt = parent.dataset.alt || ''; img.style.cssText = 'width:100%;height:100%;object-fit:cover;'; img.style.filter = grayscale ? 'grayscale(1)' : 'none';
        overlay.appendChild(img); viewerRef.current.appendChild(overlay);
        const sx0 = tileR.width / frameR.width, sy0 = tileR.height / frameR.height;
        overlay.style.transform = `translate(${tileR.left - frameR.left}px,${tileR.top - frameR.top}px) scale(${isFinite(sx0) && sx0 > 0 ? sx0 : 1},${isFinite(sy0) && sy0 > 0 ? sy0 : 1})`;
        setTimeout(() => { if (!overlay.parentElement) return; overlay.style.opacity = '1'; overlay.style.transform = 'translate(0,0) scale(1,1)'; rootRef.current?.setAttribute('data-enlarging', 'true'); }, 16);
        if (openedImageWidth || openedImageHeight) {
            const onEnd = ev => { if (ev.propertyName !== 'transform') return; overlay.removeEventListener('transitionend', onEnd);
                const prev = overlay.style.transition; overlay.style.transition = 'none';
                overlay.style.width = openedImageWidth; overlay.style.height = openedImageHeight;
                const nr = overlay.getBoundingClientRect(); overlay.style.width = frameR.width + 'px'; overlay.style.height = frameR.height + 'px'; void overlay.offsetWidth;
                overlay.style.transition = `left ${enlargeTransitionMs}ms ease,top ${enlargeTransitionMs}ms ease,width ${enlargeTransitionMs}ms ease,height ${enlargeTransitionMs}ms ease`;
                requestAnimationFrame(() => { overlay.style.left = `${frameR.left - mainR.left + (frameR.width - nr.width) / 2}px`; overlay.style.top = `${frameR.top - mainR.top + (frameR.height - nr.height) / 2}px`; overlay.style.width = openedImageWidth; overlay.style.height = openedImageHeight; });
                overlay.addEventListener('transitionend', () => { overlay.style.transition = prev; }, { once: true });
            }; overlay.addEventListener('transitionend', onEnd);
        }
    }, [segments, enlargeTransitionMs, openedImageBorderRadius, openedImageWidth, openedImageHeight, grayscale, lockScroll, unlockScroll]);

    useGesture({
        onDragStart: ({ event }) => {
            if (focusedElRef.current) return; stopInertia();
            pointerTypeRef.current = event.pointerType || 'mouse';
            if (pointerTypeRef.current === 'touch') { event.preventDefault(); lockScroll(); }
            draggingRef.current = true; cancelTapRef.current = false; movedRef.current = false;
            startRotRef.current = { ...rotationRef.current }; startPosRef.current = { x: event.clientX, y: event.clientY };
            tapTargetRef.current = event.target.closest?.('.item__image') || null;
        },
        onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
            if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
            if (pointerTypeRef.current === 'touch') event.preventDefault();
            const dx = event.clientX - startPosRef.current.x, dy = event.clientY - startPosRef.current.y;
            if (!movedRef.current && dx * dx + dy * dy > 16) movedRef.current = true;
            const nx = clamp(startRotRef.current.x - dy / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
            const ny = startRotRef.current.y + dx / dragSensitivity;
            if (rotationRef.current.x !== nx || rotationRef.current.y !== ny) { rotationRef.current = { x: nx, y: ny }; applyTransform(nx, ny); }
            if (last) {
                draggingRef.current = false;
                const d2 = (event.clientX - startPosRef.current.x) ** 2 + (event.clientY - startPosRef.current.y) ** 2;
                const isTap = d2 <= (pointerTypeRef.current === 'touch' ? 100 : 36);
                let [vMagX, vMagY] = velArr; const [dirX, dirY] = dirArr;
                let vx = vMagX * dirX, vy = vMagY * dirY;
                if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) { const [mx, my] = movement; vx = (mx / dragSensitivity) * 0.02; vy = (my / dragSensitivity) * 0.02; }
                if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) startInertia(vx, vy);
                startPosRef.current = null; cancelTapRef.current = !isTap;
                if (isTap && tapTargetRef.current && !focusedElRef.current) openItemFromElement(tapTargetRef.current);
                tapTargetRef.current = null; if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
                if (movedRef.current) lastDragEndAt.current = performance.now(); movedRef.current = false;
                if (pointerTypeRef.current === 'touch') unlockScroll();
            }
        },
    }, { target: mainRef, eventOptions: { passive: false } });

    useEffect(() => {
        const scrim = scrimRef.current; if (!scrim) return;
        const close = () => {
            if (performance.now() - openStartedAtRef.current < 250) return;
            const el = focusedElRef.current; if (!el) return;
            const parent = el.parentElement, overlay = viewerRef.current?.querySelector('.enlarge');
            if (!overlay) return;
            const refDiv = parent.querySelector('.item__image--reference'), originalPos = originalTilePositionRef.current;
            const rootRect = rootRef.current.getBoundingClientRect(), curRect = overlay.getBoundingClientRect();
            const animOv = document.createElement('div'); animOv.className = 'enlarge-closing';
            animOv.style.cssText = `position:absolute;left:${curRect.left - rootRect.left}px;top:${curRect.top - rootRect.top}px;width:${curRect.width}px;height:${curRect.height}px;z-index:9999;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;transform:none;filter:${grayscale ? 'grayscale(1)' : 'none'};`;
            const origImg = overlay.querySelector('img'); if (origImg) { const ci = origImg.cloneNode(); ci.style.cssText = 'width:100%;height:100%;object-fit:cover;'; animOv.appendChild(ci); }
            overlay.remove(); rootRef.current.appendChild(animOv); void animOv.getBoundingClientRect();
            if (originalPos) {
                requestAnimationFrame(() => { animOv.style.left = `${originalPos.left - rootRect.left}px`; animOv.style.top = `${originalPos.top - rootRect.top}px`; animOv.style.width = `${originalPos.width}px`; animOv.style.height = `${originalPos.height}px`; animOv.style.opacity = '0'; });
            }
            const cleanup = () => {
                animOv.remove(); originalTilePositionRef.current = null; if (refDiv) refDiv.remove();
                parent.style.transition = 'none'; el.style.transition = 'none';
                parent.style.setProperty('--rot-y-delta', '0deg'); parent.style.setProperty('--rot-x-delta', '0deg');
                requestAnimationFrame(() => {
                    el.style.visibility = ''; el.style.opacity = '0'; el.style.zIndex = 0; focusedElRef.current = null;
                    rootRef.current?.removeAttribute('data-enlarging');
                    requestAnimationFrame(() => {
                        parent.style.transition = ''; el.style.transition = 'opacity 300ms ease-out';
                        requestAnimationFrame(() => { el.style.opacity = '1'; setTimeout(() => { el.style.transition = ''; el.style.opacity = ''; openingRef.current = false; if (!draggingRef.current) document.body.classList.remove('dg-scroll-lock'); }, 300); });
                    });
                });
            };
            animOv.addEventListener('transitionend', cleanup, { once: true });
        };
        scrim.addEventListener('click', close);
        const onKey = e => { if (e.key === 'Escape') close(); }; window.addEventListener('keydown', onKey);
        return () => { scrim.removeEventListener('click', close); window.removeEventListener('keydown', onKey); };
    }, [enlargeTransitionMs, openedImageBorderRadius, grayscale]);

    useEffect(() => () => { document.body.classList.remove('dg-scroll-lock'); }, []);

    const css = `.sphere-root{--radius:520px;--viewer-pad:72px;--circ:calc(var(--radius)*3.14);--rot-y:calc((360deg/var(--segments-x))/2);--rot-x:calc((360deg/var(--segments-y))/2);--item-width:calc(var(--circ)/var(--segments-x));--item-height:calc(var(--circ)/var(--segments-y))}.sphere-root *{box-sizing:border-box}.sphere,.sphere-item,.item__image{transform-style:preserve-3d}.stage{width:100%;height:100%;display:grid;place-items:center;position:absolute;inset:0;margin:auto;perspective:calc(var(--radius)*2);perspective-origin:50% 50%}.sphere{transform:translateZ(calc(var(--radius)*-1));will-change:transform;position:absolute}.sphere-item{width:calc(var(--item-width)*var(--item-size-x));height:calc(var(--item-height)*var(--item-size-y));position:absolute;top:-999px;bottom:-999px;left:-999px;right:-999px;margin:auto;transform-origin:50% 50%;backface-visibility:hidden;transition:transform 300ms;transform:rotateY(calc(var(--rot-y)*(var(--offset-x)+((var(--item-size-x)-1)/2))+var(--rot-y-delta,0deg))) rotateX(calc(var(--rot-x)*(var(--offset-y)-((var(--item-size-y)-1)/2))+var(--rot-x-delta,0deg))) translateZ(var(--radius))}.sphere-root[data-enlarging="true"] .scrim{opacity:1!important;pointer-events:all!important}.item__image{position:absolute;inset:10px;border-radius:var(--tile-radius,12px);overflow:hidden;cursor:pointer;backface-visibility:hidden;-webkit-backface-visibility:hidden;transition:transform 300ms;pointer-events:auto;transform:translateZ(0)}.item__image--reference{position:absolute;inset:10px;pointer-events:none}@media (max-aspect-ratio:1/1){.viewer-frame{height:auto!important;width:100%!important}}`;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div ref={rootRef} className="sphere-root relative w-full h-full"
                style={{ ['--segments-x']: segments, ['--segments-y']: segments, ['--overlay-blur-color']: overlayBlurColor, ['--tile-radius']: imageBorderRadius, ['--enlarge-radius']: openedImageBorderRadius, ['--image-filter']: grayscale ? 'grayscale(1)' : 'none' }}>
                <main ref={mainRef} className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
                    style={{ touchAction: 'none', WebkitUserSelect: 'none' }}>
                    <div className="stage">
                        <div ref={sphereRef} className="sphere">
                            {items.map((it, i) => (
                                <div key={`${it.x},${it.y},${i}`} className="sphere-item absolute m-auto"
                                    data-src={it.src} data-alt={it.alt} data-offset-x={it.x} data-offset-y={it.y} data-size-x={it.sizeX} data-size-y={it.sizeY}
                                    style={{ ['--offset-x']: it.x, ['--offset-y']: it.y, ['--item-size-x']: it.sizeX, ['--item-size-y']: it.sizeY, top: '-999px', bottom: '-999px', left: '-999px', right: '-999px' }}>
                                    <div className="item__image absolute block overflow-hidden cursor-pointer"
                                        role="button" tabIndex={0} aria-label={it.alt || 'Open image'}
                                        style={{ inset: '10px', borderRadius: `var(--tile-radius,${imageBorderRadius})`, backfaceVisibility: 'hidden' }}
                                        onClick={e => { if (draggingRef.current || movedRef.current || performance.now() - lastDragEndAt.current < 80 || openingRef.current) return; openItemFromElement(e.currentTarget); }}
                                        onPointerUp={e => { if (e.pointerType !== 'touch' || draggingRef.current || movedRef.current || performance.now() - lastDragEndAt.current < 80 || openingRef.current) return; openItemFromElement(e.currentTarget); }}>
                                        <img src={it.src} draggable={false} alt={it.alt} className="w-full h-full object-cover pointer-events-none"
                                            style={{ backfaceVisibility: 'hidden', filter: `var(--image-filter,${grayscale ? 'grayscale(1)' : 'none'})` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute inset-0 m-auto z-[3] pointer-events-none" style={{ backgroundImage: `radial-gradient(rgba(235,235,235,0) 65%,var(--overlay-blur-color,${overlayBlurColor}) 100%)` }} />
                    <div className="absolute inset-0 m-auto z-[3] pointer-events-none" style={{ WebkitMaskImage: `radial-gradient(rgba(235,235,235,0) 70%,var(--overlay-blur-color,${overlayBlurColor}) 90%)`, maskImage: `radial-gradient(rgba(235,235,235,0) 70%,var(--overlay-blur-color,${overlayBlurColor}) 90%)`, backdropFilter: 'blur(3px)' }} />
                    <div className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180" style={{ background: `linear-gradient(to bottom,transparent,var(--overlay-blur-color,${overlayBlurColor}))` }} />
                    <div className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none" style={{ background: `linear-gradient(to bottom,transparent,var(--overlay-blur-color,${overlayBlurColor}))` }} />
                    <div ref={viewerRef} className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center" style={{ padding: 'var(--viewer-pad)' }}>
                        <div ref={scrimRef} className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }} />
                        <div ref={frameRef} className="viewer-frame h-full aspect-square flex" style={{ borderRadius: `var(--enlarge-radius,${openedImageBorderRadius})` }} />
                    </div>
                </main>
            </div>
        </>
    );
}
