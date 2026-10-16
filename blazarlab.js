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
    if (svg) {
      svg.innerHTML = content;
      const base = svg.dataset?.baseViewBox || svg.getAttribute?.('data-base-viewbox');
      if (base && svg.setAttribute) svg.setAttribute('viewBox', base);
    }
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
    const width = 900, height = 270, margin = { top: 19, right: 24, bottom: 43, left: 56 };
    const maxValue = Math.max(...points.map(p => p.value), item.mse.maxPerScale * 1.05, 1);
    const x = value => margin.left + (value - 1) / (SCALES - 1) * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - value / maxValue * (height - margin.top - margin.bottom);
    const xTicks = points.map(p => ({ value: p.scale, label: String(p.scale) }));
    const yTicks = Array.from({ length: 5 }, (_, i) => ({ value: maxValue * i / 4, label: format(maxValue * i / 4, 2) }));
    const content = [plotFrame(width, height, margin, xTicks, yTicks, 'Escala temporal τ', 'WPE (nats)', x, y)];
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.scale).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ');
    content.push(`<path class="plot-line plot-line-amber" d="${path}" fill="none" stroke="#f4bd79" stroke-width="2.6"/>`);
    points.forEach(p => {
      content.push(`<circle class="plot-point" cx="${x(p.scale)}" cy="${y(p.value)}" r="4.2" fill="#f4bd79"><title>Escala τ=${p.scale}; WPE=${format(p.value, 4)}; N_coarse=${p.n}</title></circle>`);
      content.push(`<text class="plot-label" x="${x(p.scale)}" y="${y(p.value) - 10}" text-anchor="middle">${format(p.value, 2)}</text>`);
    });
    setSvg('msePlot', content.join(''));
    document.getElementById('ciValue').textContent = format(item.mse.CI, 3);
    document.getElementById('scaleValues').innerHTML = points.map(p => `<div class="scale-pill"><span>τ = ${p.scale}</span><strong>${format(p.value, 2)}</strong></div>`).join('');
  }


  // The public gallery is synthetic by design: three deliberately balanced demo classes,
  // eight Swift-BAT-like energy bands, and deterministic source-level variation.
  const ENERGY_BANDS = [
    { name: '14–20 keV', short: '14–20', color: '#9697ff' },
    { name: '20–24 keV', short: '20–24', color: '#b48cf2' },
    { name: '24–35 keV', short: '24–35', color: '#d58ac7' },
    { name: '35–50 keV', short: '35–50', color: '#f4bd79' },
    { name: '50–75 keV', short: '50–75', color: '#d9dc82' },
    { name: '75–100 keV', short: '75–100', color: '#61dcc7' },
    { name: '100–150 keV', short: '100–150', color: '#61b9df' },
    { name: '150–195 keV', short: '150–195', color: '#8399ff' }
  ];
  const SYNTHETIC_CLASSES = [
    { key: 'FSRQ', label: 'FSRQ · sintético', color: '#9697ff', amplitude: 0.72, noise: 0.26, mode: 'smooth' },
    { key: 'BL Lac', label: 'BL Lac · sintético', color: '#f4bd79', amplitude: 1.12, noise: 0.13, mode: 'flares' },
    { key: 'AGN', label: 'AGN · sintético', color: '#61dcc7', amplitude: 0.88, noise: 0.30, mode: 'multiscale' }
  ];
  const MULTIBAND_N = 144;

  function median(values) {
    if (!values.length) return NaN;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function generateMultibandCurve(classDef, sourceNumber, bandIndex) {
    const seed = 3719 + SYNTHETIC_CLASSES.findIndex(c => c.key === classDef.key) * 100003 + sourceNumber * 1009 + bandIndex * 7919;
    const noise = seededNoise(seed);
    const baseline = (3.2 + bandIndex * 0.31) * (0.93 + sourceNumber * 0.018);
    const amplitude = classDef.amplitude * (0.83 + sourceNumber * 0.035) * (0.76 + bandIndex * 0.072);
    const phase = sourceNumber * 0.39 + bandIndex * 0.22;
    const flux = [];
    const errors = [];
    for (let t = 0; t < MULTIBAND_N; t += 1) {
      let structure;
      if (classDef.mode === 'smooth') {
        structure = 0.78 * Math.sin(2 * Math.PI * t / (39 + sourceNumber) + phase)
          + 0.34 * Math.sin(2 * Math.PI * t / (13.5 + bandIndex * 0.45) + phase * 0.6)
          + classDef.noise * noise();
      } else if (classDef.mode === 'flares') {
        const flare = (center, width, height) => height * Math.exp(-0.5 * ((t - center) / width) ** 2);
        const offset = (sourceNumber % 3) * 3;
        structure = 0.18 * Math.sin(2 * Math.PI * t / 55 + phase)
          + flare(23 + offset, 2.5 + (sourceNumber % 2) * 0.4, 1.55)
          + flare(65 + offset, 3.2, 1.25)
          + flare(108 + offset, 2.8, 1.6)
          + classDef.noise * noise();
      } else {
        const slow = 0.55 * Math.sin(2 * Math.PI * t / (61 + sourceNumber) + phase);
        const medium = 0.35 * Math.sin(2 * Math.PI * t / (16 + bandIndex * 0.35) + phase * 1.7);
        const fast = 0.19 * Math.sin(2 * Math.PI * t / 4.8 + phase * 0.3);
        const envelope = 1 + 0.22 * Math.sin(2 * Math.PI * t / 45 + phase);
        structure = slow + envelope * medium + fast + classDef.noise * noise();
      }
      // Errors and the measurement scatter are synthetic and reproducible; the intrinsic
      // modulation estimate below uses the same error-aware algebra as the internal project.
      const error = baseline * (0.027 + 0.0022 * bandIndex) * (0.92 + 0.12 * Math.abs(noise()));
      const measured = baseline + amplitude * structure + error * Math.sqrt(3) * noise();
      flux.push(Math.max(0.025, measured));
      errors.push(error);
    }
    return { flux, errors, baseline };
  }

  function intrinsicModulationIndex(flux, errors) {
    if (!flux.length || flux.length !== errors.length) return null;
    const averageFlux = mean(flux);
    if (!Number.isFinite(averageFlux) || Math.abs(averageFlux) < 1e-12) return null;
    const observedVariance = flux.reduce((sum, x) => sum + (x - averageFlux) ** 2, 0) / flux.length;
    const meanErrorVariance = mean(errors.map(e => e * e));
    const intrinsicVariance = observedVariance - meanErrorVariance;
    return intrinsicVariance >= 0 ? 100 * Math.sqrt(intrinsicVariance) / Math.abs(averageFlux) : null;
  }

  function robustVariabilityIndex(flux) {
    const med = median(flux);
    if (!Number.isFinite(med) || Math.abs(med) < 1e-12) return null;
    const mad = median(flux.map(value => Math.abs(value - med)));
    return 100 * 1.4826 * mad / Math.abs(med);
  }

  function generateMultibandPopulation() {
    const sources = [];
    const rows = [];
    SYNTHETIC_CLASSES.forEach((classDef, classIndex) => {
      for (let sourceNumber = 1; sourceNumber <= 8; sourceNumber += 1) {
        const sourceName = `${classDef.key === 'BL Lac' ? 'BLLac' : classDef.key}-S${String(sourceNumber).padStart(2, '0')}`;
        const source = { name: sourceName, classKey: classDef.key, classLabel: classDef.label, classColor: classDef.color, bands: [] };
        ENERGY_BANDS.forEach((band, bandIndex) => {
          const series = generateMultibandCurve(classDef, sourceNumber + classIndex * 2, bandIndex);
          const sampen = calculateSampEn(series.flux, EMBEDDING_SAMPEN, 0.2);
          const fisher = fisherShannonKDE(series.flux);
          const mse = calculateMSE(series.flux);
          const row = {
            source: sourceName, sourceNumber, classKey: classDef.key, classLabel: classDef.label, classColor: classDef.color,
            bandIndex, band: band.name, bandShort: band.short, bandColor: band.color,
            series: series.flux, errors: series.errors, sampen: sampen.value,
            A: sampen.A, B: sampen.B, sigma: sampen.sigma, tolerance: sampen.tolerance,
            modulation: intrinsicModulationIndex(series.flux, series.errors),
            robustVariability: robustVariabilityIndex(series.flux), fisherShannon: fisher,
            mse, ci: mse.CI, meanFlux: mean(series.flux), n: series.flux.length
          };
          source.bands.push(row);
          rows.push(row);
        });
        sources.push(source);
      }
    });
    return { sources, rows };
  }

  const MULTIBAND = generateMultibandPopulation();
  let visibleBands = new Set(ENERGY_BANDS.map((_, i) => i));

  function sourceFromSelect() {
    const select = document.getElementById('multibandSource');
    const name = select?.value;
    return MULTIBAND.sources.find(source => source.name === name) || MULTIBAND.sources[0];
  }

  function classLegendMarkup() {
    return SYNTHETIC_CLASSES.map(item => `<span><i class="class-legend-dot" style="background:${item.color}"></i>${escapeXML(item.label)}</span>`).join('');
  }

  function renderClassLegends() {
    document.querySelectorAll('.class-legend').forEach(legend => { legend.innerHTML = classLegendMarkup(); });
  }

  function tickValues(min, max, count = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
    if (Math.abs(max - min) < 1e-12) { min -= 0.5; max += 0.5; }
    return Array.from({ length: count }, (_, i) => {
      const value = min + (max - min) * i / (count - 1);
      return { value, label: format(value, Math.abs(max - min) < 1 ? 2 : 1) };
    });
  }

  function drawMultibandCurve() {
    const source = sourceFromSelect();
    if (!source) return;
    const width = 900, height = 310, margin = { top: 18, right: 24, bottom: 43, left: 56 };
    const plotHeight = height - margin.top - margin.bottom;
    const yMin = -3.2, yMax = 3.2;
    const x = value => margin.left + value / (MULTIBAND_N - 1) * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - (value - yMin) / (yMax - yMin) * plotHeight;
    const xTicks = [0, 36, 72, 108, 143].map(v => ({ value: v, label: String(v) }));
    const yTicks = [-3, -1.5, 0, 1.5, 3].map(v => ({ value: v, label: format(v, 1) }));
    const content = [plotFrame(width, height, margin, xTicks, yTicks, 'Índice temporal sintético', 'Fluxo normalizado (z-score)', x, y)];
    source.bands.forEach(row => {
      if (!visibleBands.has(row.bandIndex)) return;
      const avg = mean(row.series);
      const sd = standardDeviation(row.series) || 1;
      const z = row.series.map(value => (value - avg) / sd);
      const path = z.map((value, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(value).toFixed(2)}`).join(' ');
      content.push(`<path class="multiband-curve" data-band="${row.bandIndex}" d="${path}" fill="none" stroke="${row.bandColor}" stroke-width="1.8" opacity="0.92"><title>${escapeXML(source.name)} · ${escapeXML(row.band)} · SampEn=${format(row.sampen, 3)} · m_int=${format(row.modulation, 2)}%</title></path>`);
      z.forEach((value, i) => { if (i % 16 === 0) content.push(`<circle cx="${x(i)}" cy="${y(value)}" r="2.2" fill="${row.bandColor}" opacity="0.72"><title>${escapeXML(row.band)} · t=${i} · z=${format(value, 3)}</title></circle>`); });
    });
    content.push(`<text class="plot-label" x="${width - margin.right}" y="${margin.top + 1}" text-anchor="end">${escapeXML(source.name)} · SINTÉTICA</text>`);
    setSvg('multibandCurvePlot', content.join(''));
    const validSE = source.bands.filter(b => Number.isFinite(b.sampen));
    const avgSE = validSE.length ? mean(validSE.map(b => b.sampen)) : NaN;
    const avgMod = mean(source.bands.map(b => b.modulation).filter(Number.isFinite));
    const stat = document.getElementById('multibandSourceStats');
    if (stat) stat.textContent = `${source.classLabel} · ${MULTIBAND_N} pontos por banda · SampEn média entre bandas = ${format(avgSE, 3)} · modulação intrínseca média = ${format(avgMod, 2)}%`;
    const sourceSummary = document.getElementById('multibandSource');
    if (sourceSummary) sourceSummary.setAttribute('aria-label', `Fonte demonstrativa selecionada: ${source.name}`);
    drawMSEBandScale(source);
    drawSensitivityMap(source);
  }

  function drawBandMeanChart(svgId, metricKey, axisLabel, digits = 3) {
    const width = 700, height = 290, margin = { top: 18, right: 18, bottom: 58, left: 58 };
    const summaries = ENERGY_BANDS.map((band, index) => {
      const values = MULTIBAND.rows.filter(row => row.bandIndex === index).map(row => row[metricKey]).filter(Number.isFinite);
      const avg = values.length ? mean(values) : NaN;
      return { ...band, index, avg, sd: values.length > 1 ? standardDeviation(values) : 0, n: values.length };
    });
    const maxVal = Math.max(0.1, ...summaries.filter(s => Number.isFinite(s.avg)).map(s => s.avg + s.sd)) * 1.18;
    const xStep = (width - margin.left - margin.right) / summaries.length;
    const y = value => height - margin.bottom - value / maxVal * (height - margin.top - margin.bottom);
    const x = index => margin.left + (index + 0.5) * xStep;
    const yTicks = Array.from({ length: 5 }, (_, i) => ({ value: maxVal * i / 4, label: format(maxVal * i / 4, digits > 2 ? 2 : 1) }));
    const xTicks = summaries.map(summary => ({ value: summary.index, label: summary.short }));
    const xScale = value => x(value);
    const content = [plotFrame(width, height, margin, xTicks, yTicks, 'Banda de energia (keV)', axisLabel, xScale, y)];
    summaries.forEach(summary => {
      if (!Number.isFinite(summary.avg)) return;
      const barWidth = xStep * 0.62;
      const top = y(summary.avg);
      const x0 = x(summary.index) - barWidth / 2;
      content.push(`<rect x="${x0}" y="${top}" width="${barWidth}" height="${height - margin.bottom - top}" rx="4" fill="${summary.color}" opacity="0.72"><title>${escapeXML(summary.name)} · média=${format(summary.avg, digits)} · DP=${format(summary.sd, digits)} · N=${summary.n} curvas sintéticas</title></rect>`);
      const topError = y(Math.min(maxVal, summary.avg + summary.sd));
      const bottomError = y(Math.max(0, summary.avg - summary.sd));
      content.push(`<line x1="${x(summary.index)}" y1="${topError}" x2="${x(summary.index)}" y2="${bottomError}" stroke="#e8efff" stroke-width="1.2"/><line x1="${x(summary.index)-5}" y1="${topError}" x2="${x(summary.index)+5}" y2="${topError}" stroke="#e8efff" stroke-width="1.2"/><line x1="${x(summary.index)-5}" y1="${bottomError}" x2="${x(summary.index)+5}" y2="${bottomError}" stroke="#e8efff" stroke-width="1.2"/>`);
      content.push(`<text class="plot-label" x="${x(summary.index)}" y="${Math.max(margin.top + 10, top - 7)}" text-anchor="middle">${format(summary.avg, 2)}</text>`);
    });
    setSvg(svgId, content.join(''));
  }

  function drawClassDistribution(svgId, metricKey, xAxisLabel, digits = 3) {
    const dataByClass = SYNTHETIC_CLASSES.map(classDef => ({ ...classDef, values: MULTIBAND.rows.filter(row => row.classKey === classDef.key).map(row => row[metricKey]).filter(Number.isFinite) }));
    const all = dataByClass.flatMap(group => group.values);
    const width = 700, height = 290, margin = { top: 18, right: 18, bottom: 48, left: 59 };
    if (!all.length) { setSvg(svgId, '<text x="350" y="140" text-anchor="middle">Sem valores finitos para este gráfico</text>'); return; }
    const min0 = Math.min(...all), max0 = Math.max(...all);
    const pad = Math.max((max0 - min0) * 0.06, 0.025);
    const min = min0 - pad, max = max0 + pad;
    const bins = 14, binWidth = (max - min) / bins;
    const counts = dataByClass.map(group => Array.from({ length: bins }, () => 0));
    dataByClass.forEach((group, gi) => group.values.forEach(value => {
      const bin = Math.max(0, Math.min(bins - 1, Math.floor((value - min) / binWidth)));
      counts[gi][bin] += 1;
    }));
    const fractions = counts.map((group, gi) => group.map(value => value / Math.max(1, dataByClass[gi].values.length)));
    const ymax = Math.max(0.05, ...fractions.flat()) * 1.16;
    const x = value => margin.left + (value - min) / (max - min || 1) * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - value / ymax * (height - margin.top - margin.bottom);
    const xTicks = Array.from({ length: 5 }, (_, i) => { const value = min + (max - min) * i / 4; return { value, label: format(value, digits) }; });
    const yTicks = Array.from({ length: 5 }, (_, i) => ({ value: ymax * i / 4, label: `${Math.round(ymax * i * 25)}%` }));
    const content = [plotFrame(width, height, margin, xTicks, yTicks, xAxisLabel, 'Fração da classe / intervalo', x, y)];
    const groupWidth = (width - margin.left - margin.right) / bins * 0.83;
    fractions.forEach((group, gi) => group.forEach((fraction, bin) => {
      const x0 = x(min + bin * binWidth) + (width - margin.left - margin.right) / bins * 0.085 + gi * groupWidth / 3;
      const barWidth = groupWidth / 3 * 0.92;
      const top = y(fraction);
      content.push(`<rect x="${x0}" y="${top}" width="${barWidth}" height="${height - margin.bottom - top}" fill="${dataByClass[gi].color}" opacity="0.72" rx="1"><title>${escapeXML(dataByClass[gi].label)} · intervalo ${format(min + bin * binWidth, digits)}–${format(min + (bin + 1) * binWidth, digits)} · ${format(fraction * 100, 1)}% dos registros da classe · N=${dataByClass[gi].values.length}</title></rect>`);
    }));
    setSvg(svgId, content.join(''));
  }

  function drawScatter(svgId, records, xGetter, yGetter, xAxisLabel, yAxisLabel, options = {}) {
    const points = records.map(row => ({ row, x: xGetter(row), y: yGetter(row) })).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y) && (!options.logY || point.y > 0) && (!options.logX || point.x > 0));
    const width = options.width || 900, height = options.height || 330;
    const margin = options.margin || { top: 20, right: 24, bottom: 50, left: 68 };
    if (points.length < 2) { setSvg(svgId, `<text class="plot-label" x="${width/2}" y="${height/2}" text-anchor="middle">Dados demonstrativos insuficientes</text>`); return; }
    let minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
    let minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
    if (options.logX) { minX = Math.log10(minX); maxX = Math.log10(maxX); }
    if (options.logY) { minY = Math.log10(minY); maxY = Math.log10(maxY); }
    const xPad = Math.max((maxX - minX) * 0.08, options.logX || options.logY ? 0.05 : 0.01);
    const yPad = Math.max((maxY - minY) * 0.1, options.logY ? 0.08 : 0.01);
    minX -= xPad; maxX += xPad; minY -= yPad; maxY += yPad;
    const X = value => { const v = options.logX ? Math.log10(value) : value; return margin.left + (v - minX) / (maxX - minX || 1) * (width - margin.left - margin.right); };
    const Y = value => { const v = options.logY ? Math.log10(value) : value; return height - margin.bottom - (v - minY) / (maxY - minY || 1) * (height - margin.top - margin.bottom); };
    const xTicks = Array.from({ length: 5 }, (_, i) => { const scaled = minX + (maxX - minX) * i / 4; const value = options.logX ? 10 ** scaled : scaled; return { value, label: format(value, options.xDigits ?? 2) }; });
    const yTicks = Array.from({ length: 5 }, (_, i) => { const scaled = minY + (maxY - minY) * i / 4; const value = options.logY ? 10 ** scaled : scaled; return { value, label: format(value, options.yDigits ?? 2) }; });
    const content = [plotFrame(width, height, margin, xTicks, yTicks, xAxisLabel, yAxisLabel, X, Y)];
    points.forEach(({ row, x, y }) => {
      const cx = X(x), cy = Y(y);
      const tooltip = `${row.source} · ${row.classLabel} · ${row.band}\nSampEn=${format(row.sampen, 4)}\nm_int=${format(row.modulation, 3)}%\nV_rob=${format(row.robustVariability, 3)}%\nH=${format(row.fisherShannon?.H, 4)}\nI_F=${format(row.fisherShannon?.fisher, 4)}\nCI=${format(row.ci, 4)}`;
      content.push(`<circle class="interactive-point" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="3.7" fill="${row.classColor}" fill-opacity="0.72" stroke="${row.classColor}" stroke-width="0.5"><title>${escapeXML(tooltip)}</title></circle>`);
    });
    content.push(`<text class="plot-label" x="${width - margin.right}" y="${margin.top + 1}" text-anchor="end">N = ${points.length} pares fonte × banda sintéticos</text>`);
    setSvg(svgId, content.join(''));
  }

  function drawFisherPopulation() {
    const bandFilter = document.getElementById('fisherBandFilter')?.value || 'all';
    const rows = bandFilter === 'all' ? MULTIBAND.rows : MULTIBAND.rows.filter(row => String(row.bandIndex) === bandFilter);
    drawScatter('fisherPopulationPlot', rows,
      row => row.fisherShannon?.H,
      row => row.fisherShannon?.fisher,
      'Entropia de Shannon H (nats)', 'Informação de Fisher I_F (escala log)',
      { logY: true, width: 900, height: 330, xDigits: 2, yDigits: 2 });
  }

  function drawFisherMetricRelation() {
    const metric = document.getElementById('fisherRelationMetric')?.value || 'modulation';
    const xGetter = metric === 'robust' ? row => row.robustVariability : row => row.modulation;
    const xLabel = metric === 'robust' ? 'Variabilidade robusta relativa V_rob (%)' : 'Índice de modulação intrínseco m_int (%)';
    drawScatter('fisherMetricPlot', MULTIBAND.rows, xGetter, row => row.fisherShannon?.fisher, xLabel, 'Informação de Fisher I_F', { width: 900, height: 330, xDigits: 2, yDigits: 3 });
  }

  function drawMSEBandScale(source) {
    if (!source) return;
    const width = 900, height = 330, margin = { top: 20, right: 24, bottom: 49, left: 60 };
    const allPoints = source.bands.flatMap(row => row.mse.points.map(point => point.value)).filter(Number.isFinite);
    const maxValue = Math.max(...allPoints, Math.log(factorial(WPE_DIMENSION)) * 0.85, 0.3) * 1.1;
    const x = value => margin.left + (value - 1) / (SCALES - 1) * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - value / maxValue * (height - margin.top - margin.bottom);
    const xTicks = Array.from({ length: SCALES }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
    const yTicks = Array.from({ length: 5 }, (_, i) => ({ value: maxValue * i / 4, label: format(maxValue * i / 4, 2) }));
    const content = [plotFrame(width, height, margin, xTicks, yTicks, 'Escala temporal τ', 'WPE (nats; d = 4)', x, y)];
    source.bands.forEach(row => {
      const data = row.mse.points;
      const path = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.scale).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ');
      content.push(`<path d="${path}" fill="none" stroke="${row.bandColor}" stroke-width="2.1" opacity="0.92"><title>${escapeXML(source.name)} · ${escapeXML(row.band)} · CI=${format(row.ci, 4)}</title></path>`);
      data.forEach(p => content.push(`<circle cx="${x(p.scale)}" cy="${y(p.value)}" r="3" fill="${row.bandColor}"><title>${escapeXML(row.band)} · τ=${p.scale} · WPE=${format(p.value, 4)} · N_coarse=${p.n}</title></circle>`));
    });
    content.push(`<text class="plot-label" x="${width - margin.right}" y="${margin.top + 1}" text-anchor="end">Fonte ${escapeXML(source.name)} · CI por banda calculado</text>`);
    setSvg('mseBandScalePlot', content.join(''));
  }

  function drawSensitivityMap(source) {
    const bandIndex = Number(document.getElementById('sensitivityBand')?.value || 0);
    const row = source.bands[bandIndex] || source.bands[0];
    if (!row) return;
    const dimensions = [1, 2, 3];
    const rFactors = [0.1, 0.15, 0.2, 0.25, 0.3];
    const cells = [];
    dimensions.forEach(m => rFactors.forEach(rFactor => {
      const result = calculateSampEn(row.series, m, rFactor);
      cells.push({ m, rFactor, value: result.value, A: result.A, B: result.B });
    }));
    const finite = cells.map(cell => cell.value).filter(Number.isFinite);
    const lo = Math.min(...finite, 0), hi = Math.max(...finite, 1);
    const width = 700, height = 235, margin = { top: 37, right: 18, bottom: 28, left: 84 };
    const cellW = (width - margin.left - margin.right) / rFactors.length;
    const cellH = (height - margin.top - margin.bottom) / dimensions.length;
    const content = [];
    rFactors.forEach((r, i) => content.push(`<text class="plot-label" x="${margin.left + (i + 0.5) * cellW}" y="${margin.top - 12}" text-anchor="middle">${format(r, 2)}σ</text>`));
    dimensions.forEach((m, ri) => {
      const cy = margin.top + ri * cellH;
      content.push(`<text class="plot-axis-title" x="${margin.left - 12}" y="${cy + cellH / 2 + 4}" text-anchor="end">m = ${m}</text>`);
      rFactors.forEach((r, ci) => {
        const cell = cells.find(item => item.m === m && Math.abs(item.rFactor - r) < 1e-9);
        const t = Number.isFinite(cell.value) ? (cell.value - lo) / (hi - lo || 1) : 0;
        const color = Number.isFinite(cell.value) ? `rgb(${Math.round(31 + t * 101)},${Math.round(43 + t * 88)},${Math.round(67 + t * 153)})` : '#333d51';
        const cx = margin.left + ci * cellW;
        content.push(`<rect x="${cx + 2}" y="${cy + 2}" width="${cellW - 4}" height="${cellH - 4}" rx="4" fill="${color}" stroke="rgba(224,235,255,.24)"><title>banda=${escapeXML(row.band)}; m=${m}; r=${r}σ; SampEn=${format(cell.value, 5)}; A=${cell.A}; B=${cell.B}</title></rect>`);
        content.push(`<text x="${cx + cellW / 2}" y="${cy + cellH / 2 + 4}" text-anchor="middle" fill="#f7f8ff" font-size="12" font-weight="650">${format(cell.value, 2)}</text>`);
      });
    });
    content.push(`<text class="plot-label" x="${width - margin.right}" y="${height - 6}" text-anchor="end">${escapeXML(row.band)} · série ${escapeXML(source.name)}</text>`);
    setSvg('sampenSensitivityPlot', content.join(''));
  }

  function drawSampenCorrelations() {
    drawScatter('sampenModPlot', MULTIBAND.rows.filter(row => Number.isFinite(row.modulation)), row => row.modulation, row => row.sampen,
      'Índice de modulação intrínseco m_int (%)', 'Sample Entropy (SampEn)', { width: 700, height: 290, margin: { top: 18, right: 18, bottom: 48, left: 60 }, xDigits: 1, yDigits: 2 });
    drawScatter('sampenRobustPlot', MULTIBAND.rows.filter(row => Number.isFinite(row.robustVariability)), row => row.robustVariability, row => row.sampen,
      'Variabilidade robusta relativa V_rob (%)', 'Sample Entropy (SampEn)', { width: 700, height: 290, margin: { top: 18, right: 18, bottom: 48, left: 60 }, xDigits: 1, yDigits: 2 });
  }

  function drawCIRelation() {
    const metric = document.getElementById('ciRelationMetric')?.value || 'modulation';
    const xGetter = metric === 'robust' ? row => row.robustVariability : row => row.modulation;
    const xLabel = metric === 'robust' ? 'Variabilidade robusta relativa V_rob (%)' : 'Índice de modulação intrínseco m_int (%)';
    drawScatter('ciMetricPlot', MULTIBAND.rows, xGetter, row => row.ci, xLabel, 'Complexity Index (CI; soma das 8 escalas)', { width: 900, height: 330, xDigits: 2, yDigits: 3 });
  }

  function drawCISampEnRelation() {
    const rows = MULTIBAND.rows.filter(row => Number.isFinite(row.sampen) && Number.isFinite(row.ci));
    drawScatter('ciSampEnPlot', rows, row => row.sampen, row => row.ci,
      'Sample Entropy (SampEn)', 'Complexity Index (CI; soma das 8 escalas)',
      { width: 900, height: 330, xDigits: 3, yDigits: 3 });
  }

  function drawMultibandGallery() {
    drawMultibandCurve();
    drawBandMeanChart('sampenBandMeanPlot', 'sampen', 'SampEn média', 3);
    drawClassDistribution('sampenClassDistPlot', 'sampen', 'Sample Entropy (SampEn)', 3);
    drawSampenCorrelations();
    drawFisherPopulation();
    drawFisherMetricRelation();
    drawBandMeanChart('ciBandMeanPlot', 'ci', 'Complexity Index médio', 3);
    drawClassDistribution('ciClassDistPlot', 'ci', 'Complexity Index (CI)', 3);
    drawCIRelation();
    drawCISampEnRelation();
    renderClassLegends();
  }

  function initMultibandGallery() {
    const sourceSelect = document.getElementById('multibandSource');
    if (sourceSelect) {
      sourceSelect.innerHTML = MULTIBAND.sources.map(source => `<option value="${escapeXML(source.name)}">${escapeXML(source.name)} · ${escapeXML(source.classLabel)}</option>`).join('');
      sourceSelect.value = MULTIBAND.sources[0].name;
      sourceSelect.addEventListener('change', () => drawMultibandCurve());
    }
    const sensitivityBand = document.getElementById('sensitivityBand');
    if (sensitivityBand) {
      sensitivityBand.innerHTML = ENERGY_BANDS.map((band, i) => `<option value="${i}">${escapeXML(band.name)}</option>`).join('');
      sensitivityBand.value = '0';
      sensitivityBand.addEventListener('change', () => drawSensitivityMap(sourceFromSelect()));
    }
    const legend = document.getElementById('bandToggleLegend');
    if (legend) {
      legend.innerHTML = ENERGY_BANDS.map((band, i) => `<button class="band-toggle is-on" type="button" data-band-toggle="${i}" aria-pressed="true"><i style="--band-color:${band.color}"></i><span>${escapeXML(band.name)}</span></button>`).join('');
      legend.addEventListener('click', event => {
        const button = event.target?.closest?.('[data-band-toggle]');
        if (!button) return;
        const index = Number(button.dataset.bandToggle);
        if (visibleBands.has(index)) visibleBands.delete(index); else visibleBands.add(index);
        button.classList.toggle('is-on', visibleBands.has(index));
        button.setAttribute('aria-pressed', String(visibleBands.has(index)));
        drawMultibandCurve();
      });
    }
    const fisherBandFilter = document.getElementById('fisherBandFilter');
    if (fisherBandFilter) {
      fisherBandFilter.innerHTML = `<option value="all">Todas as bandas · 192 curvas</option>` + ENERGY_BANDS.map((band, i) => `<option value="${i}">${escapeXML(band.name)} · 24 curvas</option>`).join('');
      fisherBandFilter.value = 'all';
      fisherBandFilter.addEventListener('change', drawFisherPopulation);
    }
    document.getElementById('fisherRelationMetric')?.addEventListener('change', drawFisherMetricRelation);
    document.getElementById('ciRelationMetric')?.addEventListener('change', drawCIRelation);
    renderClassLegends();
    drawMultibandGallery();
  }

  function initMethodTabs() {
    const tabs = Array.from(document.querySelectorAll('[data-method-tab]'));
    const panels = Array.from(document.querySelectorAll('[data-method-panel]'));
    const activate = key => {
      tabs.forEach(tab => {
        const active = tab.dataset.methodTab === key;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => {
        const active = panel.dataset.methodPanel === key;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset.methodTab));
      tab.addEventListener('keydown', event => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next]?.focus();
        activate(tabs[next]?.dataset.methodTab);
      });
    });
    if (tabs.length) activate('sampen');
  }

  const INTERACTIVE_CHART_IDS = [
    'lightcurvePlot', 'sampenPlot', 'fisherPlot', 'msePlot', 'multibandCurvePlot',
    'sampenBandMeanPlot', 'sampenClassDistPlot', 'sampenModPlot', 'sampenRobustPlot', 'sampenSensitivityPlot',
    'fisherPopulationPlot', 'fisherMetricPlot', 'mseBandScalePlot', 'ciBandMeanPlot', 'ciClassDistPlot', 'ciMetricPlot', 'ciSampEnPlot'
  ];

  function readViewBox(svg) {
    const raw = svg.getAttribute('viewBox') || svg.dataset.baseViewBox || '0 0 900 300';
    const nums = raw.trim().split(/[ ,]+/).map(Number);
    return { x: nums[0], y: nums[1], w: nums[2], h: nums[3] };
  }
  function writeViewBox(svg, box) {
    const base = readBaseViewBox(svg);
    const w = Math.max(base.w * 0.08, Math.min(base.w, box.w));
    const h = Math.max(base.h * 0.08, Math.min(base.h, box.h));
    const x = Math.max(-base.w * 2, Math.min(base.w * 3 - w, box.x));
    const y = Math.max(-base.h * 2, Math.min(base.h * 3 - h, box.y));
    svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  }
  function readBaseViewBox(svg) {
    const raw = svg.dataset.baseViewBox || svg.getAttribute('data-base-viewbox') || svg.getAttribute('viewBox') || '0 0 900 300';
    const n = raw.trim().split(/[ ,]+/).map(Number);
    return { x: n[0], y: n[1], w: n[2], h: n[3] };
  }
  function resetViewBox(svg) {
    const base = readBaseViewBox(svg);
    svg.setAttribute('viewBox', `${base.x} ${base.y} ${base.w} ${base.h}`);
  }
  function zoomSvg(svg, factor, clientX = null, clientY = null) {
    const box = readViewBox(svg);
    const rect = svg.getBoundingClientRect();
    const cx = clientX == null || !rect.width ? box.x + box.w / 2 : box.x + (clientX - rect.left) / rect.width * box.w;
    const cy = clientY == null || !rect.height ? box.y + box.h / 2 : box.y + (clientY - rect.top) / rect.height * box.h;
    writeViewBox(svg, { x: cx - (cx - box.x) * factor, y: cy - (cy - box.y) * factor, w: box.w * factor, h: box.h * factor });
  }

  function exportSvgPng(svg, filename) {
    if (typeof document.createElement !== 'function' || typeof Image === 'undefined') return;
    const clone = svg.cloneNode(true);
    const box = readViewBox(svg);
    const width = Math.max(900, Math.round(box.w * 2));
    const height = Math.max(500, Math.round(box.h * 2));
    clone.setAttribute('xmlns', NS);
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    const style = document.createElementNS ? document.createElementNS(NS, 'style') : document.createElement('style');
    style.textContent = '.plot-grid{stroke:#28364d;stroke-width:1}.plot-label{font-family:Arial,sans-serif;font-size:10px;fill:#8d9db8}.plot-axis{stroke:#667691;stroke-width:1}.plot-axis-title{font-family:Arial,sans-serif;font-size:10px;fill:#bdc9dd}.plot-tooltip{font-family:Arial,sans-serif;font-size:11px;fill:#ecf2ff}.plane-point{stroke:#101a2b;stroke-width:1.5}.interactive-point{stroke-width:.5}.bar-soft{fill:#9697ff;opacity:.36}.bar-strong{fill:#9697ff}.plot-point{stroke:#101a2b;stroke-width:1}.plot-line{fill:none;stroke-linejoin:round;stroke-linecap:round}';
    clone.insertBefore(style, clone.firstChild);
    const bg = document.createElementNS ? document.createElementNS(NS, 'rect') : null;
    if (bg) { bg.setAttribute('x', String(box.x)); bg.setAttribute('y', String(box.y)); bg.setAttribute('width', String(box.w)); bg.setAttribute('height', String(box.h)); bg.setAttribute('fill', '#101a2b'); clone.insertBefore(bg, style); }
    const svgText = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); return; }
      ctx.fillStyle = '#101a2b'; ctx.fillRect(0, 0, width, height); ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = blobUrl; a.download = filename; a.click(); URL.revokeObjectURL(blobUrl);
        }
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    image.onerror = () => { URL.revokeObjectURL(url); };
    image.src = url;
  }

  function initializeChartInteractions() {
    // In the lightweight unit-test DOM, these browser APIs may not be implemented.
    if (typeof document.createElement !== 'function') return;
    INTERACTIVE_CHART_IDS.forEach(id => {
      const svg = document.getElementById(id);
      if (!svg || typeof svg.closest !== 'function' || svg.dataset.chartControlsReady === 'true') return;
      const frame = svg.closest('.chart-frame');
      if (!frame || !frame.parentElement) return;
      const base = svg.getAttribute('viewBox') || '0 0 900 300';
      svg.dataset.baseViewBox = base;
      svg.dataset.chartControlsReady = 'true';
      svg.classList.add('interactive-svg-chart');
      const toolbar = document.createElement('div');
      toolbar.className = 'chart-tools'; toolbar.setAttribute('role', 'toolbar'); toolbar.setAttribute('aria-label', `Controles de ${id}`);
      const makeButton = (label, title, callback, extra = '') => {
        const button = document.createElement('button'); button.type = 'button'; button.className = `chart-tool-button ${extra}`.trim(); button.textContent = label; button.title = title; button.setAttribute('aria-label', title); button.addEventListener('click', callback); toolbar.appendChild(button); return button;
      };
      makeButton('−', 'Diminuir zoom', () => zoomSvg(svg, 1.25));
      makeButton('+', 'Aumentar zoom', () => zoomSvg(svg, 0.8));
      makeButton('Reset', 'Restaurar escala original', () => resetViewBox(svg), 'chart-tool-reset');
      makeButton('Tela cheia', 'Abrir o gráfico em tela cheia', async () => {
        const target = svg.closest('.multiband-chart-card, .demo-panel, .demo-primary-chart, .multiband-source-panel') || frame.parentElement;
        try {
          if (target.requestFullscreen && !document.fullscreenElement) await target.requestFullscreen();
          else if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
          else target.classList.toggle('is-fullscreen-fallback');
        } catch (_) { target.classList.toggle('is-fullscreen-fallback'); }
      }, 'chart-tool-fullscreen');
      makeButton('PNG', 'Salvar imagem deste gráfico como PNG', () => exportSvgPng(svg, `blazarlab-${id.replace(/[^a-z0-9_-]/gi, '-')}.png`), 'chart-tool-download');
      const hint = document.createElement('span'); hint.className = 'chart-tool-hint'; hint.textContent = 'Ctrl + roda: zoom · Ctrl + arraste: mover'; toolbar.appendChild(hint);
      frame.parentElement.insertBefore(toolbar, frame);
      svg.addEventListener('wheel', event => {
        if (!event.ctrlKey) return;
        event.preventDefault(); zoomSvg(svg, event.deltaY < 0 ? 0.88 : 1.14, event.clientX, event.clientY);
      }, { passive: false });
      let drag = null;
      svg.addEventListener('pointerdown', event => {
        if (!event.ctrlKey || event.button !== 0) return;
        const box = readViewBox(svg), rect = svg.getBoundingClientRect();
        drag = { x: event.clientX, y: event.clientY, box, rect };
        svg.classList.add('is-panning');
        try { svg.setPointerCapture(event.pointerId); } catch (_) {}
        event.preventDefault();
      });
      svg.addEventListener('pointermove', event => {
        if (!drag) return;
        const dx = (event.clientX - drag.x) * drag.box.w / Math.max(1, drag.rect.width);
        const dy = (event.clientY - drag.y) * drag.box.h / Math.max(1, drag.rect.height);
        writeViewBox(svg, { x: drag.box.x - dx, y: drag.box.y - dy, w: drag.box.w, h: drag.box.h });
      });
      const stopDrag = () => { drag = null; svg.classList.remove('is-panning'); };
      svg.addEventListener('pointerup', stopDrag); svg.addEventListener('pointercancel', stopDrag); svg.addEventListener('lostpointercapture', stopDrag);
    });
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
    initMultibandGallery();
    initMethodTabs();
    initializeChartInteractions();
    document.documentElement.classList.toggle('reduce-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
