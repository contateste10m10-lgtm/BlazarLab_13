#!/usr/bin/env node
'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const js=fs.readFileSync(path.join(root,'blazarlab.js'),'utf8');
const version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
assert.equal(version,'1.3.22');
assert.match(html,/data-theme-choice="light"/);assert.match(html,/data-theme-choice="dark"/);
assert.match(html,/id="secretBackgroundTrigger"/);assert.match(html,/data-background-choice="agn"/);assert.match(html,/data-background-choice="nebula"/);assert.match(html,/data-background-choice="normal"/);
assert.match(js,/localStorage\.getItem\('blazarlab-secret-unlocked'\)==='true'/);
assert.match(js,/function activeSecretChartColors\(\)\{const mode=document\.documentElement\.dataset\.backgroundMode/);
assert.match(css,/background-image:linear-gradient\(90deg,rgba\(6,8,17/);assert.match(css,/assets\/agn-background\.svg/);assert.match(css,/assets\/nebula-background\.svg/);
assert.match(css,/\.chart-frame-scrollwide svg#sampenBandHeatmapPlot\{width:1020px!important;min-width:1020px!important/);
assert.match(css,/\.mobile-plot-svg#sampenSensitivityPlot \.plot-label\{font-size:17px!important\}/);
assert.ok(fs.statSync(path.join(root,'assets','agn-background.svg')).size>500);
assert.ok(fs.statSync(path.join(root,'assets','nebula-background.svg')).size>500);
console.log('OK: seletor astronômico, paleta de gráficos isolada por modo, fundos locais e geometria móvel.');
