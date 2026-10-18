#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'blazarlab.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  assert.ok(start >= 0, `função ausente: ${signature}`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`função não balanceada: ${signature}`);
}
function makeClasses() {
  const values = new Set();
  return {
    add(value) { values.add(value); },
    remove(value) { values.delete(value); },
    contains(value) { return values.has(value); }
  };
}
function makeCard() {
  return { classList: makeClasses(), querySelector() { return null; } };
}
const listeners = new Map();
const status = { textContent: '' };
const cards = ['Sample Entropy', 'Fisher–Shannon', 'Multiscale Entropy'];
const buttons = [];
for (const method of cards) {
  for (const type of ['icon', 'diagram']) {
    const card = makeCard();
    const button = {
      dataset: { methodName: method },
      classList: makeClasses(),
      offsetWidth: 120,
      closest(selector) { return selector === '.method-card' ? card : null; },
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = String(value); },
      removeAttribute(name) { delete this.attributes[name]; },
      addEventListener(event, fn) {
        const key = `${method}:${type}:${event}`;
        if (!listeners.has(key)) listeners.set(key, []);
        listeners.get(key).push(fn);
      },
      card,
      method,
      type
    };
    buttons.push(button);
  }
}
const document = {
  querySelectorAll(selector) { return selector === '.method-visual-trigger' ? buttons : []; },
  getElementById(id) { return id === 'methodAnimationStatus' ? status : null; },
  documentElement: { classList: { contains() { return false; } } }
};
let timerId = 0;
const timers = new Map();
function setTimeoutMock(fn, delay) { timerId += 1; timers.set(timerId, { fn, delay }); return timerId; }
function clearTimeoutMock(id) { timers.delete(id); }
const simulationSource = extractFunction(js, 'function methodSimulationMarkup(method)');
const renderSimulation = new Function(`${simulationSource}; return methodSimulationMarkup;`)();
const sampenSimulation = renderSimulation('sampen');
const fisherSimulation = renderSimulation('fisher');
const mseSimulation = renderSimulation('mse');
assert.match(sampenSimulation, /role="region" aria-label="Demonstração didática de Sample Entropy"/);
assert.match(sampenSimulation, /m<sub>SE<\/sub>/, 'a demonstração deve diferenciar m_SE de m_int');
assert.match(sampenSimulation, /SampEn = −ln\(A\/B\)/);
assert.match(sampenSimulation, /A é um subconjunto de B/);
assert.match(fisherSimulation, /simulation-density/);
assert.match(fisherSimulation, /simulation-gradient/);
assert.match(fisherSimulation, /Shannon/);
assert.match(fisherSimulation, /Fisher/);
assert.match(mseSimulation, /simulation-scale-one/);
assert.match(mseSimulation, /simulation-scale-two/);
assert.match(mseSimulation, /simulation-scale-four/);
assert.match(mseSimulation, /WPE\(τ\) → curva multiescala → CI/);
const functionSource = extractFunction(js, 'function initMethodVisualAnimations()');
const init = new Function('document', 'setTimeout', 'clearTimeout', `${functionSource}; return initMethodVisualAnimations;`)(document, setTimeoutMock, clearTimeoutMock);
init();

assert.equal(buttons.length, 6, 'cada método precisa de um botão para ícone e um para o diagrama');
for (const button of buttons) {
  const callback = listeners.get(`${button.method}:${button.type}:click`);
  assert.ok(callback?.length, `acionamento por clique/toque ausente: ${button.method} (${button.type})`);
}
const first = buttons[0];
listeners.get(`${first.method}:${first.type}:click`)[0]();
assert.equal(first.classList.contains('is-playing'), true, 'acionamento precisa ativar a animação do botão');
assert.equal(first.card.classList.contains('is-animation-active'), true, 'acionamento precisa destacar o cartão certo');
assert.match(status.textContent, /Sample Entropy/, 'o acionamento deve ser anunciado sem depender apenas da animação');
const second = buttons[1];
listeners.get(`${second.method}:${second.type}:click`)[0]();
assert.equal(second.classList.contains('is-playing'), true, 'a segunda animação deve iniciar');
assert.equal(first.classList.contains('is-playing'), false, 'a animação anterior deve ser limpa ao selecionar outra');
for (const timer of timers.values()) timer.fn();
assert.equal(second.classList.contains('is-playing'), false, 'o estado ativo deve ser temporário e se limpar');
assert.equal(second.card.classList.contains('is-animation-active'), false, 'o destaque temporário deve ser removido');

for (const animation of ['method-icon-draw', 'method-line-draw', 'method-density-breathe', 'method-point-pop', 'method-marker-sweep', 'method-scale-rise', 'simulation-stage-reveal', 'simulation-density-reveal', 'simulation-gradient-reveal']) {
  assert.ok(css.includes(`@keyframes ${animation}`), `animação CSS ausente: ${animation}`);
}
assert.match(css, /prefers-reduced-motion:reduce[\s\S]*?\.method-icon\.is-playing svg path[\s\S]*?animation:none!important/);
assert.match(css, /html\.reduce-motion \.method-simulation \.simulation-stage-note[\s\S]*?animation:none!important/, 'preferência JS por movimento reduzido deve mostrar os conteúdos sem animação');
assert.match(js, /Conteúdo esquemático; não representa cálculo dos dados observacionais/);
assert.match(js, /activeSimulationButton\.setAttribute\('aria-expanded', 'false'\)/);
assert.match(js, /button\.setAttribute\('aria-expanded', 'true'\)/);
assert.match(js, /card\.removeAttribute\('tabindex'\)/, 'o cartão de método não deve criar uma parada de teclado redundante');
assert.doesNotMatch(js, /card\.addEventListener\('click', event => \{[\s\S]{0,220}method-icon/,'o cartão não deve reiniciar simulações quando o utilizador clica no conteúdo textual');
assert.equal((html.match(/class="method-icon method-visual-trigger/g) || []).length, 3);
assert.equal((html.match(/class="method-animated-hint method-visual-trigger method-visual-trigger-chart/g) || []).length, 3);
assert.match(html, /m<sub>SE<\/sub> \(dimensão do padrão\)/, 'o aviso deve nomear o parâmetro de Sample Entropy');
assert.match(html, /m<sub>int<\/sub> representa a modulação intrínseca/, 'o aviso deve diferenciar o índice de modulação');
assert.match(html, /As medidas podem se relacionar sem serem equivalentes\./, 'o título deve estar sem travessão');
assert.doesNotMatch(html, /<article class="method-card[^>]*tabindex="0"/, 'cartões não interativos não devem ser paradas extras de teclado');
console.log(`OK: animações progressivas acessíveis, interações explícitas, duração sincronizada e distinção de parâmetros BlazarLab ${fs.readFileSync(path.join(root,'VERSION'),'utf8').trim()}.`);
