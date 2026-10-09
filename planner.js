(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PinPlanner = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const angles = ['The big idea', 'Start here', 'The checklist', 'A useful detail', 'One small action', 'The perspective', 'Save for later'];
  const offsets = [0, 2, 4, 7, 10, 14, 21];
  const sample = { title: 'Make room for a little creativity', url: 'https://example.com/creative-corner', audience: 'Creators working in small spaces', summary: 'A creative corner can begin with one useful surface and a few tools you love.', points: ['Choose one useful surface.', 'Keep the tools you reach for close by.', 'Leave a little space for work in progress.'], start: '2026-10-12', affiliate: false };
  function clean(value, limit) { return String(value ?? '').trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, limit); }
  function validateDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Choose a valid start date.');
    const date = new Date(value + 'T12:00:00Z');
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Choose a valid start date.');
    return date;
  }
  function addDays(value, n) { const date = validateDate(value); date.setUTCDate(date.getUTCDate() + n); return date.toISOString().slice(0, 10); }
  function validate(input) {
    const title = clean(input.title, 100), audience = clean(input.audience, 120), summary = clean(input.summary, 300);
    const points = (Array.isArray(input.points) ? input.points : String(input.points ?? '').split('\n')).map(x => clean(x, 160)).filter(Boolean).slice(0, 6);
    if (!title || !summary || points.length < 3) throw new Error('Add a title, a main idea, and at least three useful points.');
    let url;
    try { url = new URL(String(input.url).trim()); } catch { throw new Error('Use a full https:// or http:// article link.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Use an article link without a username or password.');
    const start = clean(input.start, 10); validateDate(start);
    return { title, audience, summary, points, url: url.href, start, affiliate: input.affiliate === true };
  }
  function generate(input) {
    const brief = validate(input), p = brief.points;
    const copy = [
      [brief.title, brief.summary],
      ['Start with one useful thing', p[0]],
      ['A little checklist to keep', p.slice(0, 3).join(' ')],
      ['One detail worth keeping', p[1]],
      ['Try one small change', p[2]],
      ['Make space for the main idea', brief.summary],
      ['Save this for your next idea', brief.title + '. ' + p[0]]
    ];
    return { version: 1, brief, pins: copy.map(([headline, description], i) => ({
      id: i + 1, angle: angles[i], headline: clean(headline,100), description: clean(description,350),
      alt: clean('Editorial text graphic reading “' + headline + '”. ' + clean(description,350),500),
      link: brief.url, audience: brief.audience, plannedDate: addDays(brief.start, offsets[i]),
      disclosure: brief.affiliate ? 'Disclosure needed: write and review your relationship disclosure before publishing.' : '',
      state: 'Draft'
    })) };
  }
  function xml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])); }
  function wrap(value, width) {
    const words = String(value).split(/\s+/).flatMap(w => Array.from(w).length > width ? (w.match(new RegExp('.{1,' + width + '}', 'gu')) || []) : [w]);
    const lines = []; let line = '';
    for (const word of words) { if (Array.from(line + ' ' + word).length > width && line) { lines.push(line); line = word; } else line = line ? line + ' ' + word : word; }
    if (line) lines.push(line); return lines;
  }
  function svg(pin) {
    const dark = pin.id % 3 === 1, bg = dark ? '#132e27' : '#f5efe3', ink = dark ? '#f5efe3' : '#142b25', accent = dark ? '#bdd5aa' : '#31694e';
    const title = wrap(clean(pin.headline, 100), 18), body = wrap(clean(pin.description, 350), 42);
    const titleStep = Math.min(100, 500 / title.length), bodyStep = Math.min(42, 360 / body.length);
    const heading = title.map((line, i) => '<tspan x="84" y="' + (295 + i * titleStep) + '">' + xml(line) + '</tspan>').join('');
    const text = body.map((line, i) => '<tspan x="84" y="' + (920 + i * bodyStep) + '">' + xml(line) + '</tspan>').join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500" role="img" aria-labelledby="title description"><title id="title">' + xml(pin.headline) + '</title><desc id="description">' + xml(pin.alt) + '</desc><rect width="1000" height="1500" fill="' + bg + '"/><path d="M84 175H916" stroke="' + accent + '" stroke-width="2"/><text x="84" y="117" font-family="Arial,sans-serif" font-size="24" letter-spacing="5" fill="' + ink + '">MONA’S MEDIA / FIELD NOTES</text><text x="84" y="225" font-family="Arial,sans-serif" font-size="24" letter-spacing="3" fill="' + accent + '">' + xml(pin.angle.toUpperCase()) + '</text><text font-family="Georgia,serif" font-size="' + Math.min(88, titleStep * .86) + '" fill="' + ink + '">' + heading + '</text><path d="M84 805Q500 665 916 805M84 836Q500 696 916 836" fill="none" stroke="' + accent + '" stroke-width="3"/><text font-family="Arial,sans-serif" font-size="' + Math.min(32, bodyStep * .8) + '" fill="' + ink + '">' + text + '</text><path d="M84 1340H916" stroke="' + accent + '" stroke-width="2"/><text x="84" y="1400" font-family="Arial,sans-serif" font-size="25" fill="' + ink + '">READ THE FULL NOTE</text><text x="916" y="1400" text-anchor="end" font-family="Georgia,serif" font-size="38" fill="' + ink + '">0' + pin.id + '</text></svg>';
  }
  function csvCell(value) {
    let s = String(value ?? '');
    if (/^[\s]*[=+\-@]/.test(s) || /^[\t\r\n]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function csv(plan) {
    const keys = ['id', 'angle', 'headline', 'description', 'alt', 'link', 'audience', 'plannedDate', 'disclosure', 'state'];
    return [keys.join(','), ...plan.pins.map(p => keys.map(k => csvCell(p[k])).join(','))].join('\r\n') + '\r\n';
  }
  function importPlan(input) {
    if (!input || input.version !== 1 || !Array.isArray(input.pins) || input.pins.length !== 7) throw new Error('Choose a version 1 Pin Multiplier plan with seven pins.');
    const base = generate(input.brief);
    base.pins = input.pins.map((pin, i) => {
      if (!pin || pin.id !== i + 1) throw new Error('The saved pin sequence is invalid.');
      const result = { ...base.pins[i], headline: clean(pin.headline,100), description: clean(pin.description,350), alt: clean(pin.alt,500), disclosure: clean(pin.disclosure,300), plannedDate: addDays(String(pin.plannedDate),0), state:'Draft' };
      if (!result.headline || !result.description || !result.alt) throw new Error('Every saved pin needs a headline, description, and alt text.');
      return result;
    }); return base;
  }
  return { sample, generate, validate, addDays, svg, csv, csvCell, xml, wrap, importPlan };
});
