import type { Service } from '../data/site';

export type UI = Record<string, string>;
type SiteData = { wa: string; services: Service[]; ui?: UI };
let cache: SiteData | null = null;
function data(): SiteData {
  if (!cache) cache = JSON.parse(document.getElementById('site-data')?.textContent || '{"wa":"","services":[]}');
  return cache!;
}
export const getServices = () => data().services;
/** UI string from the page (translated per language at build time), with {x} placeholders. */
export const ui = (key: string, vars: Record<string, string> = {}) =>
  (data().ui?.[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
export const findService = (id: string) => getServices().find((s) => s.id === id);

export function iconHTML(serviceId: string) {
  const t = document.querySelector<HTMLTemplateElement>(`template[data-icon="${serviceId}"]`);
  return t ? t.innerHTML : '';
}

export const WA_NUMBER = () => data().wa;
export const waLink = (text: string) => `https://wa.me/${WA_NUMBER()}?text=${encodeURIComponent(text)}`;

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDesktop = () => matchMedia('(min-width: 861px)').matches;

/** Build a WhatsApp message from a form and open it. Returns false if invalid. */
export function sendFormToWhatsApp(form: HTMLFormElement) {
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const nameInput = form.querySelector<HTMLInputElement>('[name="name"]');
  if (!name) {
    nameInput?.setAttribute('aria-invalid', 'true');
    nameInput?.focus();
    return false;
  }
  nameInput?.removeAttribute('aria-invalid');
  const lines = [
    data.get('business')
      ? ui('waFormFrom', { name, business: String(data.get('business')) })
      : ui('waFormHello', { name }),
    ui('waFormService', { service: String(data.get('service')) }),
    String(data.get('message') || '').trim(),
  ].filter(Boolean);
  window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  return true;
}

let langReady = false;
/** Language picker: open/close, and keep the current section when switching. */
export function initLang() {
  if (langReady) return;
  langReady = true;
  const close = (except?: Element) =>
    document.querySelectorAll('[data-lang].open').forEach((l) => {
      if (l === except) return;
      l.classList.remove('open');
      l.querySelector('[data-lang-btn]')?.setAttribute('aria-expanded', 'false');
    });
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const btn = t.closest('[data-lang-btn]');
    if (btn) {
      const box = btn.closest('[data-lang]')!;
      close(box);
      const open = box.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      return;
    }
    const link = t.closest<HTMLAnchorElement>('[data-lang-link]');
    if (link) {
      e.preventDefault();
      try { localStorage.setItem('smart-lang', link.dataset.langLink!); } catch {}
      location.href = link.getAttribute('href')! + location.hash;
      return;
    }
    if (!t.closest('[data-lang]')) close();
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());
}

let plockReady = false;
/** One delegated handler for every "show price" eye button on the page. */
export function initPriceLocks() {
  if (plockReady) return;
  plockReady = true;
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-plock-btn]');
    if (!btn) return;
    e.stopPropagation();
    const lock = btn.closest<HTMLElement>('[data-plock]')!;
    const on = !lock.classList.contains('on');
    lock.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', ui(on ? 'hidePrice' : 'showPrice'));
    btn.title = ui(on ? 'hidePrice' : 'showPrice');
    navigator.vibrate?.(6);
  }, true);
}

/** Set a price lock's value and hide it again (used when a card is re-filled). */
export function setPrice(valueEl: HTMLElement, value: string) {
  valueEl.textContent = value;
  const lock = valueEl.closest<HTMLElement>('[data-plock]');
  if (!lock) return;
  lock.classList.remove('on');
  const btn = lock.querySelector<HTMLButtonElement>('[data-plock-btn]');
  if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', ui('showPrice')); btn.title = ui('showPrice'); }
}

export const logoHTML = (src: string, size = 56) =>
  `<img src="${src}" width="${size}" height="${size}" alt="" decoding="async" />`;
