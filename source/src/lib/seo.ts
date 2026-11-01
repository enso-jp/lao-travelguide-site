import type { Page } from './content';

const TITLE_MIN = 45;
const TITLE_MAX = 60;
const DESC_MIN = 130;
const DESC_MAX = 155;

function visible(text: string): string {
  return String(text ?? '')
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();
}

const ABBREV_MARK = '%%ABBREV%%';
const ABBREV_RULES: RegExp[] = [
  /(?<![A-Za-z])approx\./gi,
  /(?<![A-Za-z])e\.g\./gi,
  /(?<![A-Za-z])i\.e\./gi,
  /(?<![A-Za-z])vs\./gi,
  /(?<![A-Za-z])St\./g,
  /(?<![A-Za-z])Mt\./g,
  /(?<![A-Za-z])No\.(?=\s*\d)/g,
];

function protectAbbrevs(text: string): { text: string; marks: string[] } {
  const marks: string[] = [];
  let out = text;
  for (const re of ABBREV_RULES) {
    out = out.replace(re, (match) => {
      marks.push(match);
      return `${ABBREV_MARK}${marks.length - 1}%%`;
    });
  }
  return { text: out, marks };
}

function restoreAbbrevs(text: string, marks: string[]): string {
  return text.replace(new RegExp(`${ABBREV_MARK}(\\d+)%%`, 'g'), (_, idx) => marks[Number(idx)] ?? '');
}

function closeSentence(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

export function splitSentences(text: string): string[] {
  const raw = visible(text);
  if (!raw) return [];
  const { text: protectedText, marks } = protectAbbrevs(raw);
  const chunks = protectedText.split(/(?<=[.!?])\s+/);
  return chunks
    .map((chunk) => closeSentence(restoreAbbrevs(chunk, marks)))
    .filter((chunk) => chunk.length > 1);
}

export function seoTitle(page: Page): string {
  const title = visible(page.metaTitle);
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    throw new Error(`${page.path} title is ${title.length} chars`);
  }
  return title;
}

export function seoDescription(page: Page): string {
  const description = visible(page.metaDescription);
  if (description.length < DESC_MIN || description.length > DESC_MAX) {
    throw new Error(`${page.path} description is ${description.length} chars`);
  }
  return description;
}
