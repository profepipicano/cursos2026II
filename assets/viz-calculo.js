/* ══════════════════════════════════════════════════════════
   Visualizadores · Curso de Cálculo
   Se registran en el motor; el HTML solo pone
   <div class="viz" data-viz="nombre">…</div>
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', VERDE = '#1c7a4c', ROJO = '#b0392c', MORADO = '#7d4f9e';
/* S02: laterales · tabla-limite   ·   S03: continuidad · asintotas */

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

/* ══════ S02 · Límites laterales ══════ */
var LAT = {
  abs:   { n: 'f(x) = |x| / x', a: 0,
           izq: function (x) { return -1; }, der: function (x) { return 1; },
           val: null, li: -1, ld: 1, tipo: 'salto' },
  trozo: { n: 'f(x) = x+1 si x<2 ;  5 si x=2 ;  x²−1 si x>2', a: 2,
           izq: function (x) { return x + 1; }, der: function (x) { return x * x - 1; },
           val: 5, li: 3, ld: 3, tipo: 'existe' },
  raiz:  { n: 'f(x) = (x²−4)/(x−2)', a: 2,
           izq: function (x) { return x + 2; }, der: function (x) { return x + 2; },
           val: null, li: 4, ld: 4, tipo: 'existe' },
  inf:   { n: 'f(x) = 1/(x−2)', a: 2,
           izq: function (x) { return 1 / (x - 2); }, der: function (x) { return 1 / (x - 2); },
           val: null, li: -Infinity, ld: Infinity, tipo: 'infinito' }
};

OVA.viz.registrar('laterales', function (host) {
  var cfg = LAT[ctrl(host, 'select').value] || LAT.abs;
  var d = Math.pow(10, -parseInt(ctrl(host, '.cerca').value, 10));
  ctrl(host, '.cerca-val').textContent = 'a ± ' + d.toExponential(0).replace('e', '×10^');

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 46, sy: 34 });
  L.ox = L.w / 2 - cfg.a * L.sx;
  if (cfg.tipo === 'infinito') L.oy = L.h / 2;
  else L.oy = L.h / 2 + (cfg.li + cfg.ld) / 2 * L.sy * 0.6;
  OVA.ejes(L);
  var c = L.ctx;

  // rama izquierda y derecha
  var pintar = function (fn, hasta, desde) {
    c.strokeStyle = AZUL; c.lineWidth = 3; c.beginPath();
    var primero = true;
    for (var p = 0; p <= L.w; p += 1) {
      var xv = (p - L.ox) / L.sx;
      if (hasta !== undefined && xv >= hasta) break;
      if (desde !== undefined && xv <= desde) continue;
      var yv = fn(xv);
      if (!isFinite(yv)) { primero = true; continue; }
      var py = L.py(yv);
      if (py < -30 || py > L.h + 30) { primero = true; continue; }
      if (primero) { c.moveTo(p, py); primero = false; } else c.lineTo(p, py);
    }
    c.stroke();
  };
  pintar(cfg.izq, cfg.a, undefined);
  pintar(cfg.der, undefined, cfg.a);

  // puntos huecos en los extremos de cada rama
  if (isFinite(cfg.li)) OVA.punto(L, cfg.a, cfg.li, ROJO, true);
  if (isFinite(cfg.ld)) OVA.punto(L, cfg.a, cfg.ld, AZUL, true);
  if (cfg.val !== null) OVA.punto(L, cfg.a, cfg.val, ORO);

  // recta vertical x = a
  c.strokeStyle = 'rgba(128,128,128,.55)'; c.lineWidth = 1.4; c.setLineDash([5, 4]);
  c.beginPath(); c.moveTo(L.px(cfg.a), 0); c.lineTo(L.px(cfg.a), L.h); c.stroke();
  c.setLineDash([]);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  // tabla numérica de aproximación
  var t = '<table class="tbl" style="margin:0;font-size:.82rem;text-align:center">' +
          '<tr><th style="text-align:center">x → ' + cfg.a + '⁻</th><th style="text-align:center">f(x)</th>' +
          '<th style="text-align:center">x → ' + cfg.a + '⁺</th><th style="text-align:center">f(x)</th></tr>';
  for (var i = 0; i < 4; i++) {
    var dd = d * Math.pow(10, 3 - i);
    var xi = cfg.a - dd, xd = cfg.a + dd;
    var vi = cfg.izq(xi), vd = cfg.der(xd);
    t += '<tr><td>' + xi.toPrecision(8) + '</td><td><strong>' +
         (isFinite(vi) ? vi.toPrecision(6) : '—') + '</strong></td><td>' +
         xd.toPrecision(8) + '</td><td><strong>' +
         (isFinite(vd) ? vd.toPrecision(6) : '—') + '</strong></td></tr>';
  }
  ctrl(host, '.tabla').innerHTML = t + '</table>';

  var veredicto;
  if (cfg.tipo === 'existe') {
    veredicto = 'Los dos laterales valen <strong>' + cfg.li + '</strong>, así que ' +
      '<strong style="color:#7fd4a4">el límite existe y vale ' + cfg.li + '</strong>.' +
      (cfg.val !== null
        ? ' Fíjate en que $f(' + cfg.a + ')=' + cfg.val + '$, un valor <em>distinto</em>: ' +
          'el límite no mira lo que pasa <em>en</em> el punto.'
        : ' La función ni siquiera está definida en $x=' + cfg.a + '$, y aun así el límite existe.');
  } else if (cfg.tipo === 'salto') {
    veredicto = 'Lím por la izquierda = <strong style="color:#f0a58a">' + cfg.li + '</strong> ' +
      '≠ lím por la derecha = <strong style="color:#8fb4d9">' + cfg.ld + '</strong>, así que ' +
      '<strong style="color:#f0a58a">el límite NO existe</strong>. Es una discontinuidad de salto.';
  } else {
    veredicto = 'Los laterales se disparan a −∞ y +∞: <strong style="color:#f0a58a">' +
      'el límite no existe</strong>, y $x=' + cfg.a + '$ es una asíntota vertical (Guía 3).';
  }

  ctrl(host, '.viz-readout').innerHTML = veredicto +
    '<br><span style="color:#8fb4d9">Aumenta el acercamiento y observa la tabla: lo que importa ' +
    'es a qué número se aproxima f(x), no cuánto vale f en el punto.</span>';
  OVA.mj(ctrl(host, '.viz-readout'));
});

/* ══════ S02 · Tabla de aproximación para indeterminadas 0/0 ══════ */
var IND = {
  fact:  { f: function (x) { return (x * x - 9) / (x * x - x - 6); }, a: 3, L: 6 / 5,
           n: '(x²−9)/(x²−x−6)', tec: 'factorización', res: '(x+3)/(x+2) → 6/5 = 1,2' },
  racio: { f: function (x) { return (Math.sqrt(x + 1) - 1) / x; }, a: 0, L: 0.5,
           n: '(√(x+1)−1)/x', tec: 'racionalizar con el conjugado', res: '1/(√(x+1)+1) → 1/2' },
  compl: { f: function (x) { return (1 / (x + 2) - 0.5) / x; }, a: 0, L: -0.25,
           n: '[1/(x+2) − 1/2]/x', tec: 'simplificar la fracción compleja', res: '−1/(2(x+2)) → −1/4' },
  senc:  { f: function (x) { return Math.sin(x) / x; }, a: 0, L: 1,
           n: 'sen(x)/x', tec: 'límite trigonométrico fundamental', res: '→ 1' },
  cos2:  { f: function (x) { return (1 - Math.cos(x)) / (x * x); }, a: 0, L: 0.5,
           n: '(1−cos x)/x²', tec: 'identidad trigonométrica', res: '→ 1/2' },
  osc:   { f: function (x) { return Math.sin(1 / x); }, a: 0, L: null,
           n: 'sen(1/x)', tec: 'ninguna: oscila', res: 'no existe' }
};

