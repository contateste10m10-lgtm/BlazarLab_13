'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const listeners = new Map();
const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    const classes = new Set();
    elements.set(id, {
      id, textContent: '', innerHTML: '', dataset: {}, attrs: {},
      classList: { toggle(name, force) { if (force === undefined ? !classes.has(name) : force) classes.add(name); else classes.delete(name); return classes.has(name); }, add(name) { classes.add(name); }, remove(name) { classes.delete(name); }, contains(name) { return classes.has(name); } },
      addEventListener(event, fn) { const key = `${id}:${event}`; if (!listeners.has(key)) listeners.set(key, []); listeners.get(key).push(fn); },
      setAttribute(name, value) { this.attrs[name] = String(value); },
      getAttribute(name) { return this.attrs[name] || null; }
    });
  }
  return elements.get(id);
}
const scenarioButtons = ['smooth', 'flares', 'multiscale'].map(key => Object.assign(element(`scenario-${key}`), { dataset: { scenario: key } }));
const jumpLinks = ['smooth', 'flares', 'multiscale'].map(key => Object.assign(element(`jump-${key}`), { dataset: { jumpScenario: key } }));
const nav = Object.assign(element('siteNav'), { querySelectorAll: () => [] });
const doc = {
  readyState: 'complete',
  documentElement: Object.assign(element('html'), { classList: element('html').classList }),
  getElementById: element,
  querySelectorAll(selector) {
    if (selector === '[data-scenario]') return scenarioButtons;
    if (selector === '[data-jump-scenario]') return jumpLinks;
    return [];
  },
  addEventListener() {}
};
const context = {
  document: doc,
  window: { matchMedia: () => ({ matches: false }) },
  history: { replaceState() {} },
  console,
  Number, Math, Map, Set, Object, Array, String, Boolean, Date,
  Intl, JSON,
};
const source = fs.readFileSync(path.join(__dirname, '..', 'blazarlab.js'), 'utf8');
vm.runInNewContext(source, context, { filename: 'blazarlab.js', timeout: 10000 });

for (const id of ['scenarioStatus', 'scenarioDescription', 'lightcurvePlot', 'sampenPlot', 'fisherPlot', 'msePlot', 'sampenValue', 'sampenCounts', 'shannonValue', 'fisherValue', 'ciValue', 'scaleValues']) {
  assert.ok(element(id).innerHTML || element(id).textContent, `${id} deve ser preenchido na inicialização`);
}
assert.match(element('lightcurvePlot').innerHTML, /<path/);
assert.match(element('msePlot').innerHTML, /<path/);
assert.ok((element('msePlot').innerHTML.match(/<path/g) || []).length >= 1, 'MSE-WPE deve mostrar a curva efetivamente calculada sem perfis interpolados.');
assert.doesNotMatch(element('msePlot').innerHTML, /stroke-dasharray=\"7 5\"/, 'a curva introdutória não deve sugerir perfis interpolados.');
for (const id of ['multibandCurvePlot','sampenBandMeanPlot','sampenClassDistPlot','sampenModPlot','sampenRobustPlot','sampenSensitivityPlot','fisherPopulationPlot','fisherMetricPlot','mseBandScalePlot','ciBandMeanPlot','ciClassDistPlot','ciMetricPlot','ciSampEnPlot']) {
  assert.ok(element(id).innerHTML, `${id} deve ser calculado na inicialização`);
}
assert.match(element('bandToggleLegend').innerHTML, /data-band-toggle=\"7\"/, 'a galeria deve incluir as oito bandas energéticas.');
assert.ok(element('ciSampEnPlot').innerHTML.length > 500, 'CI × SampEn deve mostrar o gráfico demonstrativo.');
assert.match(element('fisherBandFilter').innerHTML, /Todas as bandas/, 'o plano Fisher-Shannon deve oferecer filtro de banda.');
assert.match(element('sampenSensitivityPlot').innerHTML, /SampEn=/, 'o mapa m×r deve expor valores calculados via tooltips.');
assert.match(element('scaleValues').innerHTML, /τ = 8/);
const initial = element('sampenValue').textContent;
const flareClick = listeners.get('scenario-flares:click');
assert.ok(flareClick && flareClick.length, 'seletor de cenário deve ter callback');
flareClick[0]();
assert.match(element('scenarioStatus').textContent, /SURTOS LOCALIZADOS/);
assert.notEqual(element('sampenValue').textContent, initial, 'trocar cenário deve recalcular a SampEn demonstrativa');
const multiClick = listeners.get('scenario-multiscale:click');
assert.ok(multiClick && multiClick.length);
multiClick[0]();
assert.match(element('scenarioStatus').textContent, /ESTRUTURA MULTIESCALA/);
assert.equal(element('scaleValues').innerHTML.match(/class="scale-pill"/g)?.length, 8, 'devem ser apresentadas oito escalas');
console.log('OK: inicialização, três métodos, galeria de oito bandas, mapa m×r, métricas sintéticas e troca interativa de cenários.');
console.log(`SampEn inicial: ${initial}; cenário C: ${element('sampenValue').textContent}; CI cenário C: ${element('ciValue').textContent}.`);
