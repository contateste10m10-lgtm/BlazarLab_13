#!/usr/bin/env node
'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'blazarlab.js'),'utf8');
const version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
assert.match(js,/svg\.setPointerCapture\(event\.pointerId\)/,'capturar cada ponteiro evita perder o segundo dedo durante a pinça');
assert.match(js,/svg\.addEventListener\('pointerup',endPointer\);svg\.addEventListener\('pointercancel',endPointer\)/,'pointerup e pointercancel precisam compartilhar a limpeza individual');
assert.match(js,/if\(pointers\.size===1\)\{resumeSinglePointer\(\);return;\}/,'ao soltar um dedo, o ponteiro restante deve continuar sem salto');
assert.match(js,/pan-y pinch-zoom/,'fora do modo zoom o navegador deve manter rolagem e pinça nativas');
assert.match(js,/renderActiveDemoPreservingZoom/,'redimensionamento e troca de tema devem preservar escala e centro do zoom');
const sourceStart=js.indexOf('  function viewBoxForPinch(');assert.ok(sourceStart>=0,'helper de geometria de pinça deve existir');
let depth=0,open=js.indexOf('{',sourceStart),end=-1;for(let i=open;i<js.length;i++){if(js[i]==='{')depth++;if(js[i]==='}')depth--;if(depth===0){end=i+1;break;}}
const helper=js.slice(sourceStart,end).replace(/^  /gm,'');const fn=new Function(`${helper};return viewBoxForPinch;`)();
const result=fn({x:0,y:0,w:100,h:100},{left:0,top:0,width:100,height:100},{x:50,y:50},{x:50,y:50},.5);
assert.equal(result.w,50);assert.equal(result.h,50);assert.equal(result.x,25);assert.equal(result.y,25,'pinça deve manter o ponto de referência sob o centro dos dedos');
const moved=fn({x:0,y:0,w:100,h:100},{left:0,top:0,width:100,height:100},{x:50,y:50},{x:60,y:50},.5);
assert.equal(moved.x,20,'o ponto ancorado deve acompanhar o centro da pinça sem saltos');
console.log(`OK: zoom por pinça, liberação parcial de dedos e preservação do estado — BlazarLab ${version}.`);
