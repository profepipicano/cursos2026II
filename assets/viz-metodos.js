/* ══════════════════════════════════════════════════════════
   Visualizadores · Métodos Numéricos
   ----------------------------------------------------------
   cancelacion   §4  pérdida de cifras al restar números cercanos
   iteracion     §5  convergencia de una sucesión iterativa
   taylor        §6  polinomio de Taylor y su error
   cota-taylor   §6.5 error real frente a la cota de Lagrange
   biseccion     (semana 8 · métodos cerrados)
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', ROJO = '#b0392c', VERDE = '#1c7a4c', MORADO = '#7d4f9e';
function q(host, sel) { return host.querySelector(sel); }
function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }

/* Redondea a d cifras significativas: simula una máquina de precisión limitada */
function sig(v, d) {
  if (v === 0 || !isFinite(v)) return v;
  var m = Math.pow(10, d - 1 - Math.floor(Math.log10(Math.abs(v))));
  return Math.round(v * m) / m;
}

/* ══════ §4 · Cancelación catastrófica ══════ */
OVA.viz.registrar('cancelacion', function (host) {
  var d = parseInt(q(host, '.cifras').value, 10);
  var X = parseFloat(q(host, '.xval').value);
  q(host, '.cifras-val').textContent = d + ' cifras significativas';
  q(host, '.x-val').textContent = 'x = ' + X;

  function calcular(d) {
    var a = sig(Math.sqrt(X + 1), d), b = sig(Math.sqrt(X), d);
    var ingenuo = sig(a - b, d);
    var estable = sig(1 / sig(a + b, d), d);
    var exacto = 1 / (Math.sqrt(X + 1) + Math.sqrt(X));
    return {
      a: a, b: b, ingenuo: ingenuo, estable: estable, exacto: exacto,
      erI: Math.abs(ingenuo - exacto) / exacto,
      erE: Math.abs(estable - exacto) / exacto
    };
  }
  var r = calcular(d);

  // Gráfica: error relativo de cada camino según las cifras disponibles
  var L = OVA.lienzo(q(host, 'canvas'), { alto: 240 });
  var c = L.ctx, mIzq = 46, mAb = 30, mAr = 16, mDer = 12;
  var W = L.w - mIzq - mDer, H = L.h - mAb - mAr;
  var dmin = 3, dmax = 15;
  var px = function (dd) { return mIzq + (dd - dmin) / (dmax - dmin) * W; };
  // escala logarítmica en el error: de 1e-16 a 1e0
  var py = function (e) {
    var t = Math.max(Math.min(Math.log10(Math.max(e, 1e-17)), 0), -16);
    return mAr + (-t) / 16 * H;
  };

  c.strokeStyle = OVA.color('cv-grid'); c.lineWidth = 1;
  for (var k = 0; k >= -16; k -= 4) {
    c.beginPath(); c.moveTo(mIzq, py(Math.pow(10, k))); c.lineTo(mIzq + W, py(Math.pow(10, k))); c.stroke();
    c.fillStyle = OVA.color('cv-text'); c.font = '9px ui-monospace,monospace';
    c.fillText('1e' + k, 6, py(Math.pow(10, k)) + 3);
  }
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mIzq, mAr); c.lineTo(mIzq, mAr + H); c.lineTo(mIzq + W, mAr + H); c.stroke();
  c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
  for (var dd = dmin; dd <= dmax; dd += 2) c.fillText(String(dd), px(dd) - 4, L.h - 10);
  c.font = 'bold 10px ui-monospace,monospace';
  c.fillText('cifras significativas disponibles', mIzq + W / 2 - 80, L.h - 1);

  [['erI', ROJO, 'camino ingenuo: √(x+1) − √x'],
   ['erE', VERDE, 'camino estable: 1/(√(x+1)+√x)']].forEach(function (par, idx) {
    c.strokeStyle = par[1]; c.lineWidth = 2.6; c.beginPath();
    for (var dd = dmin; dd <= dmax; dd++) {
      var e = calcular(dd)[par[0]];
      var Px = px(dd), Py = py(e);
      if (dd === dmin) c.moveTo(Px, Py); else c.lineTo(Px, Py);
    }
    c.stroke();
    c.fillStyle = par[1]; c.font = 'bold 11px ui-monospace,monospace';
    c.fillText('— ' + par[2], mIzq + 8, mAr + 14 + idx * 15);
  });
  // marca de la posición actual
  c.strokeStyle = ORO; c.lineWidth = 1.5; c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(px(d), mAr); c.lineTo(px(d), mAr + H); c.stroke();
  c.setLineDash([]);

  var perdidas = r.erI > 0 ? Math.max(0, Math.round(Math.log10(r.erI / Math.max(r.erE, 1e-17)))) : 0;
  q(host, '.viz-readout').innerHTML =
    '<strong>Con ' + d + ' cifras significativas:</strong><br>' +
    '√(x+1) = ' + r.a + ' &nbsp;·&nbsp; √x = ' + r.b + '<br>' +
    '<span style="color:#f0a58a">Ingenuo:</span> ' + r.a + ' − ' + r.b + ' = <strong>' + r.ingenuo + '</strong>' +
      ' &nbsp;(error relativo ' + r.erI.toExponential(2) + ')<br>' +
    '<span style="color:#7fd4a4">Estable:</span> 1/(' + sig(r.a + r.b, d) + ') = <strong>' + r.estable + '</strong>' +
      ' &nbsp;(error relativo ' + r.erE.toExponential(2) + ')<br>' +
    'Valor exacto: ' + r.exacto.toPrecision(12) + '<br>' +
    '<span style="color:#8fb4d9">La resta destruye alrededor de <strong>' + perdidas + ' cifras</strong>. ' +
    'Ambas expresiones son álgebra equivalente; solo una sobrevive a la aritmética finita.</span>';
});