OVA.viz.registrar('tabla-limite', function (host) {
  var cfg = IND[ctrl(host, 'select').value] || IND.fact;
  var n = parseInt(ctrl(host, '.filas').value, 10);
  ctrl(host, '.filas-val').textContent = n + ' pasos de acercamiento';

  var t = '<table class="tbl" style="margin:0;font-size:.82rem;text-align:center">' +
          '<tr><th style="text-align:center">x</th><th style="text-align:center">f(x)</th>' +
          '<th style="text-align:center">x</th><th style="text-align:center">f(x)</th></tr>';
  var ultI = NaN, ultD = NaN;
  for (var i = 1; i <= n; i++) {
    var d = Math.pow(10, -i);
    var xi = cfg.a - d, xd = cfg.a + d;
    var vi = cfg.f(xi), vd = cfg.f(xd);
    ultI = vi; ultD = vd;
    t += '<tr><td>' + xi.toPrecision(10) + '</td><td><strong>' +
         (isFinite(vi) ? vi.toPrecision(9) : '—') + '</strong></td><td>' +
         xd.toPrecision(10) + '</td><td><strong>' +
         (isFinite(vd) ? vd.toPrecision(9) : '—') + '</strong></td></tr>';
  }
  ctrl(host, '.tabla').innerHTML = t + '</table>';

  var L = OVA.lienzo(ctrl(host, 'canvas'), { alto: 200, sx: 60, sy: 60 });
  L.ox = L.w / 2 - cfg.a * L.sx;
  L.oy = cfg.L !== null ? L.h / 2 + cfg.L * L.sy * 0.7 : L.h / 2;
  OVA.ejes(L);
  OVA.curva(L, cfg.f, AZUL, 3);
  if (cfg.L !== null) {
    var c = L.ctx;
    c.strokeStyle = ORO; c.lineWidth = 2; c.setLineDash([6, 4]);
    c.beginPath(); c.moveTo(0, L.py(cfg.L)); c.lineTo(L.w, L.py(cfg.L)); c.stroke();
    c.setLineDash([]);
    OVA.punto(L, cfg.a, cfg.L, ORO, true);
    c.fillStyle = ORO; c.font = '11px ui-monospace,monospace';
    c.fillText('L = ' + cfg.L, 6, L.py(cfg.L) - 6);
  }
  L.ctx.fillStyle = OVA.color('cv-text');
  L.ctx.font = 'bold 12px ui-monospace,monospace';
  L.ctx.fillText(cfg.n, 10, 16);

  ctrl(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> en x → ' + cfg.a +
    ' &nbsp;·&nbsp; técnica: <strong>' + cfg.tec + '</strong><br>' +
    (cfg.L !== null
      ? 'Resultado algebraico: <strong style="color:#dba949">' + cfg.res + '</strong><br>' +
        'La tabla confirma: por la izquierda ' + ultI.toPrecision(8) +
        ' y por la derecha ' + ultD.toPrecision(8) + '.'
      : '<strong style="color:#f0a58a">El límite no existe.</strong> Mira la tabla: los valores ' +
        'saltan entre −1 y 1 sin asentarse. Acercarse más no ayuda, y por eso una tabla nunca ' +
        '<em>demuestra</em> un límite: solo lo sugiere.') +
    '<br><span style="color:#8fb4d9">La tabla es evidencia numérica; el álgebra es la prueba. ' +
    'Las dos deben coincidir, y si no coinciden hay un error en alguna.</span>';
});

/* ══════ S03 · Continuidad en un punto: las tres condiciones ══════ */
var CONT = {
  evit: { n: 'f(x) = (x²−9)/(x−3),  f(3) = k', a: 3,
          f: function (x) { return x + 3; }, def: true, lim: 6, tipo: 'param' },
  salto:{ n: 'f(x) = x+1 si x<2 ;  x²−1 si x≥2', a: 2,
          fi: function (x) { return x + 1; }, fd: function (x) { return x * x - 1; },
          li: 3, ld: 3, val: 3, tipo: 'ok' },
  salto2:{ n: 'f(x) = x+1 si x<2 ;  x²+1 si x≥2', a: 2,
          fi: function (x) { return x + 1; }, fd: function (x) { return x * x + 1; },
          li: 3, ld: 5, val: 5, tipo: 'salto' },
  hueco:{ n: 'f(x) = (x²−4)/(x−2),  sin definir en 2', a: 2,
          f: function (x) { return x + 2; }, def: false, lim: 4, tipo: 'nodef' },
  infi: { n: 'f(x) = 1/(x−2)²', a: 2,
          f: function (x) { return 1 / ((x - 2) * (x - 2)); }, def: false, lim: null, tipo: 'inf' }
};

OVA.viz.registrar('continuidad', function (host) {
  var clave = ctrl(host, 'select').value;
  var cfg = CONT[clave] || CONT.evit;
  var kk = parseFloat(ctrl(host, '.kval').value) / 10;
  var ctrlK = host.querySelector('.grupo-k');
  if (ctrlK) ctrlK.style.display = (cfg.tipo === 'param') ? '' : 'none';
  ctrl(host, '.k-val').textContent = 'k = ' + kk.toFixed(1);

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 40, sy: 26 });
  L.ox = L.w / 2 - cfg.a * L.sx;
  L.oy = cfg.tipo === 'inf' ? L.h * 0.85 : L.h / 2 + 3 * L.sy;
  OVA.ejes(L);
  var c = L.ctx;

  if (cfg.fi) {
    OVA.curva(L, function (x) { return x < cfg.a ? cfg.fi(x) : NaN; }, AZUL, 3);
    OVA.curva(L, function (x) { return x > cfg.a ? cfg.fd(x) : NaN; }, AZUL, 3);
    OVA.punto(L, cfg.a, cfg.li, AZUL, true);
    OVA.punto(L, cfg.a, cfg.val, ORO);
  } else {
    OVA.curva(L, cfg.f, AZUL, 3);
    if (cfg.lim !== null) OVA.punto(L, cfg.a, cfg.lim, AZUL, true);
    if (cfg.tipo === 'param') OVA.punto(L, cfg.a, kk, ORO);
  }
  c.strokeStyle = 'rgba(128,128,128,.5)'; c.lineWidth = 1.3; c.setLineDash([5, 4]);
  c.beginPath(); c.moveTo(L.px(cfg.a), 0); c.lineTo(L.px(cfg.a), L.h); c.stroke();
  c.setLineDash([]);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 16);

  // evaluación de las tres condiciones
  var c1, c2, c3, valor, limite, diag;
  if (cfg.tipo === 'param') {
    c1 = true; valor = kk; c2 = true; limite = cfg.lim; c3 = Math.abs(kk - cfg.lim) < 1e-9;
    diag = c3 ? 'Continua: con k = 6 las tres condiciones se cumplen.'
              : 'Discontinuidad <strong>evitable</strong>: el límite existe y vale 6, pero ' +
                'f(3) = ' + kk.toFixed(1) + ' ≠ 6. Basta redefinir f(3) = 6 para repararla.';
  } else if (cfg.tipo === 'salto') {
    c1 = true; valor = cfg.val; c2 = false; limite = null; c3 = false;
    diag = 'Discontinuidad de <strong>salto</strong>: los laterales valen ' + cfg.li + ' y ' +
           cfg.ld + '. Falla la condición 2 y <em>no</em> se puede reparar redefiniendo un punto.';
  } else if (cfg.tipo === 'ok') {
    c1 = true; valor = cfg.val; c2 = true; limite = cfg.li; c3 = true;
    diag = 'Continua en x = ' + cfg.a + ': las tres condiciones se cumplen.';
  } else if (cfg.tipo === 'nodef') {
    c1 = false; valor = null; c2 = true; limite = cfg.lim; c3 = false;
    diag = 'Discontinuidad <strong>evitable</strong>: falla la condición 1, porque f(2) no existe. ' +
           'Definiendo f(2) = 4 la función queda continua.';
  } else {
    c1 = false; valor = null; c2 = false; limite = null; c3 = false;
    diag = 'Discontinuidad <strong>infinita</strong>: fallan las condiciones 1 y 2. ' +
           'x = 2 es una asíntota vertical y no hay forma de reparar.';
  }

  var fila = function (ok, txt) {
    return '<div style="margin:.15rem 0">' +
      (ok ? '<span style="color:#7fd4a4">✓</span> ' : '<span style="color:#f0a58a">✗</span> ') +
      txt + '</div>';
  };
  ctrl(host, '.viz-readout').innerHTML =
    fila(c1, '<strong>1.</strong> f(' + cfg.a + ') está definida' +
         (valor !== null ? ' &nbsp;→ vale ' + valor : ' &nbsp;→ no existe')) +
    fila(c2, '<strong>2.</strong> el límite existe' +
         (limite !== null ? ' &nbsp;→ vale ' + limite : ' &nbsp;→ no existe')) +
    fila(c3, '<strong>3.</strong> los dos coinciden') +
    '<div style="margin-top:.5rem">' + diag + '</div>';
});

/* ══════ S03 · Asíntotas de una función racional ══════ */
var ASI = {
  ig:   { n: '(3x²−2x+1)/(5x²+7)', f: function (x) { return (3*x*x-2*x+1)/(5*x*x+7); },
          av: [], ah: 0.6, gn: 2, gd: 2, caso: 'grados iguales ⟹ y = 3/5 = 0,6' },
  menor:{ n: '(2x+1)/(x²+3)', f: function (x) { return (2*x+1)/(x*x+3); },
          av: [], ah: 0, gn: 1, gd: 2, caso: 'grado del numerador menor ⟹ y = 0' },
  mayor:{ n: 'x³/(x²+1)', f: function (x) { return x*x*x/(x*x+1); },
          av: [], ah: null, gn: 3, gd: 2, caso: 'grado del numerador mayor ⟹ NO hay asíntota horizontal' },
  vert: { n: '(x+3)/(x²−9)', f: function (x) { return (x+3)/(x*x-9); },
          av: [3], ah: 0, gn: 1, gd: 2, caso: 'en x = −3 el factor se cancela: hueco, no asíntota' },
  simple:{ n: '1/(x−2)', f: function (x) { return 1/(x-2); },
          av: [2], ah: 0, gn: 0, gd: 1, caso: 'asíntota vertical en x = 2 y horizontal y = 0' },
  raiz: { n: '√(x²+1)/x', f: function (x) { return Math.sqrt(x*x+1)/x; },
          av: [0], ah: null, dos: [1,-1], gn: 1, gd: 1,
          caso: 'DOS asíntotas horizontales: y = 1 por la derecha, y = −1 por la izquierda' }
};

