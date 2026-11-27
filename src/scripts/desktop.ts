import { findService, waLink, reducedMotion, isDesktop, sendFormToWhatsApp, initPriceLocks, setPrice, logoHTML } from './shared';

export function initDesktop() {
  const root = document.getElementById('desktop');
  if (!root) return;

  // One orchestrated entrance: headline, head, ring, orbit.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  initPriceLocks();
  initNav(root);
  initReveals(root);
  initDialog(root);
  initOrbit(root);
  initPicker(root);
  initSpotlight(root);
  initTilt(root);
  initChat(root);
  initSteps(root);
  initForm(root);
  initCert(root);

  // three.js only on desktop, only after first paint, never blocking LCP.
  const startNeural = () => {
    if (!isDesktop()) return;
    const canvas = root.querySelector<HTMLCanvasElement>('[data-neural]');
    if (!canvas) return;
    import('./neural').then((m) => m.startNeural(canvas, root.querySelector('[data-stage]'))).catch(() => {});
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
      const t = root.querySelector<HTMLElement>(a.hash);
      if (!t) return;
      ev.preventDefault();
      portalTo(t, ev as MouseEvent, a.textContent?.trim() || '');
      history.replaceState(null, '', a.hash);
    }),
  );
}

/**
 * Menu jump: instead of a long scroll, the page "opens a portal" from the click
 * point. The current view shrinks back and blurs away while the target section
 * grows in through an expanding circle, then its own reveal plays.
 * Uses the View Transitions API; falls back to a smooth scroll.
 */
function portalTo(target: HTMLElement, ev: MouseEvent, label: string) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  const jump = () => {
    target.querySelectorAll<HTMLElement>('[data-rv]').forEach((el) => el.classList.remove('in'));
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - (target.id === 'top' ? 0 : 0), behavior: 'instant' as ScrollBehavior });
  };
  if (reducedMotion() || !doc.startViewTransition) {
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
    return;
  }
  const x = ev.clientX || innerWidth / 2;
  const y = ev.clientY || 60;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const root = document.documentElement;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-r', `${r}px`);
  root.dataset.vtLabel = label;
  root.classList.add('vt-portal');
  const t = doc.startViewTransition(jump);
  t.finished.finally(() => root.classList.remove('vt-portal'));
}

/**
 * Scroll reveals. Each element marked [data-rv] animates in once, when it first
 * enters the viewport. Headings split into words that rise out of a mask;
 * groups ([data-rv-group]) stagger their children.
 */
