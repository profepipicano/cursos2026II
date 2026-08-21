/* ══════════════════════════════════════════════════════════
   Visualizadores · Métodos Numéricos
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', ROJO = '#b0392c', VERDE = '#1c7a4c';
function q(host, sel) { return host.querySelector(sel); }
function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }

/* ── Serie de Taylor y error de truncamiento ────────────── */
var TAY = {
  exp: { f: Math.exp,  t: function (x, n) { var s = 0; for (var k = 0; k <= n; k++) s += Math.pow(x, k) / fact(k); return s; }, n: 'eˣ' },
  sin: { f: Math.sin,  t: function (x, n) { var s = 0; for (var k = 0; k <= n; k++) { if (k % 2) s += Math.pow(-1, (k - 1) / 2) * Math.pow(x, k) / fact(k); } return s; }, n: 'sen x' },
  cos: { f: Math.cos,  t: function (x, n) { var s = 0; for (var k = 0; k <= n; k++) { if (k % 2 === 0) s += Math.pow(-1, k / 2) * Math.pow(x, k) / fact(k); } return s; }, n: 'cos x' }
};

OVA.viz.registrar('taylor', function (host) {
  var cfg = TAY[q(host, 'select').value] || TAY.exp;
  var n = parseInt(q(host, '.grado').value, 10);
  var xe = parseFloat(q(host, '.punto').value);
  q(host, '.grado-val').textContent = 'n = ' + n;
  q(host, '.punto-val').textContent = 'x = ' + xe.toFixed(1);

  var L = OVA.lienzo(q(host, 'canvas'), { sx: 46, sy: 30 });
  L.oy = L.h * 0.62;
  OVA.ejes(L);
  OVA.curva(L, cfg.f, AZUL, 3);
  OVA.curva(L, function (x) { return cfg.t(x, n); }, ORO, 2.2);

  var real = cfg.f(xe), aprox = cfg.t(xe, n);
  var c = L.ctx;
  c.strokeStyle = ROJO; c.lineWidth = 2; c.setLineDash([3, 3]);
  c.beginPath(); c.moveTo(L.px(xe), L.py(real)); c.lineTo(L.px(xe), L.py(aprox)); c.stroke();
  c.setLineDash([]);
  OVA.punto(L, xe, real, AZUL);
  OVA.punto(L, xe, aprox, ORO);

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText('— ' + cfg.n + '   — polinomio de Taylor grado ' + n, 10, 18);

  var ea = Math.abs(real - aprox);
  var er = real !== 0 ? ea / Math.abs(real) : NaN;
  q(host, '.viz-readout').innerHTML =
    'Valor exacto: <strong>' + real.toFixed(8) + '</strong><br>' +
    'Aproximación $P_{' + n + '}$: <strong>' + aprox.toFixed(8) + '</strong><br>' +
    'Error absoluto: <strong style="color:#f0a58a">' + ea.toExponential(3) + '</strong>' +
    ' &nbsp;·&nbsp; Error relativo: <strong style="color:#f0a58a">' +
      (isFinite(er) ? (er * 100).toExponential(3) + ' %' : '—') + '</strong><br>' +
    '<span style="color:#8fb4d9">Sube el grado y observa cómo cae el error; aléjate del origen y ' +
    'observa cómo vuelve a crecer. Ese es el error de truncamiento.</span>';
  OVA.mj(q(host, '.viz-readout'));
});

/* ── Bisección paso a paso ──────────────────────────────── */
var BIS = {
  a: { f: function (x) { return x * x * x - x - 2; }, n: 'f(x) = x³ − x − 2', a: 1, b: 2 },
  b: { f: function (x) { return Math.cos(x) - x; },   n: 'f(x) = cos x − x',  a: 0, b: 1 },
  c: { f: function (x) { return Math.exp(x) - 3 * x; }, n: 'f(x) = eˣ − 3x',  a: 0, b: 1 }
};

OVA.viz.registrar('biseccion', function (host) {
  var cfg = BIS[q(host, 'select').value] || BIS.a;
  var iters = parseInt(q(host, '.iters').value, 10);
  q(host, '.iters-val').textContent = iters + ' iteraciones';

  var a = cfg.a, b = cfg.b, filas = [], m = a, ea = NaN, prev = null;
  for (var k = 1; k <= iters; k++) {
    m = (a + b) / 2;
    ea = prev === null ? NaN : Math.abs((m - prev) / m);
    filas.push({ k: k, a: a, b: b, m: m, fm: cfg.f(m), ea: ea });
    if (cfg.f(a) * cfg.f(m) < 0) b = m; else a = m;
    prev = m;
  }

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 210, sx: 1, sy: 1 });
  var x0 = cfg.a - (cfg.b - cfg.a) * 0.15, x1 = cfg.b + (cfg.b - cfg.a) * 0.15;
  L.sx = L.w / (x1 - x0); L.ox = -x0 * L.sx;
  var vals = [], i;
  for (i = 0; i <= 100; i++) vals.push(cfg.f(x0 + (x1 - x0) * i / 100));
  var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  L.sy = L.h * 0.8 / (hi - lo); L.oy = L.h * 0.9 + lo * L.sy;
  OVA.ejes(L);
  OVA.curva(L, cfg.f, AZUL, 2.5);

  var ult = filas[filas.length - 1];
  L.ctx.fillStyle = 'rgba(198,143,46,.22)';
  L.ctx.fillRect(L.px(ult.a), 0, (ult.b - ult.a) * L.sx, L.h);
  OVA.punto(L, ult.m, cfg.f(ult.m), ROJO);
  L.ctx.fillStyle = OVA.color('cv-text'); L.ctx.font = 'bold 12px ui-monospace,monospace';
  L.ctx.fillText(cfg.n, 10, 16);

  var tabla = '<table class="tbl" style="margin:0;font-size:.8rem"><tr>' +
    '<th>i</th><th>a</th><th>b</th><th>m</th><th>f(m)</th><th>|εₐ|</th></tr>';
  filas.slice(-8).forEach(function (r) {
    tabla += '<tr><td>' + r.k + '</td><td>' + r.a.toFixed(6) + '</td><td>' + r.b.toFixed(6) +
      '</td><td><strong>' + r.m.toFixed(6) + '</strong></td><td>' + r.fm.toExponential(2) +
      '</td><td>' + (isFinite(r.ea) ? (r.ea * 100).toFixed(4) + ' %' : '—') + '</td></tr>';
  });
  tabla += '</table>';
  q(host, '.tabla-iter').innerHTML = tabla;

  q(host, '.viz-readout').innerHTML =
    'Raíz aproximada tras ' + iters + ' iteraciones: <strong>' + ult.m.toFixed(8) + '</strong><br>' +
    'Amplitud del intervalo: <strong>' + Math.abs(ult.b - ult.a).toExponential(3) + '</strong> ' +
    '(se divide exactamente a la mitad cada paso: convergencia lineal).';
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