OVA.viz.registrar('asintotas', function (host) {
  var cfg = ASI[ctrl(host, 'select').value] || ASI.ig;
  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 34, sy: 34 });
  OVA.ejes(L);
  var c = L.ctx;

  cfg.av.forEach(function (v) {
    c.strokeStyle = ROJO; c.lineWidth = 2.2; c.setLineDash([7, 5]);
    c.beginPath(); c.moveTo(L.px(v), 0); c.lineTo(L.px(v), L.h); c.stroke();
    c.setLineDash([]);
    c.fillStyle = ROJO; c.font = 'bold 11px ui-monospace,monospace';
    c.fillText('x = ' + v, L.px(v) + 5, 30);
  });
  var horiz = cfg.dos || (cfg.ah !== null ? [cfg.ah] : []);
  horiz.forEach(function (v) {
    c.strokeStyle = VERDE; c.lineWidth = 2.2; c.setLineDash([7, 5]);
    c.beginPath(); c.moveTo(0, L.py(v)); c.lineTo(L.w, L.py(v)); c.stroke();
    c.setLineDash([]);
    c.fillStyle = VERDE; c.font = 'bold 11px ui-monospace,monospace';
    c.fillText('y = ' + v, 8, L.py(v) - 6);
  });
  OVA.curva(L, cfg.f, AZUL, 3);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 16);

  var lejos = [10, 100, 1000].map(function (v) {
    return 'f(' + v + ') = ' + cfg.f(v).toPrecision(6);
  }).join(' &nbsp;·&nbsp; ');

  ctrl(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;·&nbsp; grado numerador ' + cfg.gn +
    ', denominador ' + cfg.gd + '<br>' +
    '<span style="color:#7fd4a4">' + cfg.caso + '</span><br>' +
    'Valores lejanos: ' + lejos + '<br>' +
    '<span style="color:#8fb4d9">Las verticales (rojas) salen de los ceros del denominador que ' +
    '<em>no</em> se cancelan; las horizontales (verdes) de comparar los grados. Prueba √(x²+1)/x ' +
    'y verás dos horizontales distintas.</span>';
});

/* ══════ S04 · La secante que se convierte en tangente ══════ */
var SEC = {
  cuad: { f: function (x) { return x * x - 3 * x; }, d: function (x) { return 2 * x - 3; },
          n: 'f(x) = x² − 3x', dn: "f'(x) = 2x − 3", a: 2 },
  cub:  { f: function (x) { return (x * x * x - 2 * x) / 3; },
          d: function (x) { return (3 * x * x - 2) / 3; },
          n: 'f(x) = (x³ − 2x)/3', dn: "f'(x) = (3x² − 2)/3", a: 1.4 },
  raiz: { f: function (x) { return 2 * Math.sqrt(Math.max(x, 0)); },
          d: function (x) { return 1 / Math.sqrt(Math.max(x, 1e-9)); },
          n: 'f(x) = 2√x', dn: "f'(x) = 1/√x", a: 2.2 },
  seno: { f: function (x) { return 2 * Math.sin(x); }, d: function (x) { return 2 * Math.cos(x); },
          n: 'f(x) = 2sen x', dn: "f'(x) = 2cos x", a: 0.9 }
};

OVA.viz.registrar('secante', function (host) {
  var cfg = SEC[ctrl(host, 'select').value] || SEC.cuad;
  var hh = parseFloat(ctrl(host, '.hh').value) / 100;
  ctrl(host, '.h-val').textContent = 'h = ' + hh.toFixed(3);
  var a = cfg.a;

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 52, sy: 34 });
  L.ox = L.w / 2 - a * L.sx * 0.35;
  OVA.ejes(L);
  var c = L.ctx;
  OVA.curva(L, cfg.f, AZUL, 3);

  var fa = cfg.f(a), fb = cfg.f(a + hh);
  var mSec = (fb - fa) / hh, mTan = cfg.d(a);

  // recta tangente (referencia fija)
  c.strokeStyle = 'rgba(198,143,46,.55)'; c.lineWidth = 2; c.setLineDash([7, 5]);
  c.beginPath();
  c.moveTo(0, L.py(fa + mTan * ((0 - L.ox) / L.sx - a)));
  c.lineTo(L.w, L.py(fa + mTan * ((L.w - L.ox) / L.sx - a)));
  c.stroke(); c.setLineDash([]);

  // recta secante
  c.strokeStyle = ROJO; c.lineWidth = 2.6;
  c.beginPath();
  c.moveTo(0, L.py(fa + mSec * ((0 - L.ox) / L.sx - a)));
  c.lineTo(L.w, L.py(fa + mSec * ((L.w - L.ox) / L.sx - a)));
  c.stroke();

  // triángulo Δx, Δy
  c.strokeStyle = 'rgba(150,167,181,.9)'; c.lineWidth = 1.4; c.setLineDash([4, 4]);
  c.beginPath();
  c.moveTo(L.px(a), L.py(fa)); c.lineTo(L.px(a + hh), L.py(fa));
  c.lineTo(L.px(a + hh), L.py(fb)); c.stroke(); c.setLineDash([]);
  c.fillStyle = OVA.color('cv-text'); c.font = '11px ui-monospace,monospace';
  c.fillText('h', (L.px(a) + L.px(a + hh)) / 2 - 4, L.py(fa) + 15);
  c.fillText('Δy', L.px(a + hh) + 6, (L.py(fa) + L.py(fb)) / 2);

  OVA.punto(L, a, fa, ORO);
  OVA.punto(L, a + hh, fb, ROJO);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  ctrl(host, '.viz-readout').innerHTML =
    'Punto fijo <span style="color:#dba949">(' + a.toFixed(2) + ', ' + fa.toFixed(3) + ')</span>' +
    ' &nbsp;·&nbsp; punto móvil <span style="color:#f0a58a">(' + (a + hh).toFixed(3) + ', ' +
      fb.toFixed(3) + ')</span><br>' +
    'Pendiente de la <span style="color:#f0a58a">secante</span> = ' +
      '<strong>' + mSec.toFixed(6) + '</strong> = (' + fb.toFixed(4) + ' − ' + fa.toFixed(4) +
      ') / ' + hh.toFixed(3) + '<br>' +
    'Pendiente de la <span style="color:#dba949">tangente</span> = ' + cfg.dn +
      ' en x=' + a + ' &nbsp;→&nbsp; <strong>' + mTan.toFixed(6) + '</strong><br>' +
    'Diferencia: <strong>' + Math.abs(mSec - mTan).toExponential(3) + '</strong><br>' +
    '<span style="color:#8fb4d9">Reduce h y observa cómo la recta roja gira hasta apoyarse en la ' +
    'dorada. La derivada <em>es</em> ese límite: no una fórmula nueva, sino el número al que se ' +
    'acerca el cociente cuando h se hace pequeño.</span>';
});

/* ══════ S04 · Derivabilidad frente a continuidad ══════ */
var DER = {
  abs:  { f: function (x) { return Math.abs(x); }, a: 0, n: 'f(x) = |x|',
          izq: -1, der: 1, cont: true, deriv: false,
          diag: 'Continua pero <strong>no derivable</strong>: los cocientes laterales valen −1 y 1. ' +
                'La gráfica tiene un pico y no hay una única recta tangente.' },
  raiz: { f: function (x) { return Math.cbrt(x); }, a: 0, n: 'f(x) = ∛x',
          izq: Infinity, der: Infinity, cont: true, deriv: false,
          diag: 'Continua pero <strong>no derivable</strong>: el cociente se dispara a +∞. ' +
                'La tangente existe, pero es <em>vertical</em>, y una recta vertical no tiene pendiente.' },
  salto:{ f: function (x) { return x < 0 ? x - 1 : x + 1; }, a: 0, n: 'f(x) = x−1 si x<0 ; x+1 si x≥0',
          izq: Infinity, der: null, cont: false, deriv: false,
          diag: '<strong>Ni continua ni derivable.</strong> Hay un salto, y donde no hay ' +
                'continuidad no puede haber derivada: el cociente se dispara.' },
  suave:{ f: function (x) { return x * x; }, a: 0, n: 'f(x) = x²',
          izq: 0, der: 0, cont: true, deriv: true,
          diag: '<strong style="color:#7fd4a4">Continua y derivable.</strong> Los dos cocientes ' +
                'laterales valen 0 y coinciden: hay una única recta tangente, horizontal.' }
};

