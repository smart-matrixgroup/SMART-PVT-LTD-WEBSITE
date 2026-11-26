import { findService, iconHTML, waLink, reducedMotion, isDesktop, sendFormToWhatsApp } from './shared';

export function initDesktop() {
  const root = document.getElementById('desktop');
  if (!root) return;

  // One orchestrated entrance: headline, head, ring, orbit.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  initNav(root);
  initDialog(root);
  initOrbit(root);
  initSpotlight(root);
  initTilt(root);
  initChat(root);
  initSteps(root);
  initForm(root);

  // three.js only on desktop, only after first paint, never blocking LCP.
  const startNeural = () => {
    if (!isDesktop()) return;
    const canvas = root.querySelector<HTMLCanvasElement>('[data-neural]');
    if (!canvas) return;
    import('./neural').then((m) => m.startNeural(canvas)).catch(() => {});
  };
  if ('requestIdleCallback' in window) requestIdleCallback(startNeural, { timeout: 1500 });
  else setTimeout(startNeural, 600);
}

function initNav(root: HTMLElement) {
  const nav = root.querySelector<HTMLElement>('[data-nav]')!;
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = [...nav.querySelectorAll<HTMLAnchorElement>('.nav-links a')];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((l) => l.classList.toggle('active', l.hash === `#${e.target.id}`));
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach((l) => {
    const t = root.querySelector(l.hash);
    if (t) io.observe(t);
  });
  root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (ev) => {
      const t = root.querySelector(a.hash);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
      history.replaceState(null, '', a.hash);
    }),
  );
}

function initDialog(root: HTMLElement) {
  const dlg = root.querySelector<HTMLDialogElement>('[data-dialog]')!;
  const q = (k: string) => dlg.querySelector<HTMLElement>(`[data-d="${k}"]`)!;
  let opener: HTMLElement | null = null;

  root.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('[data-service]');
    if (!btn) return;
    const s = findService(btn.dataset.service!);
    if (!s) return;
    opener = btn;
    q('icon').innerHTML = iconHTML(s.id);
    q('name').textContent = s.name;
    q('short').textContent = s.short;
    q('problem').textContent = s.problem;
    q('forWho').textContent = s.forWho;
    q('includes').innerHTML = s.includes
      .map((i) => `<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${escapeHTML(i)}</li>`)
      .join('');
    q('price').textContent = s.price;
    q('note').textContent = [s.priceNote, s.delivery && `Ready in ${s.delivery}.`].filter(Boolean).join(' ');
    (q('cta') as HTMLAnchorElement).href = waLink(`Hi SMART, I'm interested in ${s.name}. Can you tell me more?`);
    dlg.showModal();
  });

  dlg.addEventListener('click', (ev) => {
    if (ev.target === dlg || (ev.target as HTMLElement).closest('[data-close]')) dlg.close();
  });
  dlg.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}

function initOrbit(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const items = [...stage.querySelectorAll<HTMLElement>('.orbit-item')];
  const n = items.length;
  let angle = -Math.PI / 2;
  let speed = 0.12; // rad/s
  let target = speed;
  let last = performance.now();
  let intro = 0; // 0 → 1 fly-out on load
  let visible = true;
  const tilt = (12 * Math.PI) / 180;

  const hoverOn = () => (target = 0.015);
  const hoverOff = () => (target = 0.12);
  stage.addEventListener('pointerenter', hoverOn);
  stage.addEventListener('pointerleave', hoverOff);
  stage.addEventListener('focusin', hoverOn);
  stage.addEventListener('focusout', hoverOff);

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible) {
      speed += (target - speed) * Math.min(1, dt * 3);
      if (!reducedMotion()) angle += speed * dt;
      intro = Math.min(1, intro + dt / 1.6);
      const e = 1 - Math.pow(1 - intro, 4);
      const w = stage.clientWidth;
      const rx = w * 0.5 * e;
      const ry = w * 0.17 * e;
      const cx = w / 2;
      const cy = w / 2;
      for (let i = 0; i < n; i++) {
        const a = angle + (i / n) * Math.PI * 2;
        const ex = Math.cos(a) * rx;
        const ey = Math.sin(a) * ry;
        const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt);
        const y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
        const depth = Math.sin(a); // +1 front, -1 back
        const k = (depth + 1) / 2;
        const el = items[i];
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(0.72 + 0.32 * k).toFixed(3)})`;
        el.style.opacity = String((0.35 + 0.65 * k) * e);
        el.style.zIndex = depth > 0 ? '20' : '1';
        el.style.filter = depth < -0.35 ? `blur(${(-depth - 0.35) * 2.2}px)` : '';
      }
    }
    requestAnimationFrame(frame);
  };
  setTimeout(() => requestAnimationFrame((t) => ((last = t), frame(t))), 500);
}

function initSpotlight(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-spot]').forEach((el) =>
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }),
  );
}

function initTilt(root: HTMLElement) {
  if (reducedMotion()) return;
  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

function initChat(root: HTMLElement) {
  const chat = root.querySelector<HTMLElement>('[data-chat]');
  if (!chat) return;
  const bubs = [...chat.querySelectorAll<HTMLElement>('.bub')];
  let timer = 0;
  const play = () => {
    bubs.forEach((b) => b.classList.remove('show'));
    bubs.forEach((b, i) => (timer = window.setTimeout(() => b.classList.add('show'), 400 + i * 1100)));
  };
  new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) play();
      else clearTimeout(timer);
    },
    { threshold: 0.5 },
  ).observe(chat);
}

function initSteps(root: HTMLElement) {
  const steps = root.querySelector<HTMLElement>('[data-steps]');
  if (!steps) return;
  const line = steps.querySelector<HTMLElement>('.steps-line span')!;
  const update = () => {
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (innerHeight * 0.5)));
    line.style.setProperty('--p', p.toFixed(3));
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

function initForm(root: HTMLElement) {
  root.querySelectorAll<HTMLFormElement>('[data-wa-form]').forEach((f) =>
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      sendFormToWhatsApp(f);
    }),
  );
}

function escapeHTML(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
