type SearchItem = {
  title: string;
  localScript?: string;
  th?: string;
  sub?: string;
  group: string;
  href: string;
  body?: string;
  text?: string;
};

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function wireDatePair(inInput: HTMLInputElement | null, outInput: HTMLInputElement | null) {
  if (!inInput || !outInput) return;
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const todayStr = fmtDate(today);
  const checkinStr = fmtDate(tomorrow);
  inInput.min = todayStr;
  outInput.min = checkinStr;
  const staleIn = !inInput.value || inInput.value < todayStr;
  if (staleIn) inInput.value = checkinStr;
  if (!outInput.value || outInput.value <= inInput.value || staleIn) {
    const picked = new Date(`${inInput.value}T00:00:00`);
    outInput.value = fmtDate(addDays(picked, 3));
  }
  inInput.addEventListener('change', () => {
    if (!inInput.value) return;
    const picked = new Date(`${inInput.value}T00:00:00`);
    const minOut = addDays(picked, 1);
    const minOutStr = fmtDate(minOut);
    outInput.min = minOutStr;
    if (!outInput.value || outInput.value <= inInput.value) {
      outInput.value = fmtDate(addDays(picked, 3));
    }
  });
}

function appendStayQuery(baseHref: string, checkin?: string, checkout?: string, guests = '2-1'): string {
  try {
    const url = new URL(baseHref);
    if (checkin) url.searchParams.set('checkin', checkin);
    if (checkout) url.searchParams.set('checkout', checkout);
    const [adults, rooms] = guests.split('-');
    if (adults) url.searchParams.set('adult', adults);
    if (rooms) url.searchParams.set('crn', rooms);
    return url.toString();
  } catch {
    return baseHref;
  }
}

function placementFor(el: Element | null): string {
  if (!el) return 'unknown';
  const tagged = el.closest<HTMLElement>('[data-placement]');
  if (tagged?.dataset.placement) return tagged.dataset.placement;
  const named = el.closest<HTMLElement>('[data-trip-box],[data-book],[data-book-form],section[id],[class*="trip-cta"],[class*="aff"],[class*="flight"],header,footer,nav,main');
  if (!named) return 'page';
  if (named.hasAttribute('data-trip-box')) return 'trip_search';
  if (named.hasAttribute('data-book') || named.hasAttribute('data-book-form')) return 'book_widget';
  if (named.id) return named.id;
  const cls = Array.from(named.classList).find((c) => /trip-cta|aff|flight/.test(c));
  return cls || named.tagName.toLowerCase();
}

type AffiliateClick = { partner: string; linkUrl: string; subId: string; linkText: string; placement: string };

function trackAffiliate(click: AffiliateClick) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  // The inline GA snippet is wrapped in a function scope by define:vars, so
  // fall back to the queue gtag.js reads if window.gtag is missing.
  const g =
    typeof w.gtag === 'function'
      ? w.gtag
      : function (..._args: unknown[]) {
          (w.dataLayer = w.dataLayer || []).push(arguments);
        };
  let linkDomain = '';
  try {
    linkDomain = new URL(click.linkUrl, location.href).hostname;
  } catch {
    /* keep empty */
  }
  try {
    g('event', 'affiliate_click', {
      partner: click.partner,
      link_domain: linkDomain,
      sub_id: click.subId,
      link_text: click.linkText.replace(/\s+/g, ' ').trim().slice(0, 100),
      page_path: location.pathname,
      placement: click.placement,
      link_url: click.linkUrl.slice(0, 500),
      transport_type: 'beacon',
    });
  } catch {
    /* analytics must never break navigation */
  }
}

/** 'trip' or 'klook' for affiliate URLs (including Travelpayouts redirects), else null. */
function partnerFor(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href, location.href);
  } catch {
    return null;
  }
  const host = url.hostname;
  if (/(^|\.)trip\.com$/.test(host)) return 'trip';
  if (/(^|\.)klook\.com$/.test(host) || /(^|\.)tpx\.li$/.test(host)) return 'klook';
  if (/(^|\.)(tp\.media|tpk\.ro|travelpayouts\.com|tp\.st)$/.test(host)) {
    const inner = url.searchParams.get('u') || '';
    if (/klook\.com/.test(inner) || url.searchParams.get('trs') === '588978') return 'klook';
    if (/trip\.com/.test(inner)) return 'trip';
    return 'travelpayouts';
  }
  return null;
}

