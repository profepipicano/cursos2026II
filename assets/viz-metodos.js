/* ══════════════════════════════════════════════════════════
   Visualizadores · Métodos Numéricos
   ----------------------------------------------------------
   cancelacion   §4  pérdida de cifras al restar números cercanos
   iteracion     §5  convergencia de una sucesión iterativa
   taylor        §6  polinomio de Taylor y su error
   cota-taylor   §6.5 error real frente a la cota de Lagrange
   sustitucion   S01 §2  sustitución hacia atrás
   riemann       S01 §4  sumas de Riemann y convergencia
   gauss         S03 §2-3 eliminación paso a paso (Gauss / Gauss-Jordan)
   pivoteo       S03 §5  por qué hace falta intercambiar filas
   costo         S03 §4  n³/3 contra (n+1)!
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

/* ══════ S01 · Sustitución hacia atrás en un sistema triangular ══════ */
var TRI = {
  a: { n: '3×3', M: [[3,2,-1],[0,4,3],[0,0,2]], b: [3,10,4],
       v: ['x','y','z'], sol: [1,1,2] },
  b: { n: '3×3', M: [[2,3,-1],[0,-1,4],[0,0,3]], b: [5,10,9],
       v: ['x','y','z'], sol: [1,2,3] },
  c: { n: '4×4', M: [[1,2,-1,1],[0,3,1,-2],[0,0,2,4],[0,0,0,5]], b: [7,1,14,15],
       v: ['x₁','x₂','x₃','x₄'], sol: [1,2,1,3] }
};

OVA.viz.registrar('sustitucion', function (host) {
  var cfg = TRI[q(host, 'select').value] || TRI.a;
  var n = cfg.M.length;
  var sl = q(host, '.paso');
  sl.max = n;
  var paso = Math.min(parseInt(sl.value, 10), n);
  q(host, '.paso-val').textContent = paso + ' de ' + n + ' incógnitas';

  // resolver de abajo hacia arriba
  var xs = new Array(n).fill(null), detalle = [];
  for (var s = 0; s < paso; s++) {
    var i = n - 1 - s, suma = 0, terminos = [];
    for (var j = i + 1; j < n; j++) {
      if (cfg.M[i][j] !== 0) {
        suma += cfg.M[i][j] * xs[j];
        terminos.push('(' + cfg.M[i][j] + ')(' + xs[j] + ')');
      }
    }
    xs[i] = (cfg.b[i] - suma) / cfg.M[i][i];
    detalle.push({
      i: i, v: cfg.v[i], coef: cfg.M[i][i], rhs: cfg.b[i],
      terminos: terminos, suma: suma, val: xs[i]
    });
  }

  // matriz aumentada
  var t = '<table class="tbl" style="margin:0;font-size:.85rem;text-align:center"><tr>';
  cfg.v.forEach(function (v) { t += '<th style="text-align:center">' + v + '</th>'; });
  t += '<th style="text-align:center">=</th></tr>';
  for (var r = 0; r < n; r++) {
    var resuelta = xs[r] !== null;
    t += '<tr>';
    for (var c2 = 0; c2 < n; c2++) {
      var val = cfg.M[r][c2];
      var estilo = val === 0 ? 'color:var(--muted);opacity:.45' :
                   (r === c2 ? 'font-weight:800;color:var(--gold-600)' : '');
      t += '<td style="text-align:center;' + estilo +
           (resuelta ? ';background:rgba(28,122,76,.14)' : '') + '">' + val + '</td>';
    }
    t += '<td style="text-align:center;font-weight:700' +
         (resuelta ? ';background:rgba(28,122,76,.14)' : '') + '">' + cfg.b[r] + '</td></tr>';
  }
  q(host, '.matriz').innerHTML = t + '</table>';

  // pasos aritméticos
  var h = '';
  detalle.forEach(function (d, idx) {
    var expr = d.terminos.length
      ? d.coef + '·' + d.v + ' + ' + d.terminos.join(' + ') + ' = ' + d.rhs
      : d.coef + '·' + d.v + ' = ' + d.rhs;
    h += '<div class="paso"><div class="paso-t">Fila ' + (d.i + 1) + ' — despejar ' + d.v + '</div>' +
         '<span style="font-family:ui-monospace,monospace">' + expr + '</span><br>' +
         '<span style="font-family:ui-monospace,monospace">' + d.v + ' = (' + d.rhs +
         (d.suma ? ' − ' + d.suma : '') + ') / ' + d.coef +
         ' = <strong>' + (Math.round(d.val * 1e6) / 1e6) + '</strong></span></div>';
  });
  q(host, '.pasos').innerHTML = h || '<p style="color:var(--muted);font-size:.88rem">' +
    'Avanza el deslizador. Se empieza por la <strong>última</strong> fila, que tiene una sola incógnita.</p>';

  var listo = paso >= n;
  q(host, '.viz-readout').innerHTML =
    (listo
      ? '<strong style="color:#7fd4a4">Solución: ' +
        cfg.v.map(function (v, i) { return v + ' = ' + xs[i]; }).join(', ') + '</strong><br>'
      : 'Resueltas ' + paso + ' de ' + n + ' incógnitas.<br>') +
    '<span style="color:#8fb4d9">La forma triangular es lo que hace posible este proceso: la última ' +
    'fila tiene una sola incógnita, y cada valor hallado alimenta la fila de arriba. ' +
    'Llevar un sistema cualquiera a esta forma es el trabajo de la eliminación de Gauss (semana 3).</span>';
});

/* ══════ S01 · Sumas de Riemann ══════ */
var RIEM = {
  cuad: { f: function (x) { return x * x; }, a: 0, b: 2, exacto: 8 / 3, n: 'f(x) = x²',
          prim: 'x³/3' },
  seno: { f: Math.sin, a: 0, b: Math.PI, exacto: 2, n: 'f(x) = sen x', prim: '−cos x' },
  inv:  { f: function (x) { return 1 / x; }, a: 1, b: 3, exacto: Math.log(3), n: 'f(x) = 1/x',
          prim: 'ln x' },
  gauss:{ f: function (x) { return Math.exp(-x * x); }, a: 0, b: 2, exacto: 0.8820813908,
          n: 'f(x) = e^(−x²)', prim: 'no existe en forma elemental' }
};

OVA.viz.registrar('riemann', function (host) {
  var cfg = RIEM[q(host, '.fn').value] || RIEM.cuad;
  var N = parseInt(q(host, '.n').value, 10);
  var modo = q(host, '.modo').value;
  q(host, '.n-val').textContent = 'n = ' + N;

  var A = cfg.a, B = cfg.b, dx = (B - A) / N;
  var suma = 0, rects = [];
  for (var i = 0; i < N; i++) {
    var xi = A + i * dx, xf = xi + dx, alt, alt2 = null;
    if (modo === 'izq') alt = cfg.f(xi);
    else if (modo === 'der') alt = cfg.f(xf);
    else if (modo === 'med') alt = cfg.f((xi + xf) / 2);
    else { alt = cfg.f(xi); alt2 = cfg.f(xf); }
    suma += (alt2 === null ? alt : (alt + alt2) / 2) * dx;
    rects.push([xi, xf, alt, alt2]);
  }

  var L = OVA.lienzo(host.querySelector('canvas'), { alto: 260 });
  var c = L.ctx, mI = 44, mA = 18, mB = 30, mD = 14;
  var W = L.w - mI - mD, H = L.h - mA - mB;
  var ys = [0]; for (var s = 0; s <= 200; s++) ys.push(cfg.f(A + (B - A) * s / 200));
  var hi = Math.max.apply(null, ys) * 1.12, lo = Math.min(0, Math.min.apply(null, ys));
  var PX = function (v) { return mI + (v - A) / (B - A) * W; };
  var PY = function (v) { return mA + (hi - v) / (hi - lo) * H; };

  // rectángulos / trapecios
  rects.forEach(function (r) {
    c.fillStyle = 'rgba(58,110,165,.28)';
    c.strokeStyle = 'rgba(58,110,165,.85)'; c.lineWidth = 1;
    c.beginPath();
    c.moveTo(PX(r[0]), PY(0)); c.lineTo(PX(r[0]), PY(r[2]));
    c.lineTo(PX(r[1]), PY(r[3] === null ? r[2] : r[3]));
    c.lineTo(PX(r[1]), PY(0)); c.closePath();
    c.fill(); c.stroke();
  });

  // curva
  c.strokeStyle = '#c68f2e'; c.lineWidth = 3; c.beginPath();
  for (var p = 0; p <= 400; p++) {
    var xv = A + (B - A) * p / 400;
    p ? c.lineTo(PX(xv), PY(cfg.f(xv))) : c.moveTo(PX(xv), PY(cfg.f(xv)));
  }
  c.stroke();

  // ejes
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mI, mA); c.lineTo(mI, PY(0)); c.lineTo(mI + W, PY(0)); c.stroke();
  c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
  c.fillText(A.toFixed(1), mI - 6, L.h - 12);
  c.fillText(B.toFixed(1), mI + W - 10, L.h - 12);
  c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, mI + 8, mA + 12);

  var err = Math.abs(suma - cfg.exacto);
  q(host, '.viz-readout').innerHTML =
    'Aproximación con ' + N + ' subintervalos: <strong>' + suma.toFixed(8) + '</strong><br>' +
    'Valor exacto: <strong>' + cfg.exacto.toFixed(8) + '</strong> &nbsp;·&nbsp; primitiva: ' +
      cfg.prim + '<br>' +
    'Error absoluto: <strong style="color:#f0a58a">' + err.toExponential(3) + '</strong><br>' +
    '<span style="color:#8fb4d9">Sube n y observa cómo cae el error. El trapecio y el punto medio ' +
    'convergen mucho más rápido que los extremos: eso es exactamente lo que formalizarás en la ' +
    'semana 12.</span>';
});

/* ══════ S03 · Eliminación paso a paso: Gauss vs Gauss-Jordan ══════ */
var SIS = {
  a: { n: 'x+y+z=6 ; 2x−y+3z=9 ; 3x+2y−2z=1', v: ['x','y','z'],
       M: [[1,1,1,6],[2,-1,3,9],[3,2,-2,1]], sol: [1,2,3] },
  b: { n: '2x+y−z=8 ; −3x−y+2z=−11 ; −2x+y+2z=−3', v: ['x','y','z'],
       M: [[2,1,-1,8],[-3,-1,2,-11],[-2,1,2,-3]], sol: [2,3,-1] },
  c: { n: 'x−2y+z=0 ; 2y−8z=8 ; −4x+5y+9z=−9', v: ['x','y','z'],
       M: [[1,-2,1,0],[0,2,-8,8],[-4,5,9,-9]], sol: [29,16,3] }
};

function fmt(v) {
  if (Math.abs(v) < 1e-10) return '0';
  var r = Math.round(v * 1000) / 1000;
  return (Math.abs(r - Math.round(r)) < 1e-9) ? String(Math.round(r)) : r.toFixed(3);
}

