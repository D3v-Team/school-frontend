/**
 * ScrollStack — native window scroll, no Lenis, no extra deps.
 *
 * Cards stack on top of each other as user scrolls through the section.
 * Each card is position:sticky with increasing top offset.
 * The section height is expanded so there is enough scroll room.
 */
import { useEffect, useRef } from 'react';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
    <div className={`scroll-stack-item ${itemClassName}`}>{children}</div>
);

const ScrollStack = ({
    children,
    className = '',
    itemDistance = 120,   // px of scroll travel per card before next appears
    stackPosition = 160,  // sticky top offset for first card (px from viewport top)
    itemStackOffset = 10, // additional top offset per subsequent card
}) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const items = Array.from(section.querySelectorAll('.scroll-stack-item'));
        if (!items.length) return;

        // Apply sticky + z-index + top to each card
        items.forEach((item, i) => {
            item.style.position = 'sticky';
            item.style.top = `${stackPosition + i * itemStackOffset}px`;
            item.style.zIndex = 10 + i;
            item.style.marginBottom = `${itemDistance}px`;
        });

        // Last card: remove bottom margin so section ends cleanly
        if (items.length > 0) {
            items[items.length - 1].style.marginBottom = '0';
        }
    }, [stackPosition, itemStackOffset, itemDistance]);

    return (
        <div
            ref={sectionRef}
            className={className}
        >
            {children}
        </div>
    );
};

export default ScrollStack;
