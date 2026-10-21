// Inner-page heroes: plain editorial headers on the page colour, with no illustration, gradient or card.
// build.mjs turns <section class="page-hero" ...> into this; data-hero / data-art / data-tint attributes are ignored.
export function heroCard(attrs, inner) {
  return `<section class="page-hero"><div class="wrap">${inner}</div></section>`;
}
