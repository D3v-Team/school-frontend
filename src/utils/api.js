/**
 * Public API helpers — no auth required
 * Base URL: http://167.86.110.132:3002
 */
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export const BASE = 'http://167.86.110.132:3002';

const pub = axios.create({ baseURL: BASE });

export default pub;

/**
 * Normalize i18n language code to API suffix
 * uz/lotin → 'latin', cyrl/kk/kiril → 'cyril', ru → 'ru'
 */
export function normalizeLang(lang) {
    const code = (lang || 'uz').split('-')[0].toLowerCase();
    if (code === 'ru') return 'ru';
    if (code === 'cyrl' || code === 'kk' || code === 'kiril' || code === 'uzcyrl') return 'cyrl';
    return 'latin';
}

/**
 * Reactive hook — returns normalized lang string.
 * Re-renders when i18n language changes.
 */
export function useLang() {
    const { i18n } = useTranslation();
    return normalizeLang(i18n.language);
}

/**
 * Get localized field value based on i18n language
 * uz → *_latin, cyrl/kk → *_cyril, ru → *_ru
 */
export function getLang(obj, field, lang = 'uz') {
    if (!obj) return '';
    const suffix = normalizeLang(lang);
    const nested = obj[field];
    const nestedValue = nested && typeof nested === 'object'
        ? nested[suffix === 'ru' ? 'ru' : suffix === 'cyrl' ? 'kk' : 'uz']
            || nested[suffix]
            || nested.uz
        : '';

    if (suffix === 'ru') {
        return obj[`${field}_ru`] || nestedValue || obj[`${field}_latin`] || obj[field] || '';
    }
    if (suffix === 'cyrl') {
        return obj[`${field}_cyril`] || obj[`${field}_kyryl`] || obj[`${field}_kiril`]
            || nestedValue || obj[`${field}_latin`] || obj[field] || '';
    }
    return obj[`${field}_latin`] || nestedValue || obj[field] || '';
}

/**
 * Get translated text directly by suffix keys
 * Works for objects like { title_latin, title_cyril, title_ru }
 */
export function getLocalizedField(obj, field, langSuffix = 'latin') {
    if (!obj) return '';
    return obj[`${field}_${langSuffix}`] || obj[`${field}_latin`] || obj[field] || '';
}

/** Absolute URL for /media/... paths from API */
export function mediaUrl(path) {
    if (!path) return '';
    if (typeof path === 'object') {
        path = path.url || path.image_url || path.cover_image || path.src || path.icon_url || '';
    }
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) return path;
    return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Format date to "19 Aug 2026" */
export function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date)) return d;
    const day   = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year  = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/* cached contact info for header/footer */
let _contactPromise = null;
export function fetchContactInfo() {
    if (!_contactPromise) {
        _contactPromise = pub.get('/api/contact/info')
            .then(res => res.data?.data || res.data || null)
            .catch(() => null);
    }
    return _contactPromise;
}
