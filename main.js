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
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header shadow + back-to-top button */
const header = $('.site-header');
const toTop = $('.to-top');
const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
  toTop.classList.toggle('show', window.scrollY > 900);
};
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

/* Product finder: cards */
const ICONS = {
  'Hormone and insulin': '<rect x="9" y="2" width="6" height="4" rx="1" fill="currentColor"/><rect x="7" y="6" width="10" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="12" width="10" height="9" rx="3" fill="currentColor" opacity=".4"/>',
  'Infusion': '<path d="M8 3h8v9a4 4 0 0 1-8 0z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 9h8" stroke="currentColor" stroke-width="2"/>',
  'Ophthalmics': '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  'Cardiac': '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  default: '<g transform="rotate(-35 12 12)"><rect x="2" y="8" width="20" height="8" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 8h6v8H6a4 4 0 0 1 0-8z" fill="currentColor"/></g>'
};
const icon = area => `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">${ICONS[area] || ICONS.default}</svg>`;

const state = { q: '', area: 'All', all: false };
const LIMIT = 8;
const more = $('#finder-more');
const list = $('#finder-body');
const count = $('#finder-count');
const fq = $('#fq');
more.addEventListener('click', () => { state.all = true; render(); });

function render() {
  const q = state.q.trim().toLowerCase();
  const rows = MEDICINES.filter(m =>
    (state.area === 'All' || m.area === state.area) &&
    (!q || m.name.toLowerCase().includes(q) || m.area.toLowerCase().includes(q) || m.form.toLowerCase().includes(q))
  );
  const shown = state.all ? rows : rows.slice(0, LIMIT);
  more.hidden = shown.length === rows.length;
  more.textContent = `Show all ${rows.length} results`;
  list.innerHTML = rows.length
    ? shown.map((m, i) => `<li class="med" style="animation-delay:${Math.min(i, 8) * 40}ms">
        <div class="med__top"><span class="med__icon">${icon(m.area)}</span><span class="tag">${esc(m.area)}</span></div>
        <h3>${esc(m.name)}</h3>
        <p class="med__form">${esc(m.form)}</p>
        <a class="textlink" href="#" aria-label="Prescribing leaflet for ${esc(m.name)}">Prescribing leaflet <span class="arr" aria-hidden="true">→</span></a>
      </li>`).join('')
    : `<li class="med__empty">No match in this sample. Try another name, or call <a href="tel:+8802222243097">+88 02 222243097</a>.</li>`;
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

// Hero search hands off to the finder
const quick = $('[data-quick-search]');
quick.addEventListener('submit', e => {
  e.preventDefault();
  state.q = fq.value = $('#qs').value;
  setArea('All');
  $('#medicines').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
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

/* Marquee: duplicate the list once so the loop is seamless (copy hidden from screen readers) */
const track = $('.marquee__track');
if (track) {
  [...track.children].forEach(li => {
    const c = li.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    track.appendChild(c);
  });
}

/* Count-up numbers */
function countUp(el) {
  const end = +el.dataset.count;
  if (reduced) { el.textContent = end; return; }
  const t0 = performance.now(), dur = 1400;
  const step = t => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
}

/* Scroll reveal, once per element */
const revealEls = $$('.reveal, .reveal-img');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = Math.min(Math.max(sibs.indexOf(el), 0), 4) * 80 + 'ms';
      el.classList.add('in');
      $$('[data-count]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}
