import type { Service } from '../data/site';

type SiteData = { wa: string; services: Service[] };
let cache: SiteData | null = null;
function data(): SiteData {
  if (!cache) cache = JSON.parse(document.getElementById('site-data')?.textContent || '{"wa":"","services":[]}');
  return cache!;
}
export const getServices = () => data().services;
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
    `Hi SMART, I'm ${name}${data.get('business') ? ` from ${data.get('business')}` : ''}.`,
    `I'm interested in: ${data.get('service')}.`,
    String(data.get('message') || '').trim(),
  ].filter(Boolean);
  window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  return true;
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
    btn.setAttribute('aria-label', on ? 'Hide price' : 'Show price');
    btn.title = on ? 'Hide price' : 'Show price';
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
  if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Show price'); btn.title = 'Show price'; }
}

export const logoHTML = (src: string, size = 56) =>
  `<img src="${src}" width="${size}" height="${size}" alt="" decoding="async" />`;
