const fs = require('node:fs'), path = require('node:path'), planner = require('./planner.js');
const target = path.join(__dirname, 'sample-export'), plan = planner.generate(planner.sample);
fs.mkdirSync(target, {recursive:true});
fs.writeFileSync(path.join(target,'plan.json'), JSON.stringify(plan,null,2)+'\n');
fs.writeFileSync(path.join(target,'plan.csv'), planner.csv(plan));
for (const pin of plan.pins) fs.writeFileSync(path.join(target,'pin-0'+pin.id+'.svg'),planner.svg(pin));
console.log('Wrote seven SVGs, the JSON plan, and CSV to sample-export/.');