/* ══════ §5 · Convergencia de un método iterativo ══════ */
var ITER = {
  heron2:  { g: function (x) { return (x + 2 / x) / 2; },  x0: 1,   L: Math.SQRT2,
             n: 'Herón:  xₙ₊₁ = (xₙ + 2/xₙ)/2', obj: '√2 = 1,41421356237309…' },
  heron10: { g: function (x) { return (x + 10 / x) / 2; }, x0: 3,   L: Math.sqrt(10),
             n: 'Herón:  xₙ₊₁ = (xₙ + 10/xₙ)/2', obj: '√10 = 3,16227766016838…' },
  coseno:  { g: function (x) { return Math.cos(x); },      x0: 1,   L: 0.7390851332151607,
             n: 'Punto fijo:  xₙ₊₁ = cos(xₙ)', obj: 'solución de x = cos x' },
  expneg:  { g: function (x) { return Math.exp(-x); },     x0: 0.5, L: 0.5671432904097838,
             n: 'Punto fijo:  xₙ₊₁ = e^(−xₙ)', obj: 'solución de x = e⁻ˣ' }
};

OVA.viz.registrar('iteracion', function (host) {
  var cfg = ITER[q(host, 'select').value] || ITER.heron2;
  var N = parseInt(q(host, '.iters').value, 10);
  q(host, '.iters-val').textContent = N + ' iteraciones';

  var filas = [], x = cfg.x0, prev = null;
  for (var i = 0; i <= N; i++) {
    var ea = (prev === null || x === 0) ? NaN : Math.abs((x - prev) / x);
    filas.push({ i: i, x: x, ea: ea, err: Math.abs(x - cfg.L) });
    prev = x;
    x = cfg.g(x);
    if (!isFinite(x)) break;
  }

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 230 });
  var c = L.ctx, mIzq = 52, mAb = 26, mAr = 18, mDer = 14;
  var W = L.w - mIzq - mDer, H = L.h - mAb - mAr;
  var vals = filas.map(function (f) { return f.x; }).concat([cfg.L]);
  var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  var pad = (hi - lo) * 0.18 || 0.5; lo -= pad; hi += pad;
  var PX = function (i) { return mIzq + (filas.length > 1 ? i / (filas.length - 1) : 0.5) * W; };
  var PY = function (v) { return mAr + (hi - v) / (hi - lo) * H; };

  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mIzq, mAr); c.lineTo(mIzq, mAr + H); c.lineTo(mIzq + W, mAr + H); c.stroke();

  // recta del límite
  c.strokeStyle = ORO; c.lineWidth = 2; c.setLineDash([6, 4]);
  c.beginPath(); c.moveTo(mIzq, PY(cfg.L)); c.lineTo(mIzq + W, PY(cfg.L)); c.stroke();
  c.setLineDash([]);
  c.fillStyle = ORO; c.font = 'bold 10px ui-monospace,monospace';
  c.fillText('límite', mIzq + W - 42, PY(cfg.L) - 6);

  // sucesión
  c.strokeStyle = AZUL; c.lineWidth = 2.4; c.beginPath();
  filas.forEach(function (f, i) { i ? c.lineTo(PX(i), PY(f.x)) : c.moveTo(PX(i), PY(f.x)); });
  c.stroke();
  c.fillStyle = AZUL;
  filas.forEach(function (f, i) { c.beginPath(); c.arc(PX(i), PY(f.x), 3.5, 0, 6.2832); c.fill(); });

  c.fillStyle = OVA.color('cv-text'); c.font = '9px ui-monospace,monospace';
  c.fillText(hi.toFixed(3), 4, mAr + 4);
  c.fillText(lo.toFixed(3), 4, mAr + H);
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillText(cfg.n, mIzq + 8, mAr + 12);
  c.font = '10px ui-monospace,monospace';
  c.fillText('n', mIzq + W / 2, L.h - 6);

  var t = '<table class="tbl" style="margin:0;font-size:.8rem"><tr>' +
    '<th>n</th><th>xₙ</th><th>|εₐ|</th><th>error real</th><th>cifras correctas</th></tr>';
  filas.slice(-9).forEach(function (f) {
    var cif = f.err > 0 ? Math.max(0, Math.floor(-Math.log10(f.err / Math.abs(cfg.L)))) : 16;
    t += '<tr><td>' + f.i + '</td><td><strong>' + f.x.toPrecision(12) + '</strong></td><td>' +
      (isFinite(f.ea) ? (f.ea * 100).toExponential(3) + ' %' : '—') + '</td><td>' +
      (f.err > 0 ? f.err.toExponential(2) : '0') + '</td><td>' + Math.min(cif, 16) + '</td></tr>';
  });
  q(host, '.tabla-iter').innerHTML = t + '</table>';

  var u = filas[filas.length - 1];
  q(host, '.viz-readout').innerHTML =
    'Objetivo: <strong>' + cfg.obj + '</strong><br>' +
    'Tras ' + u.i + ' iteraciones: <strong>' + u.x.toPrecision(14) + '</strong>' +
    ' &nbsp;·&nbsp; error ' + (u.err > 0 ? u.err.toExponential(2) : '0') + '<br>' +
    '<span style="color:#8fb4d9">Ningún paso da la respuesta exacta. La sucesión se acerca, y somos ' +
    'nosotros quienes decidimos cuándo es suficiente: eso es un método iterativo.</span>';
});

