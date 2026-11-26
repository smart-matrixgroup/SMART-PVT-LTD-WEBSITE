import { findService, waLink, sendFormToWhatsApp, initPriceLocks, setPrice, logoHTML } from './shared';

const TABS = ['home', 'services', 'work', 'about', 'contact'] as const;
type Tab = (typeof TABS)[number];
const TITLES: Record<Tab, string> = { home: 'SMART', services: 'Services', work: 'Our Work', about: 'About', contact: 'Contact' };
const tap = () => navigator.vibrate?.(6);

export function initMobile() {
  const root = document.getElementById('mobile');
  if (!root) return;
  initPriceLocks();
  const nav = root.querySelector<HTMLElement>('[data-mnav]')!;
  const navTitle = root.querySelector<HTMLElement>('[data-mnav-title]')!;
  const panels = new Map(TABS.map((t) => [t, root.querySelector<HTMLElement>(`[data-tab="${t}"]`)!]));
  const btns = [...root.querySelectorAll<HTMLAnchorElement>('[data-tabbtn]')];
  const scrollMem: Partial<Record<Tab, number>> = {};
  let current: Tab = 'home';

  // ── Tabs (hash routed, so back button and shared links work) ──
  const show = (tab: Tab, opts: { push?: boolean } = {}) => {
    if (tab === current && !opts.push) return;
    scrollMem[current] = scrollY;
    panels.forEach((p, t) => (p.hidden = t !== tab));
    btns.forEach((b) => {
      const on = b.dataset.tabbtn === tab;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    root.dataset.active = tab;
    navTitle.textContent = TITLES[tab];
    root.querySelector<HTMLElement>('.m-tabbar')?.style.setProperty('--ti', String(TABS.indexOf(tab)));
    const panel = panels.get(tab)!;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      [...panel.children].forEach((ch, i) => (ch as HTMLElement).style.setProperty('--k', String(Math.min(i, 8))));
      panel.classList.remove('enter');
      void panel.offsetWidth;
      panel.classList.add('enter');
      window.setTimeout(() => panel.classList.remove('enter'), 1200);
    }
    const target = tab === current ? 0 : scrollMem[tab] ?? 0;
    current = tab;
    scrollTo({ top: target, behavior: 'instant' as ScrollBehavior });
    updateNav();
  };
  btns.forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      tap();
      const t = b.dataset.tabbtn as Tab;
      if (t === current) scrollTo({ top: 0, behavior: 'smooth' }); // iOS: tap active tab = scroll to top
      else {
        history.pushState(null, '', t === 'home' ? location.pathname : `#${t}`);
        show(t);
      }
    }),
  );
  root.querySelectorAll<HTMLElement>('[data-goto]').forEach((b) =>
    b.addEventListener('click', () => {
      const t = b.dataset.goto as Tab;
      history.pushState(null, '', `#${t}`);
      show(t);
    }),
  );
  const fromHash = () => {
    const h = location.hash.slice(1) as Tab;
    show(TABS.includes(h) ? h : 'home');
  };
  addEventListener('popstate', () => {
    if (sheetOpen()) closeSheet(false);
    fromHash();
  });
  if (matchMedia('(max-width: 860px)').matches) fromHash();

  // ── Nav bar: transparent over hero/large title, solid once scrolled ──
  function updateNav() {
    const threshold = current === 'home' ? 260 : 44;
    nav.classList.toggle('solid', scrollY > threshold);
  }
  addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── Scroll reveals ──
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    root.querySelectorAll('.m-rv').forEach((el) => io.observe(el));
    root.classList.add('m-rv-on');
  }

  // ── Search ──
  const search = root.querySelector<HTMLInputElement>('[data-search]');
  const empty = root.querySelector<HTMLElement>('[data-search-empty]')!;
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    root.querySelectorAll<HTMLElement>('[data-search-text]').forEach((el) => {
      const hit = !q || el.dataset.searchText!.includes(q);
      (el.classList.contains('m-fcard') ? el : el.parentElement!).hidden = !hit;
      if (hit) shown++;
    });
    empty.hidden = shown > 0;
  });

  // ── Segmented control ──
  const seg = root.querySelector<HTMLElement>('[data-seg]');
  if (seg) {
    const thumb = seg.querySelector<HTMLElement>('.m-seg-thumb')!;
    const segBtns = [...seg.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    segBtns.forEach((b, i) =>
      b.addEventListener('click', () => {
        tap();
        segBtns.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
        thumb.style.transform = `translateX(${i * 100}%)`;
        const f = b.dataset.filter!;
        root.querySelectorAll<HTMLElement>('.m-work').forEach((w) => (w.hidden = f !== 'all' && w.dataset.kind !== f));
      }),
    );
  }

  // ── Form ──
  const form = root.querySelector<HTMLFormElement>('[data-wa-form]');
  root.querySelector('[data-wa-submit]')?.addEventListener('click', () => form && sendFormToWhatsApp(form));
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    sendFormToWhatsApp(form);
  });

  // ── Page sheet ──
  const wrap = root.querySelector<HTMLElement>('[data-sheet-wrap]')!;
  const sheet = root.querySelector<HTMLElement>('[data-sheet]')!;
  const scroller = root.querySelector<HTMLElement>('[data-sheet-scroll]')!;
  const q = (k: string) => sheet.querySelector<HTMLElement>(`[data-s="${k}"]`)!;
  let opener: HTMLElement | null = null;
  const sheetOpen = () => wrap.classList.contains('open');

  const openSheet = (id: string, from: HTMLElement) => {
    const s = findService(id);
    if (!s) return;
    tap();
    opener = from;
    q('icon').innerHTML = logoHTML(s.logo, 72);
    q('name').textContent = s.name;
    q('short').textContent = s.short;
    setPrice(q('price'), s.price);
    q('delivery').textContent = s.delivery || '';
    q('delivery-wrap').hidden = !s.delivery;
    q('note').textContent = s.priceNote || '';
    q('forWho').textContent = s.forWho;
    q('problem').textContent = s.problem;
    q('includes').innerHTML = s.includes
      .map((i) => `<li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span></span></li>`)
      .join('');
    q('includes').querySelectorAll('span').forEach((sp, i) => (sp.textContent = s.includes[i]));
    (q('cta') as HTMLAnchorElement).href = waLink(`Hi SMART, I'm interested in ${s.name}. Can you tell me more?`);
    scroller.scrollTop = 0;
    sheet.style.removeProperty('--drag');
    wrap.hidden = false;
    document.documentElement.classList.add('sheet-open');
    history.pushState({ sheet: true }, '', location.href);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
    setTimeout(() => sheet.focus({ preventScroll: true }), 350);
  };
  const closeSheet = (viaHistory = true) => {
    if (!sheetOpen()) return;
    wrap.classList.remove('open');
    sheet.style.removeProperty('--drag');
    document.documentElement.classList.remove('sheet-open');
    setTimeout(() => (wrap.hidden = true), 450);
    opener?.focus({ preventScroll: true });
    if (viaHistory && history.state?.sheet) history.back();
  };

  root.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-service]');
    if (el) openSheet(el.dataset.service!, el);
  });
  wrap.querySelectorAll('[data-sheet-close]').forEach((b) => b.addEventListener('click', () => closeSheet()));
  addEventListener('keydown', (e) => e.key === 'Escape' && closeSheet());

  // Drag to dismiss: from the grabber anywhere, or from content when scrolled to top.
  let startY = 0, dy = 0, dragging = false, t0 = 0;
  const begin = (y: number) => {
    startY = y; dy = 0; dragging = true; t0 = performance.now();
    sheet.classList.add('dragging');
  };
  const move = (y: number, e?: Event) => {
    if (!dragging) return;
    dy = Math.max(0, y - startY);
    if (dy > 0 && e?.cancelable) e.preventDefault();
    sheet.style.setProperty('--drag', `${dy < 0 ? 0 : dy}px`);
  };
  const end = () => {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('dragging');
    const v = dy / Math.max(1, performance.now() - t0);
    if (dy > sheet.clientHeight * 0.3 || v > 0.6) closeSheet();
    else sheet.style.setProperty('--drag', '0px');
  };
  sheet.addEventListener('touchstart', (e) => {
    const onGrabber = (e.target as HTMLElement).closest('[data-grabber]');
    if (onGrabber || scroller.scrollTop <= 0) begin(e.touches[0].clientY);
  }, { passive: true });
  sheet.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const y = e.touches[0].clientY;
    if (y < startY && !(e.target as HTMLElement).closest('[data-grabber]')) {
      // scrolling content upward: hand control back to the scroller
      dragging = false;
      sheet.classList.remove('dragging');
      return;
    }
    move(y, e);
  }, { passive: false });
  sheet.addEventListener('touchend', end);
  sheet.addEventListener('touchcancel', end);
  // mouse fallback on the grabber (desktop browsers in narrow windows)
  const grab = sheet.querySelector<HTMLElement>('[data-grabber]')!;
  grab.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    grab.setPointerCapture(e.pointerId);
    begin(e.clientY);
  });
  grab.addEventListener('pointermove', (e) => e.pointerType !== 'touch' && move(e.clientY));
  grab.addEventListener('pointerup', (e) => e.pointerType !== 'touch' && end());
}