/* Genera la lista de pasos de eliminación. modo: 'gauss' | 'jordan' */
function pasosElim(M0, n, modo) {
  var M = M0.map(function (f) { return f.slice(); });
  var pasos = [], ops = 0;
  for (var k = 0; k < n; k++) {
    // normalizar el pivote (solo Gauss-Jordan)
    if (modo === 'jordan' && Math.abs(M[k][k] - 1) > 1e-12) {
      var p = M[k][k];
      for (var c = k; c <= n; c++) { M[k][c] /= p; ops++; }
      pasos.push({ txt: 'F' + (k + 1) + ' → F' + (k + 1) + ' / (' + fmt(p) + ')',
                   M: M.map(function (f) { return f.slice(); }), piv: k, ops: ops });
    }
    for (var i = 0; i < n; i++) {
      if (i === k) continue;
      if (modo === 'gauss' && i < k) continue;   // Gauss solo elimina hacia abajo
      if (Math.abs(M[i][k]) < 1e-12) continue;
      var f = M[i][k] / M[k][k];
      for (var c2 = k; c2 <= n; c2++) { M[i][c2] -= f * M[k][c2]; ops += 2; }
      pasos.push({ txt: 'F' + (i + 1) + ' → F' + (i + 1) + ' − (' + fmt(f) + ')·F' + (k + 1),
                   M: M.map(function (g) { return g.slice(); }), piv: k, ops: ops });
    }
  }
  if (modo === 'gauss') {
    // sustitución hacia atrás
    var xs = new Array(n).fill(null);
    for (var s = n - 1; s >= 0; s--) {
      var suma = 0;
      for (var j = s + 1; j < n; j++) { suma += M[s][j] * xs[j]; ops += 2; }
      xs[s] = (M[s][n] - suma) / M[s][s]; ops++;
      pasos.push({ txt: 'Sustitución hacia atrás: despejar la incógnita ' + (s + 1),
                   M: M.map(function (g) { return g.slice(); }), piv: -1, ops: ops, xs: xs.slice() });
    }
  }
  return pasos;
}

OVA.viz.registrar('gauss', function (host) {
  var cfg = SIS[q(host, 'select').value] || SIS.a;
  var modo = q(host, '.modo').value;
  var n = cfg.M.length;
  var pasos = pasosElim(cfg.M, n, modo);
  var sl = q(host, '.paso');
  sl.max = pasos.length;
  var p = Math.min(parseInt(sl.value, 10), pasos.length);
  q(host, '.paso-val').textContent = 'paso ' + p + ' de ' + pasos.length;

  var M = p === 0 ? cfg.M : pasos[p - 1].M;
  var piv = p === 0 ? -1 : pasos[p - 1].piv;
  var xs = p > 0 ? pasos[p - 1].xs : null;

  var t = '<table class="tbl" style="margin:0;font-size:.88rem;text-align:center"><tr>';
  cfg.v.forEach(function (v) { t += '<th style="text-align:center">' + v + '</th>'; });
  t += '<th style="text-align:center">=</th></tr>';
  for (var r = 0; r < n; r++) {
    t += '<tr>';
    for (var c = 0; c <= n; c++) {
      var est = '';
      if (c === piv && r === piv) est = 'font-weight:800;background:rgba(198,143,46,.35)';
      else if (c === piv && c < n) est = 'background:rgba(176,57,44,.16)';
      else if (Math.abs(M[r][c]) < 1e-10) est = 'color:var(--muted);opacity:.45';
      if (c === n) est += ';font-weight:700;border-left:2px solid var(--border)';
      t += '<td style="text-align:center;' + est + '">' + fmt(M[r][c]) + '</td>';
    }
    t += '</tr>';
  }
  q(host, '.matriz').innerHTML = t + '</table>';

  var h = '';
  if (p === 0) {
    h = '<p style="color:var(--muted);font-size:.88rem">Matriz aumentada inicial. ' +
        'Avanza el deslizador para ver cada operación de fila.</p>';
  } else {
    for (var i = Math.max(0, p - 4); i < p; i++) {
      h += '<div class="paso"><div class="paso-t">Paso ' + (i + 1) + '</div>' +
           '<span style="font-family:ui-monospace,monospace">' + pasos[i].txt + '</span></div>';
    }
  }
  q(host, '.pasos').innerHTML = h;

  var listo = p >= pasos.length;
  var res = xs ? xs : (listo && modo === 'jordan'
    ? M.map(function (f) { return f[n]; }) : null);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + (modo === 'gauss' ? 'Eliminación de Gauss + sustitución hacia atrás'
                                   : 'Gauss-Jordan') + '</strong><br>' +
    (listo && res
      ? '<strong style="color:#7fd4a4">Solución: ' +
        cfg.v.map(function (v, i) { return v + ' = ' + fmt(res[i]); }).join(', ') + '</strong><br>'
      : '') +
    'Operaciones acumuladas: <strong>' + (p ? pasos[p - 1].ops : 0) + '</strong>' +
    ' &nbsp;·&nbsp; total del método: <strong>' + pasos[pasos.length - 1].ops + '</strong><br>' +
    '<span style="color:#8fb4d9">' +
    (modo === 'gauss'
      ? 'Gauss solo elimina <em>por debajo</em> de la diagonal y luego sustituye hacia atrás.'
      : 'Gauss-Jordan normaliza cada pivote y elimina <em>arriba y abajo</em>, hasta dejar la ' +
        'identidad. No necesita sustitución, pero cuesta más operaciones.') +
    ' Cambia de método con el mismo sistema y compara el total.</span>';
});

/* ══════ S03 · Por qué hace falta el pivoteo ══════ */
function sigc(v, d) {
  if (v === 0 || !isFinite(v)) return v;
  var m = Math.pow(10, d - 1 - Math.floor(Math.log10(Math.abs(v))));
  return Math.round(v * m) / m;
}

/* Máquina consistente de d cifras: se redondea TODO, incluidas las entradas */
function resolver2x2(d, pivotear) {
  var a = [[sigc(0.0003, d), sigc(3.0, d)], [sigc(1.0, d), sigc(1.0, d)]];
  var b = [sigc(2.0001, d), sigc(1.0, d)];
  var permuta = false;
  if (pivotear && Math.abs(a[1][0]) > Math.abs(a[0][0])) {
    permuta = true;
    var ta = a[0]; a[0] = a[1]; a[1] = ta;
    var tb = b[0]; b[0] = b[1]; b[1] = tb;
  }
  var f = sigc(a[1][0] / a[0][0], d);
  var a22 = sigc(a[1][1] - sigc(f * a[0][1], d), d);
  var b2 = sigc(b[1] - sigc(f * b[0], d), d);
  var x2 = sigc(b2 / a22, d);
  var x1 = sigc(sigc(b[0] - sigc(a[0][1] * x2, d), d) / a[0][0], d);
  return { x1: x1, x2: x2, f: f, permuta: permuta };
}

OVA.viz.registrar('pivoteo', function (host) {
  var d = parseInt(q(host, '.cifras').value, 10);
  q(host, '.cifras-val').textContent = d + ' cifras significativas';
  var EX1 = 1 / 3, EX2 = 2 / 3;
  var sin = resolver2x2(d, false), con = resolver2x2(d, true);
  var eSin = Math.abs(sin.x1 - EX1) / EX1, eCon = Math.abs(con.x1 - EX1) / EX1;

  var L = OVA.lienzo(host.querySelector('canvas'), { alto: 240 });
  var c = L.ctx, mI = 52, mA = 18, mB = 32, mD = 14;
  var W = L.w - mI - mD, H = L.h - mA - mB;
  var dmin = 3, dmax = 12;
  var PX = function (dd) { return mI + (dd - dmin) / (dmax - dmin) * W; };
  var PY = function (e) {
    var v = Math.max(Math.min(Math.log10(Math.max(e, 1e-13)), 1), -12);
    return mA + (1 - v) / 13 * H;
  };
  c.strokeStyle = OVA.color('cv-grid'); c.lineWidth = 1;
  c.fillStyle = OVA.color('cv-text'); c.font = '9px ui-monospace,monospace';
  for (var g = 0; g >= -12; g -= 3) {
    c.beginPath(); c.moveTo(mI, PY(Math.pow(10, g))); c.lineTo(mI + W, PY(Math.pow(10, g))); c.stroke();
    c.fillText('1e' + g, 4, PY(Math.pow(10, g)) + 3);
  }
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mI, mA); c.lineTo(mI, mA + H); c.lineTo(mI + W, mA + H); c.stroke();
  c.font = '10px ui-monospace,monospace';
  for (var dd = dmin; dd <= dmax; dd++) c.fillText(String(dd), PX(dd) - 3, L.h - 12);
  c.font = 'bold 10px ui-monospace,monospace';
  c.fillText('cifras significativas de la máquina', mI + W / 2 - 95, L.h - 1);

  [[false, '#b0392c', 'sin pivoteo'], [true, '#1c7a4c', 'con pivoteo parcial']]
    .forEach(function (par, idx) {
      c.strokeStyle = par[1]; c.lineWidth = 2.8; c.beginPath();
      for (var dv = dmin; dv <= dmax; dv++) {
        var r = resolver2x2(dv, par[0]);
        var e = Math.abs(r.x1 - EX1) / EX1;
        var X = PX(dv), Y = PY(e);
        dv === dmin ? c.moveTo(X, Y) : c.lineTo(X, Y);
      }
      c.stroke();
      c.fillStyle = par[1]; c.font = 'bold 11px ui-monospace,monospace';
      c.fillText('— ' + par[2], mI + 10, mA + 14 + idx * 15);
    });
  c.strokeStyle = '#c68f2e'; c.lineWidth = 1.6; c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(PX(d), mA); c.lineTo(PX(d), mA + H); c.stroke();
  c.setLineDash([]);

  q(host, '.viz-readout').innerHTML =
    '<strong>Con ' + d + ' cifras significativas:</strong><br>' +
    '<span style="color:#f0a58a">Sin pivoteo:</span> x₁ = <strong>' + sin.x1.toFixed(6) +
      '</strong> &nbsp;(multiplicador ' + sin.f.toPrecision(5) + ', error ' +
      (eSin * 100).toFixed(3) + ' %)<br>' +
    '<span style="color:#7fd4a4">Con pivoteo:</span> x₁ = <strong>' + con.x1.toFixed(6) +
      '</strong> &nbsp;(multiplicador ' + con.f.toPrecision(5) + ', error ' +
      (eCon * 100).toFixed(5) + ' %)<br>' +
    'Valor exacto: x₁ = 1/3 = 0,333333…<br>' +
    '<span style="color:#8fb4d9">Sin pivoteo el multiplicador es enorme y la resta cancela ' +
    'cifras; con 3 o 4 cifras el resultado es <strong>cero</strong>: 100 % de error. ' +
    'Intercambiar filas cuesta nada y lo evita por completo.</span>';
});

