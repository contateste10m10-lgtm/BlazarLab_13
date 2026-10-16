'use strict';

(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const N = 240;
  const EMBEDDING_SAMPEN = 2;
  const WPE_DIMENSION = 4;
  const SCALES = 8;
  const scenarioInfo = {
    smooth: {
      key: 'smooth', letter: 'A', title: 'Variação suave', status: 'CENÁRIO A · VARIAÇÃO SUAVE',
      description: 'Uma oscilação gradual com ruído moderado — um exemplo didático de variação relativamente suave.',
      color: '#9697ff', css: 'purple'
    },
    flares: {
      key: 'flares', letter: 'B', title: 'Surtos localizados', status: 'CENÁRIO B · SURTOS LOCALIZADOS',
      description: 'Uma série com excursões concentradas sobre um fundo mais brando — um exemplo sintético de picos de amplitude.',
      color: '#f4bd79', css: 'amber'
    },
    multiscale: {
      key: 'multiscale', letter: 'C', title: 'Estrutura multiescala', status: 'CENÁRIO C · ESTRUTURA MULTIESCALA',
      description: 'Oscilações lentas e rápidas se sobrepõem, acompanhadas por ruído determinístico — uma demonstração de ritmos temporais combinados.',
      color: '#61dcc7', css: 'teal'
    }
  };

  function seededNoise(seed) {
    let state = seed >>> 0;
    return () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return (state / 4294967296) * 2 - 1;
    };
  }

  function generateScenario(key) {
    const seed = { smooth: 701, flares: 1703, multiscale: 2609 }[key];
    const noise = seededNoise(seed);
    const series = [];
    for (let i = 0; i < N; i += 1) {
      const t = i;
      let value = 0;
      if (key === 'smooth') {
        value = 0.62 * Math.sin(2 * Math.PI * t / 54) + 0.25 * Math.sin(2 * Math.PI * t / 23 + 0.4) + 0.15 * noise();
      } else if (key === 'flares') {
        const pulse = (center, width, height) => height * Math.exp(-0.5 * ((t - center) / width) ** 2);
        value = 0.12 * Math.sin(2 * Math.PI * t / 72) + 0.09 * noise() + pulse(48, 2.6, 1.35) + pulse(128, 4.1, 1.9) + pulse(194, 3.2, 1.55);
      } else {
        const slow = 0.5 * Math.sin(2 * Math.PI * t / 84);
        const medium = (0.24 + 0.06 * Math.sin(2 * Math.PI * t / 115)) * Math.sin(2 * Math.PI * t / 18 + 0.5);
        const fast = 0.12 * Math.sin(2 * Math.PI * t / 5.2 + 0.2);
        const modulation = 1 + 0.28 * Math.sin(2 * Math.PI * t / 63);
        value = slow + modulation * medium + fast + 0.11 * noise();
      }
      series.push(value);
    }
    const mean = series.reduce((a, b) => a + b, 0) / series.length;
    // Synthetic series are centered for easier comparison of temporal structure.
    return series.map(v => v - mean);
  }

  function mean(values) { return values.reduce((a, b) => a + b, 0) / values.length; }
  function standardDeviation(values) {
    if (values.length < 2) return 0;
    const m = mean(values);
    return Math.sqrt(values.reduce((sum, value) => sum + (value - m) ** 2, 0) / values.length);
  }
  function format(value, digits = 3) {
    if (!Number.isFinite(value)) return '—';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function formatInteger(value) { return Math.round(value).toLocaleString('pt-BR'); }
  function escapeXML(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
  }
  function setSvg(id, content) {
    const svg = document.getElementById(id);
    if (svg) svg.innerHTML = content;
  }
  function plotFrame(width, height, margin, xTicks, yTicks, xLabel, yLabel, xScale, yScale) {
    const parts = [];
    xTicks.forEach(tick => {
      const x = xScale(tick.value);
      parts.push(`<line class="plot-grid" x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}"/>`);
      parts.push(`<text class="plot-label" x="${x}" y="${height - margin.bottom + 18}" text-anchor="middle">${escapeXML(tick.label)}</text>`);
    });
    yTicks.forEach(tick => {
      const y = yScale(tick.value);
      parts.push(`<line class="plot-grid" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"/>`);
      parts.push(`<text class="plot-label" x="${margin.left - 9}" y="${y + 3.5}" text-anchor="end">${escapeXML(tick.label)}</text>`);
    });
    parts.push(`<line class="plot-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"/>`);
    parts.push(`<line class="plot-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"/>`);
    parts.push(`<text class="plot-axis-title" x="${(margin.left + width - margin.right) / 2}" y="${height - 8}" text-anchor="middle">${escapeXML(xLabel)}</text>`);
    parts.push(`<text class="plot-axis-title" transform="translate(13 ${(height - margin.bottom + margin.top) / 2}) rotate(-90)" text-anchor="middle">${escapeXML(yLabel)}</text>`);
    return parts.join('');
  }

  function makeLinePath(values, xScale, yScale, startIndex = 0, endIndex = values.length - 1) {
    let path = '';
    for (let i = startIndex; i <= endIndex; i += 1) {
      const command = i === startIndex ? 'M' : 'L';
      path += `${command}${xScale(i).toFixed(2)},${yScale(values[i]).toFixed(2)} `;
    }
    return path.trim();
  }

  function calculateSampEn(series, m = EMBEDDING_SAMPEN, rFactor = 0.2) {
    const n = series.length;
    const sigma = standardDeviation(series);
    const tolerance = rFactor * sigma;
    const templateCount = n - m;
    if (templateCount < 2 || !Number.isFinite(tolerance) || tolerance <= 0) return { value: null, A: 0, B: 0, sigma, tolerance, templateCount, status: 'A série não tem variação suficiente.' };
    let B = 0;
    let A = 0;
    for (let i = 0; i < templateCount; i += 1) {
      for (let j = i + 1; j < templateCount; j += 1) {
        let matchesM = true;
        let matchesM1 = true;
        for (let k = 0; k < m; k += 1) {
          if (Math.abs(series[i + k] - series[j + k]) > tolerance) {
            matchesM = false;
            matchesM1 = false;
            break;
          }
        }
        if (matchesM) {
          B += 1;
          if (Math.abs(series[i + m] - series[j + m]) <= tolerance && matchesM1) A += 1;
        }
      }
    }
    const value = (A > 0 && B > 0) ? -Math.log(A / B) : null;
    return { value, A, B, sigma, tolerance, templateCount, status: value === null ? 'Não há pares de extensão suficiente para estimar a SampEn com estes parâmetros.' : 'Estimativa sintética calculada.' };
  }

  function fisherShannonKDE(series) {
    const n = series.length;
    const sd = standardDeviation(series);
    if (!n || !Number.isFinite(sd) || sd <= 0) return { H: null, fisher: null };
    const sorted = [...series].sort((a, b) => a - b);
    const q1 = sorted[Math.floor((n - 1) * 0.25)];
    const q3 = sorted[Math.floor((n - 1) * 0.75)];
    const iqr = q3 - q1;
    const robustSd = iqr > 0 ? Math.min(sd, iqr / 1.349) : sd;
    const bandwidth = Math.max(1e-4, 0.9 * robustSd * Math.pow(n, -0.2));
    const minX = sorted[0] - 3.5 * bandwidth;
    const maxX = sorted[n - 1] + 3.5 * bandwidth;
    const count = 241;
    const step = (maxX - minX) / (count - 1);
    const density = new Array(count).fill(0);
    const derivative = new Array(count).fill(0);
    const invSqrt2Pi = 1 / Math.sqrt(2 * Math.PI);
    for (let i = 0; i < count; i += 1) {
      const x = minX + i * step;
      let f = 0;
      let df = 0;
      for (const sample of series) {
        const z = (x - sample) / bandwidth;
        const kernel = invSqrt2Pi * Math.exp(-0.5 * z * z);
        f += kernel / bandwidth;
        df += -z * kernel / (bandwidth * bandwidth);
      }
      density[i] = f / n;
      derivative[i] = df / n;
    }
    // Normalize the numerical density, and its derivative, to account for finite grid edges.
    let integral = 0;
    for (let i = 0; i < count - 1; i += 1) integral += (density[i] + density[i + 1]) * step / 2;
    if (!Number.isFinite(integral) || integral <= 0) return { H: null, fisher: null };
    for (let i = 0; i < count; i += 1) { density[i] /= integral; derivative[i] /= integral; }
    let H = 0;
    let fisher = 0;
    for (let i = 0; i < count - 1; i += 1) {
      const f0 = Math.max(density[i], 1e-14);
      const f1 = Math.max(density[i + 1], 1e-14);
      const d0 = derivative[i];
      const d1 = derivative[i + 1];
      const h0 = -f0 * Math.log(f0);
      const h1 = -f1 * Math.log(f1);
      const j0 = d0 * d0 / f0;
      const j1 = d1 * d1 / f1;
      H += (h0 + h1) * step / 2;
      fisher += (j0 + j1) * step / 2;
    }
    return { H, fisher, density, minX, maxX, bandwidth };
  }

  function ordinalPattern(values) {
    return values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value || a.index - b.index).map(point => point.index).join('');
  }

  function weightedPermutationEntropy(series, dimension = WPE_DIMENSION, delay = 1) {
    const patternWeights = new Map();
    const totalLength = series.length - (dimension - 1) * delay;
    if (totalLength <= 0) return { value: null, count: 0 };
    let totalWeight = 0;
    for (let i = 0; i < totalLength; i += 1) {
      const vector = [];
      for (let k = 0; k < dimension; k += 1) vector.push(series[i + k * delay]);
      const localMean = mean(vector);
      const weight = vector.reduce((sum, value) => sum + (value - localMean) ** 2, 0) / dimension;
      const key = ordinalPattern(vector);
      patternWeights.set(key, (patternWeights.get(key) || 0) + weight);
      totalWeight += weight;
    }
    if (totalWeight <= Number.EPSILON) return { value: 0, count: totalLength };
    let entropy = 0;
    for (const weight of patternWeights.values()) {
      const p = weight / totalWeight;
      if (p > 0) entropy -= p * Math.log(p);
    }
    return { value: entropy, count: totalLength, distinctPatterns: patternWeights.size };
  }

  function coarseGrain(series, scale) {
    const count = Math.floor(series.length / scale);
    const result = [];
    for (let j = 0; j < count; j += 1) {
      let sum = 0;
      for (let k = 0; k < scale; k += 1) sum += series[j * scale + k];
      result.push(sum / scale);
    }
    return result;
  }

  function calculateMSE(series) {
    const points = [];
    let CI = 0;
    for (let scale = 1; scale <= SCALES; scale += 1) {
      const coarse = coarseGrain(series, scale);
      const wpe = weightedPermutationEntropy(coarse, WPE_DIMENSION, 1);
      const value = Number.isFinite(wpe.value) ? wpe.value : 0;
      points.push({ scale, value, n: coarse.length, patterns: wpe.distinctPatterns || 0 });
      CI += value;
    }
    return { points, CI, maxPerScale: Math.log(factorial(WPE_DIMENSION)), maxCI: SCALES * Math.log(factorial(WPE_DIMENSION)) };
  }
  function factorial(n) { let result = 1; for (let i = 2; i <= n; i += 1) result *= i; return result; }

  // Reference curves are illustrative, not measured data and not WPE outputs
  // computed from individual OVRO sources. The source summary reports a gentler
  // fall for the low-modulation quartile (4.10 -> 2.88) and a steeper fall for
  // the high-modulation quartile (3.88 -> 1.83). Because these reported values
  // do not fit the d=4 theoretical maximum used by this browser demonstration,
  // we preserve their relative shape/endpoints and rescale them to ln(4!).
  // Intermediate points are linearly interpolated for illustration only.
  function referenceMSEProfiles() {
    const maxPerScale = Math.log(factorial(WPE_DIMENSION));
    const reportedMaximum = 4.10;
    const profile = (start, end) => Array.from({ length: SCALES }, (_, index) => {
      const fraction = index / (SCALES - 1);
      const value = start + fraction * (end - start);
      return { scale: index + 1, value: value / reportedMaximum * maxPerScale };
    });
    return [
      { key: 'low', title: 'Baixa modulação intrínseca', color: '#9697ff', points: profile(4.10, 2.88) },
      { key: 'high', title: 'Alta modulação intrínseca', color: '#61dcc7', points: profile(3.88, 1.83) }
    ];
  }

  const scenarios = Object.fromEntries(Object.keys(scenarioInfo).map(key => {
    const series = generateScenario(key);
    return [key, { ...scenarioInfo[key], series, sampen: calculateSampEn(series), fisherShannon: fisherShannonKDE(series), mse: calculateMSE(series) }];
  }));

  function drawLightcurve(item) {
    const width = 900, height = 290, margin = { top: 18, right: 22, bottom: 42, left: 52 };
    const values = item.series;
    let min = Math.min(...values), max = Math.max(...values);
    if (Math.abs(max - min) < 1e-9) { min -= 1; max += 1; }
    const pad = (max - min) * 0.1;
    min -= pad; max += pad;
    const x = i => margin.left + i / (values.length - 1) * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - (value - min) / (max - min) * (height - margin.top - margin.bottom);
    const yTicks = Array.from({ length: 5 }, (_, i) => { const value = min + (max - min) * i / 4; return { value, label: format(value, 2) }; });
    const xTicks = [0, 60, 120, 180, 239].map(value => ({ value, label: String(value) }));
    let content = plotFrame(width, height, margin, xTicks, yTicks, 'Índice temporal sintético', 'Fluxo relativo', x, y);
    content += `<path class="plot-line plot-line-${item.css}" style="stroke:${item.color}" d="${makeLinePath(values, x, y)}"/>`;
    for (let i = 0; i < values.length; i += 12) content += `<circle class="plot-point" cx="${x(i)}" cy="${y(values[i])}" r="2.7" fill="${item.color}"/>`;
    content += `<text class="plot-label" x="${width - margin.right}" y="${margin.top + 2}" text-anchor="end">SÉRIE SINTÉTICA ${item.letter}</text>`;
    setSvg('lightcurvePlot', content);
    document.getElementById('lightcurveRange').textContent = `${formatInteger(values.length)} pontos · faixa ${format(min + pad, 2)} a ${format(max - pad, 2)}`;
  }

  function drawSampEn(item) {
    const result = item.sampen;
    const width = 600, height = 250, margin = { top: 22, right: 26, bottom: 44, left: 56 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const maxCount = Math.max(1, result.B, result.A) * 1.15;
    const y = value => height - margin.bottom - value / maxCount * plotHeight;
    const content = [];
    const ticks = Array.from({ length: 5 }, (_, i) => ({ value: maxCount * i / 4, label: formatInteger(maxCount * i / 4) }));
    ticks.forEach(t => {
      content.push(`<line class="plot-grid" x1="${margin.left}" y1="${y(t.value)}" x2="${width - margin.right}" y2="${y(t.value)}"/>`);
      content.push(`<text class="plot-label" x="${margin.left - 8}" y="${y(t.value) + 3}" text-anchor="end">${t.label}</text>`);
    });
    content.push(`<line class="plot-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"/>`);
    const barWidth = 94;
    const positions = [margin.left + plotWidth * .31 - barWidth / 2, margin.left + plotWidth * .70 - barWidth / 2];
    const values = [result.B, result.A];
    const colors = ['bar-soft', 'bar-strong'];
    const labels = ['B · extensão m', 'A · extensão m+1'];
    values.forEach((value, i) => {
      const barH = (value / maxCount) * plotHeight;
      content.push(`<rect class="${colors[i]}" x="${positions[i]}" y="${height - margin.bottom - barH}" width="${barWidth}" height="${barH}" rx="5"/>`);
      content.push(`<text class="plot-tooltip" x="${positions[i] + barWidth / 2}" y="${height - margin.bottom - barH - 8}" text-anchor="middle">${formatInteger(value)}</text>`);
      content.push(`<text class="plot-label" x="${positions[i] + barWidth / 2}" y="${height - margin.bottom + 20}" text-anchor="middle">${labels[i]}</text>`);
    });
    content.push(`<text class="plot-axis-title" x="${width / 2}" y="${height - 7}" text-anchor="middle">Pares semelhantes contados</text>`);
    setSvg('sampenPlot', content.join(''));
    document.getElementById('sampenValue').textContent = result.value === null ? 'indefinida' : format(result.value, 3);
    document.getElementById('sampenCounts').textContent = `${formatInteger(result.B)} / ${formatInteger(result.A)}`;
    document.getElementById('sampenExplanation').textContent = result.value === null
      ? `${result.status} A SampEn não é definida quando A ou B é zero; o site não substitui esses casos por um valor artificial.`
      : `Com m = 2, r = 0,2σ e ${formatInteger(result.templateCount)} inícios de padrão compartilhados para A e B, SampEn = −ln(${formatInteger(result.A)} / ${formatInteger(result.B)}) = ${format(result.value, 3)}. Valores maiores sugerem menor persistência de padrões semelhantes nestas condições.`;
  }

  function drawFisherPlane(currentKey) {
    const items = Object.values(scenarios);
    const width = 600, height = 250, margin = { top: 17, right: 26, bottom: 43, left: 66 };
    const validH = items.map(d => d.fisherShannon.H).filter(Number.isFinite);
    const validI = items.map(d => d.fisherShannon.fisher).filter(Number.isFinite);
    const minH0 = Math.min(...validH), maxH0 = Math.max(...validH);
    const minI0 = Math.min(...validI), maxI0 = Math.max(...validI);
    const hPad = Math.max((maxH0 - minH0) * .3, .08);
    const minH = minH0 - hPad, maxH = maxH0 + hPad;
    // Fisher information can span orders of magnitude when a scenario contains sharp, localized excursions.
    // A logarithmic visual axis prevents the smoother cases from collapsing against the baseline.
    const minLogI0 = Math.log10(Math.max(minI0, 1e-9));
    const maxLogI0 = Math.log10(Math.max(maxI0, minI0 * 1.001, 1e-8));
    const logPad = Math.max((maxLogI0 - minLogI0) * .18, .12);
    const minLogI = minLogI0 - logPad, maxLogI = maxLogI0 + logPad;
    const minI = Math.pow(10, minLogI), maxI = Math.pow(10, maxLogI);
    const x = value => margin.left + (value - minH) / (maxH - minH || 1) * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - (Math.log10(Math.max(value, 1e-9)) - minLogI) / (maxLogI - minLogI || 1) * (height - margin.top - margin.bottom);
    const xTicks = Array.from({ length: 4 }, (_, i) => { const value = minH + (maxH - minH) * i / 3; return { value, label: format(value, 2) }; });
    const yTicks = Array.from({ length: 4 }, (_, i) => { const value = Math.pow(10, minLogI + (maxLogI - minLogI) * i / 3); return { value, label: value < 10 ? format(value, 1) : format(value, 0) }; });
    const content = [plotFrame(width, height, margin, xTicks, yTicks, 'Entropia de Shannon H (nats)', 'Informação de Fisher I_F (escala log)', x, y)];
    const labelOffset = { smooth: [-12, -15], flares: [11, -8], multiscale: [12, 19] };
    for (const item of items) {
      const h = item.fisherShannon.H;
      const f = item.fisherShannon.fisher;
      const [dx, dy] = labelOffset[item.key];
      const selected = item.key === currentKey;
      content.push(`<circle class="plane-point ${selected ? 'is-selected' : ''}" cx="${x(h)}" cy="${y(f)}" r="${selected ? 7.5 : 5.5}" fill="${item.color}"/>`);
      content.push(`<text class="plot-tooltip" x="${x(h) + dx}" y="${y(f) + dy}" text-anchor="${dx < 0 ? 'end' : 'start'}" style="font-weight:${selected ? 700 : 500};fill:${item.color}">${item.letter} · ${escapeXML(item.title)}</text>`);
    }
    setSvg('fisherPlot', content.join(''));
    const selected = scenarios[currentKey].fisherShannon;
    document.getElementById('shannonValue').textContent = format(selected.H, 3);
    document.getElementById('fisherValue').textContent = format(selected.fisher, 3);
  }

  function drawMSE(item) {
    const points = item.mse.points;
    const profiles = referenceMSEProfiles();
    const width = 900, height = 270, margin = { top: 19, right: 24, bottom: 43, left: 56 };
    const maxObserved = Math.max(...points.map(p => p.value), ...profiles.flatMap(profile => profile.points.map(p => p.value)));
    const maxValue = Math.max(maxObserved * 1.12, item.mse.maxPerScale * 1.10, 1);
    const x = value => margin.left + (value - 1) / (SCALES - 1) * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - value / maxValue * (height - margin.top - margin.bottom);
    const xTicks = points.map(p => ({ value: p.scale, label: String(p.scale) }));
    const yTicks = Array.from({ length: 5 }, (_, i) => ({ value: maxValue * i / 4, label: format(maxValue * i / 4, 2) }));
    const content = [plotFrame(width, height, margin, xTicks, yTicks, 'Escala temporal τ', 'WPE (nats)', x, y)];

    // Draw the qualitative reference profiles first; the live calculated curve remains foregrounded.
    profiles.forEach(profile => {
      const profilePath = profile.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.scale).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ');
      content.push(`<path d="${profilePath}" fill="none" stroke="${profile.color}" stroke-width="2.2" stroke-dasharray="7 5" opacity="0.95"/>`);
      profile.points.forEach((p, i) => {
        if (i === 0 || i === profile.points.length - 1) content.push(`<circle cx="${x(p.scale)}" cy="${y(p.value)}" r="3.2" fill="${profile.color}" opacity="0.95"/>`);
      });
    });

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.scale).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ');
    content.push(`<path class="plot-line plot-line-amber" d="${path}" fill="none" stroke="#f4bd79" stroke-width="2.6"/>`);
    points.forEach(p => {
      content.push(`<circle class="plot-point" cx="${x(p.scale)}" cy="${y(p.value)}" r="4.2" fill="#f4bd79"/>`);
      content.push(`<text class="plot-label" x="${x(p.scale)}" y="${y(p.value) - 10}" text-anchor="middle">${format(p.value, 2)}</text>`);
    });
    setSvg('msePlot', content.join(''));
    document.getElementById('ciValue').textContent = format(item.mse.CI, 3);
    document.getElementById('scaleValues').innerHTML = points.map(p => `<div class="scale-pill"><span>τ = ${p.scale}</span><strong>${format(p.value, 2)}</strong></div>`).join('');
  }

  let currentKey = 'smooth';
  function selectScenario(key, updateHash = false) {
    if (!scenarios[key]) return;
    currentKey = key;
    const item = scenarios[key];
    document.querySelectorAll('[data-scenario]').forEach(button => {
      const active = button.dataset.scenario === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('scenarioStatus').textContent = item.status;
    document.getElementById('scenarioDescription').textContent = item.description;
    drawLightcurve(item);
    drawSampEn(item);
    drawFisherPlane(key);
    drawMSE(item);
    if (updateHash) history.replaceState(null, '', `#explorar`);
  }

  function initNavigation() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('siteNav');
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
    document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => selectScenario(button.dataset.scenario, true)));
    document.querySelectorAll('[data-jump-scenario]').forEach(link => link.addEventListener('click', () => selectScenario(link.dataset.jumpScenario, true)));
  }

  function init() {
    initNavigation();
    selectScenario('smooth');
    document.documentElement.classList.toggle('reduce-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
