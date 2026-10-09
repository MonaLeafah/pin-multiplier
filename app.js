'use strict';
const $ = id => document.getElementById(id);
let plan, selected = 0, previewUrl;
function setStatus(message) { $('status').textContent = message; }
function fillBrief(brief) {
  for (const key of ['title','url','audience','summary','start']) $('brief-form').elements[key].value = brief[key];
  $('source-points').value = brief.points.join('\n'); $('source-affiliate').checked = brief.affiliate;
}
function download(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], {type})), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000); setStatus(name + ' downloaded.');
}
function drawPreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  const pin = plan.pins[selected]; previewUrl = URL.createObjectURL(new Blob([PinPlanner.svg(pin)], {type:'image/svg+xml'}));
  $('pin-preview').src = previewUrl; $('pin-preview').alt = pin.alt;
}
function refreshState() {
  $('review-count').textContent = plan.pins.filter(p => p.state === 'Reviewed').length + ' of 7 reviewed';
  document.querySelectorAll('.pin-choice').forEach((button, i) => { button.setAttribute('aria-pressed', String(i === selected)); button.querySelector('.pin-state').textContent = plan.pins[i].state; });
}
function selectPin(i) {
  selected = i; const pin = plan.pins[i];
  $('selected-angle').textContent = 'PIN 0' + pin.id + ' / ' + pin.angle.toUpperCase();
  $('pin-headline').value = pin.headline; $('pin-description').value = pin.description; $('pin-alt').value = pin.alt;
  $('pin-reviewed').checked = pin.state === 'Reviewed';
  $('disclosure-fields').hidden = !plan.brief.affiliate;
  $('pin-disclosure-copy').value = pin.disclosure.startsWith('Disclosure needed:') ? '' : pin.disclosure;
  refreshState(); drawPreview();
}
function render() {
  const list = $('pin-list'); list.replaceChildren();
  plan.pins.forEach((pin, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'pin-choice';
    button.setAttribute('aria-label', 'Pin ' + pin.id + ': ' + pin.angle);
    const number = document.createElement('span'); number.className = 'pin-number'; number.textContent = '0' + pin.id;
    const label = document.createElement('span'); label.textContent = pin.angle;
    const state = document.createElement('span'); state.className = 'pin-state'; state.textContent = pin.state;
    button.append(number, label, state); button.addEventListener('click', () => selectPin(i)); list.append(button);
  });
  const dates = $('schedule-list'); dates.replaceChildren();
  plan.pins.forEach(pin => {
    const row = document.createElement('div'); row.className = 'date-row';
    const label = document.createElement('label'); label.htmlFor = 'date-' + pin.id; label.textContent = '0' + pin.id + ' / ' + pin.angle;
    const input = document.createElement('input'); input.type = 'date'; input.id = label.htmlFor; input.value = pin.plannedDate;
    input.addEventListener('change', () => { try { PinPlanner.addDays(input.value, 0); pin.plannedDate = input.value; input.setCustomValidity(''); setStatus('Plan date updated.'); } catch(e) { input.setCustomValidity(e.message); input.reportValidity(); input.value = pin.plannedDate; input.setCustomValidity(''); } });
    row.append(label, input); dates.append(row);
  }); selectPin(0);
}
function build(input) { try { const next = PinPlanner.generate(input); plan = next; render(); $('source-error').textContent = ''; setStatus('Seven drafts created. Review each before publishing.'); } catch(e) { $('source-error').textContent = e.message; } }
$('brief-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; build(Object.fromEntries([...new FormData(form), ['affiliate', form.elements.affiliate.checked]])); });
$('load-sample').addEventListener('click', () => { fillBrief(PinPlanner.sample); build(PinPlanner.sample); });
for (const [field, key] of [['pin-headline','headline'],['pin-description','description'],['pin-alt','alt'],['pin-disclosure-copy','disclosure']]) {
  $(field).addEventListener('input', () => { plan.pins[selected][key] = $(field).value; plan.pins[selected].state = 'Draft'; $('pin-reviewed').checked = false; refreshState(); drawPreview(); });
}
$('pin-reviewed').addEventListener('change', () => {
  const pin = plan.pins[selected];
  if ($('pin-reviewed').checked && (!pin.headline.trim() || !pin.description.trim() || !pin.alt.trim() || (plan.brief.affiliate && (!pin.disclosure.trim() || pin.disclosure.startsWith('Disclosure needed:'))))) {
    $('pin-reviewed').checked = false; setStatus('Complete the copy and alt text, and add a reviewed relationship disclosure to the description before marking this pin reviewed.'); return;
  }
  pin.state = $('pin-reviewed').checked ? 'Reviewed' : 'Draft'; refreshState();
});
$('download-svg').addEventListener('click', () => download(PinPlanner.svg(plan.pins[selected]), 'image/svg+xml', 'pin-0' + (selected + 1) + '.svg'));
$('download-png').addEventListener('click', async () => {
  const button = $('download-png'); button.disabled = true; $('export-error').textContent = '';
  try {
    const src = URL.createObjectURL(new Blob([PinPlanner.svg(plan.pins[selected])], {type:'image/svg+xml'}));
    try {
      const image = new Image(); image.src = src; await image.decode(); const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1500;
      canvas.getContext('2d').drawImage(image, 0, 0); const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export was unavailable. Use the SVG export instead.');
      download(blob, 'image/png', 'pin-0' + (selected + 1) + '.png');
    } finally { URL.revokeObjectURL(src); }
  } catch(e) { $('export-error').textContent = e.message; } finally { button.disabled = false; }
});
$('download-csv').addEventListener('click', () => download(PinPlanner.csv(plan), 'text/csv;charset=utf-8', 'pin-multiplier-plan.csv'));
$('download-json').addEventListener('click', () => download(JSON.stringify(plan, null, 2), 'application/json', 'pin-multiplier-plan.json'));
function restorePlan(text) {
  if (text.length > 100000) throw new Error('Choose a plan smaller than 100 KB.');
  const restored = PinPlanner.importPlan(JSON.parse(text)); plan = restored; fillBrief(plan.brief); render(); setStatus('Plan reopened. All pins are drafts so you can review them again.');
}
$('restore-plan').addEventListener('click', () => { try { restorePlan($('restore-json').value); } catch(e) { setStatus('Could not reopen the plan: ' + e.message); } });
$('import-json').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 100000) throw new Error('Choose a plan smaller than 100 KB.');
    restorePlan(await file.text());
  } catch(e) { setStatus('Could not reopen the plan: ' + e.message); } finally { event.target.value = ''; }
});
fillBrief(PinPlanner.sample); build(PinPlanner.sample);
