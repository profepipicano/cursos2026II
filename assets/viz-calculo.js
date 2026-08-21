/* ══════════════════════════════════════════════════════════
   Visualizadores · Curso de Cálculo
   Se registran en el motor; el HTML solo pone
   <div class="viz" data-viz="nombre">…</div>
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', VERDE = '#1c7a4c', ROJO = '#b0392c', MORADO = '#7d4f9e';

function ctrl(host, sel) { return host.querySelector(sel); }

/* ── Explorador de funciones ────────────────────────────── */
var FUNCS = {
  quad: { f: function (x) { return x * x - 4; },        n: 'f(x) = x² − 4',      c: ORO },
  cub:  { f: function (x) { return x * x * x - 3 * x; }, n: 'f(x) = x³ − 3x',    c: AZUL },
  rat:  { f: function (x) { return x === 1 ? NaN : 1 / (x - 1); }, n: 'f(x) = 1/(x−1)', c: MORADO },
  sqrt: { f: function (x) { return x >= -4 ? Math.sqrt(x + 4) : NaN; }, n: 'f(x) = √(x+4)', c: VERDE },
  abs:  { f: function (x) { return Math.abs(x - 2); },   n: 'f(x) = |x − 2|',    c: ROJO },
  sin:  { f: function (x) { return Math.sin(x); },       n: 'f(x) = sen(x)',     c: AZUL }
};

OVA.viz.registrar('explorador', function (host) {
  var cv = ctrl(host, 'canvas'), sel = ctrl(host, 'select'), sld = ctrl(host, 'input[type=range]');
  var out = ctrl(host, '.viz-readout');
  var d = FUNCS[sel.value] || FUNCS.quad;
  var L = OVA.lienzo(cv, { sx: 42, sy: 34 });
  OVA.ejes(L);
  OVA.curva(L, d.f, d.c);
  L.ctx.fillStyle = d.c;
  L.ctx.font = 'bold 12px ui-monospace,monospace';
  L.ctx.fillText(d.n, 10, 18);

  var x = parseFloat(sld.value) / 10, y = d.f(x);
  ctrl(host, '.x-val').textContent = 'x = ' + x.toFixed(1);

  if (isFinite(y) && Math.abs(L.py(y)) < 1e5 && L.py(y) > -20 && L.py(y) < L.h + 20) {
    var c = L.ctx;
    c.strokeStyle = 'rgba(128,128,128,.55)'; c.lineWidth = 1; c.setLineDash([4, 4]);
    c.beginPath(); c.moveTo(L.px(x), L.py(y)); c.lineTo(L.px(x), L.oy); c.stroke();
    c.beginPath(); c.moveTo(L.px(x), L.py(y)); c.lineTo(L.ox, L.py(y)); c.stroke();
    c.setLineDash([]);
    OVA.punto(L, x, y, d.c);
    out.innerHTML = '<strong>Punto:</strong> (' + x.toFixed(1) + ', ' + y.toFixed(2) + ')' +
      ' &nbsp;·&nbsp; <strong>f(' + x.toFixed(1) + ') =</strong> ' + y.toFixed(4);
  } else {
    out.innerHTML = '<strong>f(' + x.toFixed(1) + ')</strong> no está definida aquí: ' +
      'el valor queda fuera del dominio o la gráfica se va al infinito.';
  }
});

/* ── Composición paso a paso ────────────────────────────── */
var G_FN = {
  sq: { f: function (v) { return v * v; }, n: 'g(x) = x²' },
  p1: { f: function (v) { return v + 1; }, n: 'g(x) = x + 1' },
  m2: { f: function (v) { return 2 * v; }, n: 'g(x) = 2x' }
};
var F_FN = {
  raiz: { f: function (v) { return v >= 0 ? Math.sqrt(v) : NaN; }, n: 'f(u) = √u' },
  p3:   { f: function (v) { return v + 3; }, n: 'f(u) = u + 3' },
  inv:  { f: function (v) { return v === 0 ? NaN : 1 / v; }, n: 'f(u) = 1/u' }
};

OVA.viz.registrar('composicion', function (host) {
  var x = parseFloat(ctrl(host, '.comp-x').value);
  var g = G_FN[ctrl(host, '.comp-g').value], f = F_FN[ctrl(host, '.comp-f').value];
  var out = ctrl(host, '.viz-readout');
  if (!isFinite(x)) { out.innerHTML = 'Escribe un valor numérico para x.'; return; }
  var gx = g.f(x), fgx = f.f(gx);
  var caja = function (t, col) {
    return '<span style="display:inline-block;background:' + (col || 'rgba(255,255,255,.14)') +
           ';padding:.3rem .7rem;border-radius:6px;margin:.15rem">' + t + '</span>';
  };
  out.innerHTML =
    caja('x = ' + x) + ' <span style="color:#dba949">→ ' + g.n + ' →</span> ' +
    caja('g(x) = ' + (isFinite(gx) ? gx.toFixed(3).replace(/\.?0+$/, '') : 'no existe')) +
    ' <span style="color:#dba949">→ ' + f.n + ' →</span> ' +
    caja('<strong>f(g(x)) = ' + (isFinite(fgx) ? fgx.toFixed(4).replace(/\.?0+$/, '') : 'no existe') + '</strong>',
         isFinite(fgx) ? 'rgba(28,122,76,.55)' : 'rgba(176,57,44,.55)');
});

