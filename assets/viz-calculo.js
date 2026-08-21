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

/* ── Transformaciones de gráficas ───────────────────────── */
var BASES = {
  cuad: { f: function (x) { return x * x; },       n: 'x²' },
  abs:  { f: function (x) { return Math.abs(x); }, n: '|x|' },
  raiz: { f: function (x) { return x >= 0 ? Math.sqrt(x) : NaN; }, n: '√x' },
  cub:  { f: function (x) { return x * x * x; },   n: 'x³' },
  sen:  { f: function (x) { return Math.sin(x); }, n: 'sen x' }
};

OVA.viz.registrar('transformaciones', function (host) {
  var base = BASES[ctrl(host, 'select').value] || BASES.cuad;
  var a = parseFloat(ctrl(host, '.par-a').value) / 10;
  var h = parseFloat(ctrl(host, '.par-h').value) / 10;
  var k = parseFloat(ctrl(host, '.par-k').value) / 10;
  ctrl(host, '.a-v').textContent = 'a = ' + a.toFixed(1);
  ctrl(host, '.h-v').textContent = 'h = ' + h.toFixed(1);
  ctrl(host, '.k-v').textContent = 'k = ' + k.toFixed(1);

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 38, sy: 30 });
  OVA.ejes(L);

  // Original punteada
  var c = L.ctx;
  c.setLineDash([5, 5]);
  OVA.curva(L, base.f, 'rgba(128,150,175,.85)', 2);
  c.setLineDash([]);
  // Transformada
  OVA.curva(L, function (x) { return a * base.f(x - h) + k; }, ORO, 3);

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText('- - -  y = ' + base.n, 10, 18);
  c.fillStyle = ORO;
  c.fillText('———  y = a·f(x−h)+k', 10, 34);

  var partes = [];
  if (a < 0) partes.push('reflexión respecto al eje x');
  if (Math.abs(a) > 1) partes.push('estiramiento vertical de factor ' + Math.abs(a).toFixed(1));
  if (Math.abs(a) < 1 && a !== 0) partes.push('compresión vertical de factor ' + Math.abs(a).toFixed(1));
  if (h > 0) partes.push(h.toFixed(1) + ' unidades a la <strong>derecha</strong>');
  if (h < 0) partes.push(Math.abs(h).toFixed(1) + ' unidades a la <strong>izquierda</strong>');
  if (k > 0) partes.push(k.toFixed(1) + ' unidades hacia <strong>arriba</strong>');
  if (k < 0) partes.push(Math.abs(k).toFixed(1) + ' unidades hacia <strong>abajo</strong>');

  ctrl(host, '.viz-readout').innerHTML =
    'y = ' + (a === 1 ? '' : a.toFixed(1) + '·') + 'f(x' +
      (h === 0 ? '' : (h > 0 ? ' − ' + h.toFixed(1) : ' + ' + Math.abs(h).toFixed(1))) + ')' +
      (k === 0 ? '' : (k > 0 ? ' + ' + k.toFixed(1) : ' − ' + Math.abs(k).toFixed(1))) + '<br>' +
    (partes.length ? 'Transformaciones aplicadas: ' + partes.join(', ') + '.'
                   : 'Sin transformación: la curva dorada coincide con la original.');
});

/* ── Función inversa y prueba de la recta horizontal ────── */
var INV = {
  lineal: { f: function (x) { return 2 * x + 3; }, n: 'f(x) = 2x + 3', inv: 'f⁻¹(x) = (x − 3)/2', d: [-6, 6] },
  cubica: { f: function (x) { return x * x * x / 4; }, n: 'f(x) = x³/4', inv: 'f⁻¹(x) = ∛(4x)', d: [-4, 4] },
  cuad:   { f: function (x) { return x * x - 2; }, n: 'f(x) = x² − 2  (en todo ℝ)', inv: 'no existe: f no es inyectiva', d: [-4, 4] },
  cuadR:  { f: function (x) { return x >= 0 ? x * x - 2 : NaN; }, n: 'f(x) = x² − 2  restringida a x ≥ 0', inv: 'f⁻¹(x) = √(x + 2)', d: [0, 4] },
  expo:   { f: function (x) { return Math.exp(x * 0.7) - 2; }, n: 'f(x) = e^{0,7x} − 2', inv: 'f⁻¹(x) = (1/0,7)·ln(x + 2)', d: [-5, 3] }
};

