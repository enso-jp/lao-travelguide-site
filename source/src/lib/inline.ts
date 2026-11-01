import { pageHref } from './site';

const NETWORK_HOSTS = new Set([
  'vietnam-travelguide.com',
  'www.vietnam-travelguide.com',
  'thailand-travelguide.com',
  'www.thailand-travelguide.com',
  'laos-travelguide.com',
  'www.laos-travelguide.com',
]);

const OFFICIAL_HOSTS = new Set(['laoevisa.gov.la', 'www.laoevisa.gov.la']);

const STATIC_FILE = /\.[a-z0-9]{2,8}$/i;
const MARKDOWN_LINK = /\[([^\]]+)\]\((https:\/\/[^)\s]+|\/[a-z0-9][a-z0-9\-\/]*)\)/gi;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeAbsoluteHref(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (NETWORK_HOSTS.has(host)) {
      if (url.pathname && url.pathname !== '/' && !url.pathname.endsWith('/') && !STATIC_FILE.test(url.pathname)) {
        url.pathname += '/';
      }
      return url.toString();
    }
    if (OFFICIAL_HOSTS.has(host)) return url.toString();
    return null;
  } catch {
    return null;
  }
}

export function formatInline(text: string): string {
  const source = String(text ?? '');
  const parts: string[] = [];
  let last = 0;
  MARKDOWN_LINK.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK.exec(source))) {
    parts.push(escapeHtml(source.slice(last, match.index)));
    const label = escapeHtml(match[1]);
    const hrefRaw = match[2];
    if (hrefRaw.startsWith('/')) {
      parts.push(`<a href="${pageHref(hrefRaw)}">${label}</a>`);
    } else {
      const safe = safeAbsoluteHref(hrefRaw);
      if (safe) parts.push(`<a href="${escapeHtml(safe)}" rel="noopener">${label}</a>`);
      else parts.push(escapeHtml(match[0]));
    }
    last = match.index + match[0].length;
  }
  parts.push(escapeHtml(source.slice(last)));
  return parts.join('').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