/* ── Acercamiento al límite ─────────────────────────────── */
var LIMS = {
  fac: { f: function (x) { return x === 2 ? NaN : (x * x - 4) / (x - 2); }, a: 2, L: 4, n: '(x²−4)/(x−2) → 4' },
  cub: { f: function (x) { return x === 3 ? NaN : (x * x - 9) / (x - 3); }, a: 3, L: 6, n: '(x²−9)/(x−3) → 6' },
  sinc:{ f: function (x) { return x === 0 ? NaN : Math.sin(x) / x; },       a: 0, L: 1, n: 'sen(x)/x → 1' }
};

OVA.viz.registrar('limite', function (host) {
  var cfg = LIMS[ctrl(host, 'select').value] || LIMS.fac;
  var delta = parseFloat(ctrl(host, 'input[type=range]').value) / 100;
  ctrl(host, '.d-val').textContent = 'δ = ' + delta.toFixed(2);
  var cv = ctrl(host, 'canvas');
  var L = OVA.lienzo(cv, { sx: 46, sy: 34 });
  L.ox = L.w / 2 - cfg.a * L.sx;
  L.oy = L.h / 2 + cfg.L * L.sy * 0.5;
  OVA.ejes(L);

  var c = L.ctx;
  c.fillStyle = 'rgba(198,143,46,.16)';
  c.fillRect(L.px(cfg.a - delta), 0, 2 * delta * L.sx, L.h);

  OVA.curva(L, cfg.f, AZUL);

  c.strokeStyle = ORO; c.lineWidth = 1.5; c.setLineDash([6, 4]);
  c.beginPath(); c.moveTo(0, L.py(cfg.L)); c.lineTo(L.w, L.py(cfg.L)); c.stroke();
  c.setLineDash([]);
  c.fillStyle = ORO; c.font = '11px ui-monospace,monospace';
  c.fillText('L = ' + cfg.L, 6, L.py(cfg.L) - 6);

  var xi = cfg.a - delta * 0.9, xd = cfg.a + delta * 0.9;
  if (isFinite(cfg.f(xi))) OVA.punto(L, xi, cfg.f(xi), ROJO);
  if (isFinite(cfg.f(xd))) OVA.punto(L, xd, cfg.f(xd), AZUL);
  OVA.punto(L, cfg.a, cfg.L, OVA.color('cv-axis'), true);

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  ctrl(host, '.viz-readout').innerHTML =
    '<span style="color:#e08b7e">●</span> por la izquierda: f(' + xi.toFixed(3) + ') = ' +
      (isFinite(cfg.f(xi)) ? cfg.f(xi).toFixed(4) : '—') + '<br>' +
    '<span style="color:#8fb4d9">●</span> por la derecha: f(' + xd.toFixed(3) + ') = ' +
      (isFinite(cfg.f(xd)) ? cfg.f(xd).toFixed(4) : '—') + '<br>' +
    '<span style="color:#dba949">━</span> Al reducir δ, ambos valores se acercan a L = ' + cfg.L +
    '. En x = ' + cfg.a + ' la función no está definida (círculo hueco), y aun así el límite existe.';
});

/* ── Recta tangente ─────────────────────────────────────── */
OVA.viz.registrar('tangente', function (host) {
  var a = parseFloat(ctrl(host, 'input[type=range]').value) / 10;
  ctrl(host, '.a-val').textContent = 'a = ' + a.toFixed(1);
  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 40, sy: 24 });
  L.oy = L.h * 0.82;
  OVA.ejes(L);
  var f = function (x) { return x * x; };
  OVA.curva(L, f, AZUL);
  var m = 2 * a, fa = f(a);
  OVA.curva(L, function (x) { return m * (x - a) + fa; }, ORO, 2);
  OVA.punto(L, a, fa, ORO);
  var c = L.ctx;
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText('f(x) = x²', 10, 18);
  ctrl(host, '.viz-readout').innerHTML =
    '<strong>f′(a) = 2a = ' + m.toFixed(1) + '</strong> · Recta tangente: y = ' +
    m.toFixed(1) + '(x − ' + a.toFixed(1) + ') + ' + fa.toFixed(2) + '<br>' +
    'La pendiente de la tangente <em>es</em> la derivada. Mueve el punto y observa que en a = 0 ' +
    'la tangente es horizontal (f′(0) = 0).';
});

/* ── Enlazar controles: cualquier cambio redibuja ───────── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (host) {
    host.addEventListener('input', function () { OVA.viz.redibujar(); });
    host.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