OVA.viz.registrar('inversa', function (host) {
  var cfg = INV[ctrl(host, 'select').value] || INV.lineal;
  var yc = parseFloat(ctrl(host, '.recta').value) / 10;
  ctrl(host, '.y-v').textContent = 'y = ' + yc.toFixed(1);

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 36, sy: 36 });
  OVA.ejes(L);
  var c = L.ctx;

  // Eje de simetría y = x
  c.strokeStyle = 'rgba(128,150,175,.8)'; c.lineWidth = 1.5; c.setLineDash([5, 5]);
  c.beginPath();
  c.moveTo(L.px(-12), L.py(-12)); c.lineTo(L.px(12), L.py(12)); c.stroke();
  c.setLineDash([]);
  c.fillStyle = 'rgba(128,150,175,1)'; c.font = '11px ui-monospace,monospace';
  c.fillText('y = x', L.px(3.4), L.py(3.0));

  // f
  OVA.curva(L, cfg.f, AZUL, 3);

  // f⁻¹ como reflexión: se dibuja el punto (f(x), x)
  var cortes = 0, prev = null;
  c.strokeStyle = VERDE; c.lineWidth = 3; c.beginPath();
  var arranco = false;
  for (var x = cfg.d[0]; x <= cfg.d[1]; x += 0.02) {
    var y = cfg.f(x);
    if (!isFinite(y)) { arranco = false; prev = null; continue; }
    var pxv = L.px(y), pyv = L.py(x);
    if (pxv < -30 || pxv > L.w + 30 || pyv < -30 || pyv > L.h + 30) { arranco = false; }
    else if (!arranco) { c.moveTo(pxv, pyv); arranco = true; }
    else c.lineTo(pxv, pyv);
    // conteo de cortes con la recta horizontal
    if (prev !== null && ((prev - yc) * (y - yc) < 0 || y === yc)) cortes++;
    prev = y;
  }
  c.stroke();

  // Recta horizontal de prueba
  c.strokeStyle = cortes > 1 ? ROJO : ORO; c.lineWidth = 2; c.setLineDash([7, 4]);
  c.beginPath(); c.moveTo(0, L.py(yc)); c.lineTo(L.w, L.py(yc)); c.stroke();
  c.setLineDash([]);

  c.fillStyle = AZUL; c.font = 'bold 12px ui-monospace,monospace';
  c.fillText('———  f', 10, 18);
  c.fillStyle = VERDE;
  c.fillText('———  reflexión de f en y = x', 10, 34);

  var veredicto;
  if (cortes > 1) {
    veredicto = 'Más de un corte ⇒ <strong>f no es inyectiva aquí</strong>, y por eso su reflexión ' +
                'no pasa la prueba de la recta vertical: no es función.';
  } else if (cortes === 1) {
    veredicto = 'Un solo corte a esta altura. Recorre toda la gráfica con el deslizador antes de ' +
                'concluir: basta <em>una</em> altura con dos cortes para que f deje de ser inyectiva.';
  } else {
    veredicto = 'A esta altura la recta no toca la gráfica: ese valor no pertenece al rango de f. ' +
                'Eso no dice nada sobre la inyectividad — sigue deslizando.';
  }

  ctrl(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong><br>' +
    'La recta y = ' + yc.toFixed(1) + ' corta la gráfica de f en <strong style="color:' +
      (cortes > 1 ? '#f0a58a' : '#7fd4a4') + '">' + cortes + '</strong> punto' + (cortes === 1 ? '' : 's') + '. ' +
    veredicto +
    '<br><span style="color:#8fb4d9">Inversa: ' + cfg.inv + '</span>';
});

/* ── Enlazar controles: cualquier cambio redibuja ───────── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (host) {
    host.addEventListener('input', function () { OVA.viz.redibujar(); });
    host.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