/* ══════ S03 · Costo de los tres métodos ══════ */
OVA.viz.registrar('costo', function (host) {
  var nmax = parseInt(q(host, '.nmax').value, 10);
  q(host, '.nmax-val').textContent = 'hasta n = ' + nmax;

  var gauss = function (n) { return n * n * n / 3; };
  var jordan = function (n) { return n * n * n / 2; };
  var cramer = function (n) { var f = 1; for (var i = 2; i <= n + 1; i++) f *= i; return f; };

  var L = OVA.lienzo(host.querySelector('canvas'), { alto: 260 });
  var c = L.ctx, mI = 56, mA = 18, mB = 32, mD = 14;
  var W = L.w - mI - mD, H = L.h - mA - mB;
  var top = Math.max(Math.log10(cramer(nmax)), 4);
  var PX = function (n) { return mI + (n - 2) / (nmax - 2) * W; };
  var PY = function (v) { return mA + (1 - Math.log10(Math.max(v, 1)) / top) * H; };

  c.strokeStyle = OVA.color('cv-grid'); c.lineWidth = 1;
  c.fillStyle = OVA.color('cv-text'); c.font = '9px ui-monospace,monospace';
  var salto = Math.max(3, Math.ceil(top / 6));
  for (var e = 0; e <= top; e += salto) {
    c.beginPath(); c.moveTo(mI, PY(Math.pow(10, e))); c.lineTo(mI + W, PY(Math.pow(10, e))); c.stroke();
    c.fillText('1e' + e, 4, PY(Math.pow(10, e)) + 3);
  }
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mI, mA); c.lineTo(mI, mA + H); c.lineTo(mI + W, mA + H); c.stroke();
  c.font = '10px ui-monospace,monospace';
  for (var nv = 2; nv <= nmax; nv += Math.max(1, Math.round((nmax - 2) / 8)))
    c.fillText(String(nv), PX(nv) - 4, L.h - 12);
  c.font = 'bold 10px ui-monospace,monospace';
  c.fillText('tamaño del sistema n', mI + W / 2 - 55, L.h - 1);

  [[gauss, '#1c7a4c', 'Gauss  ≈ n³/3'],
   [jordan, '#3a6ea5', 'Gauss-Jordan  ≈ n³/2'],
   [cramer, '#b0392c', 'Cramer por cofactores  ≈ (n+1)!']]
    .forEach(function (par, idx) {
      c.strokeStyle = par[1]; c.lineWidth = 2.8; c.beginPath();
      for (var n = 2; n <= nmax; n++) {
        var X = PX(n), Y = PY(par[0](n));
        n === 2 ? c.moveTo(X, Y) : c.lineTo(X, Y);
      }
      c.stroke();
      c.fillStyle = par[1]; c.font = 'bold 11px ui-monospace,monospace';
      c.fillText('— ' + par[2], mI + 10, mA + 14 + idx * 15);
    });

  var seg = cramer(nmax) / 1e9;
  var tiempo = seg < 60 ? seg.toPrecision(3) + ' s'
             : seg < 3.15e7 ? (seg / 86400).toPrecision(3) + ' días'
             : (seg / 3.15e7).toExponential(2) + ' años';
  q(host, '.viz-readout').innerHTML =
    'Para <strong>n = ' + nmax + '</strong>:<br>' +
    '<span style="color:#7fd4a4">Gauss</span> ≈ ' + Math.round(gauss(nmax)).toLocaleString('es') +
      ' operaciones &nbsp;·&nbsp; <span style="color:#8fb4d9">Gauss-Jordan</span> ≈ ' +
      Math.round(jordan(nmax)).toLocaleString('es') + '<br>' +
    '<span style="color:#f0a58a">Cramer por cofactores</span> ≈ ' + cramer(nmax).toExponential(3) +
      ' operaciones — a mil millones por segundo, <strong>' + tiempo + '</strong><br>' +
    '<span style="color:#8fb4d9">El eje vertical es logarítmico: cada línea horizontal multiplica ' +
    'por mil. Las dos curvas cúbicas son casi indistinguibles; la factorial se despega y no vuelve.</span>';
});

/* ══════ S04 · Factorización LU paso a paso ══════ */
var SISLU = {
  a: { n: '2x+y−z=8 ; −3x−y+2z=−11 ; −2x+y+2z=−3',
       M: [[2,1,-1],[-3,-1,2],[-2,1,2]], b: [8,-11,-3], sol: [2,3,-1] },
  b: { n: 'x+y+z=6 ; 2x−y+3z=9 ; 3x+2y−2z=1',
       M: [[1,1,1],[2,-1,3],[3,2,-2]], b: [6,9,1], sol: [1,2,3] },
  c: { n: '4x−2y+z=11 ; −2x+4y−2z=−16 ; x−2y+4z=17',
       M: [[4,-2,1],[-2,4,-2],[1,-2,4]], b: [11,-16,17], sol: [1,-2,3] }
};

function fmtN(v) {
  if (Math.abs(v) < 1e-10) return '0';
  var r = Math.round(v * 1000) / 1000;
  return (Math.abs(r - Math.round(r)) < 1e-9) ? String(Math.round(r)) : r.toFixed(3);
}

OVA.viz.registrar('lu', function (host) {
  var cfg = SISLU[q(host, 'select').value] || SISLU.a;
  var n = cfg.M.length;
  var U = cfg.M.map(function (f) { return f.slice(); });
  var Lm = [];
  for (var i = 0; i < n; i++) { Lm.push([]); for (var j = 0; j < n; j++) Lm[i].push(i === j ? 1 : 0); }
  var pasos = [];
  for (var k = 0; k < n; k++) {
    for (var i2 = k + 1; i2 < n; i2++) {
      if (Math.abs(U[i2][k]) < 1e-12) continue;
      var f = U[i2][k] / U[k][k];
      Lm[i2][k] = f;                                   // el multiplicador SE GUARDA
      for (var c2 = k; c2 < n; c2++) U[i2][c2] -= f * U[k][c2];
      pasos.push({ txt: 'F' + (i2+1) + ' → F' + (i2+1) + ' − (' + fmtN(f) + ')·F' + (k+1) +
                        '   ·   se guarda ℓ' + (i2+1) + (k+1) + ' = ' + fmtN(f),
                   U: U.map(function (g) { return g.slice(); }),
                   L: Lm.map(function (g) { return g.slice(); }), piv: k, fila: i2 });
    }
  }
  var sl = q(host, '.paso'); sl.max = pasos.length;
  var p = Math.min(parseInt(sl.value, 10), pasos.length);
  q(host, '.paso-val').textContent = 'paso ' + p + ' de ' + pasos.length;
  var Uv = p === 0 ? cfg.M : pasos[p-1].U;
  var Lv = p === 0 ? Lm.map(function(g,i){return g.map(function(_,j){return i===j?1:0;});})
                   : pasos[p-1].L;

  var tabla = function (M, titulo, resalta) {
    var t = '<div style="flex:1;min-width:160px"><div style="font-weight:700;font-size:.82rem;' +
            'margin-bottom:.25rem;color:var(--muted)">' + titulo + '</div>' +
            '<table class="tbl" style="margin:0;font-size:.84rem;text-align:center">';
    for (var r = 0; r < n; r++) {
      t += '<tr>';
      for (var c = 0; c < n; c++) {
        var est = Math.abs(M[r][c]) < 1e-10 ? 'color:var(--muted);opacity:.4' : '';
        if (resalta && r > c) est += ';background:rgba(198,143,46,.22);font-weight:700';
        t += '<td style="text-align:center;' + est + '">' + fmtN(M[r][c]) + '</td>';
      }
      t += '</tr>';
    }
    return t + '</table></div>';
  };
  q(host, '.matriz').innerHTML = '<div style="display:flex;gap:1rem;flex-wrap:wrap">' +
    tabla(Lv, 'L  (multiplicadores)', true) + tabla(Uv, 'U  (triangular superior)', false) + '</div>';

  var hh = '';
  for (var i3 = Math.max(0, p - 3); i3 < p; i3++) {
    hh += '<div class="paso"><div class="paso-t">Paso ' + (i3+1) + '</div>' +
          '<span style="font-family:ui-monospace,monospace">' + pasos[i3].txt + '</span></div>';
  }
  q(host, '.pasos').innerHTML = hh || '<p style="color:var(--muted);font-size:.88rem">' +
    'L empieza como la identidad. Avanza y verás que cada multiplicador, en vez de descartarse, ' +
    'se guarda en su posición de L.</p>';

  // comprobación L·U = A
  var prod = [];
  for (var r2 = 0; r2 < n; r2++) {
    prod.push([]);
    for (var c3 = 0; c3 < n; c3++) {
      var s = 0;
      for (var m = 0; m < n; m++) s += Lv[r2][m] * Uv[m][c3];
      prod[r2].push(s);
    }
  }
  var err = 0;
  for (var r3 = 0; r3 < n; r3++) for (var c4 = 0; c4 < n; c4++)
    err = Math.max(err, Math.abs(prod[r3][c4] - cfg.M[r3][c4]));

  var det = 1;
  for (var d = 0; d < n; d++) det *= Uv[d][d];

  q(host, '.viz-readout').innerHTML =
    '<strong>L · U = A</strong> en todo momento — desviación máxima <strong>' +
      err.toExponential(2) + '</strong> ' +
      (err < 1e-9 ? '<span style="color:#7fd4a4">✓</span>' : '') + '<br>' +
    (p >= pasos.length
      ? 'Factorización completa. &nbsp;det A = producto de la diagonal de U = <strong>' +
        fmtN(det) + '</strong><br>'
      : '') +
    '<span style="color:#8fb4d9">Es la <em>misma</em> eliminación de Gauss de la Guía 3. ' +
    'La única diferencia: el multiplicador, en vez de tirarse a la basura, se guarda en L. ' +
    'Eso permite resolver después cualquier b sin repetir la eliminación.</span>';
});

/* ══════ S04 · Cholesky y matrices definidas positivas ══════ */
var CHOL = {
  a: { n: 'clásica', M: [[4,12,-16],[12,37,-43],[-16,-43,98]] },
  b: { n: 'tridiagonal', M: [[4,-2,0],[-2,5,-2],[0,-2,5]] },
  c: { n: 'NO definida positiva', M: [[1,2,0],[2,1,0],[0,0,3]] },
  d: { n: 'no simétrica', M: [[2,1,0],[3,4,1],[0,1,3]] }
};

