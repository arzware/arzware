// Hero cards for inner pages (Nebius-style): a rounded card with either a drifting colour mesh
// or a pale ground with a frosted-glass illustration. Colours come only from the hero palette.
// build.mjs turns <section class="page-hero" data-hero="VARIANT" data-art="MOTIF"> into the card.

const C = { saffron: '#ffb23f', coral: '#ff6f5b', violet: '#6d5dfc', ink: '#0f2427', mist: '#eaf1f0' };

// Tint per motif: [plate colour, glass tint]
const TINT = {
  violet: [C.violet, '#b9b2ff'],
  coral: [C.coral, '#ffc2b8'],
  saffron: [C.saffron, '#ffd99a'],
};

// Motifs drawn inside a 480 x 420 box. Strokes are rendered as glass tubes.
const MOTIFS = {
  stack: '<rect x="150" y="70" width="230" height="150" rx="26"/><rect x="120" y="140" width="230" height="150" rx="26"/><rect x="90" y="210" width="230" height="150" rx="26"/>',
  path: '<path d="M60 300 C130 160 190 380 250 230 S370 110 430 170"/><circle cx="60" cy="300" r="20"/><circle cx="150" cy="250" r="20"/><circle cx="250" cy="230" r="20"/><circle cx="340" cy="150" r="20"/><circle cx="430" cy="170" r="20"/>',
  mark: '<path d="M120 360 L240 70 L360 360"/><path d="M160 260 C190 228 214 292 240 260 C266 228 290 292 320 260"/>',
  pulse: '<path d="M40 230 H150 L180 150 L220 320 L255 190 L280 230 H440"/><path d="M380 80 V150 M345 115 H415"/>',
  chat: '<rect x="80" y="80" width="240" height="140" rx="40"/><path d="M130 220 L110 270 L180 220"/><rect x="190" y="220" width="220" height="120" rx="40"/><path d="M350 340 L380 380 L330 340"/>',
  lock: '<rect x="130" y="190" width="220" height="170" rx="30"/><path d="M180 190 V140 a60 60 0 0 1 120 0 V190"/><circle cx="240" cy="265" r="18"/><path d="M240 283 V315"/>',
  doc: '<path d="M140 60 H290 L350 120 V360 H140 Z"/><path d="M290 60 V120 H350"/><path d="M180 180 H310 M180 230 H310 M180 280 H260"/>',
  lens: '<circle cx="210" cy="190" r="110"/><path d="M290 270 L390 370"/><path d="M150 190 C170 165 190 215 210 190 C230 165 250 215 270 190"/>',
  cup: '<path d="M120 190 H320 V280 a80 80 0 0 1 -80 80 H200 a80 80 0 0 1 -80 -80 Z"/><path d="M320 210 h30 a40 40 0 0 1 0 80 h-30"/><path d="M170 150 c-20 -30 20 -50 0 -90 M230 150 c-20 -30 20 -50 0 -90 M290 150 c-20 -30 20 -50 0 -90"/>',
  bubbles: '<rect x="60" y="70" width="230" height="90" rx="45"/><rect x="190" y="180" width="230" height="90" rx="45"/><rect x="60" y="290" width="190" height="80" rx="40"/><circle cx="130" cy="330" r="8"/><circle cx="160" cy="330" r="8"/><circle cx="190" cy="330" r="8"/>',
  pipeline: '<rect x="60" y="70" width="110" height="290" rx="22"/><rect x="185" y="70" width="110" height="290" rx="22"/><rect x="310" y="70" width="110" height="290" rx="22"/><path d="M85 120 H145 M85 170 H145 M210 120 H270 M335 120 H395"/>',
  folders: '<rect x="90" y="70" width="140" height="130" rx="26"/><rect x="250" y="70" width="140" height="130" rx="26"/><rect x="90" y="220" width="140" height="130" rx="26"/><rect x="250" y="220" width="140" height="130" rx="26"/>',
  browser: '<rect x="60" y="70" width="360" height="280" rx="28"/><path d="M60 130 H420"/><circle cx="100" cy="100" r="8"/><circle cx="130" cy="100" r="8"/><path d="M110 200 H300 M110 250 H250"/><rect x="110" y="285" width="110" height="34" rx="17"/>',
  receipt: '<path d="M150 60 H330 V360 L300 340 L270 360 L240 340 L210 360 L180 340 L150 360 Z"/><path d="M190 120 H290 M190 170 H290 M190 220 H260 M190 280 H290"/>',
  shield: '<path d="M240 60 L370 110 V210 C370 290 310 340 240 370 C170 340 110 290 110 210 V110 Z"/><path d="M180 215 L225 260 L305 175"/>',
  phone: '<rect x="160" y="50" width="160" height="320" rx="34"/><path d="M215 80 H265"/><rect x="190" y="120" width="40" height="40" rx="10"/><rect x="250" y="120" width="40" height="40" rx="10"/><rect x="190" y="180" width="40" height="40" rx="10"/><rect x="250" y="180" width="40" height="40" rx="10"/>',
  compass: '<circle cx="240" cy="210" r="140"/><path d="M240 110 L275 210 L240 310 L205 210 Z"/><circle cx="240" cy="210" r="14"/>',
};

export function glassArt(motif, tint = 'violet') {
  const [plate, glass] = TINT[tint] || TINT.violet;
  const id = `g-${motif}-${tint}`;
  const shapes = MOTIFS[motif] || MOTIFS.stack;
  return `<div class="ph-art" aria-hidden="true">
  <div class="ph-plate t-${tint}"></div>
  <svg class="ph-glass" viewBox="0 0 480 420" fill="none">
    <defs>
      <linearGradient id="${id}-f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="${glass}" stop-opacity=".55"/><stop offset="1" stop-color="${plate}" stop-opacity=".55"/></linearGradient>
      <pattern id="${id}-r" width="14" height="420" patternUnits="userSpaceOnUse"><rect width="7" height="420" fill="#fff" fill-opacity=".35"/></pattern>
      <linearGradient id="${id}-p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${glass}" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/></linearGradient>
    </defs>
    <rect x="40" y="30" width="400" height="360" rx="40" fill="url(#${id}-p)" stroke="#fff" stroke-opacity=".8" stroke-width="2"/>
    <rect x="40" y="30" width="400" height="360" rx="40" fill="url(#${id}-r)"/>
    <g class="ph-motif" stroke="url(#${id}-f)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">${shapes}</g>
    <g class="ph-motif" stroke="#fff" stroke-opacity=".9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(-4 -4)">${shapes}</g>
  </svg>
</div>`;
}

export function mesh(variant) {
  return `<div class="ph-mesh ${variant}" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;
}

// Wrap a page hero's inner HTML in the card.
export function heroCard(attrs, inner) {
  const v = (attrs.match(/data-hero="([^"]+)"/) || [])[1] || 'pale';
  const art = (attrs.match(/data-art="([^"]+)"/) || [])[1];
  const tint = (attrs.match(/data-tint="([^"]+)"/) || [])[1] || 'violet';
  const isMesh = v.startsWith('mesh');
  return `<section class="page-hero ph"><div class="ph-frame"><div class="ph-card ph-${v}${art ? ' has-art' : ''}">${isMesh ? mesh(v) : ''}<div class="ph-text">${inner}</div>${art ? glassArt(art, tint) : ''}</div></div></section>`;
}