/* ══════ §6 · Polinomio de Taylor ══════ */
var TAY = {
  exp: { f: Math.exp, t: function (x, n) { var s = 0; for (var k = 0; k <= n; k++) s += Math.pow(x, k) / fact(k); return s; },
         n: 'eˣ', M: function (r) { return Math.exp(r); } },
  sin: { f: Math.sin, t: function (x, n) { var s = 0; for (var k = 1; k <= n; k += 2) s += Math.pow(-1, (k - 1) / 2) * Math.pow(x, k) / fact(k); return s; },
         n: 'sen x', M: function () { return 1; } },
  cos: { f: Math.cos, t: function (x, n) { var s = 0; for (var k = 0; k <= n; k += 2) s += Math.pow(-1, k / 2) * Math.pow(x, k) / fact(k); return s; },
         n: 'cos x', M: function () { return 1; } }
};

OVA.viz.registrar('taylor', function (host) {
  var cfg = TAY[q(host, 'select').value] || TAY.exp;
  var n = parseInt(q(host, '.grado').value, 10);
  var xe = parseFloat(q(host, '.punto').value) / 10;
  q(host, '.grado-val').textContent = 'n = ' + n;
  q(host, '.punto-val').textContent = 'x = ' + xe.toFixed(1);

  var L = OVA.lienzo(q(host, 'canvas'), { sx: 46, sy: 30 });
  L.oy = L.h * 0.62;
  OVA.ejes(L);
  OVA.curva(L, cfg.f, AZUL, 3);
  OVA.curva(L, function (x) { return cfg.t(x, n); }, ORO, 2.2);

  var real = cfg.f(xe), aprox = cfg.t(xe, n), c = L.ctx;
  c.strokeStyle = ROJO; c.lineWidth = 2; c.setLineDash([3, 3]);
  c.beginPath(); c.moveTo(L.px(xe), L.py(real)); c.lineTo(L.px(xe), L.py(aprox)); c.stroke();
  c.setLineDash([]);
  OVA.punto(L, xe, real, AZUL); OVA.punto(L, xe, aprox, ORO);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText('— ' + cfg.n + '     — Pₙ(x) con n = ' + n, 10, 18);

  var ea = Math.abs(real - aprox), er = real !== 0 ? ea / Math.abs(real) : NaN;
  q(host, '.viz-readout').innerHTML =
    'Valor exacto: <strong>' + real.toFixed(10) + '</strong><br>' +
    'Aproximación P<sub>' + n + '</sub>: <strong>' + aprox.toFixed(10) + '</strong><br>' +
    'Error absoluto: <strong style="color:#f0a58a">' + ea.toExponential(3) + '</strong>' +
    ' &nbsp;·&nbsp; relativo: <strong style="color:#f0a58a">' +
      (isFinite(er) ? (er * 100).toExponential(3) + ' %' : '—') + '</strong><br>' +
    '<span style="color:#8fb4d9">Sube el grado y el error cae; aléjate del centro y vuelve a crecer. ' +
    'Taylor es una aproximación local.</span>';
});