/** trip_sub1, else Travelpayouts sub_id, else marker. */
function subIdFor(href: string): string {
  try {
    const p = new URL(href, location.href).searchParams;
    return p.get('trip_sub1') || p.get('sub_id') || p.get('marker') || '';
  } catch {
    return '';
  }
}

function ready(fn: () => void) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}

ready(() => {
  document.addEventListener(
    'click',
    (event) => {
      const a = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const partner = partnerFor(a.href);
      if (partner) {
        trackAffiliate({
          partner,
          linkUrl: a.href,
          subId: subIdFor(a.href),
          linkText: a.textContent || a.getAttribute('aria-label') || '',
          placement: placementFor(a),
        });
      }
    },
    { capture: true },
  );

  // Partner iframes (Trip.com search box): a click inside moves focus to the
  // iframe and blurs the window. Count at most once per iframe per page view.
  const seenFrames = new WeakSet<HTMLIFrameElement>();
  window.addEventListener('blur', () => {
    window.setTimeout(() => {
      const f = document.activeElement;
      if (!(f instanceof HTMLIFrameElement) || seenFrames.has(f)) return;
      // Proxy for search box use: only the Trip.com iframe, once per page view.
      if (partnerFor(f.src) !== 'trip') return;
      seenFrames.add(f);
      trackAffiliate({
        partner: 'trip',
        linkUrl: f.src,
        subId: subIdFor(f.src),
        linkText: 'search_box',
        placement: `${placementFor(f)}_iframe`,
      });
    }, 0);
  });

  const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu]');
  const menu = document.querySelector<HTMLElement>('#site-menu');
  const backdrops = document.querySelectorAll<HTMLElement>('[data-menu]');
  const toggleMenu = (open?: boolean) => {
    const next = open ?? menu?.hasAttribute('hidden');
    menuBtn?.setAttribute('aria-expanded', String(Boolean(next)));
    menu?.toggleAttribute('hidden', !next);
  };
  backdrops.forEach((el) => {
    el.addEventListener('click', () => {
      if (el.classList.contains('phone-backdrop') || el.hasAttribute('data-menu')) {
        if (el === menuBtn) toggleMenu();
        else toggleMenu(false);
      }
    });
  });

  const searchPop = document.querySelector<HTMLElement>('#site-search');
  const searchToggle = document.querySelector<HTMLButtonElement>('[data-search-toggle]');
  const q = document.querySelector<HTMLInputElement>('#q');
  const panel = document.querySelector<HTMLElement>('#search-panel');
  let index: SearchItem[] | null = null;
  let loading: Promise<void> | null = null;

  const loadIndex = () => {
    if (index || loading) return loading;
    loading = fetch('/search.json')
      .then((res) => res.json())
      .then((data) => {
        index = data;
      })
      .catch(() => {
        loading = null;
      });
    return loading;
  };

  const renderSearch = () => {
    if (!q || !panel || !index) return;
    const query = q.value.trim().toLowerCase();
    if (query.length < 2) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    const ranked = index
      .map((item) => {
        const hay = `${item.title} ${item.localScript || item.th || ''} ${item.text || item.body || ''}`.toLowerCase();
        if (!hay.includes(query)) return null;
        const title = item.title.toLowerCase();
        const rank = title.startsWith(query) ? 0 : title.includes(query) ? 1 : 2;
        return { item, rank };
      })
      .filter((row): row is { item: SearchItem; rank: number } => Boolean(row))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 8);
    panel.innerHTML = ranked
      .map((row) => {
        const local = row.item.localScript || row.item.th || '';
        const label = local ? `${row.item.title} · ${local}` : row.item.title;
        return `<a href="${row.item.href}"><span>${label}</span><small>${row.item.group}</small></a>`;
      })
      .join('');
    panel.hidden = ranked.length === 0;
  };

  q?.addEventListener('focus', () => {
    void loadIndex()?.then(renderSearch);
  });
  q?.addEventListener('input', () => {
    void loadIndex()?.then(renderSearch);
  });
  searchToggle?.addEventListener('click', () => {
    const open = searchPop?.hasAttribute('hidden');
    searchPop?.toggleAttribute('hidden', !open);
    searchToggle.setAttribute('aria-expanded', String(Boolean(open)));
    if (open) q?.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggleMenu(false);
      if (window.matchMedia('(max-width: 860px)').matches) {
        searchPop?.setAttribute('hidden', '');
        searchToggle?.setAttribute('aria-expanded', 'false');
      }
      panel && (panel.hidden = true);
    }
  });

  document.querySelectorAll<HTMLElement>('[data-region-stage]').forEach((stage) => {
    const show = (slug: string) => {
      stage.querySelectorAll<HTMLElement>('[data-region-card]').forEach((card) => {
        card.hidden = card.dataset.regionCard !== slug;
      });
      stage.querySelectorAll<HTMLElement>('[data-region]').forEach((el) => {
        const on = el.dataset.region === slug;
        el.classList.toggle('is-active', on);
        if (el.getAttribute('role') === 'tab') el.setAttribute('aria-selected', String(on));
      });
      const slide = stage.querySelector<HTMLElement>(`[data-region-slide="${slug}"]`);
      const row = stage.querySelector<HTMLElement>('[data-region-swipe-row]');
      if (slide && row) row.scrollTo({ left: slide.offsetLeft - row.offsetLeft, behavior: 'smooth' });
      stage.querySelectorAll<HTMLElement>('[data-region-slide]').forEach((el) => {
        el.classList.toggle('is-active', el.dataset.regionSlide === slug);
      });
    };

    stage.querySelectorAll<HTMLElement>('button[data-region], svg .map-hit').forEach((el) => {
      el.addEventListener('click', (event) => {
        const slug = (event.currentTarget as HTMLElement).dataset.region;
        if (!slug) return;
        event.preventDefault();
        show(slug);
      });
    });

    stage.querySelectorAll<SVGElement>('svg .map-province').forEach((shape) => {
      shape.addEventListener('pointerover', () => {
        shape.classList.add('is-hover');
        const name = shape.getAttribute('data-province');
        stage.querySelectorAll(`.map-pin[data-province="${name}"]`).forEach((pin) => pin.classList.add('is-hover'));
      });
      shape.addEventListener('pointerout', () => {
        shape.classList.remove('is-hover');
        const name = shape.getAttribute('data-province');
        stage.querySelectorAll(`.map-pin[data-province="${name}"]`).forEach((pin) => pin.classList.remove('is-hover'));
      });
    });

    const slugs = [...stage.querySelectorAll<HTMLElement>('button[data-region]')].map((btn) => btn.dataset.region || '');
    stage.querySelector('[data-region-prev]')?.addEventListener('click', () => {
      const current = slugs.findIndex((slug) => stage.querySelector(`[data-region="${slug}"].is-active`));
      show(slugs[(current - 1 + slugs.length) % slugs.length]);
    });
    stage.querySelector('[data-region-next]')?.addEventListener('click', () => {
      const current = slugs.findIndex((slug) => stage.querySelector(`[data-region="${slug}"].is-active`));
      show(slugs[(current + 1) % slugs.length]);
    });
  });

  document.querySelectorAll<HTMLElement>('.attraction-stack').forEach((stack) => {
    stack.querySelector('.list-more')?.addEventListener('click', () => {
      const open = stack.classList.toggle('is-open');
      stack.querySelector('.list-more')?.setAttribute('aria-expanded', String(open));
    });
  });

  if (location.hash) {
    const hashed = document.querySelector(location.hash);
    if (hashed?.classList.contains('is-extra')) {
      hashed.closest('.attraction-stack')?.classList.add('is-open');
      hashed.scrollIntoView({ block: 'center' });
    }
  }

  const tabs = document.querySelectorAll<HTMLAnchorElement>('nav.tabs a[href^="#"]');
  const sections = [...tabs]
    .map((tab) => document.querySelector<HTMLElement>(tab.getAttribute('href') || ''))
    .filter((el): el is HTMLElement => Boolean(el));
  if (tabs.length && sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        tabs.forEach((tab) => {
          tab.removeAttribute('aria-current');
          if (tab.getAttribute('href') === `#${visible.target.id}`) tab.setAttribute('aria-current', 'location');
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0.1, 0.3] },
    );
    sections.forEach((section) => io.observe(section));
  }

  const dish = document.querySelector<HTMLInputElement>('#dish-search');
  dish?.addEventListener('input', () => {
    const query = dish.value.trim().toLowerCase();
    document.querySelectorAll<HTMLElement>('[data-find]').forEach((node) => {
      const hay = (node.dataset.find || node.textContent || '').toLowerCase();
      node.hidden = query.length > 0 && !hay.includes(query);
    });
    document.querySelectorAll<HTMLElement>('[data-letter]').forEach((section) => {
      const visible = [...section.querySelectorAll<HTMLElement>('[data-find]')].some((node) => !node.hidden);
      section.hidden = !visible;
    });
  });

  document.querySelectorAll<HTMLElement>('[data-book]').forEach((book) => {
    const json = book.querySelector<HTMLScriptElement>('[data-book-links]');
    const links = json ? (JSON.parse(json.textContent || '{}') as Record<string, Record<string, string>>) : {};
    const inInput = book.querySelector<HTMLInputElement>('[data-book-in]');
    const outInput = book.querySelector<HTMLInputElement>('[data-book-out]');
    const goBtn = book.querySelector<HTMLButtonElement>('[data-book-go]');
    wireDatePair(inInput, outInput);

    let tab = 'stay';
    book.querySelectorAll<HTMLButtonElement>('[data-book-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        tab = btn.dataset.bookTab || 'stay';
        book.querySelectorAll('[data-book-tab]').forEach((other) => {
          other.setAttribute('aria-selected', String(other === btn));
        });
        if (goBtn && btn.dataset.bookSubmit) {
          goBtn.textContent = btn.dataset.bookSubmit;
        }
      });
    });
    book.querySelector<HTMLFormElement>('[data-book-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const city = book.querySelector<HTMLSelectElement>('[data-book-city]')?.value || 'bangkok';
      const guests = book.querySelector<HTMLSelectElement>('[data-book-guests]')?.value || '2-1';
      const pack = links[city] || links.bangkok;
      if (!pack) return;
      const href =
        tab === 'activities'
          ? pack.tours
          : tab === 'transfers'
            ? pack.transfer
            : tab === 'trains'
              ? pack.trains
              : appendStayQuery(pack.stay, inInput?.value, outInput?.value, guests);
      const partner = partnerFor(href);
      if (partner) trackAffiliate({ partner, linkUrl: href, subId: subIdFor(href), linkText: `book_widget_${tab}`, placement: `book_widget_${tab}` });
      window.open(href, '_blank', 'noopener,noreferrer');
    });
  });

  document.querySelectorAll<HTMLElement>('[data-trip-box]').forEach((box) => {
    const json = box.querySelector<HTMLScriptElement>('[data-trip-links]');
    const links = json ? (JSON.parse(json.textContent || '{}') as Record<string, string>) : {};
    const inInput = box.querySelector<HTMLInputElement>('[data-trip-in]');
    const outInput = box.querySelector<HTMLInputElement>('[data-trip-out]');
    wireDatePair(inInput, outInput);

    box.querySelector<HTMLFormElement>('[data-trip-search-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const city = box.querySelector<HTMLSelectElement>('[data-trip-city]')?.value || 'bangkok';
      const guests = box.querySelector<HTMLSelectElement>('[data-trip-guests]')?.value || '2-1';
      const base = links[city] || links.bangkok;
      if (!base) return;
      const href = appendStayQuery(base, inInput?.value, outInput?.value, guests);
      trackAffiliate({ partner: 'trip', linkUrl: href, subId: subIdFor(href), linkText: 'trip_search', placement: 'trip_search' });
      window.open(href, '_blank', 'noopener,noreferrer');
    });
  });

  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((rail) => {
    const row = rail.querySelector<HTMLElement>('[data-carousel-row]');
    if (!row) return;
    rail.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
      row.scrollBy({ left: -row.clientWidth * 0.8, behavior: 'smooth' });
    });
    rail.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
      row.scrollBy({ left: row.clientWidth * 0.8, behavior: 'smooth' });
    });
  });
});
