// Popular Pharmaceuticals PLC homepage behaviour. No dependencies.
document.documentElement.classList.add('js');

// Sample data for the design. The live site loads all brands from the product database.
const MEDICINES = [
  { name: 'Human Insulin (soluble)', area: 'Hormone and insulin', form: 'Injection, vial and cartridge' },
  { name: 'Human Insulin (isophane, NPH)', area: 'Hormone and insulin', form: 'Injection, vial and cartridge' },
  { name: 'Human Insulin 30/70 premix', area: 'Hormone and insulin', form: 'Injection, vial and cartridge' },
  { name: 'Amikacin', area: 'Anti-infectives', form: 'Injection' },
  { name: 'Ceftriaxone', area: 'Anti-infectives', form: 'Injection' },
  { name: 'Ambroxol', area: 'Respiratory and allergy', form: 'Syrup and tablet' },
  { name: 'Rupatadine', area: 'Respiratory and allergy', form: 'Tablet' },
  { name: 'Amlodipine', area: 'Cardiac', form: 'Tablet' },
  { name: 'Losartan potassium', area: 'Cardiac', form: 'Tablet' },
  { name: 'Esomeprazole', area: 'Gastro', form: 'Capsule and injection' },
  { name: 'Moxifloxacin', area: 'Ophthalmics', form: 'Eye drops' },
  { name: 'Sodium chloride 0.9%', area: 'Infusion', form: 'IV infusion' },
  { name: 'Dextrose 5%', area: 'Infusion', form: 'IV infusion' },
  { name: 'Ivermectin', area: 'Animal health', form: 'Injection' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Header: thinner border once the page scrolls */
const header = $('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Mobile menu */
const menuBtn = $('.menu-btn');
const nav = $('#nav');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  $('.menu-btn__label').textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  if (open) $('a', nav).focus();
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', e => { if (e.target.closest('a') && nav.classList.contains('is-open')) setMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
});
matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* Product finder */
const state = { q: '', area: 'All', all: false };
const LIMIT = 8;
const more = $('#finder-more');
more.addEventListener('click', () => { state.all = true; render(); });
const body = $('#finder-body');
const count = $('#finder-count');
const fq = $('#fq');

function render() {
  const q = state.q.trim().toLowerCase();
  const rows = MEDICINES.filter(m =>
    (state.area === 'All' || m.area === state.area) &&
    (!q || m.name.toLowerCase().includes(q) || m.area.toLowerCase().includes(q) || m.form.toLowerCase().includes(q))
  );
  const shown = state.all ? rows : rows.slice(0, LIMIT);
  more.hidden = shown.length === rows.length;
  more.textContent = `Show all ${rows.length} results`;
  body.innerHTML = rows.length
    ? shown.map(m => `<tr>
        <td>${esc(m.name)}</td>
        <td><span class="tag">${esc(m.area)}</span></td>
        <td>${esc(m.form)}</td>
        <td><a class="textlink" href="#" aria-label="Prescribing leaflet for ${esc(m.name)}">Leaflet <span class="arr" aria-hidden="true">→</span></a></td>
      </tr>`).join('')
    : `<tr class="finder__empty"><td colspan="4">No match in this sample. Try another name, or call +88 02 222243097.</td></tr>`;
  const where = state.area === 'All' ? '' : ` in ${state.area}`;
  count.textContent = `${rows.length} ${rows.length === 1 ? 'medicine' : 'medicines'}${where}${q ? ` for “${state.q.trim()}”` : ''}`;
}

function setArea(area) {
  state.area = area;
  state.all = false;
  $$('[data-area]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.area === area)));
  render();
}

$$('[data-area]').forEach(b => b.addEventListener('click', () => setArea(b.dataset.area)));
fq.addEventListener('input', () => { state.q = fq.value; state.all = false; render(); });

// Hero quick search hands off to the finder
const quick = $('[data-quick-search]');
quick.addEventListener('submit', e => {
  e.preventDefault();
  state.q = fq.value = $('#qs').value;
  setArea('All');
  $('#medicines').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  fq.focus({ preventScroll: true });
});
$$('[data-fill]', quick).forEach(b => b.addEventListener('click', () => {
  $('#qs').value = b.dataset.fill;
  quick.requestSubmit();
}));

// "See our insulin range" pre-filters the finder
$$('[data-filter-class]').forEach(a => a.addEventListener('click', () => {
  state.q = fq.value = '';
  setArea(a.dataset.filterClass);
}));

render();

// Medicine suggestions for the side effect form
$('#med-list').innerHTML = MEDICINES.map(m => `<option value="${esc(m.name)}"></option>`).join('');

/* Side effect form: inline validation, clear errors, focus the first problem */
const form = $('#report-form');
const required = [
  ['#r-med', '#r-med-err'],
  ['#r-what', '#r-what-err'],
  ['#r-contact', '#r-contact-err']
];
form.addEventListener('submit', e => {
  e.preventDefault();
  let first = null;
  required.forEach(([f, err]) => {
    const field = $(f);
    const bad = !field.value.trim();
    field.setAttribute('aria-invalid', String(bad));
    $(err).hidden = !bad;
    if (bad && !first) first = field;
  });
  if (first) { first.focus(); return; }
  const ref = 'PV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000);
  const done = $('#report-done');
  done.innerHTML = `<strong>Thank you. Your report is in.</strong><br>Reference ${ref}. Our pharmacovigilance team will contact you if they need more detail. (Design preview: nothing was sent.)`;
  done.hidden = false;
  done.focus();
  form.reset();
  required.forEach(([f]) => $(f).removeAttribute('aria-invalid'));
});
required.forEach(([f, err]) => $(f).addEventListener('input', e => {
  if (e.target.value.trim()) { e.target.setAttribute('aria-invalid', 'false'); $(err).hidden = true; }
}));

/* Dealt moments (tasteskill). Ported from the kit's word-highlight and picture-develops (film)
   into plain script, so the page also runs when opened straight from disk. Both rest under reduced motion. */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. word-highlight: the story statement turns from grey to white, word by word, scrubbed to the scroll
(function wordHighlight() {
  const el = $('[data-moment="word-highlight"]');
  if (!el || reducedMotion) return;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span');
          w.className = 'mo-w';
          w.textContent = part;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  el.classList.add('mo-wh');
  const words = $$('.mo-w', el);
  let last = -1, ticking = false;
  const update = () => {
    ticking = false;
    const r = el.getBoundingClientRect(), vh = innerHeight;
    const start = vh * 0.85, end = vh * 0.45;
    const t = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, (start - end) + r.height)));
    const k = Math.round(t * words.length);
    if (k === last) return;
    last = k;
    words.forEach((w, i) => w.classList.toggle('is-on', i < k));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();

// 2. picture-develops (film): the factory photo comes up like a print in the tray, once
(function pictureDevelops() {
  const fig = $('[data-moment="picture-develops"]');
  const img = fig && $('img', fig);
  if (!img || reducedMotion || !img.animate || !('IntersectionObserver' in window)) return;
  const from = { filter: 'grayscale(1) contrast(.55) brightness(1.32)', transform: 'scale(1.06)' };
  img.style.filter = from.filter;
  img.style.transform = from.transform;
  const run = () => {
    const a = img.animate([
      from,
      { filter: 'grayscale(.8) contrast(.82) brightness(1.14)', offset: 0.3 },
      { filter: 'grayscale(.35) contrast(.95) brightness(1.04)', offset: 0.62 },
      { filter: 'grayscale(0) contrast(1) brightness(1)', transform: 'none' }
    ], { duration: 1600, easing: 'cubic-bezier(.3,.2,.3,1)', fill: 'both' });
    a.finished.then(() => { img.style.filter = ''; img.style.transform = ''; a.cancel(); });
  };
  const io = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting)) { io.disconnect(); run(); }
  }, { threshold: 0.25 });
  io.observe(fig);
})();
