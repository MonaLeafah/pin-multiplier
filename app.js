'use strict';
const $ = id => document.getElementById(id);
let plan, selected = 0, previewUrl, overviewUrls = [], sourceDirty=false, previousPlan;
function setStatus(message) { $('status').textContent = message; }
function syncSourceState() {
  $('source-pending').hidden=!sourceDirty;
  for(const id of ['download-png','download-svg','download-csv','download-packet'])$(id).disabled=sourceDirty;
}
function rememberPlan() {if(plan){previousPlan=structuredClone(plan);$('undo-plan').hidden=false;}}
function fillBrief(brief) {
  for (const key of ['title','url','audience','summary','start']) $('brief-form').elements[key].value = brief[key];
  $('source-points').value = brief.points.join('\n'); $('source-affiliate').checked = brief.affiliate;
  sourceDirty=false;syncSourceState();
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
function refreshOverview() {
  overviewUrls.forEach(URL.revokeObjectURL); overviewUrls=[];
  const grid=$('set-overview');grid.replaceChildren();
  plan.pins.forEach((pin,i)=>{
    const button=document.createElement('button');button.type='button';button.className='overview-pin';button.setAttribute('aria-label','Edit pin '+pin.id+': '+pin.angle);
    const img=document.createElement('img'),label=document.createElement('span');
    const url=URL.createObjectURL(new Blob([PinPlanner.svg(pin)],{type:'image/svg+xml'}));overviewUrls.push(url);
    img.src=url;img.alt=pin.headline;label.textContent='0'+pin.id+' / '+pin.angle;
    button.append(img,label);button.addEventListener('click',()=>{selectPin(i);$('pin-headline').focus();});grid.append(button);
  });
}
function selectPin(i) {
  selected = i; $('export-error').textContent='';$('packet-error').textContent='';const pin = plan.pins[i];
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
  }); selectPin(0); refreshOverview();
}
function build(input) { try { const next = PinPlanner.generate(input); rememberPlan(); plan = next;sourceDirty=false;syncSourceState();render(); $('source-error').textContent = ''; setStatus('Seven drafts created. Review each before publishing.'); } catch(e) { $('source-error').textContent = e.message; } }
$('brief-form').addEventListener('input',()=>{sourceDirty=true;syncSourceState();});
$('brief-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; build(Object.fromEntries([...new FormData(form), ['affiliate', form.elements.affiliate.checked]])); });
$('load-sample').addEventListener('click', () => { fillBrief(PinPlanner.sample); build(PinPlanner.sample); });
$('undo-plan').addEventListener('click',()=>{if(!previousPlan)return;plan=previousPlan;previousPlan=undefined;fillBrief(plan.brief);render();$('undo-plan').hidden=true;setStatus('Previous plan restored with its edits and review states.');});
for (const [field, key] of [['pin-headline','headline'],['pin-description','description'],['pin-alt','alt'],['pin-disclosure-copy','disclosure']]) {
  $(field).addEventListener('input', () => { plan.pins[selected][key] = $(field).value; plan.pins[selected].state = 'Draft'; $('pin-reviewed').checked = false; refreshState(); drawPreview(); });
  $(field).addEventListener('change',refreshOverview);
}
$('pin-reviewed').addEventListener('change', () => {
  const pin = plan.pins[selected];
  if ($('pin-reviewed').checked && (!pin.headline.trim() || !pin.description.trim() || !pin.alt.trim() || (plan.brief.affiliate && (!pin.disclosure.trim() || pin.disclosure.startsWith('Disclosure needed:'))))) {
    $('pin-reviewed').checked = false; setStatus('Complete the copy and alt text, and add a reviewed relationship disclosure to the description before marking this pin reviewed.'); return;
  }
  pin.state = $('pin-reviewed').checked ? 'Reviewed' : 'Draft'; refreshState();
});
$('download-svg').addEventListener('click', () => {try{PinPlanner.assertExportable([plan.pins[selected]]);$('export-error').textContent='';download(PinPlanner.svg(plan.pins[selected]), 'image/svg+xml', 'pin-0' + (selected + 1) + '.svg');}catch(e){$('export-error').textContent=e.message;}});
async function pngBlob(pin) {
  const src=URL.createObjectURL(new Blob([PinPlanner.svg(pin)],{type:'image/svg+xml'}));
  try {
    const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1500;
    const context=canvas.getContext('2d');if(!context)throw new Error('PNG export is unavailable in this browser.');
    context.drawImage(image,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('PNG export was unavailable. Use the SVG export instead.');
    return blob;
  }finally{URL.revokeObjectURL(src);}
}
$('download-png').addEventListener('click', async () => {
  const button = $('download-png'); button.disabled = true; $('export-error').textContent = '';
  try {
    PinPlanner.assertExportable([plan.pins[selected]]);
    download(await pngBlob(plan.pins[selected]), 'image/png', 'pin-0' + (selected + 1) + '.png');
  } catch(e) { $('export-error').textContent = e.message; } finally { button.disabled = sourceDirty; }
});
const packetReadme='PIN MULTIPLIER / MONA’S MEDIA\n\nSeven draft graphics, editable SVG originals, spreadsheet copy, and a reopenable JSON plan. Review every pin before publishing. Draft and Reviewed states are preserved in plan.csv and plan.json. Planned dates do not publish or schedule anything.\n\n1. Review headlines, destination links, alt text, and any paid relationship disclosures.\n2. Use graphics/*.png for posting or graphics/*.svg for editing.\n3. Use plan.csv for copy and dates. Reopen plan.json in the workbench to continue.\n4. Record actual results in trial-results.csv. Blank cells mean unknown, never zero.\n5. Separate audience results from estimated time value; do not call correlation incremental revenue.\n\nThis is an original demo. The default creative-corner content and example.com destination are fictional. Mona’s Media branding identifies this demo; replace it for your own publication. No analytics, AI request, tracking pixels, or auto-publishing are included.\n\nhttps://monaleafah.github.io/pin-multiplier/\n';
$('download-packet').addEventListener('click',async()=>{
  const button=$('download-packet'),label=button.textContent;button.disabled=true;$('packet-error').textContent='';
  try {
    const snapshot=structuredClone(plan);PinPlanner.assertExportable(snapshot.pins);
    const files=[{name:'README.txt',content:packetReadme},{name:'plan.csv',content:PinPlanner.csv(snapshot)},{name:'plan.json',content:JSON.stringify(snapshot,null,2)},{name:'trial-results.csv',content:PinPlanner.trialCsv(snapshot)}];
    for(const pin of snapshot.pins){
      button.textContent='Preparing '+pin.id+' of 7…';setStatus('Preparing graphic '+pin.id+' of 7.');
      files.push({name:'graphics/pin-0'+pin.id+'.svg',content:PinPlanner.svg(pin)},{name:'graphics/pin-0'+pin.id+'.png',content:new Uint8Array(await (await pngBlob(pin)).arrayBuffer())});
    }
    download(PinPacket.zip(files),'application/zip','pin-multiplier-packet.zip');setStatus('Complete packet downloaded: seven PNGs, seven SVGs, the plan, and a blank results tracker.');
  } catch(e){$('packet-error').textContent=e.message;setStatus('Packet export needs attention. Your work is still here.');}finally{button.disabled=sourceDirty;button.textContent=label;}
});
$('overview-details').addEventListener('toggle',()=>{if($('overview-details').open)refreshOverview();});
$('download-csv').addEventListener('click', () => download(PinPlanner.csv(plan), 'text/csv;charset=utf-8', 'pin-multiplier-plan.csv'));
$('download-json').addEventListener('click', () => {download(JSON.stringify(plan, null, 2), 'application/json', 'pin-multiplier-plan.json');if(sourceDirty)setStatus('Saved the current built plan. Source changes have not been applied; build seven drafts to apply them.');});
function restorePlan(text) {
  if (text.length > 100000) throw new Error('Choose a plan smaller than 100 KB.');
  const restored = PinPlanner.importPlan(JSON.parse(text));rememberPlan();plan = restored; fillBrief(plan.brief); render(); setStatus('Plan reopened. All pins are drafts so you can review them again.');
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
