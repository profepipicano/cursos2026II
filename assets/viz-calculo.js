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

/* ── Enlazar controles: cualquier cambio redibuja ───────── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (host) {
    host.addEventListener('input', function () { OVA.viz.redibujar(); });
    host.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