OVA.viz.registrar('cholesky', function (host) {
  var cfg = CHOL[q(host, 'select').value] || CHOL.a;
  var M = cfg.M, n = M.length;

  // ¿es simétrica?
  var sim = true;
  for (var i = 0; i < n; i++) for (var j = 0; j < n; j++)
    if (Math.abs(M[i][j] - M[j][i]) > 1e-12) sim = false;

  // menores principales
  var menores = [];
  for (var k = 1; k <= n; k++) {
    var sub = [];
    for (var r = 0; r < k; r++) { sub.push([]); for (var c = 0; c < k; c++) sub[r].push(M[r][c]); }
    menores.push(det_(sub, k));
  }
  var dp = sim && menores.every(function (v) { return v > 1e-12; });

  function det_(A, k) {
    if (k === 1) return A[0][0];
    if (k === 2) return A[0][0]*A[1][1] - A[0][1]*A[1][0];
    return A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])
         - A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])
         + A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0]);
  }

  var Lc = null, err = null;
  if (dp) {
    Lc = []; for (var a = 0; a < n; a++) { Lc.push([]); for (var b = 0; b < n; b++) Lc[a].push(0); }
    for (var i2 = 0; i2 < n; i2++) {
      for (var j2 = 0; j2 <= i2; j2++) {
        var s = 0;
        for (var m = 0; m < j2; m++) s += Lc[i2][m] * Lc[j2][m];
        Lc[i2][j2] = (i2 === j2) ? Math.sqrt(M[i2][i2] - s) : (M[i2][j2] - s) / Lc[j2][j2];
      }
    }
    err = 0;
    for (var r2 = 0; r2 < n; r2++) for (var c2 = 0; c2 < n; c2++) {
      var v = 0;
      for (var m2 = 0; m2 < n; m2++) v += Lc[r2][m2] * Lc[c2][m2];
      err = Math.max(err, Math.abs(v - M[r2][c2]));
    }
  }

  var tabla = function (A, titulo) {
    var t = '<div style="flex:1;min-width:150px"><div style="font-weight:700;font-size:.82rem;' +
            'margin-bottom:.25rem;color:var(--muted)">' + titulo + '</div>' +
            '<table class="tbl" style="margin:0;font-size:.84rem;text-align:center">';
    for (var r = 0; r < n; r++) {
      t += '<tr>';
      for (var c = 0; c < n; c++)
        t += '<td style="text-align:center;' +
             (Math.abs(A[r][c]) < 1e-10 ? 'color:var(--muted);opacity:.4' : '') + '">' +
             fmtN(A[r][c]) + '</td>';
      t += '</tr>';
    }
    return t + '</table></div>';
  };
  q(host, '.matriz').innerHTML = '<div style="display:flex;gap:1rem;flex-wrap:wrap">' +
    tabla(M, 'A') + (Lc ? tabla(Lc, 'L  (Cholesky)') : '') + '</div>';

  var marca = function (ok, txt) {
    return '<div style="margin:.12rem 0">' +
      (ok ? '<span style="color:#7fd4a4">✓</span> ' : '<span style="color:#f0a58a">✗</span> ') +
      txt + '</div>';
  };
  q(host, '.viz-readout').innerHTML =
    marca(sim, '<strong>1.</strong> A es simétrica') +
    marca(dp, '<strong>2.</strong> Menores principales positivos: ' +
          menores.map(fmtN).join(', ')) +
    (dp
      ? '<div style="margin-top:.4rem"><strong style="color:#7fd4a4">Cholesky existe.</strong> ' +
        'Comprobación L·Lᵀ = A: desviación máxima ' + err.toExponential(2) + '</div>'
      : '<div style="margin-top:.4rem"><strong style="color:#f0a58a">Cholesky no aplica.</strong> ' +
        (sim ? 'Es simétrica pero no definida positiva: al calcular la diagonal aparecería la raíz ' +
               'de un número negativo.'
             : 'No es simétrica, y Cholesky exige simetría antes que nada.') + '</div>') +
    '<span style="color:#8fb4d9">Cholesky cuesta la mitad que LU (≈ n³/6 frente a n³/3) porque ' +
    'aprovecha la simetría: calcula solo la mitad de la matriz. Pero exige que se cumplan ' +
    'las dos condiciones.</span>';
});

/* ══════ S06 · Amplificación del error según el condicionamiento ══════ */
var COND = {
  bien:  { n: 'Sistema bien condicionado', A: [[3, 0], [0, 2]], b: [6, 4],
           cond: 1.5, desc: 'A = diag(3,2): las ecuaciones son casi independientes' },
  medio: { n: 'Condicionamiento moderado', A: [[4, 3], [3, 4]], b: [7, 7],
           cond: 7, desc: 'las dos rectas se cruzan en buen ángulo' },
  mal:   { n: 'Mal condicionado', A: [[1, 1], [1, 1.01]], b: [2, 2.01],
           cond: 402, desc: 'las dos rectas son casi paralelas' },
  peor:  { n: 'Casi singular', A: [[1, 1], [1, 1.0001]], b: [2, 2.0001],
           cond: 40002, desc: 'las rectas son casi la misma: mínimo cambio, enorme efecto' }
};

function resolver2(A, b) {
  var det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  return [(b[0] * A[1][1] - b[1] * A[0][1]) / det,
          (A[0][0] * b[1] - A[1][0] * b[0]) / det];
}

OVA.viz.registrar('condicion', function (host) {
  var cfg = COND[q(host, 'select').value] || COND.bien;
  var pert = parseFloat(q(host, '.pert').value) / 1000;   // hasta 0.05
  q(host, '.pert-val').textContent = 'perturbación en b: ' + pert.toFixed(3);

  var x0 = resolver2(cfg.A, cfg.b);
  var bp = [cfg.b[0] + pert, cfg.b[1] - pert];
  var x1 = resolver2(cfg.A, bp);

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 300, sx: 40, sy: 40 });
  // centrar la vista en la solución
  L.ox = L.w / 2 - x0[0] * L.sx;
  L.oy = L.h / 2 + x0[1] * L.sy;
  OVA.ejes(L);
  var c = L.ctx;

  // dibujar las dos rectas del sistema (original y perturbado)
  var recta = function (fila, rhs, color, ancho, guiones) {
    c.strokeStyle = color; c.lineWidth = ancho;
    if (guiones) c.setLineDash(guiones);
    c.beginPath();
    var primero = true;
    for (var px = 0; px <= L.w; px += 3) {
      var xv = (px - L.ox) / L.sx;
      var yv = Math.abs(fila[1]) > 1e-12 ? (rhs - fila[0] * xv) / fila[1] : null;
      if (yv === null) continue;
      var py = L.py(yv);
      if (py < -50 || py > L.h + 50) { primero = true; continue; }
      primero ? (c.moveTo(px, py), primero = false) : c.lineTo(px, py);
    }
    c.stroke(); c.setLineDash([]);
  };
  recta(cfg.A[0], cfg.b[0], 'rgba(58,110,165,.85)', 2.4);
  recta(cfg.A[1], cfg.b[1], 'rgba(28,122,76,.85)', 2.4);
  if (pert > 0) {
    recta(cfg.A[0], bp[0], 'rgba(58,110,165,.4)', 1.8, [5, 4]);
    recta(cfg.A[1], bp[1], 'rgba(28,122,76,.4)', 1.8, [5, 4]);
  }

  OVA.punto(L, x0[0], x0[1], ORO);
  if (pert > 0) {
    OVA.punto(L, x1[0], x1[1], ROJO);
    c.strokeStyle = ROJO; c.lineWidth = 1.4; c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(L.px(x0[0]), L.py(x0[1])); c.lineTo(L.px(x1[0]), L.py(x1[1])); c.stroke();
    c.setLineDash([]);
  }
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  var dsol = Math.hypot(x1[0] - x0[0], x1[1] - x0[1]);
  var db = Math.hypot(pert, pert);
  var amplif = db > 1e-9 ? dsol / db : 0;

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · número de condición ≈ <strong>' + cfg.cond + '</strong><br>' +
    '<span style="color:#8fb4d9">' + cfg.desc + '</span><br>' +
    'Solución original <span style="color:#dba949">(' + x0[0].toFixed(3) + ', ' + x0[1].toFixed(3) +
      ')</span>' +
    (pert > 0
      ? ' → perturbada <span style="color:#f0a58a">(' + x1[0].toFixed(3) + ', ' + x1[1].toFixed(3) +
        ')</span><br>' +
        'Cambio en b: <strong>' + db.toFixed(4) + '</strong> &nbsp;→&nbsp; cambio en x: <strong>' +
        dsol.toFixed(4) + '</strong> &nbsp;·&nbsp; amplificación ×<strong style="color:#f0a58a">' +
        amplif.toFixed(1) + '</strong>'
      : '<br><span style="color:var(--muted)">Sube la perturbación y observa cuánto se mueve el punto rojo.</span>') +
    '<br><span style="color:#8fb4d9">Cuanto más paralelas son las rectas, mayor el número de ' +
    'condición y más se desplaza la solución ante un cambio diminuto en los datos. El pivoteo ' +
    'no arregla esto: es una propiedad de la matriz, no del método.</span>';
});

/* ══════ S07 · Jacobi y Gauss-Seidel iterando ══════ */
var ITERSEL = {   // (antes ITER: colisionaba con el ITER de S02 y rompía «iteracion»)
  a: { n: '10x−y+2z=6 ; −x+11y−z+3w=25 ; 2x−y+10z−w=−11 ; 3y−z+8w=15',
       A: [[10, -1, 2, 0], [-1, 11, -1, 3], [2, -1, 10, -1], [0, 3, -1, 8]],
       b: [6, 25, -11, 15], v: ['x', 'y', 'z', 'w'], sol: [1, 2, -1, 1], dom: true },
  b: { n: '4x+y=9 ; x+3y=8', A: [[4, 1], [1, 3]], b: [9, 8],
       v: ['x', 'y'], sol: [1.857142857, 2.047619048], dom: true },
  c: { n: 'x+2y=5 ; 3x+y=5  (NO dominante)', A: [[1, 2], [3, 1]], b: [5, 5],
       v: ['x', 'y'], sol: [1, 2], dom: false }
};

function iterar(cfg, metodo, n) {
  var m = cfg.A.length, x = new Array(m).fill(0), hist = [x.slice()];
  for (var k = 0; k < n; k++) {
    var xn = metodo === 'jacobi' ? new Array(m).fill(0) : x.slice();
    for (var i = 0; i < m; i++) {
      var s = cfg.b[i];
      for (var j = 0; j < m; j++) {
        if (j === i) continue;
        s -= cfg.A[i][j] * (metodo === 'jacobi' ? x[j] : xn[j]);
      }
      xn[i] = s / cfg.A[i][i];
    }
    x = xn; hist.push(x.slice());
    if (x.some(function (u) { return !isFinite(u) || Math.abs(u) > 1e6; })) break;
  }
  return hist;
}