OVA.viz.registrar('derivabilidad', function (host) {
  var cfg = DER[ctrl(host, 'select').value] || DER.abs;
  var hh = Math.pow(10, -parseInt(ctrl(host, '.acerca').value, 10));
  ctrl(host, '.acerca-val').textContent = 'h = ' + hh.toExponential(0);

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 60, sy: 44 });
  OVA.ejes(L);
  var c = L.ctx;
  OVA.curva(L, function (x) { return x < cfg.a ? cfg.f(x) : NaN; }, AZUL, 3);
  OVA.curva(L, function (x) { return x > cfg.a ? cfg.f(x) : NaN; }, AZUL, 3);

  var fa = cfg.f(cfg.a);
  var qi = (cfg.f(cfg.a - hh) - fa) / (-hh), qd = (cfg.f(cfg.a + hh) - fa) / hh;
  // secantes laterales
  [[-hh, ROJO], [hh, VERDE]].forEach(function (par) {
    var m = (cfg.f(cfg.a + par[0]) - fa) / par[0];
    if (!isFinite(m)) return;
    c.strokeStyle = par[1]; c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(0, L.py(fa + m * ((0 - L.ox) / L.sx - cfg.a)));
    c.lineTo(L.w, L.py(fa + m * ((L.w - L.ox) / L.sx - cfg.a)));
    c.stroke();
  });
  OVA.punto(L, cfg.a, fa, ORO);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  var fmt = function (v) { return isFinite(v) ? v.toFixed(4) : (v > 0 ? '→ ∞' : '→ −∞'); };
  ctrl(host, '.viz-readout').innerHTML =
    'Cociente por la <span style="color:#f0a58a">izquierda</span>: <strong>' + fmt(qi) + '</strong>' +
    ' &nbsp;·&nbsp; por la <span style="color:#7fd4a4">derecha</span>: <strong>' + fmt(qd) +
      '</strong><br>' + cfg.diag +
    '<br><span style="color:#8fb4d9">Reduce h: si los dos cocientes convergen al mismo número, ' +
    'la función es derivable. <strong>Derivable siempre implica continua, pero no al revés</strong>, ' +
    'y |x| es el contraejemplo clásico.</span>';
});

/* ── Enlazar controles: cualquier cambio redibuja ───────── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (host) {
    host.addEventListener('input', function () { OVA.viz.redibujar(); });
    host.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});

function q(host, sel) { return host.querySelector(sel); }

/* ══════════ S06 · Regla de la cadena: función compuesta ══════════ */
var CADENA = {
  pot:  { g: function (x) { return x*x + 1; }, gp: function (x) { return 2*x; },
          fu: function (u) { return Math.pow(u, 3); }, fpu: function (u) { return 3*u*u; },
          nf: 'f(u) = u³', ng: 'g(x) = x² + 1', ny: 'y = (x²+1)³',
          nd: "y' = 3(x²+1)²·2x = 6x(x²+1)²", x0: 0.8 },
  sen:  { g: function (x) { return 3*x; }, gp: function () { return 3; },
          fu: function (u) { return Math.sin(u); }, fpu: function (u) { return Math.cos(u); },
          nf: 'f(u) = sen u', ng: 'g(x) = 3x', ny: 'y = sen(3x)',
          nd: "y' = cos(3x)·3 = 3cos(3x)", x0: 0.5 },
  exp:  { g: function (x) { return x*x; }, gp: function (x) { return 2*x; },
          fu: function (u) { return Math.exp(u); }, fpu: function (u) { return Math.exp(u); },
          nf: 'f(u) = eᵘ', ng: 'g(x) = x²', ny: 'y = e^{x²}',
          nd: "y' = e^{x²}·2x = 2x·e^{x²}", x0: 0.7 },
  raiz: { g: function (x) { return x*x + 1; }, gp: function (x) { return 2*x; },
          fu: function (u) { return Math.sqrt(u); }, fpu: function (u) { return 0.5/Math.sqrt(u); },
          nf: 'f(u) = √u', ng: 'g(x) = x² + 1', ny: 'y = √(x²+1)',
          nd: "y' = x/√(x²+1)", x0: 1.2 }
};

OVA.viz.registrar('cadena', function (host) {
  var cfg = CADENA[q(host, 'select').value] || CADENA.pot;
  var x0 = parseFloat(q(host, '.punto').value);
  q(host, '.punto-val').textContent = 'x = ' + x0.toFixed(2);

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 300, sx: 46, sy: 30 });
  OVA.ejes(L);
  var Y = function (x) { return cfg.fu(cfg.g(x)); };
  OVA.curva(L, Y, AZUL, 3);
  var c = L.ctx;

  // punto y recta tangente con pendiente por la cadena
  var u0 = cfg.g(x0), y0 = cfg.fu(u0);
  var m = cfg.fpu(u0) * cfg.gp(x0);   // regla de la cadena
  c.strokeStyle = 'rgba(176,57,44,.85)'; c.lineWidth = 2;
  c.beginPath();
  c.moveTo(L.px(x0 - 2), L.py(y0 - 2*m));
  c.lineTo(L.px(x0 + 2), L.py(y0 + 2*m));
  c.stroke();
  OVA.punto(L, x0, y0, ROJO);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.ny, 10, 18);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.ny + '</strong> como composición: primero ' +
    '<span style="color:#8fb4d9">' + cfg.ng + '</span>, luego ' +
    '<span style="color:#dba949">' + cfg.nf + '</span><br>' +
    'En x = ' + x0.toFixed(2) + ': la función interna vale g(x) = ' + u0.toFixed(3) +
    ', y la pendiente de la tangente es<br>' +
    "<strong>y' = f'(g(x))·g'(x) = " + cfg.fpu(u0).toFixed(3) + ' × ' +
      cfg.gp(x0).toFixed(3) + ' = ' + m.toFixed(3) + '</strong><br>' +
    '<span style="color:#8fb4d9">La regla de la cadena multiplica dos tasas: cuánto cambia la ' +
    'salida por unidad de la interna, por cuánto cambia la interna por unidad de x. Fórmula general: ' +
    '<strong>' + cfg.nd + '</strong>.</span>';
});

/* ══════════ S07 · Derivación implícita: tangente a una curva ══════════ */
var IMPLICITA = {
  circ: { n: 'x² + y² = 25', F: function (x, y) { return x*x + y*y - 25; },
          // y' = -Fx/Fy = -(2x)/(2y) = -x/y
          yp: function (x, y) { return -x / y; },
          curva: function (t) { return [5*Math.cos(t), 5*Math.sin(t)]; }, ta: 0, tb: 6.2832,
          px: 3, py: 4, lim: 7,
          nd: "y' = −x/y" },
  elipse: { n: 'x²/9 + y²/4 = 1', F: function (x, y) { return x*x/9 + y*y/4 - 1; },
          yp: function (x, y) { return -(4*x) / (9*y); },
          curva: function (t) { return [3*Math.cos(t), 2*Math.sin(t)]; }, ta: 0, tb: 6.2832,
          px: 3*Math.cos(0.9), py: 2*Math.sin(0.9), lim: 4,
          nd: "y' = −4x/(9y)" },
  astro: { n: 'x^{2/3} + y^{2/3} = 4  (astroide)',
          F: function (x, y) { return Math.cbrt(x*x) + Math.cbrt(y*y) - 4; },
          yp: function (x, y) { return -Math.cbrt(y / x); },
          curva: function (t) { return [8*Math.pow(Math.cos(t),3), 8*Math.pow(Math.sin(t),3)]; },
          ta: 0, tb: 6.2832, px: 8*Math.pow(Math.cos(0.9),3), py: 8*Math.pow(Math.sin(0.9),3), lim: 9,
          nd: "y' = −∛(y/x)" }
};

OVA.viz.registrar('implicita', function (host) {
  var cfg = IMPLICITA[q(host, 'select').value] || IMPLICITA.circ;
  var L = OVA.lienzo(q(host, 'canvas'), { alto: 320 });
  L.sx = L.w / (2.2 * cfg.lim); L.sy = L.sx;   // isótropo
  OVA.ejes(L);
  var c = L.ctx;

  // dibujar la curva por su parametrización
  c.strokeStyle = AZUL; c.lineWidth = 2.6; c.beginPath();
  var primero = true;
  for (var t = cfg.ta; t <= cfg.tb; t += (cfg.tb - cfg.ta) / 400) {
    var P = cfg.curva(t);
    var px = L.px(P[0]), py = L.py(P[1]);
    primero ? (c.moveTo(px, py), primero = false) : c.lineTo(px, py);
  }
  c.closePath(); c.stroke();

  // punto y tangente
  var m = cfg.yp(cfg.px, cfg.py);
  c.strokeStyle = 'rgba(176,57,44,.9)'; c.lineWidth = 2;
  var dx = cfg.lim * 0.7;
  c.beginPath();
  c.moveTo(L.px(cfg.px - dx), L.py(cfg.py - dx*m));
  c.lineTo(L.px(cfg.px + dx), L.py(cfg.py + dx*m));
  c.stroke();
  OVA.punto(L, cfg.px, cfg.py, VERDE);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · no se puede despejar y como una sola función, ' +
    'pero la derivación implícita da la pendiente en cualquier punto.<br>' +
    'En el punto (' + cfg.px.toFixed(2) + ', ' + cfg.py.toFixed(2) + '): ' +
    '<strong style="color:#b0392c">y\' = ' + m.toFixed(3) + '</strong><br>' +
    '<span style="color:#8fb4d9">Derivando ambos lados respecto de x y tratando y como función de x ' +
    '(cadena), se despeja y\'. Aquí <strong>' + cfg.nd + '</strong>. La recta roja es tangente a la ' +
    'curva en el punto verde.</span>';
});