function initReveals(root: HTMLElement) {
  if (reducedMotion()) return;
  // Split section headings into masked words.
  root.querySelectorAll<HTMLElement>('main .h2, .vm-text').forEach((h) => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    const words = (h.textContent || '').trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent!.trim());
    h.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--wi:${i}">${w}</span></span>`).join(' ');
    h.setAttribute('data-rv', 'words');
  });
  // Stagger children of groups.
  root.querySelectorAll<HTMLElement>('[data-rv-group]').forEach((g) => {
    [...g.children].forEach((c, i) => {
      if (!(c instanceof HTMLElement) || c.classList.contains('steps-line')) return;
      c.setAttribute('data-rv', g.dataset.rvGroup || 'up');
      c.style.setProperty('--ri', String(i));
    });
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );
  root.querySelectorAll<HTMLElement>('[data-rv]').forEach((el) => io.observe(el));
  // After a portal jump we re-arm the target's reveals.
  const mo = new MutationObserver((list) => {
    for (const m of list) {
      const el = m.target as HTMLElement;
      if (m.attributeName === 'class' && el.hasAttribute('data-rv') && !el.classList.contains('in')) io.observe(el);
    }
  });
  mo.observe(root, { subtree: true, attributes: true, attributeFilter: ['class'] });
  document.documentElement.classList.add('rv-on');
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
    q('icon').innerHTML = logoHTML(s.logo, 72);
    q('name').textContent = s.name;
    q('short').textContent = s.short;
    q('problem').textContent = s.problem;
    q('forWho').textContent = s.forWho;
    q('includes').innerHTML = s.includes
      .map((i) => `<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${escapeHTML(i)}</li>`)
      .join('');
    setPrice(q('price'), s.price);
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

  // Bring one service to the front of the orbit (driven by the problem picker).
  let focusAngle: number | null = null;
  const nodes = items.map((it) => it.querySelector<HTMLElement>('.orbit-node')!);
  stage.addEventListener('orbit-focus', (ev) => {
    const id = (ev as CustomEvent<string>).detail;
    const i = nodes.findIndex((nd) => nd.dataset.service === id);
    if (i < 0) return;
    focusAngle = Math.PI / 2 - (i / n) * Math.PI * 2;
    nodes.forEach((nd, j) => nd.classList.toggle('is-focus', j === i));
  });

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible) {
      speed += (target - speed) * Math.min(1, dt * 3);
      if (focusAngle !== null) {
        let d = (focusAngle - angle) % (Math.PI * 2);
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        angle += reducedMotion() ? d : d * Math.min(1, dt * 3.2);
      } else if (!reducedMotion()) angle += speed * dt;
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

function initPicker(root: HTMLElement) {
  const picker = root.querySelector<HTMLElement>('[data-picker]');
  const stage = root.querySelector<HTMLElement>('[data-stage]');
  if (!picker || !stage) return;
  const chips = [...picker.querySelectorAll<HTMLButtonElement>('[data-pick]')];
  const card = picker.querySelector<HTMLElement>('[data-answer]')!;
  const q = (k: string) => card.querySelector<HTMLElement>(`[data-a="${k}"]`)!;
  const CYCLE = 4200;
  let idx = 0;
  let auto = !reducedMotion();
  let t0 = performance.now();

  const pick = (i: number) => {
    idx = i;
    const chip = chips[i];
    const s = findService(chip.dataset.pick!);
    if (!s) return;
    chips.forEach((c) => c.setAttribute('aria-checked', String(c === chip)));
    q('icon').innerHTML = logoHTML(s.logo, 56);
    q('name').textContent = s.name;
    q('short').textContent = s.short;
    setPrice(q('price'), s.price);
    q('more').dataset.service = s.id;
    (q('wa') as HTMLAnchorElement).href = waLink(`Hi SMART, I'm interested in ${s.name}.`);
    card.classList.remove('swap');
    void card.offsetWidth;
    card.classList.add('swap');
    stage.dispatchEvent(new CustomEvent('orbit-focus', { detail: s.id }));
    t0 = performance.now();
  };
  const stopAuto = () => {
    auto = false;
    card.style.setProperty('--prog', '0');
  };

  chips.forEach((c, i) =>
    c.addEventListener('click', () => {
      stopAuto();
      pick(i);
    }),
  );
  // Arrow keys move between options, like a native radio group.
  picker.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    stopAuto();
    const next = (idx + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + chips.length) % chips.length;
    pick(next);
    chips[next].focus();
  });
  stage.addEventListener('click', stopAuto);

  // Until someone interacts, walk through the problems so the hero explains itself.
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(picker);
  const tick = (now: number) => {
    if (auto && visible && !document.hidden) {
      const p = (now - t0) / CYCLE;
      if (p >= 1) pick((idx + 1) % chips.length);
      else card.style.setProperty('--prog', p.toFixed(3));
    } else if (auto) t0 = now - (Number(card.style.getPropertyValue('--prog')) || 0) * CYCLE;
    if (auto) requestAnimationFrame(tick);
  };
  setTimeout(() => {
    pick(0);
    if (auto) requestAnimationFrame(tick);
  }, 1400);
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

function initCert(root: HTMLElement) {
  const dlg = root.querySelector<HTMLDialogElement>('[data-cert]');
  if (!dlg) return;
  let opener: HTMLElement | null = null;
  root.querySelectorAll<HTMLElement>('[data-cert-open]').forEach((b) =>
    b.addEventListener('click', () => { opener = b; dlg.showModal(); }),
  );
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || (e.target as HTMLElement).closest('[data-cert-close]')) dlg.close();
  });
  dlg.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}
