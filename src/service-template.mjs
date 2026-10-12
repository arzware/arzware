// Renders one service page body from src/data/services.mjs.
import { services, PRICE_ANSWER } from './data/services.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const lock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

const mocks = {
  report: `<div class="doc" role="img" aria-label="Illustration of a diagnosis report">
    <div class="doc-head"><b>Diagnosis report</b><span class="sample-tag">Sample</span></div>
    <div class="doc-row"><span>01 About your business</span><i></i></div>
    <div class="doc-row hl"><span>02 What we found</span><em>4 findings</em></div>
    <div class="doc-row"><span>03 How you compare</span><em>3 competitors</em></div>
    <div class="doc-row"><span>04 What we recommend</span><em>quick wins first</em></div>
    <div class="doc-row"><span>05 Who does what</span><i></i></div>
    <div class="doc-row"><span>06 Next step</span><i></i></div></div>`,
  menu: `<div class="phone" role="img" aria-label="Illustration of a café menu on a phone">
    <div class="top"><i>☕</i>Menu · open now</div>
    <div class="doc-row"><span>Flat white</span><em>Order</em></div>
    <div class="doc-row"><span>Cardamom latte</span><em>Order</em></div>
    <div class="doc-row"><span>Za'atar croissant</span><em>Order</em></div>
    <div class="bub note">Order sent on WhatsApp</div></div>`,
  chat: `<div class="phone" role="img" aria-label="Illustration of a WhatsApp booking conversation">
    <div class="top"><i>A</i>Your business</div>
    <div class="bub in">Hi, do you have a table for four tonight at 8?</div>
    <div class="bub out">Yes, we have a table for four at 8:00 or 8:30. Which would you like?</div>
    <div class="bub in">8:30 please</div>
    <div class="bub out">Booked for 8:30. See you tonight.</div>
    <div class="bub note">Need anything else? A person can take over any time.</div></div>`,
  pipeline: `<div class="pipe" role="img" aria-label="Illustration of a sales pipeline in a CRM">
    <div><b>New</b><span class="card">Enquiry from website</span><span class="card">WhatsApp lead</span></div>
    <div><b>Talking</b><span class="card">Quote sent<small>Reminder: Thursday</small></span></div>
    <div><b>Won</b><span class="card">Order confirmed</span></div></div>`,
  workspace: `<div class="doc" role="img" aria-label="Illustration of shared drives and permissions">
    <div class="doc-head"><b>Shared drives</b><em>you@yourbusiness.com</em></div>
    <div class="doc-row"><span>Sales</span><em>Sales team</em></div>
    <div class="doc-row"><span>Finance</span><em>Owners only</em></div>
    <div class="doc-row"><span>Marketing</span><em>Everyone</em></div>
    <div class="doc-row hl"><span>AI rules</span><em>No customer data in public tools</em></div></div>`,
  browser: `<div class="browser" role="img" aria-label="Illustration of a business website on a laptop and phone">
    <div class="bar"><i></i><i></i><i></i><span>yourbusiness.com</span></div>
    <div class="page"><b>Fresh bread, every morning.</b><span class="line"></span><span class="line short"></span><span class="pill">Book a table</span></div></div>`,
  receipt: `<div class="doc receipt" role="img" aria-label="Illustration of a sales report from a POS">
    <div class="doc-head"><b>Today's sales</b><em>Report</em></div>
    <div class="doc-row"><span>Best seller</span><em>Flat white</em></div>
    <div class="doc-row"><span>Busiest hour</span><em>8–9 am</em></div>
    <div class="doc-row hl"><span>Low stock</span><em>Oat milk</em></div>
    <div class="doc-row"><span>Card / cash</span><em>Split shown</em></div></div>`,
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
    <div class="doc-row"><span>Who owns the code</span><em>You</em></div>
    <div class="doc-row hl"><span>Fixed price</span><em>Agreed in writing</em></div></div>`,
};

export function renderService(s) {
  const bySlug = Object.fromEntries(services.map((x) => [x.slug, x]));
  const faq = [['How much does it cost?', PRICE_ANSWER], ...s.faq];
  const content = `
<section class="page-hero" data-hero="${s.hero[0]}" data-art="${s.hero[1]}" data-tint="${s.hero[2]}">
  <div class="wrap">
    <p class="label">${esc(s.name)}</p>
    <h1>${esc(s.title)}</h1>
    <p class="lead">${esc(s.sub)}</p>
    <a class="link-arrow down" href="#get">What you get</a>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="label">Is this for you?</p><h2>You might recognise this.</h2></div>
    <div class="signs">
      ${s.signs.map((x) => `<div class="sign rv">${check}<p>${esc(x)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section bg-warm" id="get">
  <div class="wrap split">
    <div class="stack">
      <p class="label">What you get</p>
      <h2>What we set up for you.</h2>
      <p class="muted">Every project starts with a written scope, so you know exactly what's included.</p>
    </div>
    <ol class="numbered">
      ${s.get.map((x) => `<li>${esc(x)}</li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><p class="label">How it works</p><h2>We look before we build.</h2></div>
    <ol class="steps">
      ${s.steps.map(([t, p]) => `<li class="rv"><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="section tight">
  <div class="wrap split">
    <div class="mock rv">${mocks[s.mock]}</div>
    <div class="stack">
      <p class="label">Your data</p>
      <h2>You stay in control.</h2>
      <div class="data-note">${lock}<p>${esc(s.data)}</p></div>
      <p class="label">What it works with</p>
      <div class="tools">${s.tools.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      <p class="micro">Tools we set up. Not a partnership or endorsement.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="stack"><p class="label">Questions</p><h2>What people usually ask.</h2></div>
    <div class="faq">
      ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div><p>${esc(a)}</p></div></details>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="section-head"><p class="label">Related</p><h2>Often set up together.</h2></div>
    <div class="related">
      ${s.related.map((r) => bySlug[r]).map((r) => `<a class="door" href="/services/${r.slug}/"><span class="label">${esc(r.group)}</span><span class="v">${esc(r.name)}</span><p>${esc(r.short)}</p></a>`).join('\n      ')}
    </div>
  </div>
</section>

{{> contact-band}}`;

  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.description, serviceType: s.name,
      provider: { '@type': 'Organization', name: 'Arzware', url: 'https://arzware.net' },
      areaServed: ['LB', 'AE', 'SA'], url: `https://arzware.net/services/${s.slug}/` },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  return { meta: { title: `${s.name} · Arzware`, description: s.description, nav: 'services' }, content, jsonld };
}

export { services };