/* ══════════ S08 · Optimización: el problema de la caja ══════════ */
OVA.viz.registrar('optimiza', function (host) {
  var lado = parseFloat(q(host, 'select').value);       // lado del cartón cuadrado
  var xcut = parseFloat(q(host, '.corte').value);        // corte de esquina
  var maxc = lado / 2;
  if (xcut > maxc - 0.05) xcut = maxc - 0.05;
  q(host, '.corte-val').textContent = 'corte x = ' + xcut.toFixed(2);

  var V = function (x) { return x * Math.pow(lado - 2*x, 2); };
  var xopt = lado / 6;                                   // óptimo exacto
  var Vopt = V(xopt);

  // panel izquierdo: curva de volumen
  var L = OVA.lienzo(q(host, 'canvas'), { alto: 300, sx: q(host,'canvas').clientWidth/(1.25*maxc), sy: 1 });
  L.oy = L.h - 30; L.ox = 40;
  L.sy = (L.h - 50) / (Vopt * 1.15);
  OVA.ejes(L);
  OVA.curva(L, V, AZUL, 3);
  var c = L.ctx;
  // óptimo
  OVA.punto(L, xopt, Vopt, VERDE);
  c.strokeStyle = 'rgba(28,122,76,.45)'; c.setLineDash([4,4]); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(L.px(xopt), L.py(0)); c.lineTo(L.px(xopt), L.py(Vopt)); c.stroke();
  c.setLineDash([]);
  // punto actual
  OVA.punto(L, xcut, V(xcut), ORO);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText('V(x) = x(' + lado + '−2x)²', 48, 18);
  var Vpx = Math.pow(lado - 2*xcut, 2) + xcut*2*(lado - 2*xcut)*(-2);

  q(host, '.viz-readout').innerHTML =
    '<strong>Caja sin tapa</strong> a partir de un cartón ' + lado + '×' + lado +
    ': se cortan esquinas de lado x y se doblan las solapas.<br>' +
    'Volumen: V(x) = x(' + lado + '−2x)². Con el corte actual x = ' + xcut.toFixed(2) +
    ': V = <strong style="color:#c68f2e">' + V(xcut).toFixed(1) + '</strong>, ' +
    "y la pendiente V'(x) = <strong>" + Vpx.toFixed(1) + '</strong>.<br>' +
    '<span style="color:#8fb4d9">El volumen máximo se alcanza donde <strong>V\'(x) = 0</strong>: ' +
    'en x = ' + xopt.toFixed(3) + ' (un tercio de la mitad del lado), con ' +
    'V = <strong style="color:#1c7a4c">' + Vopt.toFixed(1) + '</strong>. ' +
    'Mueve el corte y observa cómo la pendiente se anula justo en el máximo.</span>';
});

/* ══════════ S09 · Análisis gráfico: f, f', f'' alineadas ══════════ */
var ANALISIS = {
  cubica: { f: function (x) { return x*x*x - 3*x*x + 2; },
            fp: function (x) { return 3*x*x - 6*x; },
            fpp: function (x) { return 6*x - 6; },
            n: 'f(x) = x³ − 3x² + 2', crit: [0, 2], infl: [1] },
  cuartica: { f: function (x) { return x*x*x*x - 4*x*x; },
            fp: function (x) { return 4*x*x*x - 8*x; },
            fpp: function (x) { return 12*x*x - 8; },
            n: 'f(x) = x⁴ − 4x²', crit: [-Math.sqrt(2), 0, Math.sqrt(2)],
            infl: [-Math.sqrt(2/3), Math.sqrt(2/3)] },
  seno: { f: function (x) { return Math.sin(x); },
            fp: function (x) { return Math.cos(x); },
            fpp: function (x) { return -Math.sin(x); },
            n: 'f(x) = sen x', crit: [-Math.PI/2, Math.PI/2], infl: [0] }
};

OVA.viz.registrar('analisis', function (host) {
  var cfg = ANALISIS[q(host, 'select').value] || ANALISIS.cubica;
  var ver = q(host, '.capa').value;   // 'f' | 'fp' | 'fpp' | 'todas'

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 340, sx: 46, sy: 24 });
  OVA.ejes(L);
  var c = L.ctx;

  if (ver === 'f' || ver === 'todas') OVA.curva(L, cfg.f, AZUL, 3);
  if (ver === 'fp' || ver === 'todas') OVA.curva(L, cfg.fp, VERDE, 2.2);
  if (ver === 'fpp' || ver === 'todas') OVA.curva(L, cfg.fpp, ORO, 2.2);

  // marcar críticos (f'=0) e inflexiones (f''=0)
  cfg.crit.forEach(function (xc) {
    OVA.punto(L, xc, cfg.f(xc), ROJO);
    c.strokeStyle = 'rgba(176,57,44,.35)'; c.setLineDash([3,3]); c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(L.px(xc), 0); c.lineTo(L.px(xc), L.h); c.stroke(); c.setLineDash([]);
  });
  cfg.infl.forEach(function (xi) {
    OVA.punto(L, xi, cfg.f(xi), MORADO, true);
  });
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);
  // leyenda
  c.font = '11px ui-monospace,monospace';
  c.fillStyle = AZUL;   c.fillText('— f', L.w - 60, 20);
  c.fillStyle = VERDE;  c.fillText("— f'", L.w - 60, 36);
  c.fillStyle = ORO;    c.fillText("— f''", L.w - 60, 52);

  var critTxt = cfg.crit.map(function (x) {
    var tipo = cfg.fpp(x) > 0 ? 'mín' : cfg.fpp(x) < 0 ? 'máx' : '?';
    return 'x=' + x.toFixed(2) + ' (' + tipo + ')';
  }).join(', ');

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong><br>' +
    'Puntos críticos (donde f\'=0, líneas rojas): <strong>' + critTxt + '</strong><br>' +
    'Inflexiones (donde f\'\'=0, puntos morados): <strong>' +
      cfg.infl.map(function (x){return 'x='+x.toFixed(2);}).join(', ') + '</strong><br>' +
    '<span style="color:#8fb4d9">Donde <strong style="color:#1c7a4c">f\' (verde)</strong> cruza cero, ' +
    'f tiene un máximo o mínimo. El signo de <strong style="color:#c68f2e">f\'\' (naranja)</strong> ' +
    'ahí decide cuál: f\'\'&lt;0 es máximo (cóncava hacia abajo), f\'\'&gt;0 es mínimo. Donde f\'\' cruza ' +
    'cero cambia la concavidad: es un punto de inflexión.</span>';
});

/* ══════════ S09 · Elasticidad de la demanda ══════════ */
OVA.viz.registrar('elasticidad', function (host) {
  var a = parseFloat(q(host, 'select').value);   // pendiente de la demanda q = 100 - a·p
  var p0 = parseFloat(q(host, '.precio').value);
  var qmax = 100, pmax = qmax / a;
  if (p0 > pmax - 1) p0 = pmax - 1;
  q(host, '.precio-val').textContent = 'p = ' + p0.toFixed(0);

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 300 });
  L.ox = 44; L.oy = L.h - 30;
  L.sx = (L.w - 60) / (pmax * 1.05);
  L.sy = (L.h - 50) / (qmax * 1.1);
  OVA.ejes(L);
  var c = L.ctx;

  // recta de demanda
  var dem = function (p) { return qmax - a*p; };
  c.strokeStyle = AZUL; c.lineWidth = 2.6;
  c.beginPath(); c.moveTo(L.px(0), L.py(dem(0))); c.lineTo(L.px(pmax), L.py(0)); c.stroke();

  // punto de elasticidad unitaria: E=-1 en p = 50/a  (mitad del intercepto)
  var pu = pmax / 2;
  OVA.punto(L, pu, dem(pu), VERDE);
  c.strokeStyle = 'rgba(28,122,76,.4)'; c.setLineDash([4,4]); c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(L.px(pu), L.py(0)); c.lineTo(L.px(pu), L.py(dem(pu))); c.stroke();
  c.setLineDash([]);

  // punto actual
  var q0 = dem(p0);
  var E = (-a) * p0 / q0;   // elasticidad = (dq/dp)(p/q)
  OVA.punto(L, p0, q0, ORO);

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace';
  c.fillText('q = ' + qmax + ' − ' + a + 'p', 52, 18);
  c.fillStyle = VERDE; c.font = '10px ui-monospace,monospace';
  c.fillText('|E|=1', L.px(pu) - 12, L.py(dem(pu)) - 8);

  var tipo = Math.abs(E) > 1 ? 'elástica' : Math.abs(E) < 1 ? 'inelástica' : 'unitaria';
  var col = Math.abs(E) > 1 ? '#b0392c' : Math.abs(E) < 1 ? '#3a6ea5' : '#1c7a4c';

  q(host, '.viz-readout').innerHTML =
    '<strong>Demanda q = ' + qmax + ' − ' + a + 'p</strong> · elasticidad E = (dq/dp)·(p/q)<br>' +
    'En p = ' + p0.toFixed(0) + ': q = ' + q0.toFixed(0) + ', y ' +
    'E = (−' + a + ')·(' + p0.toFixed(0) + '/' + q0.toFixed(0) + ') = ' +
    '<strong style="color:' + col + '">' + E.toFixed(2) + '</strong> → demanda <strong style="color:' +
    col + '">' + tipo + '</strong><br>' +
    '<span style="color:#8fb4d9">|E|&gt;1 (precios altos): subir el precio baja el ingreso — demanda ' +
    'elástica. |E|&lt;1 (precios bajos): subir el precio sube el ingreso — inelástica. En el punto ' +
    'medio (verde) |E|=1: ahí el ingreso es máximo. Mueve el precio y cruza ese punto.</span>';
});

