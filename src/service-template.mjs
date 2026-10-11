// Renders one service page from src/data/services.mjs.
import { services, PRICE_ANSWER } from './data/services.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Small illustrations. Generic, clearly not client work.
const mocks = {
  report: `<div class="doc" role="img" aria-label="Illustration of the contents of a diagnosis">
    <div class="doc-head"><b>Diagnosis</b><em>Sample</em></div>
    <div class="doc-row"><span>About your business</span><i></i></div>
    <div class="doc-row hl"><span>What we found</span><em>with evidence</em></div>
    <div class="doc-row"><span>How you compare</span><em>side by side</em></div>
    <div class="doc-row"><span>What we recommend</span><em>quick wins first</em></div>
    <div class="doc-row"><span>Who does what</span><i></i></div>
    <div class="doc-row"><span>Next step</span><i></i></div></div>`,
  menu: `<div class="phone" role="img" aria-label="Illustration of a café menu on a phone">
    <div class="top"><i>M</i>Menu · open now</div>
    <div class="doc-row"><span>Flat white</span><em>Order</em></div>
    <div class="doc-row"><span>Cardamom latte</span><em>Order</em></div>
    <div class="doc-row"><span>Za'atar croissant</span><em>Order</em></div>
    <div class="bub note">Order sent on WhatsApp</div></div>`,
  chat: `<div class="phone" role="img" aria-label="Illustration of a WhatsApp booking conversation">
    <div class="top"><i>A</i>Your business</div>
    <div class="bub in">Hi, do you have a table for four tonight at 8?</div>
    <div class="bub out">Yes, a table for four at 8:00 or 8:30. Which would you like?</div>
    <div class="bub in">8:30 please</div>
    <div class="bub out">Booked for 8:30. See you tonight.</div>
    <div class="bub note">A person can take over at any time.</div></div>`,
  pipeline: `<div class="pipe" role="img" aria-label="Illustration of a sales pipeline in a CRM">
    <div><b>New</b><span class="card-mini">Website enquiry</span><span class="card-mini">WhatsApp lead</span></div>
    <div><b>Talking</b><span class="card-mini">Quote sent<small>Reminder: Thursday</small></span></div>
    <div><b>Won</b><span class="card-mini">Order confirmed</span></div></div>`,
  workspace: `<div class="doc" role="img" aria-label="Illustration of shared drives and permissions">
    <div class="doc-head"><b>Shared drives</b><em>yourbusiness.com</em></div>
    <div class="doc-row"><span>Sales</span><em>Sales team</em></div>
    <div class="doc-row"><span>Finance</span><em>Owners only</em></div>
    <div class="doc-row"><span>Marketing</span><em>Everyone</em></div>
    <div class="doc-row hl"><span>AI rules</span><em>No customer data in public tools</em></div></div>`,
  browser: `<div class="browser" role="img" aria-label="Illustration of a business website">
    <div class="bar"><i></i><i></i><i></i><span>yourbusiness.com</span></div>
    <div class="page-mock"><b>Fresh bread, every morning.</b><span class="line"></span><span class="line short"></span><span class="pill">Book a table</span></div></div>`,
  receipt: `<div class="doc" role="img" aria-label="Illustration of a daily sales report from a POS">
    <div class="doc-head"><b>Today's sales</b><em>Report</em></div>
    <div class="doc-row"><span>Best seller</span><em>Flat white</em></div>
    <div class="doc-row"><span>Busiest hour</span><em>8–9 am</em></div>
    <div class="doc-row hl"><span>Running low</span><em>Oat milk</em></div>
    <div class="doc-row"><span>Card and cash</span><em>Split shown</em></div></div>`,
  care: `<div class="doc" role="img" aria-label="Illustration of a monthly care note">
    <div class="doc-head"><b>Monthly care note</b><em>This month</em></div>
    <div class="doc-row"><span>Backups checked</span><em>Done</em></div>
    <div class="doc-row"><span>Security updates</span><em>Done</em></div>
    <div class="doc-row"><span>Opening hours changed</span><em>Done</em></div>
    <div class="doc-row hl"><span>Worth fixing next</span><em>Slow menu images</em></div></div>`,
  spec: `<div class="doc" role="img" aria-label="Illustration of a written project scope">
    <div class="doc-head"><b>Written scope</b><em>Before work starts</em></div>
    <div class="doc-row"><span>What we build</span><i></i></div>
    <div class="doc-row"><span>What we leave out, and why</span><i></i></div>
    <div class="doc-row"><span>Stages and check-ins</span><i></i></div>
    <div class="doc-row hl"><span>Quote</span><em>In writing</em></div></div>`,
};

export function renderService(s) {
  const bySlug = Object.fromEntries(services.map((x) => [x.slug, x]));
  const faq = [['How much does it cost?', PRICE_ANSWER], ...s.faq];
  const content = `
<section class="page-head" aria-labelledby="page-title">
  <div class="wrap">
    <p class="crumbs"><a href="/">Home</a> / <a href="/services/">What we do</a> / ${esc(s.name)}</p>
    <p class="kicker">${esc(s.group)} · ${esc(s.name)}</p>
    <h1 id="page-title">${esc(s.title)}</h1>
    <p class="lede">${esc(s.sub)}</p>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="stack">
      <p class="kicker">What it is</p>
      <h2>${esc(s.name)}</h2>
      <p class="lede">${esc(s.what)}</p>
    </div>
    <div class="stack">
      <p class="kicker">You might recognise this</p>
      <ul class="check-list">
        ${s.signs.map((x) => `<li>${esc(x)}</li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<section class="section bg-paper">
  <div class="wrap split">
    <div class="stack">
      <p class="kicker">What's included</p>
      <h2>What we set up for you.</h2>
      <p class="muted">The exact scope is agreed with you in writing before work starts.</p>
      <div class="mock rv">${mocks[s.mock]}</div>
    </div>
    <ol class="numbered">
      ${s.get.map((x) => `<li>${esc(x)}</li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head single"><div><p class="kicker">How it works</p><h2>Research first, then the work.</h2></div></div>
    <ol class="steps">
      ${s.steps.map(([t, p], i) => `<li class="rv"><span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(p)}</p><span></span></li>`).join('\n      ')}
    </ol>
    <div class="note-box" style="margin-top:2rem"><b>Your data.</b> ${esc(s.data)}</div>
  </div>
</section>

<section class="section bg-paper">
  <div class="wrap split">
    <div class="stack">
      <p class="kicker">Questions</p>
      <h2>Straight answers.</h2>
      <p class="muted">Works with: ${s.tools.map(esc).join(' · ')}. These are tools we set up, not partnerships.</p>
    </div>
    <div class="faq">
      ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div><p>${esc(a)}</p></div></details>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="head single"><div><p class="kicker">Related</p><h2>Often set up together.</h2></div></div>
    <div class="cards two">
      ${s.related.map((r) => bySlug[r]).map((r) => `<a class="card" href="/services/${r.slug}/"><span class="kicker">${esc(r.group)}</span><h3>${esc(r.name)}</h3><p>${esc(r.title)}</p></a>`).join('\n      ')}
    </div>
  </div>
</section>

{{> invite}}`;

  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.description, serviceType: s.name,
      provider: { '@type': 'Organization', name: 'Arzware', url: 'https://arzware.net' },
      areaServed: ['AE', 'SA', 'LB'], url: `https://arzware.net/services/${s.slug}/` },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  return { meta: { title: `${s.name} · Arzware`, description: s.description, nav: 'services' }, content, jsonld };
}

export { services };