OVA.viz.registrar('iterativos', function (host) {
  var cfg = ITERSEL[q(host, 'select').value] || ITERSEL.a;
  var metodo = q(host, '.metodo').value;
  var it = parseInt(q(host, '.iter').value, 10);
  q(host, '.iter-val').textContent = it + ' iteraciones';

  var hist = iterar(cfg, metodo, Math.max(it, 30));
  var m = cfg.A.length;

  // tabla de las últimas iteraciones
  var desde = Math.max(0, it - 6);
  var t = '<table class="tbl" style="margin:0;font-size:.82rem;text-align:center"><tr>' +
          '<th style="text-align:center">k</th>' +
          cfg.v.map(function (v) { return '<th style="text-align:center">' + v + '</th>'; }).join('') +
          '<th style="text-align:center">‖Δ‖∞</th></tr>';
  for (var k = desde; k <= Math.min(it, hist.length - 1); k++) {
    var delta = k > 0 ? Math.max.apply(null, hist[k].map(function (u, i) {
      return Math.abs(u - hist[k - 1][i]); })) : 0;
    var conv = k === it;
    t += '<tr' + (conv ? ' style="background:rgba(28,122,76,.14)"' : '') + '><td>' + k + '</td>' +
      hist[k].map(function (u) {
        return '<td>' + (isFinite(u) ? u.toFixed(6) : '∞') + '</td>'; }).join('') +
      '<td>' + (k > 0 ? delta.toExponential(2) : '—') + '</td></tr>';
  }
  q(host, '.tabla').innerHTML = t + '</table>';

  // gráfica de convergencia del error
  var L = OVA.lienzo(q(host, 'canvas'), { alto: 200 });
  var c = L.ctx, mI = 48, mA = 16, mB = 28, mD = 12;
  var W = L.w - mI - mD, H = L.h - mA - mB;
  var errs = hist.map(function (x) {
    return Math.max.apply(null, x.map(function (u, i) { return Math.abs(u - cfg.sol[i]); }));
  });
  var maxIt = Math.min(it, hist.length - 1);
  var PX = function (k) { return mI + k / Math.max(maxIt, 1) * W; };
  var lo = -8, hi = Math.max(1, Math.ceil(Math.log10(Math.max(errs[0], 1e-9))));
  var PY = function (e) {
    var v = Math.max(Math.min(Math.log10(Math.max(e, 1e-12)), hi), lo);
    return mA + (hi - v) / (hi - lo) * H;
  };
  c.strokeStyle = OVA.color('cv-grid'); c.lineWidth = 1;
  c.fillStyle = OVA.color('cv-text'); c.font = '9px ui-monospace,monospace';
  for (var g = hi; g >= lo; g -= 2) {
    c.beginPath(); c.moveTo(mI, PY(Math.pow(10, g))); c.lineTo(mI + W, PY(Math.pow(10, g))); c.stroke();
    c.fillText('1e' + g, 4, PY(Math.pow(10, g)) + 3);
  }
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mI, mA); c.lineTo(mI, mA + H); c.lineTo(mI + W, mA + H); c.stroke();
  var diverge = errs[maxIt] > errs[0] * 2;
  c.strokeStyle = diverge ? ROJO : VERDE; c.lineWidth = 2.6; c.beginPath();
  for (var k2 = 0; k2 <= maxIt; k2++) {
    var pt = [PX(k2), PY(errs[k2])];
    k2 ? c.lineTo(pt[0], pt[1]) : c.moveTo(pt[0], pt[1]);
  }
  c.stroke();
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace';
  c.fillText('error ‖xₖ − x*‖∞  (escala log)', mI + 8, mA + 12);
  c.font = '9px ui-monospace,monospace';
  c.fillText('iteración k', mI + W - 60, L.h - 4);

  var errFin = errs[Math.min(it, hist.length - 1)];
  q(host, '.viz-readout').innerHTML =
    '<strong>' + (metodo === 'jacobi' ? 'Jacobi' : 'Gauss-Seidel') + '</strong> · ' +
    (cfg.dom
      ? '<span style="color:#7fd4a4">matriz diagonalmente dominante ✓</span>'
      : '<span style="color:#f0a58a">matriz NO dominante ✗</span>') + '<br>' +
    (diverge
      ? '<strong style="color:#f0a58a">Diverge:</strong> el error crece sin control. ' +
        'Sin dominancia diagonal, la iteración no está garantizada.'
      : 'Error tras ' + it + ' iteraciones: <strong>' + errFin.toExponential(3) + '</strong>') +
    '<br><span style="color:#8fb4d9">' +
    (metodo === 'jacobi'
      ? 'Jacobi usa todos los valores de la iteración anterior. '
      : 'Gauss-Seidel usa los valores <em>ya actualizados</em> en la misma pasada, y por eso suele ' +
        'converger en la mitad de iteraciones. ') +
    'Cambia de método con el mismo sistema y compara la pendiente de la curva de error.</span>';
});

/* ══════ S08 · Métodos de raíces atacando la misma ecuación ══════ */
var RAIZ = {
  cubica: { f: function (x) { return x*x*x - x - 2; }, fp: function (x) { return 3*x*x - 1; },
            n: 'f(x) = x³ − x − 2', a: 1, b: 2, x0: 1.5, raiz: 1.5213797069,
            desc: 'una sola raíz real, cerca de 1,52' },
  trig:   { f: function (x) { return Math.cos(x) - x; }, fp: function (x) { return -Math.sin(x) - 1; },
            n: 'f(x) = cos x − x', a: 0, b: 1, x0: 0.5, raiz: 0.7390851332,
            desc: 'el punto fijo del coseno' },
  exp:    { f: function (x) { return Math.exp(-x) - x; }, fp: function (x) { return -Math.exp(-x) - 1; },
            n: 'f(x) = e^{−x} − x', a: 0, b: 1, x0: 0.5, raiz: 0.5671432904,
            desc: 'aparece en física y probabilidad' },
  poli:   { f: function (x) { return x*x - 2; }, fp: function (x) { return 2*x; },
            n: 'f(x) = x² − 2', a: 1, b: 2, x0: 1.5, raiz: 1.4142135624,
            desc: 'la raíz es √2' }
};

function pasosBiseccion(cfg, n) {
  var a = cfg.a, b = cfg.b, out = [];
  for (var i = 0; i < n; i++) {
    var c = (a + b) / 2, fc = cfg.f(c);
    out.push(c);
    if (cfg.f(a) * fc < 0) b = c; else a = c;
  }
  return out;
}
function pasosFalsa(cfg, n) {
  var a = cfg.a, b = cfg.b, out = [];
  for (var i = 0; i < n; i++) {
    var c = b - cfg.f(b) * (b - a) / (cfg.f(b) - cfg.f(a));
    out.push(c);
    if (cfg.f(a) * cfg.f(c) < 0) b = c; else a = c;
  }
  return out;
}
function pasosNewton(cfg, n) {
  var x = cfg.x0, out = [x];
  for (var i = 0; i < n; i++) {
    var d = cfg.fp(x);
    if (Math.abs(d) < 1e-12) break;
    x = x - cfg.f(x) / d; out.push(x);
    if (!isFinite(x) || Math.abs(x) > 1e6) break;
  }
  return out;
}

OVA.viz.registrar('raices-nolineal', function (host) {
  var cfg = RAIZ[q(host, 'select').value] || RAIZ.cubica;
  var metodo = q(host, '.metodo').value;
  var it = parseInt(q(host, '.iter').value, 10);
  q(host, '.iter-val').textContent = it + ' iteraciones';

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 300, sx: 90, sy: 34 });
  // encuadrar en torno a [a,b]
  var cx = (cfg.a + cfg.b) / 2;
  L.ox = L.w / 2 - cx * L.sx;
  OVA.ejes(L);
  OVA.curva(L, cfg.f, AZUL, 3);
  var c = L.ctx;

  // línea de la raíz exacta
  c.strokeStyle = 'rgba(28,122,76,.4)'; c.lineWidth = 1.4; c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(L.px(cfg.raiz), 0); c.lineTo(L.px(cfg.raiz), L.h); c.stroke();
  c.setLineDash([]);

  var pts, col;
  if (metodo === 'biseccion') { pts = pasosBiseccion(cfg, it); col = ORO; }
  else if (metodo === 'falsa') { pts = pasosFalsa(cfg, it); col = MORADO; }
  else { pts = pasosNewton(cfg, it); col = ROJO; }

  // dibujar las aproximaciones
  if (metodo === 'newton') {
    // rectas tangentes que llevan de xk a xk+1
    for (var i = 0; i < pts.length - 1; i++) {
      var xk = pts[i], fk = cfg.f(xk), m = cfg.fp(xk);
      c.strokeStyle = 'rgba(176,57,44,.35)'; c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(L.px(xk), L.py(fk));
      c.lineTo(L.px(pts[i + 1]), L.py(0));
      c.stroke();
      OVA.punto(L, xk, fk, col);
      c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
      c.fillText('x' + i, L.px(xk) + 4, L.py(fk) - 5);
    }
  } else {
    pts.forEach(function (p, i) {
      OVA.punto(L, p, 0, col);
      if (i === pts.length - 1) OVA.punto(L, p, cfg.f(p), col);
    });
  }
  OVA.punto(L, cfg.raiz, 0, VERDE);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  var aprox = pts[pts.length - 1];
  var err = Math.abs(aprox - cfg.raiz);
  var nombre = metodo === 'biseccion' ? 'Bisección' : metodo === 'falsa' ? 'Falsa posición' : 'Newton-Raphson';

  // tabla de iteraciones
  var arr = metodo === 'newton' ? pts.slice(1) : pts;
  var t = '<table class="tbl" style="margin:0;font-size:.82rem;text-align:center">' +
          '<tr><th>iter</th><th>aproximación</th><th>error</th></tr>';
  var desde = Math.max(0, arr.length - 6);
  for (var k = desde; k < arr.length; k++) {
    t += '<tr' + (k === arr.length - 1 ? ' style="background:rgba(28,122,76,.14)"' : '') +
         '><td>' + (k + 1) + '</td><td>' + arr[k].toFixed(8) + '</td><td>' +
         Math.abs(arr[k] - cfg.raiz).toExponential(2) + '</td></tr>';
  }
  q(host, '.tabla').innerHTML = t + '</table>';

  q(host, '.viz-readout').innerHTML =
    '<strong>' + nombre + '</strong> sobre ' + cfg.n + ' · raíz exacta ≈ ' + cfg.raiz.toFixed(6) + '<br>' +
    'Tras ' + it + ' iteraciones: <strong style="color:#dba949">' + aprox.toFixed(8) +
      '</strong> · error <strong>' + err.toExponential(3) + '</strong><br>' +
    '<span style="color:#8fb4d9">' +
    (metodo === 'biseccion'
      ? 'Bisección parte el intervalo por la mitad cada vez. Lenta pero <strong>infalible</strong>: ' +
        'si hay cambio de signo, converge siempre. El error se divide entre 2 en cada paso.'
      : metodo === 'falsa'
      ? 'Falsa posición usa la recta secante entre los extremos en vez del punto medio. Suele ser ' +
        'más rápida que bisección, y también garantiza convergencia por mantener el cambio de signo.'
      : 'Newton usa la tangente en cada punto para saltar al siguiente. Muy rápida ' +
        '(<strong>convergencia cuadrática</strong>: los decimales correctos se duplican), pero ' +
        'necesita la derivada y puede fallar si la tangente apunta lejos. Compara el error con el ' +
        'de bisección al mismo número de pasos.') +
    '</span>';
});

/* ══════ S09 · Newton para sistemas: intersección de dos curvas ══════ */
var SISNL = {
  circ: { n: 'x² + y² = 4  ∩  y = x²',
          f1: function (x, y) { return x*x + y*y - 4; },
          f2: function (x, y) { return y - x*x; },
          J: function (x, y) { return [[2*x, 2*y], [-2*x, 1]]; },
          c1: 'circunferencia', c2: 'parábola',
          x0: 1, y0: 1, sol: [1.24962107, 1.56155281],
          dibujar1: function (t) { return [2*Math.cos(t), 2*Math.sin(t)]; }, t1a: 0, t1b: 6.2832,
          dibujar2: function (t) { return [t, t*t]; }, t2a: -1.6, t2b: 1.6 },
  hiper: { n: 'xy = 1  ∩  x² + y² = 4',
           f1: function (x, y) { return x*y - 1; },
           f2: function (x, y) { return x*x + y*y - 4; },
           J: function (x, y) { return [[y, x], [2*x, 2*y]]; },
           c1: 'hipérbola', c2: 'circunferencia',
           x0: 1.8, y0: 0.6, sol: [1.9318516, 0.5176381],
           dibujar1: function (t) { return [t, 1/t]; }, t1a: 0.3, t1b: 3.3,
           dibujar2: function (t) { return [2*Math.cos(t), 2*Math.sin(t)]; }, t2a: 0, t2b: 6.2832 },
  senos: { n: 'y = sen x  ∩  y = x/2',
           f1: function (x, y) { return y - Math.sin(x); },
           f2: function (x, y) { return y - x/2; },
           J: function (x, y) { return [[-Math.cos(x), 1], [-0.5, 1]]; },
           c1: 'seno', c2: 'recta',
           x0: 2, y0: 1, sol: [1.8954942, 0.9477471],
           dibujar1: function (t) { return [t, Math.sin(t)]; }, t1a: -0.5, t1b: 3.2,
           dibujar2: function (t) { return [t, t/2]; }, t2a: -0.5, t2b: 3.2 }
};