/* ══════ §6.5 · Error real frente a la cota de Lagrange ══════ */
OVA.viz.registrar('cota-taylor', function (host) {
  var cfg = TAY[q(host, 'select').value] || TAY.exp;
  var n = parseInt(q(host, '.grado').value, 10);
  var r = parseFloat(q(host, '.radio').value) / 10;
  q(host, '.grado-val').textContent = 'n = ' + n;
  q(host, '.radio-val').textContent = 'intervalo [−' + r.toFixed(1) + ', ' + r.toFixed(1) + ']';

  var M = cfg.M(r);
  var errReal = function (x) { return Math.abs(cfg.f(x) - cfg.t(x, n)); };
  var cota = function (x) { return M * Math.pow(Math.abs(x), n + 1) / fact(n + 1); };

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 250 });
  var c = L.ctx, mIzq = 62, mAb = 28, mAr = 30, mDer = 14;
  var W = L.w - mIzq - mDer, H = L.h - mAb - mAr;
  var maxY = cota(r) || 1e-12;
  var PX = function (x) { return mIzq + (x + r) / (2 * r) * W; };
  var PY = function (v) { return mAr + H - Math.min(v / maxY, 1) * H; };

  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mIzq, mAr); c.lineTo(mIzq, mAr + H); c.lineTo(mIzq + W, mAr + H); c.stroke();

  // zona entre el error real y la cota
  c.fillStyle = 'rgba(198,143,46,.18)';
  c.beginPath(); c.moveTo(PX(-r), PY(cota(-r)));
  for (var x = -r; x <= r; x += 2 * r / 300) c.lineTo(PX(x), PY(cota(x)));
  for (var x2 = r; x2 >= -r; x2 -= 2 * r / 300) c.lineTo(PX(x2), PY(errReal(x2)));
  c.closePath(); c.fill();

  [[cota, ORO, 3], [errReal, ROJO, 2.6]].forEach(function (par) {
    c.strokeStyle = par[1]; c.lineWidth = par[2]; c.beginPath();
    var primero = true;
    for (var x = -r; x <= r; x += 2 * r / 400) {
      var Y = PY(par[0](x));
      if (primero) { c.moveTo(PX(x), Y); primero = false; } else c.lineTo(PX(x), Y);
    }
    c.stroke();
  });

  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = ORO; c.fillText('— cota de Lagrange:  M·|x|ⁿ⁺¹/(n+1)!', mIzq + 8, 14);
  c.fillStyle = ROJO; c.fillText('— error real:  |f(x) − Pₙ(x)|', mIzq + 8, 26);
  c.fillStyle = OVA.color('cv-text'); c.font = '9px ui-monospace,monospace';
  c.fillText(maxY.toExponential(1), 4, mAr + 4);
  c.fillText('0', 4, mAr + H);
  c.font = '10px ui-monospace,monospace';
  c.fillText('−' + r.toFixed(1), mIzq - 8, L.h - 10);
  c.fillText(r.toFixed(1), mIzq + W - 8, L.h - 10);
  c.fillText('0', mIzq + W / 2 - 3, L.h - 10);

  var eB = errReal(r), cB = cota(r);
  q(host, '.viz-readout').innerHTML =
    'En el peor punto del intervalo (x = ' + r.toFixed(1) + '), con M = ' + M.toPrecision(4) + ':<br>' +
    'Error real: <strong style="color:#f0a58a">' + eB.toExponential(3) + '</strong>' +
    ' &nbsp;·&nbsp; Cota garantizada: <strong style="color:#dba949">' + cB.toExponential(3) + '</strong>' +
    ' &nbsp;(la cota es ' + (eB > 0 ? (cB / eB).toFixed(1) : '∞') + ' veces mayor)<br>' +
    '<span style="color:#8fb4d9">La franja dorada es lo que <em>sobra</em>. La cota nunca queda por ' +
    'debajo del error real: por eso sirve como garantía, aunque sea pesimista.</span>';
});