/* ══════════════════════════════════════════════════════════
   CORTE III · S11–S14 · Integración
   antiderivada (S11) · comprobar (S12) · areabajo · acumulada (S13)
   entrecurvas · excedente (S14)
   ══════════════════════════════════════════════════════════ */

/* Lienzo con rango a medida: fija origen y escala para que
   OVA.curva / OVA.punto funcionen con coordenadas reales.       */
function marco(cv, alto, xmin, xmax, ymin, ymax) {
  var L = OVA.lienzo(cv, { alto: alto });
  var padL = 44, padR = 14, padT = 14, padB = 26;
  L.sx = (L.w - padL - padR) / (xmax - xmin);
  L.sy = (L.h - padT - padB) / (ymax - ymin);
  L.ox = padL - xmin * L.sx;
  L.oy = padT + ymax * L.sy;
  L.xmin = xmin; L.xmax = xmax; L.ymin = ymin; L.ymax = ymax;
  return L;
}

/* Ejes con paso de rejilla explícito (para rangos no unitarios). */
function ejesEsc(L, px, py) {
  var c = L.ctx, grid = OVA.color('cv-grid'), axis = OVA.color('cv-axis'), txt = OVA.color('cv-text');
  c.strokeStyle = grid; c.lineWidth = 1; c.font = '10px ui-monospace,monospace'; c.fillStyle = txt;
  var x0 = Math.ceil(L.xmin / px) * px, y0 = Math.ceil(L.ymin / py) * py, v, p;
  for (v = x0; v <= L.xmax + 1e-9; v += px) {
    p = L.px(v); c.beginPath(); c.moveTo(p, L.py(L.ymin)); c.lineTo(p, L.py(L.ymax)); c.stroke();
    if (Math.abs(v) > 1e-9) c.fillText(fmtN(v), p - 6, L.py(L.ymin) + 13);
  }
  for (v = y0; v <= L.ymax + 1e-9; v += py) {
    p = L.py(v); c.beginPath(); c.moveTo(L.px(L.xmin), p); c.lineTo(L.px(L.xmax), p); c.stroke();
    if (Math.abs(v) > 1e-9) c.fillText(fmtN(v), L.px(L.xmin) - 30, p + 3);
  }
  c.strokeStyle = axis; c.lineWidth = 1.6;
  var yA = Math.min(Math.max(0, L.ymin), L.ymax), xA = Math.min(Math.max(0, L.xmin), L.xmax);
  c.beginPath(); c.moveTo(L.px(L.xmin), L.py(yA)); c.lineTo(L.px(L.xmax), L.py(yA)); c.stroke();
  c.beginPath(); c.moveTo(L.px(xA), L.py(L.ymin)); c.lineTo(L.px(xA), L.py(L.ymax)); c.stroke();
}
function fmtN(v) { return (Math.round(v * 100) / 100).toString(); }
function fmt2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
function fmt3(v) { return (Math.round(v * 1000) / 1000).toFixed(3); }