function newtonSistema(cfg, n) {
  var x = cfg.x0, y = cfg.y0, hist = [[x, y]];
  for (var i = 0; i < n; i++) {
    var F = [cfg.f1(x, y), cfg.f2(x, y)];
    var J = cfg.J(x, y);
    var det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    if (Math.abs(det) < 1e-12) break;
    // resolver J·d = -F
    var dx = (-F[0] * J[1][1] + F[1] * J[0][1]) / det;
    var dy = (-J[0][0] * F[1] + J[1][0] * F[0]) / det;
    x += dx; y += dy; hist.push([x, y]);
    if (!isFinite(x) || Math.abs(x) > 1e6) break;
  }
  return hist;
}

OVA.viz.registrar('newton-sistema', function (host) {
  var cfg = SISNL[q(host, 'select').value] || SISNL.circ;
  var it = parseInt(q(host, '.iter').value, 10);
  q(host, '.iter-val').textContent = it + ' iteraciones';

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 340, sx: 48, sy: 48 });
  OVA.ejes(L);
  var c = L.ctx;

  // dibujar las dos curvas
  var trazar = function (fn, ta, tb, color) {
    c.strokeStyle = color; c.lineWidth = 2.4; c.beginPath();
    var primero = true;
    for (var t = ta; t <= tb; t += (tb - ta) / 300) {
      var p = fn(t);
      if (!isFinite(p[0]) || !isFinite(p[1])) { primero = true; continue; }
      var px = L.px(p[0]), py = L.py(p[1]);
      if (px < -50 || px > L.w + 50 || py < -50 || py > L.h + 50) { primero = true; continue; }
      primero ? (c.moveTo(px, py), primero = false) : c.lineTo(px, py);
    }
    c.stroke();
  };
  trazar(cfg.dibujar1, cfg.t1a, cfg.t1b, 'rgba(58,110,165,.85)');
  trazar(cfg.dibujar2, cfg.t2a, cfg.t2b, 'rgba(198,143,46,.85)');

  var hist = newtonSistema(cfg, Math.max(it, 8));
  // camino de iteraciones
  c.strokeStyle = 'rgba(176,57,44,.5)'; c.lineWidth = 1.6; c.setLineDash([4, 3]);
  c.beginPath();
  for (var i = 0; i <= Math.min(it, hist.length - 1); i++) {
    var p = hist[i];
    i ? c.lineTo(L.px(p[0]), L.py(p[1])) : c.moveTo(L.px(p[0]), L.py(p[1]));
  }
  c.stroke(); c.setLineDash([]);
  for (var k = 0; k <= Math.min(it, hist.length - 1); k++) {
    OVA.punto(L, hist[k][0], hist[k][1], k === Math.min(it, hist.length - 1) ? ROJO : ORO);
  }
  // solución exacta
  OVA.punto(L, cfg.sol[0], cfg.sol[1], VERDE);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  var idx = Math.min(it, hist.length - 1);
  var pAprox = hist[idx];
  var err = Math.hypot(pAprox[0] - cfg.sol[0], pAprox[1] - cfg.sol[1]);

  var t = '<table class="tbl" style="margin:0;font-size:.82rem;text-align:center">' +
          '<tr><th>iter</th><th>x</th><th>y</th><th>‖error‖</th></tr>';
  for (var m = 0; m <= idx; m++) {
    var e = Math.hypot(hist[m][0] - cfg.sol[0], hist[m][1] - cfg.sol[1]);
    t += '<tr' + (m === idx ? ' style="background:rgba(28,122,76,.14)"' : '') + '><td>' + m +
         '</td><td>' + hist[m][0].toFixed(6) + '</td><td>' + hist[m][1].toFixed(6) +
         '</td><td>' + e.toExponential(2) + '</td></tr>';
  }
  q(host, '.tabla').innerHTML = t + '</table>';

  q(host, '.viz-readout').innerHTML =
    '<strong>Newton para sistemas</strong> · ' + cfg.n + '<br>' +
    'Intersección de <span style="color:#8fb4d9">' + cfg.c1 + '</span> y ' +
    '<span style="color:#dba949">' + cfg.c2 + '</span> ≈ (' +
    cfg.sol[0].toFixed(4) + ', ' + cfg.sol[1].toFixed(4) + ')<br>' +
    'Iteración ' + idx + ': (' + pAprox[0].toFixed(6) + ', ' + pAprox[1].toFixed(6) +
    ') · error ' + err.toExponential(3) + '<br>' +
    '<span style="color:#8fb4d9">En vez de una derivada, Newton usa la matriz <strong>Jacobiana</strong> ' +
    'de las derivadas parciales, y en cada paso resuelve un sistema lineal $J\\,\\Delta=-F$ ' +
    '(¡las Guías 3 y 4!). Conserva la convergencia cuadrática: mira cómo el error se desploma. ' +
    'El punto de partida importa: cada solución tiene su propia zona de atracción.</span>';
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
/* ══════════════════════════════════════════════════════════
   CORTE III · S11–S14
   regresion (S11) · derivada · cuadratura (S12) · euler (S13)
   rungekutta · ordenerror (S14)
   ══════════════════════════════════════════════════════════ */
