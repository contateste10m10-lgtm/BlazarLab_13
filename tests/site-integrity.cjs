#!/usr/bin/env node
'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'blazarlab.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
const required=['sampenPlot','fisherPlot','msePlot','sampenBandMeanPlot','sampenClassDistPlot','sampenModPlot','sampenRobustPlot','sampenSensitivityPlot','fisherPopulationPlot','mseBandScalePlot','ciSampEnPlot'];
const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
const duplicateIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
assert.deepEqual([...new Set(duplicateIds)],[],'IDs HTML devem ser únicos');
const idSet=new Set(ids);
for(const m of html.matchAll(/\bhref=["']#([^"']+)["']/g)) assert.ok(idSet.has(m[1]),`âncora interna quebrada: #${m[1]}`);
for(const m of html.matchAll(/data-focus-chart=["']([^"']+)["']/g)) assert.ok(idSet.has(m[1]),`atalho de gráfico quebrado: ${m[1]}`);
for(const tag of html.matchAll(/<svg\b[^>]*>/gi)) assert.ok([...tag[0].matchAll(/\bviewbox\s*=/gi)].length<=1,'um SVG não deve repetir viewBox em grafias diferentes');
for(const id of required) assert.match(html,new RegExp('id=["\\\']'+id+'["\\\']'),`faltou painel ${id}`);
assert.ok(fs.existsSync(path.join(root,'assets','social-preview.svg')),'prévia social local deve existir');
assert.doesNotMatch(html,/documentos enviados|resumos enviados para esta construção/i,'texto interno não deve vazar para público');
assert.match(html,/Como citar o BlazarLab/i,'seção de citação deve existir');
assert.match(js,/function initializeChartInteractions/,'controlador de interação deve existir');
assert.match(js,/function computeSensitivityCells/,'cálculo da sensibilidade m×r deve existir');
assert.match(css,/@media\s*\(max-width:\s*599px\)/,'CSS móvel deve existir');
assert.match(css,/\.chart-frame-scrollwide/,'matrizes extensas devem ter contêiner rolável');
assert.match(css,/\.method-question\{font:700 19px\/1\.35 var\(--serif\);color:#f0f3ff/,'hierarquia tipográfica das perguntas científicas deve estar preservada');
if(version.startsWith('1.3.')){
  assert.equal(version,'1.3.13','a versão refinada deve ser identificada corretamente');
  for(const id of ['activeBandSelector','sampenBandHeatmapPlot','fisherBandTrajectoryPlot','bandScaleHeatmapPlot','downloadSourceCsv']) assert.match(html,new RegExp('id=["\\\']'+id+'["\\\']'),`funcionalidade V1.3 ausente: ${id}`);
  assert.match(js,/function drawBandScaleHeatmap/);assert.match(js,/function drawFisherBandTrajectory/);assert.match(js,/function drawSampenSourceBandHeatmap/);
  assert.match(js,/function downloadSourceCSV/,'a exportação CSV deve ter implementação');
  assert.match(js,/measurement_error_arbitrary_units/,'o CSV deve identificar os erros sintéticos');
  assert.match(html,/versão 1\.3\.13/,'a citação deve refletir a versão publicada');
  assert.match(html,/version = \{1\.3\.13\}/,'o BibTeX deve refletir a versão publicada');
}else{
  assert.equal(version,'1.2.5');
  assert.doesNotMatch(html,/id=["\\\']activeBandSelector["\\\']/,'a seleção sincronizada fica para V1.3');
}
console.log(`OK: integridade estática BlazarLab ${version}; HTML, referências de interface, CSS móvel e funções científicas essenciais.`);