/* Recorta el dibujo al marco para que las curvas no invadan los márgenes. */
function clipMarco(L, fn) {
  var c = L.ctx; c.save(); c.beginPath();
  c.rect(L.px(L.xmin), L.py(L.ymax), L.px(L.xmax) - L.px(L.xmin), L.py(L.ymin) - L.py(L.ymax));
  c.clip(); fn(); c.restore();
}
/* Rellena entre dos funciones en [a,b]. */
function rellenar(L, a, b, fTop, fBot, color) {
  var c = L.ctx, n = 160, i, x;
  c.fillStyle = color; c.beginPath();
  for (i = 0; i <= n; i++) { x = a + (b - a) * i / n; var y = fTop(x); if (i === 0) c.moveTo(L.px(x), L.py(y)); else c.lineTo(L.px(x), L.py(y)); }
  for (i = n; i >= 0; i--) { x = a + (b - a) * i / n; c.lineTo(L.px(x), L.py(fBot(x))); }
  c.closePath(); c.fill();
}
function simpson(f, a, b, n) {
  n = n || 400; var h = (b - a) / n, s = f(a) + f(b), i;
  for (i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}
function tangente(L, x0, y0, m, color) {
  var c = L.ctx, dx = (L.xmax - L.xmin) * 0.22;
  c.strokeStyle = color; c.lineWidth = 1.6; c.setLineDash([5, 4]);
  c.beginPath(); c.moveTo(L.px(x0 - dx), L.py(y0 - m * dx)); c.lineTo(L.px(x0 + dx), L.py(y0 + m * dx)); c.stroke();
  c.setLineDash([]);
}

/* ══════════ S11 · Familia de antiderivadas F(x)+C ══════════ */
var ANTI = {
  dosx:   { f: function (x) { return 2 * x; },        F: function (x) { return x * x; },
            nf: 'f(x) = 2x',        nF: 'F(x) = x²',        sF: 'x²' },
  cubica: { f: function (x) { return 3*x*x - 3; },    F: function (x) { return x*x*x - 3*x; },
            nf: 'f(x) = 3x² − 3',   nF: 'F(x) = x³ − 3x',   sF: 'x³ − 3x' },
  cos:    { f: Math.cos,                                F: Math.sin,
            nf: 'f(x) = cos x',     nF: 'F(x) = sen x',     sF: 'sen x' },
  exp:    { f: Math.exp,                                F: Math.exp,
            nf: 'f(x) = eˣ',        nF: 'F(x) = eˣ',        sF: 'eˣ' }
};

OVA.viz.registrar('antiderivada', function (host) {
  var cfg = ANTI[q(host, 'select').value] || ANTI.dosx;
  var C = parseFloat(q(host, '.cte').value);
  var x0 = parseFloat(q(host, '.punto').value) / 10;
  q(host, '.cte-val').textContent = 'C = ' + C.toFixed(1);
  q(host, '.punto-val').textContent = 'x₀ = ' + x0.toFixed(1);

  var L = marco(q(host, 'canvas'), 320, -3, 3, -4, 6);
  ejesEsc(L, 1, 1);
  var c = L.ctx;
  clipMarco(L, function () {
    [-2, -1, 0, 1, 2].forEach(function (k) {
      if (k === C) return;
      OVA.curva(L, function (x) { return cfg.F(x) + k; }, 'rgba(58,110,165,.22)', 1.4);
    });
    OVA.curva(L, cfg.f, ORO, 1.8);
    OVA.curva(L, function (x) { return cfg.F(x) + C; }, AZUL, 3);
    var y0 = cfg.F(x0) + C, m = cfg.f(x0);
    tangente(L, x0, y0, m, VERDE);
    OVA.punto(L, x0, y0, VERDE);
    OVA.punto(L, x0, m, ORO, true);
  });
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = AZUL; c.fillText('— ' + cfg.nF + ' + C', L.px(L.xmin) + 6, 24);
  c.fillStyle = ORO;  c.fillText('— ' + cfg.nf, L.px(L.xmin) + 6, 40);

  var y0 = cfg.F(x0) + C, m = cfg.f(x0);
  q(host, '.viz-readout').innerHTML =
    '<strong>Familia F(x) + C = ' + cfg.sF + ' + C</strong> · todas tienen la misma derivada ' + cfg.nf + '<br>' +
    'Curva resaltada: C = ' + C.toFixed(1) + '. En x₀ = ' + x0.toFixed(1) + ': F(x₀)+C = <strong>' + fmt2(y0) +
    '</strong>, y la pendiente de la tangente (verde) es <strong style="color:#c68f2e">' + fmt2(m) +
    '</strong> = f(x₀) (el círculo naranja sobre la curva de f).<br>' +
    '<span style="color:#8fb4d9">Cambiar C desplaza la curva verticalmente sin cambiar su pendiente: ' +
    'por eso toda antiderivada se escribe F(x) + C. La condición inicial elige una sola curva de la familia.</span>';
});

/* ══════════ S12 · Comprobar una integral derivando ══════════ */
var COMPR = {
  sust1:  { f: function (x) { return x * Math.sqrt(x*x + 4); }, F: function (x) { return Math.pow(x*x + 4, 1.5) / 3; },
            nf: 'f = x√(x²+4)', nF: 'F = (x²+4)^{3/2}/3', tec: 'sustitución u = x² + 4', r: [-2, 2, -1, 8] },
  sust2:  { f: function (x) { return 2*x / (x*x + 1); }, F: function (x) { return Math.log(x*x + 1); },
            nf: 'f = 2x/(x²+1)', nF: 'F = ln(x²+1)', tec: 'sustitución u = x² + 1', r: [-3, 3, -1.5, 3] },
  sust3:  { f: function (x) { return Math.exp(-2*x); }, F: function (x) { return -Math.exp(-2*x) / 2; },
            nf: 'f = e^(−2x)', nF: 'F = −e^(−2x)/2', tec: 'sustitución u = −2x', r: [-1, 2, -4, 8] },
  partes1:{ f: function (x) { return x * Math.exp(x); }, F: function (x) { return (x - 1) * Math.exp(x); },
            nf: 'f = x·eˣ', nF: 'F = (x−1)eˣ', tec: 'partes: u = x, dv = eˣdx', r: [-2, 2, -3, 8] },
  partes2:{ f: function (x) { return x > 0 ? x * Math.log(x) : NaN; }, F: function (x) { return x > 0 ? x*x/2*Math.log(x) - x*x/4 : NaN; },
            nf: 'f = x·ln x', nF: 'F = (x²/2)ln x − x²/4', tec: 'partes: u = ln x, dv = x dx', r: [0, 3, -1, 4] },
  partes3:{ f: function (x) { return x > 0 ? Math.log(x) : NaN; }, F: function (x) { return x > 0 ? x*Math.log(x) - x : NaN; },
            nf: 'f = ln x', nF: 'F = x·ln x − x', tec: 'partes: u = ln x, dv = dx', r: [0, 4, -2, 3] }
};

OVA.viz.registrar('comprobar', function (host) {
  var cfg = COMPR[q(host, 'select').value] || COMPR.sust1;
  var r = cfg.r, t = parseFloat(q(host, '.punto').value) / 100;
  var x0 = r[0] + (r[1] - r[0]) * (0.05 + 0.9 * t);
  q(host, '.punto-val').textContent = 'x₀ = ' + x0.toFixed(2);

  var L = marco(q(host, 'canvas'), 320, r[0], r[1], r[2], r[3]);
  ejesEsc(L, 1, 1);
  var c = L.ctx;
  var y0 = cfg.F(x0), m = cfg.f(x0), h = 1e-4;
  var mNum = (cfg.F(x0 + h) - cfg.F(x0 - h)) / (2 * h);
  clipMarco(L, function () {
    OVA.curva(L, cfg.f, ORO, 1.8);
    OVA.curva(L, cfg.F, AZUL, 3);
    tangente(L, x0, y0, m, VERDE);
    OVA.punto(L, x0, y0, VERDE);
    OVA.punto(L, x0, m, ORO, true);
  });
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = AZUL; c.fillText('— ' + cfg.nF, L.px(L.xmin) + 6, 24);
  c.fillStyle = ORO;  c.fillText('— ' + cfg.nf, L.px(L.xmin) + 6, 40);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.nF + '</strong> obtenida por ' + cfg.tec + '.<br>' +
    'En x₀ = ' + x0.toFixed(2) + ': pendiente de F (tangente verde) = <strong>' + fmt3(mNum) +
    '</strong> &nbsp;·&nbsp; f(x₀) = <strong style="color:#c68f2e">' + fmt3(m) + '</strong>' +
    (Math.abs(mNum - m) < 1e-3 * Math.max(1, Math.abs(m)) ? ' &nbsp;✓ coinciden' : '') + '<br>' +
    '<span style="color:#8fb4d9">Toda integral se comprueba derivando: si F′(x) = f(x) en todo punto, la ' +
    'técnica se aplicó bien. Mueve x₀ y verifica que la pendiente de F siempre es la altura de f.</span>';
});

/* ══════════ S13 · Área bajo la curva: sumas de Riemann ══════════ */
var RIEM = {
  cuad:  { f: function (x) { return x*x; },     a: 0, b: 2, ex: 8/3,          n: 'f(x) = x² en [0, 2]',    sEx: '8/3 ≈ 2.6667',  ymax: 4.4 },
  lineal:{ f: function (x) { return x; },       a: 0, b: 1, ex: 0.5,          n: 'f(x) = x en [0, 1]',     sEx: '1/2',           ymax: 1.3 },
  parab: { f: function (x) { return 4 - x*x; }, a: 0, b: 2, ex: 16/3,         n: 'f(x) = 4 − x² en [0, 2]', sEx: '16/3 ≈ 5.3333', ymax: 4.6 },
  exp:   { f: Math.exp,                          a: 0, b: 1, ex: Math.E - 1,   n: 'f(x) = eˣ en [0, 1]',    sEx: 'e − 1 ≈ 1.7183', ymax: 3 }
};

OVA.viz.registrar('areabajo', function (host) {
  var cfg = RIEM[q(host, 'select').value] || RIEM.cuad;
  var n = parseInt(q(host, '.n').value, 10);
  var modo = q(host, '.modo').value;
  q(host, '.n-val').textContent = 'n = ' + n;

  var L = marco(q(host, 'canvas'), 320, cfg.a - 0.15 * (cfg.b - cfg.a), cfg.b + 0.15 * (cfg.b - cfg.a), -0.12 * cfg.ymax, cfg.ymax);
  ejesEsc(L, (cfg.b - cfg.a) / 4, cfg.ymax > 3 ? 1 : 0.5);
  var c = L.ctx, dx = (cfg.b - cfg.a) / n, suma = 0, i;
  for (i = 0; i < n; i++) {
    var xi = cfg.a + i * dx;
    var xe = modo === 'izq' ? xi : modo === 'der' ? xi + dx : xi + dx / 2;
    var alt = cfg.f(xe); suma += alt * dx;
    c.fillStyle = 'rgba(198,143,46,.38)'; c.strokeStyle = ORO; c.lineWidth = 1;
    c.fillRect(L.px(xi), L.py(alt), L.px(xi + dx) - L.px(xi), L.py(0) - L.py(alt));
    c.strokeRect(L.px(xi), L.py(alt), L.px(xi + dx) - L.px(xi), L.py(0) - L.py(alt));
  }
  clipMarco(L, function () { OVA.curva(L, cfg.f, AZUL, 3); });
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace';
  c.fillText(cfg.n, L.px(L.xmin) + 6, 24);

  var err = suma - cfg.ex, nomb = modo === 'izq' ? 'izquierdos' : modo === 'der' ? 'derechos' : 'punto medio';
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · ' + n + ' rectángulos (' + nomb + '), Δx = ' + fmt3(dx) + '<br>' +
    'Suma de Riemann: <strong style="color:#c68f2e">' + fmt3(suma) + '</strong> &nbsp;·&nbsp; ' +
    'valor exacto ∫ = <strong>' + cfg.sEx + '</strong> &nbsp;·&nbsp; error = ' + (err >= 0 ? '+' : '') + fmt3(err) + '<br>' +
    '<span style="color:#8fb4d9">Al aumentar n el error se encoge: la integral definida es el límite de estas sumas ' +
    'cuando n → ∞. Con extremos derechos la suma sobreestima cuando f crece; con izquierdos, subestima.</span>';
});

/* ══════════ S13 · Función acumulada A(x) = ∫ₐˣ f(t) dt (TFC) ══════════ */
var ACUM = {
  dos:  { f: function (t) { return 2*t; },        A: function (x) { return x*x; },
          nf: 'f(t) = 2t',       nA: 'A(x) = x²',          xmax: 3, ymin: -1, ymax: 9 },
  cuad: { f: function (t) { return t*t; },        A: function (x) { return x*x*x/3; },
          nf: 'f(t) = t²',       nA: 'A(x) = x³/3',        xmax: 3, ymin: -1, ymax: 9 },
  mix:  { f: function (t) { return t*t - 2*t; },  A: function (x) { return x*x*x/3 - x*x; },
          nf: 'f(t) = t² − 2t',  nA: 'A(x) = x³/3 − x²',   xmax: 3, ymin: -1.6, ymax: 3.2 },
  cos:  { f: Math.cos,                             A: Math.sin,
          nf: 'f(t) = cos t',    nA: 'A(x) = sen x',       xmax: 6.5, ymin: -1.5, ymax: 1.5 }
};

OVA.viz.registrar('acumulada', function (host) {
  var cfg = ACUM[q(host, 'select').value] || ACUM.dos;
  var x = cfg.xmax * parseFloat(q(host, '.xa').value) / 100;
  q(host, '.xa-val').textContent = 'x = ' + x.toFixed(2);

  var L = marco(q(host, 'canvas'), 320, -0.3, cfg.xmax, cfg.ymin, cfg.ymax);
  ejesEsc(L, cfg.xmax > 4 ? 1 : 0.5, cfg.ymax > 4 ? 2 : 1);
  var c = L.ctx;
  clipMarco(L, function () {
    // región con signo entre 0 y x
    rellenar(L, 0, x, function (t) { return Math.max(cfg.f(t), 0); }, function () { return 0; }, 'rgba(28,122,76,.35)');
    rellenar(L, 0, x, function () { return 0; }, function (t) { return Math.min(cfg.f(t), 0); }, 'rgba(176,57,44,.35)');
    OVA.curva(L, cfg.f, ORO, 1.8);
    OVA.curva(L, function (u) { return u >= 0 ? cfg.A(u) : NaN; }, AZUL, 3);
    c.strokeStyle = 'rgba(58,110,165,.5)'; c.setLineDash([4, 4]); c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(L.px(x), L.py(0)); c.lineTo(L.px(x), L.py(cfg.A(x))); c.stroke(); c.setLineDash([]);
    OVA.punto(L, x, cfg.A(x), AZUL);
  });
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = ORO;  c.fillText('— ' + cfg.nf, L.px(L.xmin) + 6, 24);
  c.fillStyle = AZUL; c.fillText('— ' + cfg.nA + ' = ∫₀ˣ f', L.px(L.xmin) + 6, 40);

  var A = cfg.A(x), fx = cfg.f(x), num = simpson(cfg.f, 0, x, 200);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.nA + '</strong> acumula el área con signo bajo ' + cfg.nf + ' desde 0 hasta x.<br>' +
    'En x = ' + x.toFixed(2) + ': A(x) = <strong>' + fmt3(A) + '</strong> (área verde − área roja = ' + fmt3(num) + ')' +
    ' &nbsp;·&nbsp; A′(x) = f(x) = <strong style="color:#c68f2e">' + fmt3(fx) + '</strong><br>' +
    '<span style="color:#8fb4d9">Teorema fundamental: la rapidez con que crece el área acumulada es la altura de f. ' +
    'Donde f &gt; 0 (verde) A sube; donde f &lt; 0 (rojo) A baja; donde f = 0, A tiene un máximo o mínimo.</span>';
});

/* ══════════ S14 · Área entre dos curvas ══════════ */
var ENTRE = {
  recta: { f: function (x) { return x + 2; }, g: function (x) { return x*x; }, a: -1, b: 2,
           nf: 'y = x + 2', ng: 'y = x²', ex: 4.5, sEx: '9/2', r: [-2, 3, -1, 6], cortes: [-1, 2],
           txt: 'La recta va arriba en todo [−1, 2]: área = ∫₋₁²(x + 2 − x²)dx = 9/2.' },
  cubica:{ f: function (x) { return x; }, g: function (x) { return x*x*x; }, a: -1, b: 1,
           nf: 'y = x', ng: 'y = x³', ex: 0.5, sEx: '1/2', r: [-1.5, 1.5, -1.5, 1.5], cortes: [-1, 0, 1],
           txt: 'Las curvas se cruzan en 0: en [0,1] va arriba y = x, en [−1,0] va arriba y = x³. Se parte en dos integrales de 1/4 cada una.' },
  dos:   { f: function (x) { return 2*x; }, g: function (x) { return x*x; }, a: 0, b: 2,
           nf: 'y = 2x', ng: 'y = x²', ex: 4/3, sEx: '4/3', r: [-0.5, 3, -1, 5], cortes: [0, 2],
           txt: 'Cortes en x = 0 y x = 2; la recta va arriba: área = ∫₀²(2x − x²)dx = 4/3.' },
  lorenz:{ f: function (x) { return x; }, g: function (x) { return x*x; }, a: 0, b: 1,
           nf: 'y = x (igualdad perfecta)', ng: 'L(x) = x² (curva de Lorenz)', ex: 1/6, sEx: '1/6', r: [-0.1, 1.1, -0.1, 1.1], cortes: [0, 1],
           txt: 'Área entre la diagonal y la curva de Lorenz = 1/6; el índice de Gini es el doble: G = 1/3.' }
};

OVA.viz.registrar('entrecurvas', function (host) {
  var cfg = ENTRE[q(host, 'select').value] || ENTRE.recta;
  var r = cfg.r, t = parseFloat(q(host, '.franja').value) / 100;
  var xs = cfg.a + (cfg.b - cfg.a) * t;
  q(host, '.franja-val').textContent = 'x = ' + xs.toFixed(2);

  var L = marco(q(host, 'canvas'), 320, r[0], r[1], r[2], r[3]);
  ejesEsc(L, (r[1] - r[0]) > 3 ? 1 : 0.5, (r[3] - r[2]) > 3 ? 1 : 0.5);
  var c = L.ctx;
  var top = function (x) { return Math.max(cfg.f(x), cfg.g(x)); }, bot = function (x) { return Math.min(cfg.f(x), cfg.g(x)); };
  clipMarco(L, function () {
    rellenar(L, cfg.a, cfg.b, top, bot, 'rgba(28,122,76,.33)');
    OVA.curva(L, cfg.f, AZUL, 2.6);
    OVA.curva(L, cfg.g, ORO, 2.6);
    cfg.cortes.forEach(function (xc) { OVA.punto(L, xc, cfg.f(xc), ROJO); });
    // franja vertical en xs
    c.strokeStyle = MORADO; c.lineWidth = 3;
    c.beginPath(); c.moveTo(L.px(xs), L.py(top(xs))); c.lineTo(L.px(xs), L.py(bot(xs))); c.stroke();
  });
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = AZUL; c.fillText('— ' + cfg.nf, L.px(L.xmin) + 6, 24);
  c.fillStyle = ORO;  c.fillText('— ' + cfg.ng, L.px(L.xmin) + 6, 40);

  var area = simpson(function (x) { return top(x) - bot(x); }, cfg.a, cfg.b, 400);
  var arriba = cfg.f(xs) >= cfg.g(xs) ? cfg.nf : cfg.ng;
  q(host, '.viz-readout').innerHTML =
    '<strong>Área entre ' + cfg.nf + ' y ' + cfg.ng + ' en [' + cfg.a + ', ' + cfg.b + ']</strong> = ' +
    '∫(arriba − abajo)dx = <strong style="color:#1c7a4c">' + cfg.sEx + ' ≈ ' + fmt3(cfg.ex) + '</strong> (numérico: ' + fmt3(area) + ')<br>' +
    'Franja morada en x = ' + xs.toFixed(2) + ': altura = arriba − abajo = <strong>' + fmt3(top(xs) - bot(xs)) +
    '</strong> (arriba va <em>' + arriba + '</em>).<br>' +
    '<span style="color:#8fb4d9">' + cfg.txt + ' Los puntos rojos son los cortes, que dan los límites de integración.</span>';
});

/* ══════════ S14 · Excedente del consumidor y del productor ══════════ */
var EXCED = {
  base:  { D: function (q) { return 100 - 2*q; }, S: function (q) { return 20 + 2*q; }, qe: 20, pe: 60,
           nD: 'D: p = 100 − 2q', nS: 'S: p = 20 + 2q', EC: 400, EP: 400, sEC: '400', sEP: '400' },
  inel:  { D: function (q) { return 100 - q; },   S: function (q) { return 20 + 2*q; }, qe: 80/3, pe: 220/3,
           nD: 'D: p = 100 − q',  nS: 'S: p = 20 + 2q', EC: 3200/9, EP: 6400/9, sEC: '3200/9 ≈ 355,6', sEP: '6400/9 ≈ 711,1' },
  oferta:{ D: function (q) { return 100 - 2*q; }, S: function (q) { return 40 + q; },   qe: 20, pe: 60,
           nD: 'D: p = 100 − 2q', nS: 'S: p = 40 + q',  EC: 400, EP: 200, sEC: '400', sEP: '200' }
};

OVA.viz.registrar('excedente', function (host) {
  var cfg = EXCED[q(host, 'select').value] || EXCED.base;
  var ver = q(host, '.capa').value;   // ambos | ec | ep

  var L = marco(q(host, 'canvas'), 320, 0, 55, 0, 110);
  ejesEsc(L, 10, 20);
  var c = L.ctx;
  clipMarco(L, function () {
    if (ver !== 'ep') rellenar(L, 0, cfg.qe, cfg.D, function () { return cfg.pe; }, 'rgba(28,122,76,.35)');
    if (ver !== 'ec') rellenar(L, 0, cfg.qe, function () { return cfg.pe; }, cfg.S, 'rgba(125,79,158,.35)');
    OVA.curva(L, cfg.D, AZUL, 2.6);
    OVA.curva(L, cfg.S, ORO, 2.6);
    c.strokeStyle = 'rgba(176,57,44,.5)'; c.setLineDash([4, 4]); c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(L.px(0), L.py(cfg.pe)); c.lineTo(L.px(cfg.qe), L.py(cfg.pe)); c.lineTo(L.px(cfg.qe), L.py(0)); c.stroke();
    c.setLineDash([]);
    OVA.punto(L, cfg.qe, cfg.pe, ROJO);
  });
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = AZUL;   c.fillText('— ' + cfg.nD, L.px(28), 24);
  c.fillStyle = ORO;    c.fillText('— ' + cfg.nS, L.px(28), 40);
  c.fillStyle = VERDE;  c.fillText('EC', L.px(3), L.py((cfg.D(0) + cfg.pe) / 2) + 4);
  c.fillStyle = MORADO; c.fillText('EP', L.px(3), L.py((cfg.S(0) + cfg.pe) / 2) + 4);

  var ECn = simpson(cfg.D, 0, cfg.qe, 200) - cfg.pe * cfg.qe, EPn = cfg.pe * cfg.qe - simpson(cfg.S, 0, cfg.qe, 200);
  q(host, '.viz-readout').innerHTML =
    '<strong>Equilibrio</strong> (punto rojo): D = S en q* = ' + fmt2(cfg.qe) + ', p* = ' + fmt2(cfg.pe) + '.<br>' +
    'Excedente del consumidor (verde) = ∫₀^{q*} D(q)dq − p*q* = <strong style="color:#1c7a4c">' + cfg.sEC + '</strong> (numérico ' + fmt2(ECn) + ') ' +
    '&nbsp;·&nbsp; Excedente del productor (morado) = p*q* − ∫₀^{q*} S(q)dq = <strong style="color:#b08ad0">' + cfg.sEP + '</strong> (numérico ' + fmt2(EPn) + ')<br>' +
    '<span style="color:#8fb4d9">EC: lo que los compradores estaban dispuestos a pagar por encima del precio real. ' +
    'EP: lo que los vendedores reciben por encima del mínimo que aceptarían. Ambos son áreas entre curvas.</span>';
});

})();