function marcoM(cv, alto, xmin, xmax, ymin, ymax) {
  var L = OVA.lienzo(cv, { alto: alto });
  var padL = 46, padR = 14, padT = 14, padB = 26;
  L.sx = (L.w - padL - padR) / (xmax - xmin); L.sy = (L.h - padT - padB) / (ymax - ymin);
  L.ox = padL - xmin * L.sx; L.oy = padT + ymax * L.sy;
  L.xmin = xmin; L.xmax = xmax; L.ymin = ymin; L.ymax = ymax;
  return L;
}
function ejesM(L, px, py, logy) {
  var c = L.ctx, grid = OVA.color('cv-grid'), axis = OVA.color('cv-axis'), txt = OVA.color('cv-text'), v, p;
  c.strokeStyle = grid; c.lineWidth = 1; c.fillStyle = txt; c.font = '10px ui-monospace,monospace';
  for (v = Math.ceil(L.xmin / px - 1e-9) * px; v <= L.xmax + 1e-9; v += px) {
    p = L.px(v); c.beginPath(); c.moveTo(p, L.py(L.ymin)); c.lineTo(p, L.py(L.ymax)); c.stroke();
    c.fillText(String(Math.round(v * 1000) / 1000), p - 6, L.py(L.ymin) + 13);
  }
  for (v = Math.ceil(L.ymin / py - 1e-9) * py; v <= L.ymax + 1e-9; v += py) {
    p = L.py(v); c.beginPath(); c.moveTo(L.px(L.xmin), p); c.lineTo(L.px(L.xmax), p); c.stroke();
    c.fillText(logy ? ('1e' + Math.round(v)) : String(Math.round(v * 100) / 100), L.px(L.xmin) - 40, p + 3);
  }
  c.strokeStyle = axis; c.lineWidth = 1.6;
  var yA = Math.min(Math.max(0, L.ymin), L.ymax), xA = Math.min(Math.max(0, L.xmin), L.xmax);
  c.beginPath(); c.moveTo(L.px(L.xmin), L.py(yA)); c.lineTo(L.px(L.xmax), L.py(yA)); c.stroke();
  c.beginPath(); c.moveTo(L.px(xA), L.py(L.ymin)); c.lineTo(L.px(xA), L.py(L.ymax)); c.stroke();
}
function clipM(L, fn) { var c = L.ctx; c.save(); c.beginPath(); c.rect(L.px(L.xmin), L.py(L.ymax), L.px(L.xmax) - L.px(L.xmin), L.py(L.ymin) - L.py(L.ymax)); c.clip(); fn(); c.restore(); }
function d3(v) { return (Math.round(v * 1000) / 1000).toFixed(3); }
function d4(v) { return (Math.round(v * 10000) / 10000).toFixed(4); }
function d5(v) { return (Math.round(v * 100000) / 100000).toFixed(5); }
function poli(L, pts, color, ancho) { var c = L.ctx; c.strokeStyle = color; c.lineWidth = ancho || 2.4; c.beginPath(); pts.forEach(function (p, i) { i ? c.lineTo(L.px(p[0]), L.py(p[1])) : c.moveTo(L.px(p[0]), L.py(p[1])); }); c.stroke(); }
/* resuelve A x = b (Gauss con pivoteo parcial), matrices pequeñas */
function solveM(A, b) {
  var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); }), i, j, k;
  for (i = 0; i < n; i++) {
    var p = i; for (k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    var t = M[i]; M[i] = M[p]; M[p] = t;
    for (k = i + 1; k < n; k++) { var f = M[k][i] / M[i][i]; for (j = i; j <= n; j++) M[k][j] -= f * M[i][j]; }
  }
  var x = new Array(n);
  for (i = n - 1; i >= 0; i--) { var s = M[i][n]; for (j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}
function ajusteMC(xs, ys, grado) {   // mínimos cuadrados polinomial, devuelve [a0..ag]
  var m = grado + 1, A = [], b = [], i, j, k;
  for (i = 0; i < m; i++) { A.push([]); for (j = 0; j < m; j++) { var s = 0; for (k = 0; k < xs.length; k++) s += Math.pow(xs[k], i + j); A[i].push(s); } var t = 0; for (k = 0; k < xs.length; k++) t += ys[k] * Math.pow(xs[k], i); b.push(t); }
  return solveM(A, b);
}
function evalP(a, x) { var s = 0, i; for (i = a.length - 1; i >= 0; i--) s = s * x + a[i]; return s; }

/* ══════════ S11 · Regresión por mínimos cuadrados ══════════ */
var DATOS = {
  lineal: { x: [1, 2, 3, 4, 5], y: [3, 4, 6, 7, 10], n: '5 puntos (Ejemplo 1)', r: [0, 6, 0, 12], modelo: 'recta', sA: 'y = 0,9 + 1,7x', tip: 'La recta de mínimos cuadrados tiene S_r = 1,10; ninguna otra recta baja de ahí.' },
  cuad:   { x: [0, 1, 2, 3, 4, 5], y: [2.1, 7.7, 13.6, 27.2, 40.9, 61.1], n: '6 puntos (Ejemplo 2, Chapra)', r: [-0.5, 5.5, 0, 65], modelo: 'parábola', sA: 'y = 2,4786 + 2,3593x + 1,8607x²', tip: 'Compara con la recta: S_r pasa de 133,0 a 3,75. El modelo correcto se nota en los residuos.' },
  expo:   { x: [0, 1, 2, 3], y: [2, 3.2974, 5.4366, 8.9634], n: '4 puntos de y = 2e^{0,5x}', r: [-0.5, 3.5, 0, 10], modelo: 'exponencial', sA: 'y = 2e^{0,5x}', tip: 'Se ajusta la recta a ln y: pendiente 0,5 e intercepto ln 2. Los datos son exactos, por eso S_r = 0.' }
};

OVA.viz.registrar('regresion', function (host) {
  var cfg = DATOS[q(host, 'select').value] || DATOS.lineal;
  var a0 = parseFloat(q(host, '.a0').value) / 10, a1 = parseFloat(q(host, '.a1').value) / 10;
  q(host, '.a0-val').textContent = 'a₀ = ' + a0.toFixed(1); q(host, '.a1-val').textContent = 'a₁ = ' + a1.toFixed(1);
  var xs = cfg.x, ys = cfg.y, i, L = marcoM(q(host, 'canvas'), 320, cfg.r[0], cfg.r[1], cfg.r[2], cfg.r[3]);
  ejesM(L, 1, cfg.r[3] > 20 ? 10 : 2);
  var c = L.ctx, mejor, fMejor, SrMejor = 0, SrManual = 0, fManual = function (x) { return a0 + a1 * x; };
  if (cfg.modelo === 'recta') { mejor = ajusteMC(xs, ys, 1); fMejor = function (x) { return evalP(mejor, x); }; }
  else if (cfg.modelo === 'parábola') { mejor = ajusteMC(xs, ys, 2); fMejor = function (x) { return evalP(mejor, x); }; }
  else { var lny = ys.map(Math.log); mejor = ajusteMC(xs, lny, 1); fMejor = function (x) { return Math.exp(mejor[0] + mejor[1] * x); }; }
  for (i = 0; i < xs.length; i++) { SrMejor += Math.pow(ys[i] - fMejor(xs[i]), 2); SrManual += Math.pow(ys[i] - fManual(xs[i]), 2); }
  clipM(L, function () {
    OVA.curva(L, fManual, 'rgba(176,57,44,.8)', 1.8);
    OVA.curva(L, fMejor, VERDE, 2.8);
    for (i = 0; i < xs.length; i++) {
      c.strokeStyle = 'rgba(176,57,44,.6)'; c.lineWidth = 1.4; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(L.px(xs[i]), L.py(ys[i])); c.lineTo(L.px(xs[i]), L.py(fManual(xs[i]))); c.stroke(); c.setLineDash([]);
      OVA.punto(L, xs[i], ys[i], AZUL);
    }
  });
  c.font = 'bold 11px ui-monospace,monospace'; c.fillStyle = VERDE; c.fillText('— mínimos cuadrados: ' + cfg.sA, L.px(L.xmin) + 6, 22);
  c.fillStyle = ROJO; c.fillText('— recta manual y = a₀ + a₁x', L.px(L.xmin) + 6, 38);
  var ymed = 0; for (i = 0; i < ys.length; i++) ymed += ys[i] / ys.length; var St = 0; for (i = 0; i < ys.length; i++) St += Math.pow(ys[i] - ymed, 2);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · modelo de mínimos cuadrados (verde): <strong>' + cfg.sA + '</strong>, S_r = <strong style="color:#7fd4a4">' + d3(SrMejor) + '</strong>, r² = ' + d4(1 - SrMejor / St) + '<br>' +
    'Tu recta (roja) y = ' + a0.toFixed(1) + ' + ' + a1.toFixed(1) + 'x: suma de cuadrados de los residuos (segmentos punteados) S_r = <strong style="color:#e08b7e">' + d3(SrManual) + '</strong>' +
    (SrManual < SrMejor - 1e-9 ? ' — ¡menor! (solo posible si el modelo verde no es una recta)' : SrManual - SrMejor < 1e-6 ? ' — es la óptima' : ' — mayor que la óptima') + '<br>' +
    '<span style="color:#8fb4d9">' + cfg.tip + ' Mueve a₀ y a₁ e intenta bajar S_r.</span>';
});

/* ══════════ S12 · Diferenciación numérica ══════════ */
var DFUN = {
  exp: { f: Math.exp, df: Math.exp, n: 'f(x) = eˣ', x0: 0, r: [-0.8, 0.8, 0, 2.4] },
  sen: { f: Math.sin, df: Math.cos, n: 'f(x) = sen x', x0: 1, r: [0.2, 1.8, 0, 1.2] },
  cub: { f: function (x) { return x * x * x; }, df: function (x) { return 3 * x * x; }, n: 'f(x) = x³', x0: 1, r: [0.2, 1.8, 0, 4] }
};
OVA.viz.registrar('derivada', function (host) {
  var cfg = DFUN[q(host, 'select').value] || DFUN.exp;
  var h = parseFloat(q(host, '.h').value) / 100;
  q(host, '.h-val').textContent = 'h = ' + h.toFixed(2);
  var f = cfg.f, x0 = cfg.x0, ex = cfg.df(x0);
  var ad = (f(x0 + h) - f(x0)) / h, at = (f(x0) - f(x0 - h)) / h, ce = (f(x0 + h) - f(x0 - h)) / (2 * h);
  var L = marcoM(q(host, 'canvas'), 320, cfg.r[0], cfg.r[1], cfg.r[2], cfg.r[3]);
  ejesM(L, 0.2, cfg.r[3] > 3 ? 1 : 0.5);
  var c = L.ctx;
  clipM(L, function () {
    OVA.curva(L, f, AZUL, 2.6);
    var y0 = f(x0), ext = 0.55;
    [[ad, ROJO], [at, ORO], [ce, VERDE]].forEach(function (s) { c.strokeStyle = s[1]; c.lineWidth = 1.8; c.beginPath(); c.moveTo(L.px(x0 - ext), L.py(y0 - s[0] * ext)); c.lineTo(L.px(x0 + ext), L.py(y0 + s[0] * ext)); c.stroke(); });
    c.setLineDash([4, 3]); c.strokeStyle = MORADO; c.lineWidth = 1.6; c.beginPath(); c.moveTo(L.px(x0 - ext), L.py(y0 - ex * ext)); c.lineTo(L.px(x0 + ext), L.py(y0 + ex * ext)); c.stroke(); c.setLineDash([]);
    OVA.punto(L, x0 - h, f(x0 - h), ORO, true); OVA.punto(L, x0 + h, f(x0 + h), ROJO, true); OVA.punto(L, x0, y0, AZUL);
  });
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = ROJO; c.fillText('— adelante', L.px(L.xmin) + 6, 22); c.fillStyle = ORO; c.fillText('— atrás', L.px(L.xmin) + 6, 38);
  c.fillStyle = VERDE; c.fillText('— central', L.px(L.xmin) + 6, 54); c.fillStyle = MORADO; c.fillText('- - tangente exacta', L.px(L.xmin) + 6, 70);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + ' en x₀ = ' + x0 + '</strong>, h = ' + h.toFixed(2) + ' · derivada exacta f′(x₀) = <strong>' + d5(ex) + '</strong><br>' +
    'Adelante <span style="color:#e08b7e">' + d5(ad) + '</span> (error ' + d5(Math.abs(ad - ex)) + ') · Atrás <span style="color:#f0c674">' + d5(at) + '</span> (error ' + d5(Math.abs(at - ex)) + ') · Central <strong style="color:#7fd4a4">' + d5(ce) + '</strong> (error ' + d5(Math.abs(ce - ex)) + ')<br>' +
    '<span style="color:#8fb4d9">Reduce h a la mitad: los errores de adelante y atrás se dividen por 2 (orden h); el de la central, por 4 (orden h²). La central usa los dos puntos vecinos y los errores de primer orden se cancelan.</span>';
});

/* ══════════ S12 · Cuadratura: trapecio y Simpson ══════════ */
var QFUN = {
  cub:  { f: function (x) { return x * x * x; }, a: 0, b: 2, ex: 4, sEx: '4', n: '∫₀² x³ dx', ymax: 8.5 },
  exp:  { f: Math.exp, a: 0, b: 1, ex: Math.E - 1, sEx: 'e − 1 ≈ 1,71828', n: '∫₀¹ eˣ dx', ymax: 3 },
  arc:  { f: function (x) { return 1 / (1 + x * x); }, a: 0, b: 1, ex: Math.PI / 4, sEx: 'π/4 ≈ 0,78540', n: '∫₀¹ dx/(1+x²)', ymax: 1.2 },
  sen:  { f: Math.sin, a: 0, b: Math.PI, ex: 2, sEx: '2', n: '∫₀^π sen x dx', ymax: 1.2 }
};
OVA.viz.registrar('cuadratura', function (host) {
  var cfg = QFUN[q(host, 'select').value] || QFUN.cub;
  var met = q(host, '.metodo').value, n = parseInt(q(host, '.n').value, 10);
  if (met === 's13' && n % 2) n += 1;
  if (met === 's38') n = 3 * Math.max(1, Math.round(n / 3));
  q(host, '.n-val').textContent = 'n = ' + n;
  var f = cfg.f, a = cfg.a, b = cfg.b, h = (b - a) / n, i, k, aprox = 0;
  var L = marcoM(q(host, 'canvas'), 320, a - 0.08 * (b - a), b + 0.08 * (b - a), -0.08 * cfg.ymax, cfg.ymax);
  ejesM(L, (b - a) / 4, cfg.ymax > 4 ? 2 : 0.5);
  var c = L.ctx;
  clipM(L, function () {
    if (met === 'trap') {
      for (i = 0; i < n; i++) {
        var x0 = a + i * h, x1 = x0 + h;
        c.fillStyle = 'rgba(198,143,46,.35)'; c.strokeStyle = ORO; c.lineWidth = 1;
        c.beginPath(); c.moveTo(L.px(x0), L.py(0)); c.lineTo(L.px(x0), L.py(f(x0))); c.lineTo(L.px(x1), L.py(f(x1))); c.lineTo(L.px(x1), L.py(0)); c.closePath(); c.fill(); c.stroke();
        aprox += h * (f(x0) + f(x1)) / 2;
      }
    } else {
      var paso = met === 's13' ? 2 : 3;
      for (i = 0; i < n; i += paso) {
        var xs = [], ys = [];
        for (k = 0; k <= paso; k++) { xs.push(a + (i + k) * h); ys.push(f(a + (i + k) * h)); }
        // polinomio interpolante de Lagrange sobre el tramo
        var P = function (x) { var s = 0, j, m; for (j = 0; j <= paso; j++) { var t = ys[j]; for (m = 0; m <= paso; m++) if (m !== j) t *= (x - xs[m]) / (xs[j] - xs[m]); s += t; } return s; };
        c.fillStyle = paso === 2 ? 'rgba(28,122,76,.3)' : 'rgba(125,79,158,.3)'; c.strokeStyle = paso === 2 ? VERDE : MORADO; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(L.px(xs[0]), L.py(0));
        for (k = 0; k <= 30; k++) { var xx = xs[0] + (xs[paso] - xs[0]) * k / 30; c.lineTo(L.px(xx), L.py(P(xx))); }
        c.lineTo(L.px(xs[paso]), L.py(0)); c.closePath(); c.fill(); c.stroke();
        aprox += paso === 2 ? h / 3 * (ys[0] + 4 * ys[1] + ys[2]) : 3 * h / 8 * (ys[0] + 3 * ys[1] + 3 * ys[2] + ys[3]);
      }
    }
    OVA.curva(L, f, AZUL, 2.6);
    for (i = 0; i <= n; i++) OVA.punto(L, a + i * h, f(a + i * h), AZUL);
  });
  var nom = met === 'trap' ? 'trapecio' : met === 's13' ? 'Simpson 1/3' : 'Simpson 3/8', err = aprox - cfg.ex;
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace'; c.fillText(cfg.n + ' · ' + nom, L.px(L.xmin) + 6, 22);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> con <strong>' + nom + '</strong>, n = ' + n + ' segmentos, h = ' + d4(h) + '<br>' +
    'Aproximación: <strong style="color:#c68f2e">' + d5(aprox) + '</strong> · exacto ' + cfg.sEx + ' · error ' + (err >= 0 ? '+' : '') + d5(err) +
    (Math.abs(err) < 1e-12 ? ' <strong>(exacto: el método integra polinomios de grado ≤ ' + (met === 'trap' ? 1 : 3) + ' sin error)</strong>' : '') + '<br>' +
    '<span style="color:#8fb4d9">El trapecio une los puntos con rectas (error ~h²); Simpson 1/3 pasa parábolas por cada par de segmentos y Simpson 3/8 cúbicas por cada tres (error ~h⁴). Duplica n y mira cuánto cae el error.</span>';
});

/* ══════════ S13 / S14 · EDO: Euler, Heun, punto medio, RK4 ══════════ */
var EDOS = {
  ypy:  { f: function (x, y) { return y; }, ex: Math.exp, x0: 0, y0: 1, b: 2, n: "y' = y, y(0) = 1", sEx: 'y = eˣ', r: [0, 2, 0, 8] },
  xmy:  { f: function (x, y) { return x - y; }, ex: function (x) { return x - 1 + 2 * Math.exp(-x); }, x0: 0, y0: 1, b: 3, n: "y' = x − y, y(0) = 1", sEx: 'y = x − 1 + 2e^{−x}', r: [0, 3, 0, 2.2] },
  logi: { f: function (t, P) { return 0.5 * P * (1 - P / 100); }, ex: function (t) { return 100 / (1 + 9 * Math.exp(-0.5 * t)); }, x0: 0, y0: 10, b: 12, n: "P' = 0,5P(1 − P/100), P(0) = 10", sEx: 'P = 100/(1 + 9e^{−0,5t})', r: [0, 12, 0, 110] },
  enf:  { f: function (t, T) { return -0.1 * (T - 20); }, ex: function (t) { return 20 + 70 * Math.exp(-0.1 * t); }, x0: 0, y0: 90, b: 30, n: "T' = −0,1(T − 20), T(0) = 90", sEx: 'T = 20 + 70e^{−0,1t}', r: [0, 30, 0, 100] }
};
function pasoEDO(met, f, x, y, h) {
  var k1 = f(x, y), k2, k3, k4;
  if (met === 'euler') return y + h * k1;
  if (met === 'heun') { k2 = f(x + h, y + h * k1); return y + h * (k1 + k2) / 2; }
  if (met === 'medio') { k2 = f(x + h / 2, y + h / 2 * k1); return y + h * k2; }
  k2 = f(x + h / 2, y + h / 2 * k1); k3 = f(x + h / 2, y + h / 2 * k2); k4 = f(x + h, y + h * k3);
  return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
}
function integrarEDO(met, cfg, h) {
  var pts = [[cfg.x0, cfg.y0]], x = cfg.x0, y = cfg.y0, N = Math.round((cfg.b - cfg.x0) / h), i;
  for (i = 0; i < N; i++) { y = pasoEDO(met, cfg.f, x, y, h); x = cfg.x0 + (i + 1) * h; pts.push([x, y]); }
  return pts;
}
var NOMBRES = { euler: 'Euler', heun: 'Heun (predictor-corrector)', medio: 'punto medio', rk4: 'Runge-Kutta 4' };
var EVALS = { euler: 1, heun: 2, medio: 2, rk4: 4 };
function dibujarEDO(host, permitidos) {
  var cfg = EDOS[q(host, '.edo').value] || EDOS.ypy;
  var met = q(host, '.metodo').value; if (permitidos.indexOf(met) < 0) met = permitidos[0];
  var hs = [cfg.b / 2, cfg.b / 4, cfg.b / 8, cfg.b / 16, cfg.b / 32], h = hs[parseInt(q(host, '.h').value, 10)] || hs[1];
  q(host, '.h-val').textContent = 'h = ' + (Math.round(h * 1000) / 1000);
  var pts = integrarEDO(met, cfg, h), L = marcoM(q(host, 'canvas'), 320, cfg.r[0], cfg.r[1], cfg.r[2], cfg.r[3]);
  ejesM(L, cfg.b / 4, cfg.r[3] > 50 ? 20 : cfg.r[3] > 5 ? 2 : 0.5);
  var c = L.ctx;
  clipM(L, function () {
    OVA.curva(L, cfg.ex, VERDE, 2.4);
    poli(L, pts, ORO, 2.2);
    pts.forEach(function (p) { OVA.punto(L, p[0], p[1], ORO); });
  });
  c.font = 'bold 11px ui-monospace,monospace'; c.fillStyle = VERDE; c.fillText('— solución exacta ' + cfg.sEx, L.px(L.xmin) + 6, 22);
  c.fillStyle = ORO; c.fillText('— ' + NOMBRES[met], L.px(L.xmin) + 6, 38);
  var yN = pts[pts.length - 1][1], yEx = cfg.ex(cfg.b), err = Math.abs(yN - yEx);
  var pts2 = integrarEDO(met, cfg, h / 2), err2 = Math.abs(pts2[pts2.length - 1][1] - yEx);
  return { cfg: cfg, met: met, h: h, pts: pts, yN: yN, yEx: yEx, err: err, err2: err2, N: pts.length - 1 };
}
OVA.viz.registrar('euler', function (host) {
  var R = dibujarEDO(host, ['euler', 'heun', 'medio']);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + R.cfg.n + '</strong> · ' + NOMBRES[R.met] + ' con h = ' + d3(R.h) + ' (' + R.N + ' pasos, ' + EVALS[R.met] * R.N + ' evaluaciones de f)<br>' +
    'En x = ' + R.cfg.b + ': aproximación <strong style="color:#c68f2e">' + d4(R.yN) + '</strong> · exacta ' + d4(R.yEx) + ' · error <strong>' + d4(R.err) + '</strong>' +
    ' · con h/2 el error sería ' + d4(R.err2) + ' (cociente ' + (R.err2 > 0 ? (R.err / R.err2).toFixed(2) : '—') + ')<br>' +
    '<span style="color:#8fb4d9">Euler sigue la tangente del punto actual durante todo el paso (error global ~h: al partir h, el error se parte). Heun y punto medio corrigen la pendiente con una segunda evaluación (error ~h²: se divide por 4).</span>';
});
OVA.viz.registrar('rungekutta', function (host) {
  var R = dibujarEDO(host, ['rk4', 'heun', 'euler']);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + R.cfg.n + '</strong> · ' + NOMBRES[R.met] + ' con h = ' + d3(R.h) + ' (' + R.N + ' pasos, ' + EVALS[R.met] * R.N + ' evaluaciones de f)<br>' +
    'En x = ' + R.cfg.b + ': aproximación <strong style="color:#c68f2e">' + d5(R.yN) + '</strong> · exacta ' + d5(R.yEx) + ' · error <strong>' + (R.err < 1e-3 ? R.err.toExponential(2) : d5(R.err)) + '</strong>' +
    ' · con h/2: ' + (R.err2 < 1e-3 ? R.err2.toExponential(2) : d5(R.err2)) + ' (cociente ' + (R.err2 > 0 ? (R.err / R.err2).toFixed(1) : '—') + ')<br>' +
    '<span style="color:#8fb4d9">RK4 evalúa la pendiente cuatro veces por paso y las promedia con pesos 1-2-2-1: error global ~h⁴, el cociente tiende a 16. Con el mismo número de evaluaciones de f, RK4 suele ganar por mucho a Euler.</span>';
});

/* ══════════ S14 · Orden de convergencia: error vs h (log-log) ══════════ */
OVA.viz.registrar('ordenerror', function (host) {
  var cfg = EDOS[q(host, '.edo').value] || EDOS.ypy;
  var mets = ['euler', 'heun', 'rk4'], cols = { euler: ROJO, heun: ORO, rk4: VERDE }, hs = [1 / 8, 1 / 16, 1 / 32, 1 / 64, 1 / 128, 1 / 256].map(function (t) { return cfg.b * t; });
  var L = marcoM(q(host, 'canvas'), 320, Math.log10(hs[5]) - 0.2, Math.log10(hs[0]) + 0.2, -12, 1);
  ejesM(L, 0.5, 2, true);
  var c = L.ctx, series = {}, pend = {};
  mets.forEach(function (m) {
    var pts = hs.map(function (h) { var p = integrarEDO(m, cfg, h); var e = Math.abs(p[p.length - 1][1] - cfg.ex(cfg.b)); return [Math.log10(h), Math.log10(Math.max(e, 1e-14))]; });
    series[m] = pts; clipM(L, function () { poli(L, pts, cols[m], 2.2); pts.forEach(function (p) { OVA.punto(L, p[0], p[1], cols[m]); }); });
    pend[m] = (pts[3][1] - pts[5][1]) / (pts[3][0] - pts[5][0]);   // pendiente en la zona asintótica (h pequeño)
  });
  c.font = 'bold 11px ui-monospace,monospace'; c.fillStyle = ROJO; c.fillText('— Euler', L.px(L.xmin) + 6, 22); c.fillStyle = ORO; c.fillText('— Heun', L.px(L.xmin) + 6, 38); c.fillStyle = VERDE; c.fillText('— RK4', L.px(L.xmin) + 6, 54);
  c.fillStyle = OVA.color('cv-text'); c.fillText('log₁₀ h →', L.px(L.xmax) - 70, L.py(L.ymin) - 6); c.fillText('log₁₀ error', L.px(L.xmin) + 6, L.py(L.ymax) + 12 + 60);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · error en x = ' + cfg.b + ' frente al tamaño de paso h, en escala log-log (h desde ' + d3(hs[0]) + ' hasta ' + d4(hs[5]) + ')<br>' +
    'Pendientes (tramo de h más pequeño): Euler <strong style="color:#e08b7e">' + pend.euler.toFixed(2) + '</strong> (orden 1) · Heun <strong style="color:#f0c674">' + pend.heun.toFixed(2) + '</strong> (orden 2) · RK4 <strong style="color:#7fd4a4">' + pend.rk4.toFixed(2) + '</strong> (orden 4)<br>' +
    '<span style="color:#8fb4d9">En escala log-log, error ≈ C·hᵖ es una recta de pendiente p: el orden del método. Cada vez que h se divide por 10, el error de RK4 cae 10⁴ veces y el de Euler solo 10.</span>';
});

})();