/* ══════ Semana 8 · Bisección ══════ */
var BIS = {
  a: { f: function (x) { return x * x * x - x - 2; }, n: 'f(x) = x³ − x − 2', a: 1, b: 2 },
  b: { f: function (x) { return Math.cos(x) - x; },   n: 'f(x) = cos x − x',  a: 0, b: 1 },
  c: { f: function (x) { return Math.exp(x) - 3 * x; }, n: 'f(x) = eˣ − 3x',  a: 0, b: 1 }
};

OVA.viz.registrar('biseccion', function (host) {
  var cfg = BIS[q(host, 'select').value] || BIS.a;
  var iters = parseInt(q(host, '.iters').value, 10);
  q(host, '.iters-val').textContent = iters + ' iteraciones';
  var a = cfg.a, b = cfg.b, filas = [], m = a, prev = null;
  for (var k = 1; k <= iters; k++) {
    m = (a + b) / 2;
    filas.push({ k: k, a: a, b: b, m: m, fm: cfg.f(m), ea: prev === null ? NaN : Math.abs((m - prev) / m) });
    if (cfg.f(a) * cfg.f(m) < 0) b = m; else a = m;
    prev = m;
  }
  var L = OVA.lienzo(q(host, 'canvas'), { alto: 210, sx: 1, sy: 1 });
  var x0 = cfg.a - (cfg.b - cfg.a) * 0.15, x1 = cfg.b + (cfg.b - cfg.a) * 0.15;
  L.sx = L.w / (x1 - x0); L.ox = -x0 * L.sx;
  var vals = []; for (var i = 0; i <= 100; i++) vals.push(cfg.f(x0 + (x1 - x0) * i / 100));
  var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  L.sy = L.h * 0.8 / (hi - lo); L.oy = L.h * 0.9 + lo * L.sy;
  OVA.ejes(L); OVA.curva(L, cfg.f, AZUL, 2.5);
  var u = filas[filas.length - 1];
  L.ctx.fillStyle = 'rgba(198,143,46,.22)';
  L.ctx.fillRect(L.px(u.a), 0, (u.b - u.a) * L.sx, L.h);
  OVA.punto(L, u.m, cfg.f(u.m), ROJO);
  L.ctx.fillStyle = OVA.color('cv-text'); L.ctx.font = 'bold 12px ui-monospace,monospace';
  L.ctx.fillText(cfg.n, 10, 16);
  var t = '<table class="tbl" style="margin:0;font-size:.8rem"><tr><th>i</th><th>a</th><th>b</th><th>m</th><th>f(m)</th><th>|εₐ|</th></tr>';
  filas.slice(-8).forEach(function (f) {
    t += '<tr><td>' + f.k + '</td><td>' + f.a.toFixed(6) + '</td><td>' + f.b.toFixed(6) +
      '</td><td><strong>' + f.m.toFixed(6) + '</strong></td><td>' + f.fm.toExponential(2) +
      '</td><td>' + (isFinite(f.ea) ? (f.ea * 100).toFixed(4) + ' %' : '—') + '</td></tr>';
  });
  q(host, '.tabla-iter').innerHTML = t + '</table>';
  q(host, '.viz-readout').innerHTML =
    'Raíz aproximada tras ' + iters + ' iteraciones: <strong>' + u.m.toFixed(8) + '</strong><br>' +
    'Amplitud del intervalo: <strong>' + Math.abs(u.b - u.a).toExponential(3) + '</strong> ' +
    '(se divide exactamente a la mitad cada paso: convergencia lineal).';
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
