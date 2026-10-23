/* ══════════════════════════════════════════════════════════
   Visualizadores · Ecuaciones Diferenciales
   familia    S01  solución general vs particular (clic)
   verificar  S01  comprobar una solución por sustitución
   campo      S02  campo de direcciones con clic
   isoclinas  S02  curvas de pendiente constante
   autonoma   S02  línea de fase y equilibrios
   decaimiento S03 crecimiento y decrecimiento exponencial
   lineal     S03  transitorio y estado estacionario
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', ROJO = '#b0392c', VERDE = '#1c7a4c', MORADO = '#7d4f9e';
function q(host, sel) { return host.querySelector(sel); }

var EDOS = {
  lin:  { f: function (x, y) { return y; },              n: "y' = y",           sol: 'y = C e^{x}' },
  log:  { f: function (x, y) { return y * (1 - y / 3); }, n: "y' = y(1 − y/3)",  sol: 'logística, equilibrios en y = 0 y y = 3' },
  sep:  { f: function (x, y) { return -x / (y || 1e-6); }, n: "y' = −x/y",       sol: 'x² + y² = C (circunferencias)' },
  dec:  { f: function (x, y) { return -0.8 * y + 2; },    n: "y' = −0,8y + 2",   sol: 'equilibrio estable en y = 2,5' },
  osc:  { f: function (x, y) { return Math.cos(x) - 0.3 * y; }, n: "y' = cos x − 0,3y", sol: 'régimen oscilatorio amortiguado' }
};

function rk4(f, x, y, h) {
  var k1 = f(x, y);
  var k2 = f(x + h / 2, y + h * k1 / 2);
  var k3 = f(x + h / 2, y + h * k2 / 2);
  var k4 = f(x + h, y + h * k3);
  return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
}

function trazar(L, f, x0, y0, color) {
  var c = L.ctx, dir, h, x, y, n, i;
  c.strokeStyle = color; c.lineWidth = 3; c.lineJoin = 'round';
  for (dir = 0; dir < 2; dir++) {
    h = (dir ? -1 : 1) * 0.02;
    x = x0; y = y0; n = 900;
    c.beginPath(); c.moveTo(L.px(x), L.py(y));
    for (i = 0; i < n; i++) {
      var yn = rk4(f, x, y, h);
      if (!isFinite(yn) || Math.abs(yn) > 60) break;
      x += h; y = yn;
      var pxv = L.px(x), pyv = L.py(y);
      if (pxv < -20 || pxv > L.w + 20 || pyv < -400 || pyv > L.h + 400) break;
      c.lineTo(pxv, pyv);
    }
    c.stroke();
  }
}

OVA.viz.registrar('campo', function (host) {
  var cfg = EDOS[q(host, 'select').value] || EDOS.lin;
  var canvas = q(host, 'canvas');

  if (host._edo !== q(host, 'select').value) { host._pts = []; host._edo = q(host, 'select').value; }
  if (!host._pts) host._pts = [];

  var L = OVA.lienzo(canvas, { sx: 46, sy: 34 });
  L.oy = L.h * 0.55;
  OVA.ejes(L);

  // Segmentos de pendiente
  var c = L.ctx, paso = 26, largo = 11;
  for (var pxv = paso / 2; pxv < L.w; pxv += paso) {
    for (var pyv = paso / 2; pyv < L.h; pyv += paso) {
      var x = (pxv - L.ox) / L.sx, y = (L.oy - pyv) / L.sy;
      var m = cfg.f(x, y);
      if (!isFinite(m)) continue;
      var ang = Math.atan(m);
      var dx = Math.cos(ang) * largo / 2, dy = Math.sin(ang) * largo / 2;
      var fuerza = Math.min(Math.abs(m) / 3, 1);
      c.strokeStyle = document.body.classList.contains('dark')
        ? 'rgba(143,180,217,' + (0.35 + fuerza * 0.5) + ')'
        : 'rgba(34,80,125,' + (0.3 + fuerza * 0.5) + ')';
      c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(pxv - dx, pyv + dy); c.lineTo(pxv + dx, pyv - dy); c.stroke();
    }
  }

  var COLORES = [ORO, ROJO, VERDE, '#7d4f9e', '#c65e2e'];
  host._pts.forEach(function (p, i) {
    trazar(L, cfg.f, p[0], p[1], COLORES[i % COLORES.length]);
    OVA.punto(L, p[0], p[1], COLORES[i % COLORES.length]);
  });

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  q(host, '.viz-readout').innerHTML = host._pts.length
    ? 'Curvas trazadas: <strong>' + host._pts.length + '</strong>. Última condición inicial: ' +
      '<strong>y(' + host._pts[host._pts.length - 1][0].toFixed(2) + ') = ' +
      host._pts[host._pts.length - 1][1].toFixed(2) + '</strong>.<br>' +
      '<span style="color:#8fb4d9">Solución general: ' + cfg.sol + '. Cada clic elige un miembro ' +
      'distinto de la familia; la condición inicial es lo único que los separa.</span>'
    : '<strong>Haz clic sobre el campo</strong> para trazar la solución que pasa por ese punto. ' +
      'Los segmentos muestran la pendiente que la ecuación impone en cada lugar del plano.';

  if (!canvas._lig) {
    canvas._lig = true;
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', function (ev) {
      var r = canvas.getBoundingClientRect();
      var LL = { ox: L.ox, oy: L.oy, sx: L.sx, sy: L.sy };
      host._pts.push([
        ((ev.clientX - r.left) - LL.ox) / LL.sx,
        (LL.oy - (ev.clientY - r.top)) / LL.sy
      ]);
      OVA.viz.redibujar();
    });
  }
});

OVA.viz.registrar('campo-limpiar', function () {});

/* ══════ S01 · Familia de soluciones: general vs particular ══════ */
var FAM = {
  exp:   { y: function (C, x) { return C * Math.exp(x); },      C: function (x, y) { return y * Math.exp(-x); },
           edo: "y' = y",      gen: 'y = C·eˣ',      Cs: [-3,-2,-1,-0.5,0,0.5,1,2,3] },
  cuad:  { y: function (C, x) { return x * x + C; },            C: function (x, y) { return y - x * x; },
           edo: "y' = 2x",     gen: 'y = x² + C',    Cs: [-4,-3,-2,-1,0,1,2,3,4] },
  dec:   { y: function (C, x) { return C * Math.exp(-x); },     C: function (x, y) { return y * Math.exp(x); },
           edo: "y' = −y",     gen: 'y = C·e⁻ˣ',     Cs: [-3,-2,-1,-0.5,0,0.5,1,2,3] },
  recta: { y: function (C, x) { return C * x; },                C: function (x, y) { return x !== 0 ? y / x : null; },
           edo: "y' = y/x",    gen: 'y = C·x',       Cs: [-3,-2,-1,-0.5,0,0.5,1,2,3] }
};

OVA.viz.registrar('familia', function (host) {
  var cfg = FAM[q(host, 'select').value] || FAM.exp;
  if (host._fam !== q(host, 'select').value) { host._pt = null; host._fam = q(host, 'select').value; }

  var L = OVA.lienzo(host.querySelector('canvas'), { sx: 46, sy: 34 });
  OVA.ejes(L);
  var c = L.ctx;

  // toda la familia, tenue
  cfg.Cs.forEach(function (Cv) {
    OVA.curva(L, function (x) { return cfg.y(Cv, x); }, 'rgba(128,150,175,.55)', 1.6);
  });

  // la solución particular elegida
  var P = host._pt, Csel = null;
  if (P) {
    Csel = cfg.C(P[0], P[1]);
    if (Csel !== null && isFinite(Csel)) {
      OVA.curva(L, function (x) { return cfg.y(Csel, x); }, '#c68f2e', 3.4);
      OVA.punto(L, P[0], P[1], '#b0392c');
    }
  }

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.edo + '     ' + cfg.gen, 10, 18);

  q(host, '.viz-readout').innerHTML = (P && Csel !== null && isFinite(Csel)
    ? 'Condición inicial: <strong>y(' + P[0].toFixed(2) + ') = ' + P[1].toFixed(2) + '</strong><br>' +
      'Solución particular: <strong style="color:#dba949">' +
        cfg.gen.replace('C', Csel.toFixed(3)) + '</strong><br>' +
      '<span style="color:#8fb4d9">Las curvas grises son la solución <em>general</em>: infinitas, ' +
      'una por cada C. La condición inicial elige una sola. Haz clic en otro punto para cambiarla.</span>'
    : '<strong>Haz clic en cualquier punto del plano</strong> para imponer una condición inicial.<br>' +
      '<span style="color:#8fb4d9">Las curvas grises son todas soluciones de ' + cfg.edo +
      '. Ninguna es «la» solución: forman una familia con un parámetro libre C.</span>');

  var cv = host.querySelector('canvas');
  if (!cv._lig) {
    cv._lig = true;
    cv.style.cursor = 'crosshair';
    cv.addEventListener('click', function (ev) {
      var r = cv.getBoundingClientRect();
      host._pt = [((ev.clientX - r.left) - L.ox) / L.sx, (L.oy - (ev.clientY - r.top)) / L.sy];
      OVA.viz.redibujar();
    });
  }
});

/* ══════ S01 · Verificación por sustitución ══════ */
var VERIF = {
  v1: { edo: "y' − 2y = 0", cand: 'y = e^{2x}',
        y: function (x) { return Math.exp(2 * x); },
        res: function (x) { return 2 * Math.exp(2 * x) - 2 * Math.exp(2 * x); },
        pasos: ["y = e^{2x}", "y' = 2e^{2x}", "y' − 2y = 2e^{2x} − 2e^{2x} = 0"], ok: true },
  v2: { edo: "y' − 2y = 0", cand: 'y = x²',
        y: function (x) { return x * x; },
        res: function (x) { return 2 * x - 2 * x * x; },
        pasos: ["y = x²", "y' = 2x", "y' − 2y = 2x − 2x² = 2x(1 − x)"], ok: false },
  v3: { edo: "y'' + y = 0", cand: 'y = sen x',
        y: Math.sin,
        res: function (x) { return -Math.sin(x) + Math.sin(x); },
        pasos: ["y = sen x", "y' = cos x,  y'' = −sen x", "y'' + y = −sen x + sen x = 0"], ok: true },
  v4: { edo: "y'' + y = 0", cand: 'y = eˣ',
        y: Math.exp,
        res: function (x) { return Math.exp(x) + Math.exp(x); },
        pasos: ["y = eˣ", "y' = eˣ,  y'' = eˣ", "y'' + y = eˣ + eˣ = 2eˣ"], ok: false },
  v5: { edo: "x·y' + y = 0", cand: 'y = 1/x',
        y: function (x) { return 1 / x; },
        res: function (x) { return x * (-1 / (x * x)) + 1 / x; },
        pasos: ["y = 1/x", "y' = −1/x²", "x·y' + y = −1/x + 1/x = 0"], ok: true },
  v6: { edo: "y' − y/x = 0", cand: 'y = 3x',
        y: function (x) { return 3 * x; },
        res: function (x) { return 3 - 3 * x / x; },
        pasos: ["y = 3x", "y' = 3", "y' − y/x = 3 − 3x/x = 0"], ok: true }
};

OVA.viz.registrar('verificar', function (host) {
  var cfg = VERIF[q(host, 'select').value] || VERIF.v1;

  var h = '<div style="font-family:ui-monospace,monospace;font-size:.95rem;margin-bottom:.5rem">' +
          'EDO: <strong>' + cfg.edo + '</strong> &nbsp;·&nbsp; candidato: <strong>' + cfg.cand + '</strong></div>';
  cfg.pasos.forEach(function (p, i) {
    h += '<div class="paso"><div class="paso-t">' + (i + 1) + '. ' +
         ['Escribir el candidato', 'Derivar', 'Sustituir en la ecuación'][i] + '</div>' +
         '<span style="font-family:ui-monospace,monospace">' + p + '</span></div>';
  });
  q(host, '.pasos').innerHTML = h;

  var L = OVA.lienzo(host.querySelector('canvas'), { alto: 210, sx: 60, sy: 34 });
  L.oy = L.h / 2;
  OVA.ejes(L);
  var c = L.ctx;
  c.strokeStyle = 'rgba(128,150,175,.75)'; c.lineWidth = 2.5; c.setLineDash([5, 4]);
  c.beginPath(); c.moveTo(0, L.py(0)); c.lineTo(L.w, L.py(0)); c.stroke();
  c.setLineDash([]);
  OVA.curva(L, cfg.res, cfg.ok ? '#1c7a4c' : '#b0392c', 3.4);

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText('residuo al sustituir el candidato en la EDO', 10, 18);

  var muestras = [-2, -1, -0.5, 0.5, 1, 2].map(function (v) { return Math.abs(cfg.res(v)); });
  var maxres = Math.max.apply(null, muestras.filter(isFinite));

  q(host, '.viz-readout').innerHTML =
    (cfg.ok
      ? '<strong style="color:#7fd4a4">✓ Sí es solución.</strong> El residuo es idénticamente cero: ' +
        'la curva coincide con el eje horizontal en todo el intervalo.'
      : '<strong style="color:#f0a58a">✗ No es solución.</strong> El residuo se aparta del cero ' +
        '(máximo ≈ ' + maxres.toFixed(3) + ' en la muestra): la sustitución no cierra.') +
    '<br><span style="color:#8fb4d9">Verificar cuesta quince segundos y siempre se puede hacer, ' +
    'aunque no sepas resolver la ecuación. Es la comprobación más rentable del curso.</span>';
});

/* ══════ S02 · Isoclinas: dónde la pendiente es la misma ══════ */
var ISO = {
  lin:  { f: function (x, y) { return x - y; },        n: "y' = x − y",
          iso: 'x − y = k  →  rectas y = x − k', ks: [-2,-1,0,1,2,3] },
  cuad: { f: function (x, y) { return y - x * x; },    n: "y' = y − x²",
          iso: 'y − x² = k  →  parábolas y = x² + k', ks: [-3,-2,-1,0,1,2] },
  circ: { f: function (x, y) { return x * x + y * y; }, n: "y' = x² + y²",
          iso: 'x² + y² = k  →  circunferencias', ks: [1,2,4,6,9] },
  prod: { f: function (x, y) { return x * y; },        n: "y' = x·y",
          iso: 'x·y = k  →  hipérbolas', ks: [-4,-2,-1,1,2,4] }
};
var COLISO = ['#c68f2e','#1c7a4c','#b0392c','#7d4f9e','#3a6ea5','#c65e2e'];

OVA.viz.registrar('isoclinas', function (host) {
  var cfg = ISO[q(host, 'select').value] || ISO.lin;
  var cuantas = parseInt(q(host, '.cuantas').value, 10);
  var ks = cfg.ks.slice(0, cuantas);
  q(host, '.cuantas-val').textContent = ks.length + ' isoclinas';

  var L = OVA.lienzo(host.querySelector('canvas'), { sx: 40, sy: 32 });
  OVA.ejes(L);
  var c = L.ctx;

  // campo de direcciones tenue de fondo
  var paso = 30, largo = 12;
  for (var px = paso / 2; px < L.w; px += paso) {
    for (var py = paso / 2; py < L.h; py += paso) {
      var xv = (px - L.ox) / L.sx, yv = (L.oy - py) / L.sy, m = cfg.f(xv, yv);
      if (!isFinite(m)) continue;
      var a = Math.atan(m), dx = Math.cos(a) * largo / 2, dy = Math.sin(a) * largo / 2;
      c.strokeStyle = document.body.classList.contains('dark')
        ? 'rgba(143,180,217,.30)' : 'rgba(34,80,125,.28)';
      c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(px - dx, py + dy); c.lineTo(px + dx, py - dy); c.stroke();
    }
  }

  // cada isoclina, por cambio de signo de f(x,y) − k
  ks.forEach(function (k, idx) {
    var col = COLISO[idx % COLISO.length];
    var g = function (X, Y) { return cfg.f((X - L.ox) / L.sx, (L.oy - Y) / L.sy) - k; };
    var puntos = [];
    c.fillStyle = col;
    for (var X = 0; X < L.w; X += 2) {
      for (var Y = 0; Y < L.h; Y += 2) {
        var v = g(X, Y);
        if (!isFinite(v)) continue;
        var vd = g(X + 2, Y), vb = g(X, Y + 2);
        if ((isFinite(vd) && v * vd < 0) || (isFinite(vb) && v * vb < 0)) {
          c.fillRect(X, Y, 2.4, 2.4);
          puntos.push([X, Y]);
        }
      }
    }
    // sobre la isoclina, segmentos con pendiente k: todos paralelos
    c.strokeStyle = col; c.lineWidth = 2.4;
    var salto = Math.max(1, Math.floor(puntos.length / 9));
    for (var i = 0; i < puntos.length; i += salto) {
      var p = puntos[i], ang = Math.atan(k), d1 = Math.cos(ang) * 9, d2 = Math.sin(ang) * 9;
      c.beginPath();
      c.moveTo(p[0] - d1, p[1] + d2); c.lineTo(p[0] + d1, p[1] - d2); c.stroke();
    }
  });

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;·&nbsp; isoclinas: ' + cfg.iso + '<br>' +
    ks.map(function (k, i) {
      return '<span style="color:' + COLISO[i % COLISO.length] + '">■</span> k = ' + k;
    }).join(' &nbsp; ') + '<br>' +
    '<span style="color:#8fb4d9">Sobre cada curva de color, todos los segmentos son ' +
    '<strong>paralelos entre sí</strong>: esa es la definición de isoclina. Dibujar tres o cuatro ' +
    'y rellenar entre ellas es como se bosqueja un campo a mano, sin computador.</span>';
});

/* ══════ S02 · EDO autónomas y línea de fase ══════ */
var AUTO = {
  log:  { f: function (y) { return y * (1 - y / 3); }, n: "y' = y(1 − y/3)",
          eq: [0, 3], y0s: [-0.6, 0.4, 1.5, 2.6, 3.8, 4.6], rango: [-1.4, 5] },
  cuad: { f: function (y) { return y * y - 4; },       n: "y' = y² − 4",
          eq: [-2, 2], y0s: [-3.4, -2.6, -1, 1, 1.9, 2.4], rango: [-4, 4] },
  semi: { f: function (y) { return y * (y - 2) * (y - 2); }, n: "y' = y(y − 2)²",
          eq: [0, 2], y0s: [-0.5, 0.4, 1.4, 2.3, 2.8], rango: [-1.2, 3.4] },
  dec:  { f: function (y) { return 2 - y; },           n: "y' = 2 − y",
          eq: [2], y0s: [-1, 0.5, 3.5, 5], rango: [-1.5, 5.5] }
};

OVA.viz.registrar('autonoma', function (host) {
  var cfg = AUTO[q(host, 'select').value] || AUTO.log;
  var L = OVA.lienzo(host.querySelector('canvas'), { alto: 300 });
  var c = L.ctx;
  var mL = 96, mR = 14, mT = 22, mB = 28;
  var W = L.w - mL - mR, H = L.h - mT - mB;
  var y0 = cfg.rango[0], y1 = cfg.rango[1];
  var PY = function (v) { return mT + (y1 - v) / (y1 - y0) * H; };
  var PT = function (tt) { return mL + tt / 6 * W; };

  // ── línea de fase (izquierda) ──
  var xf = 62;
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 2;
  c.beginPath(); c.moveTo(xf, mT); c.lineTo(xf, mT + H); c.stroke();
  var cortes = [y0].concat(cfg.eq).concat([y1]);
  for (var i = 0; i < cortes.length - 1; i++) {
    var med = (cortes[i] + cortes[i + 1]) / 2, sube = cfg.f(med) > 0;
    var ym = PY(med);
    c.strokeStyle = sube ? '#1c7a4c' : '#b0392c'; c.fillStyle = c.strokeStyle;
    c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(xf, ym + 14); c.lineTo(xf, ym - 14); c.stroke();
    var p = sube ? ym - 14 : ym + 14, s = sube ? 1 : -1;
    c.beginPath();
    c.moveTo(xf, p); c.lineTo(xf - 5, p + s * 8); c.lineTo(xf + 5, p + s * 8);
    c.closePath(); c.fill();
  }
  cfg.eq.forEach(function (e) {
    c.fillStyle = '#c68f2e';
    c.beginPath(); c.arc(xf, PY(e), 6, 0, 6.2832); c.fill();
    c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace';
    c.fillText('y = ' + e, 6, PY(e) + 4);
    // recta de equilibrio en el plano t-y
    c.strokeStyle = 'rgba(198,143,46,.9)'; c.lineWidth = 2; c.setLineDash([7, 4]);
    c.beginPath(); c.moveTo(mL, PY(e)); c.lineTo(mL + W, PY(e)); c.stroke();
    c.setLineDash([]);
  });
  c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
  c.fillText('línea de fase', 4, mT - 8);

  // ── curvas solución (derecha), por RK4 ──
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mL, mT); c.lineTo(mL, mT + H); c.lineTo(mL + W, mT + H); c.stroke();
  c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
  c.fillText('t', mL + W / 2, L.h - 6);

  cfg.y0s.forEach(function (v0) {
    var h = 0.01, v = v0;
    c.strokeStyle = '#3a6ea5'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(PT(0), PY(v));
    for (var s = 0; s < 600; s++) {
      var k1 = cfg.f(v), k2 = cfg.f(v + h * k1 / 2),
          k3 = cfg.f(v + h * k2 / 2), k4 = cfg.f(v + h * k3);
      v += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
      if (!isFinite(v)) break;
      var Y = PY(v);
      if (Y < mT - 30 || Y > mT + H + 30) break;
      c.lineTo(PT((s + 1) * h), Y);
    }
    c.stroke();
  });

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, mL + 8, mT + 12);

  // clasificación de cada equilibrio
  var clas = cfg.eq.map(function (e) {
    var d = 0.05, ab = cfg.f(e + d), ba = cfg.f(e - d);
    var tipo = (ba > 0 && ab < 0) ? 'atractor (estable)'
             : (ba < 0 && ab > 0) ? 'repulsor (inestable)'
             : 'semiestable';
    return 'y = ' + e + ' → <strong>' + tipo + '</strong>';
  }).join(' &nbsp;·&nbsp; ');

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> — ecuación autónoma: la pendiente depende solo de y.<br>' +
    clas + '<br>' +
    '<span style="color:#8fb4d9">Las flechas verdes suben y las rojas bajan. Fíjate en que ' +
    'ninguna curva cruza una recta dorada de equilibrio: no puede, porque ahí la pendiente es cero. ' +
    'Toda la información de la izquierda se leyó <em>sin resolver la ecuación</em>.</span>';
});

/* ══════ S03 · Crecimiento y decrecimiento exponencial ══════ */
var CREC = {
  bact: { P0: 100, k: Math.log(3) / 3, T: 12, u: 'h', n: 'Cultivo de bacterias',
          txt: 'P₀ = 100, se triplica en 3 h' },
  c14:  { P0: 100, k: -Math.log(2) / 5730, T: 25000, u: 'años', n: 'Carbono-14',
          txt: 'semivida 5 730 años' },
  med:  { P0: 500, k: -Math.log(2) / 4, T: 24, u: 'h', n: 'Fármaco en sangre',
          txt: 'P₀ = 500 mg, semivida 4 h' },
  int:  { P0: 1000, k: 0.08, T: 30, u: 'años', n: 'Interés compuesto continuo',
          txt: 'capital 1 000, tasa 8 % anual' }
};

OVA.viz.registrar('decaimiento', function (host) {
  var cfg = CREC[q(host, 'select').value] || CREC.bact;
  var tv = parseFloat(q(host, '.tiempo').value) / 100 * cfg.T;
  q(host, '.t-val').textContent = 't = ' + (cfg.T > 100 ? tv.toFixed(0) : tv.toFixed(2)) + ' ' + cfg.u;

  var P = function (tt) { return cfg.P0 * Math.exp(cfg.k * tt); };
  var crece = cfg.k > 0;
  var tc = Math.log(2) / Math.abs(cfg.k);   // duplicación o semivida

  var L = OVA.lienzo(host.querySelector('canvas'), { alto: 260 });
  var c = L.ctx, mL = 62, mR = 16, mT = 22, mB = 30;
  var W = L.w - mL - mR, H = L.h - mT - mB;
  var Pmax = crece ? P(cfg.T) * 1.05 : cfg.P0 * 1.08;
  var PX = function (tt) { return mL + tt / cfg.T * W; };
  var PY = function (v) { return mT + (1 - v / Pmax) * H; };

  c.strokeStyle = OVA.color('cv-grid'); c.lineWidth = 1;
  for (var g = 1; g <= 4; g++) {
    var yy = mT + H * g / 5;
    c.beginPath(); c.moveTo(mL, yy); c.lineTo(mL + W, yy); c.stroke();
  }
  // marcas de duplicación / semivida
  var col = crece ? '#1c7a4c' : '#b0392c';
  for (var m = 1; m * tc <= cfg.T; m++) {
    c.strokeStyle = 'rgba(198,143,46,.8)'; c.lineWidth = 1.6; c.setLineDash([5, 4]);
    c.beginPath(); c.moveTo(PX(m * tc), mT); c.lineTo(PX(m * tc), mT + H); c.stroke();
    c.setLineDash([]);
    c.fillStyle = '#c68f2e'; c.font = '10px ui-monospace,monospace';
    c.fillText((crece ? '×' : '÷') + Math.pow(2, m), PX(m * tc) + 3, mT + 12);
  }
  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mL, mT); c.lineTo(mL, mT + H); c.lineTo(mL + W, mT + H); c.stroke();

  c.strokeStyle = col; c.lineWidth = 3.2; c.beginPath();
  for (var s = 0; s <= 400; s++) {
    var tt = cfg.T * s / 400;
    s ? c.lineTo(PX(tt), PY(P(tt))) : c.moveTo(PX(tt), PY(P(tt)));
  }
  c.stroke();

  c.fillStyle = col;
  c.beginPath(); c.arc(PX(tv), PY(P(tv)), 6, 0, 6.2832); c.fill();
  c.strokeStyle = 'rgba(128,128,128,.6)'; c.lineWidth = 1; c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(mL, PY(P(tv))); c.lineTo(PX(tv), PY(P(tv)));
  c.lineTo(PX(tv), mT + H); c.stroke(); c.setLineDash([]);

  c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
  c.fillText(Pmax.toPrecision(3), 4, mT + 6);
  c.fillText('0', 4, mT + H);
  c.fillText(cfg.T + ' ' + cfg.u, mL + W - 34, L.h - 8);
  c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, mL + 10, mT + 14);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> — ' + cfg.txt + '<br>' +
    'k = <strong>' + cfg.k.toExponential(4) + '</strong> por ' + cfg.u.replace('años', 'año') +
    ' &nbsp;·&nbsp; ' + (crece ? 'tiempo de duplicación' : 'semivida') +
    ' = <strong>' + (tc > 100 ? tc.toFixed(0) : tc.toFixed(3)) + ' ' + cfg.u + '</strong><br>' +
    'P(' + (cfg.T > 100 ? tv.toFixed(0) : tv.toFixed(2)) + ') = <strong>' +
      P(tv).toPrecision(6) + '</strong> &nbsp;·&nbsp; P(t)/P₀ = ' +
      (P(tv) / cfg.P0).toPrecision(4) + '<br>' +
    '<span style="color:#8fb4d9">Las líneas doradas están <em>igualmente espaciadas</em>: cada ' +
    (crece ? 'duplicación' : 'reducción a la mitad') + ' tarda lo mismo, sin importar desde qué ' +
    'valor se parta. Esa es la firma del modelo exponencial.</span>';
});

/* ══════ S03 · Transitorio y estado estacionario ══════ */
var LINEAL = {
  rl:   { n: "0,5·i' + 10i = 12   (circuito RL)", yp: function () { return 1.2; },
          yc: function (C, t) { return C * Math.exp(-20 * t); },
          Cde: function (y0) { return y0 - 1.2; }, x0: 0, x1: 0.3, y0s: [0, 0.6, 2],
          vx: 't (s)', vy: 'i (A)', est: '1,2 A', transitorio: true },
  lin:  { n: "y' + y = x", yp: function (x) { return x - 1; },
          yc: function (C, x) { return C * Math.exp(-x); },
          Cde: function (y0) { return y0 + 1; }, x0: 0, x1: 6, y0s: [-2, 0, 4],
          vx: 'x', vy: 'y', est: 'la recta y = x − 1', transitorio: true },
  cte:  { n: "y' + 2y = 4", yp: function () { return 2; },
          yc: function (C, x) { return C * Math.exp(-2 * x); },
          Cde: function (y0) { return y0 - 2; }, x0: 0, x1: 3, y0s: [-1, 2, 5],
          vx: 'x', vy: 'y', est: '2', transitorio: true },
  crece:{ n: "y' − 3y = 6", yp: function () { return -2; },
          yc: function (C, x) { return C * Math.exp(3 * x); },
          Cde: function (y0) { return y0 + 2; }, x0: 0, x1: 1.2, y0s: [-2.4, -2, -1.6],
          vx: 'x', vy: 'y', est: 'no hay: la parte homogénea CRECE', transitorio: false }
};

OVA.viz.registrar('lineal', function (host) {
  var cfg = LINEAL[q(host, 'select').value] || LINEAL.rl;
  var idx = parseInt(q(host, '.ci').value, 10) % cfg.y0s.length;
  var v0 = cfg.y0s[idx];
  q(host, '.ci-val').textContent = 'valor inicial = ' + v0;
  var C = cfg.Cde(v0);
  var tot = function (x) { return cfg.yp(x) + cfg.yc(C, x); };

  var L = OVA.lienzo(host.querySelector('canvas'), { alto: 270 });
  var c = L.ctx, mL = 54, mR = 16, mT = 34, mB = 28;
  var W = L.w - mL - mR, H = L.h - mT - mB;
  var vals = [];
  for (var s = 0; s <= 200; s++) {
    var xx = cfg.x0 + (cfg.x1 - cfg.x0) * s / 200;
    cfg.y0s.forEach(function (u) { vals.push(cfg.yp(xx) + cfg.yc(cfg.Cde(u), xx)); });
    vals.push(cfg.yp(xx));
  }
  vals = vals.filter(isFinite);
  var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  var pad = (hi - lo) * 0.12 || 1; lo -= pad; hi += pad;
  var PX = function (xx) { return mL + (xx - cfg.x0) / (cfg.x1 - cfg.x0) * W; };
  var PY = function (v) { return mT + (hi - v) / (hi - lo) * H; };

  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mL, mT); c.lineTo(mL, mT + H);
  if (lo < 0 && hi > 0) { c.moveTo(mL, PY(0)); c.lineTo(mL + W, PY(0)); }
  else { c.lineTo(mL + W, mT + H); }
  c.stroke();

  function curva(fn, color, ancho, guiones) {
    c.strokeStyle = color; c.lineWidth = ancho;
    if (guiones) c.setLineDash(guiones);
    c.beginPath();
    for (var s = 0; s <= 400; s++) {
      var xx = cfg.x0 + (cfg.x1 - cfg.x0) * s / 400, v = fn(xx);
      if (!isFinite(v)) continue;
      s ? c.lineTo(PX(xx), PY(v)) : c.moveTo(PX(xx), PY(v));
    }
    c.stroke(); c.setLineDash([]);
  }
  curva(function (xx) { return cfg.yp(xx); }, '#1c7a4c', 2.6, [8, 5]);
  curva(function (xx) { return cfg.yc(C, xx); }, '#b0392c', 2.2, [3, 3]);
  curva(tot, '#3a6ea5', 3.4);

  c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = '#3a6ea5'; c.fillText('— y = y_p + y_c  (solución)', mL + 8, 12);
  c.fillStyle = '#1c7a4c'; c.fillText('- - y_p  (estado estacionario)', mL + 8, 24);
  c.fillStyle = '#b0392c'; c.fillText('· · y_c  (transitorio)', mL + W - 150, 12);
  c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
  c.fillText(cfg.vy, 4, mT + 8);
  c.fillText(cfg.vx, mL + W / 2, L.h - 6);

  var fin = tot(cfg.x1), yc_fin = cfg.yc(C, cfg.x1);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;·&nbsp; C = ' + C.toPrecision(4) + '<br>' +
    (cfg.transitorio
      ? 'La parte roja <strong>se desvanece</strong>: en el extremo derecho vale ' +
        yc_fin.toExponential(2) + '. La azul se pega a la verde.<br>' +
        'Estado estacionario: <strong style="color:#7fd4a4">' + cfg.est + '</strong>'
      : '<strong style="color:#f0a58a">Aquí no hay estado estacionario.</strong> La parte ' +
        'homogénea es Ce^{3x} y crece sin límite, así que domina en vez de desvanecerse.') +
    '<br><span style="color:#8fb4d9">Cambia el valor inicial: la curva verde <em>no se mueve</em>. ' +
    'La condición inicial solo afecta al transitorio, y por eso a largo plazo todas las soluciones ' +
    (cfg.transitorio ? 'terminan igual.' : 'se separan cada vez más.') + '</span>';
});

/* ══════ S01 · Descomposición en fracciones parciales ══════ */
var FRAC = {
  a: { n: '1 / (x² − 4)', den: '(x−2)(x+2)', forma: 'A/(x−2) + B/(x+2)',
       A: 0.25, B: -0.25, t1: 'x−2', t2: 'x+2',
       orig: function (x) { return 1 / (x * x - 4); },
       desc: function (x) { return 0.25 / (x - 2) - 0.25 / (x + 2); },
       num: '1',
       cubre: 'Multiplica por (x−2) y evalúa en x=2: A = 1/4. Igual con x=−2: B = −1/4.',
       usa: 'Aparece al separar variables en la ecuación logística (semana 12).' },
  b: { n: '1 / (x(x−3))', den: 'x · (x−3)', forma: 'A/x + B/(x−3)',
       A: -1 / 3, B: 1 / 3, t1: 'x', t2: 'x−3',
       orig: function (x) { return 1 / (x * (x - 3)); },
       desc: function (x) { return (-1 / 3) / x + (1 / 3) / (x - 3); },
       num: '1',
       cubre: 'En x=0: A = 1/(0−3) = −1/3. En x=3: B = 1/3.',
       usa: 'Es la forma exacta que sale en el modelo logístico P′ = kP(1 − P/M).' },
  c: { n: '(3x + 5) / (x² − x − 2)', den: '(x−2)(x+1)', forma: 'A/(x−2) + B/(x+1)',
       A: 11 / 3, B: -2 / 3, t1: 'x−2', t2: 'x+1',
       orig: function (x) { return (3 * x + 5) / (x * x - x - 2); },
       desc: function (x) { return (11 / 3) / (x - 2) + (-2 / 3) / (x + 1); },
       num: '3x+5',
       cubre: 'En x=2: A = 11/3. En x=−1: B = 2/(−3) = −2/3.',
       usa: 'Típica de la transformada inversa de Laplace (semana 13).' },
  d: { n: '(s + 7) / (s² − s − 6)', den: '(s−3)(s+2)', forma: 'A/(s−3) + B/(s+2)',
       A: 2, B: -1, t1: 's−3', t2: 's+2',
       orig: function (s) { return (s + 7) / (s * s - s - 6); },
       desc: function (s) { return 2 / (s - 3) + (-1) / (s + 2); },
       num: 's+7',
       cubre: 'En s=3: A = 10/5 = 2. En s=−2: B = 5/(−5) = −1.',
       usa: 'Al invertir, cada término da una exponencial: 2e^{3t} − e^{−2t}.' }
};

OVA.viz.registrar('fracciones', function (host) {
  var cfg = FRAC[q(host, 'select').value] || FRAC.a;
  var paso = parseInt(q(host, '.paso').value, 10);
  q(host, '.paso-val').textContent = 'paso ' + paso + ' de 4';

  var red = function (v) { return Math.round(v * 1000) / 1000; };
  var pasos = [
    ['Factorizar el denominador', cfg.num + ' / [ ' + cfg.den + ' ]'],
    ['Plantear la forma de la descomposición', cfg.forma + '   — un término por cada factor'],
    ['Hallar las constantes (método de cubrir)', cfg.cubre],
    ['Resultado', '(' + red(cfg.A) + ')/(' + cfg.t1 + ')   +   (' + red(cfg.B) + ')/(' + cfg.t2 + ')']
  ];
  var h = '<div style="font-family:ui-monospace,monospace;font-size:1rem;margin-bottom:.6rem">' +
          '<strong>' + cfg.n + '</strong></div>';
  for (var i = 0; i < paso; i++) {
    h += '<div class="paso"><div class="paso-t">' + (i + 1) + '. ' + pasos[i][0] + '</div>' +
         '<span style="font-family:ui-monospace,monospace">' + pasos[i][1] + '</span></div>';
  }
  q(host, '.pasos').innerHTML = h;

  var lectura = '';
  if (paso >= 4) {
    var peor = 0;
    [0.5, 1.3, 4.1, 5.7, -3.4].forEach(function (v) {
      var d = Math.abs(cfg.orig(v) - cfg.desc(v));
      if (isFinite(d)) peor = Math.max(peor, d);
    });
    lectura = '<strong style="color:#7fd4a4">Comprobado numéricamente:</strong> la descomposición ' +
      'coincide con la fracción original en cinco puntos de prueba (desviación máxima ' +
      peor.toExponential(2) + ').<br>';
  }
  q(host, '.viz-readout').innerHTML = lectura +
    '<span style="color:#8fb4d9">' + cfg.usa + ' &nbsp;El <em>método de cubrir</em> evita resolver ' +
    'un sistema: multiplica por un factor y evalúa en la raíz que lo anula, y todos los demás ' +
    'términos desaparecen.</span>';
});

/* ══════ S01 · Raíces en el plano complejo ══════ */
var AUX = {
  reales:  { n: 'r² − 5r + 6 = 0', a: 1, b: -5, c: 6,
             sol: 'y = C₁e^{2x} + C₂e^{3x}', tipo: 'dos raíces reales distintas' },
  doble:   { n: 'r² − 4r + 4 = 0', a: 1, b: -4, c: 4,
             sol: 'y = C₁e^{2x} + C₂x·e^{2x}', tipo: 'una raíz real doble' },
  compl:   { n: 'r² + 4 = 0', a: 1, b: 0, c: 4,
             sol: 'y = C₁cos 2x + C₂sen 2x', tipo: 'dos raíces imaginarias puras' },
  complam: { n: 'r² + 2r + 5 = 0', a: 1, b: 2, c: 5,
             sol: 'y = e^{−x}(C₁cos 2x + C₂sen 2x)', tipo: 'complejas conjugadas' },
  negat:   { n: 'r² + 3r + 2 = 0', a: 1, b: 3, c: 2,
             sol: 'y = C₁e^{−x} + C₂e^{−2x}', tipo: 'dos raíces reales negativas' }
};

OVA.viz.registrar('raices', function (host) {
  var cfg = AUX[q(host, 'select').value] || AUX.reales;
  var D = cfg.b * cfg.b - 4 * cfg.a * cfg.c;
  var re1, im1, re2, im2;
  if (D >= 0) {
    re1 = (-cfg.b + Math.sqrt(D)) / (2 * cfg.a); im1 = 0;
    re2 = (-cfg.b - Math.sqrt(D)) / (2 * cfg.a); im2 = 0;
  } else {
    re1 = re2 = -cfg.b / (2 * cfg.a);
    im1 = Math.sqrt(-D) / (2 * cfg.a); im2 = -im1;
  }

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 250, sx: 52, sy: 52 });
  OVA.ejes(L);
  var c = L.ctx;
  c.fillStyle = OVA.color('cv-text'); c.font = '11px ui-monospace,monospace';
  c.fillText('Re', L.w - 26, L.oy - 8);
  c.fillText('Im', L.ox + 8, 16);
  // eje imaginario resaltado
  c.strokeStyle = 'rgba(125,79,158,.45)'; c.lineWidth = 1.4; c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(L.ox, 0); c.lineTo(L.ox, L.h); c.stroke();
  c.setLineDash([]);

  [[re1, im1], [re2, im2]].forEach(function (r) {
    OVA.punto(L, r[0], r[1], D < 0 ? '#7d4f9e' : '#c68f2e', false);
    c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace';
    var et = D < 0
      ? (r[0] === 0 ? '' : r[0].toFixed(0)) + (r[1] >= 0 ? '+' : '−') + Math.abs(r[1]).toFixed(0) + 'i'
      : r[0].toFixed(0);
    c.fillText(et, L.px(r[0]) + 9, L.py(r[1]) - 8);
  });
  if (D < 0) {
    c.strokeStyle = 'rgba(125,79,158,.55)'; c.lineWidth = 1.2; c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(L.px(re1), L.py(im1)); c.lineTo(L.px(re2), L.py(im2)); c.stroke();
    c.setLineDash([]);
  }
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;·&nbsp; discriminante Δ = ' + D + '<br>' +
    'Raíces: <strong>' +
      (D < 0 ? re1.toFixed(2) + ' ± ' + Math.abs(im1).toFixed(2) + 'i'
             : re1.toFixed(2) + '  y  ' + re2.toFixed(2)) +
      '</strong> &nbsp;·&nbsp; ' + cfg.tipo + '<br>' +
    'Solución de la EDO asociada: <strong style="color:#dba949">' + cfg.sol + '</strong><br>' +
    '<span style="color:#8fb4d9">' +
    (D < 0
      ? 'Las raíces complejas vienen siempre en <strong>pares conjugados</strong> (simétricos ' +
        'respecto del eje real), y producen <em>oscilaciones</em>. La parte real controla si la ' +
        'amplitud crece o decae; la imaginaria, la frecuencia.'
      : 'Con raíces reales la solución es una suma de exponenciales, sin oscilación. ' +
        'Si ambas son negativas, todo decae hacia cero.') +
    ' Esto es la semana 9; aquí solo repasas cómo se hallan las raíces.</span>';
});

/* ══════ S01 · Derivadas parciales sobre una superficie ══════ */
var SUP = {
  parab: { f: function (x, y) { return (x * x + y * y) / 2; },
           fx: function (x, y) { return x; }, fy: function (x, y) { return y; },
           n: 'z = (x² + y²)/2', fxs: '∂z/∂x = x', fys: '∂z/∂y = y' },
  silla: { f: function (x, y) { return (x * x - y * y) / 2; },
           fx: function (x, y) { return x; }, fy: function (x, y) { return -y; },
           n: 'z = (x² − y²)/2', fxs: '∂z/∂x = x', fys: '∂z/∂y = −y' },
  prod:  { f: function (x, y) { return x * y / 1.5; },
           fx: function (x, y) { return y / 1.5; }, fy: function (x, y) { return x / 1.5; },
           n: 'z = xy/1,5', fxs: '∂z/∂x = y/1,5', fys: '∂z/∂y = x/1,5' },
  plano: { f: function (x, y) { return 0.6 * x + 0.4 * y; },
           fx: function () { return 0.6; }, fy: function () { return 0.4; },
           n: 'z = 0,6x + 0,4y', fxs: '∂z/∂x = 0,6', fys: '∂z/∂y = 0,4' }
};

OVA.viz.registrar('parciales', function (host) {
  var cfg = SUP[q(host, 'select').value] || SUP.parab;
  var th = parseFloat(q(host, '.giro').value) / 100;
  var a = parseFloat(q(host, '.px').value) / 50;
  var b = parseFloat(q(host, '.py').value) / 50;
  q(host, '.giro-val').textContent = 'θ = ' + th.toFixed(2);
  q(host, '.pt-val').textContent = '(a, b) = (' + a.toFixed(1) + ', ' + b.toFixed(1) + ')';

  var E = OVA.esc3d(host.querySelector('canvas'), { th: th, ph: 0.52 });
  var pts = E.puntosSuperficie(cfg.f, -2, 2, -2, 2, 10);
  [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (e) {
    pts.push([e[0] * 2.6, e[1] * 2.6, e[2] * 2.6]);
    pts.push([-e[0] * 2.4, -e[1] * 2.4, -e[2] * 2.4]);
  });
  E.ajustar(pts, 0.88);

  E.ejes(2.6, 2.4);
  E.superficie(cfg.f, -2, 2, -2, 2, { n: 18 });

  // los dos cortes que pasan por (a,b)
  E.curva(function (t) { return [t, b, cfg.f(t, b)]; }, -2, 2, ORO, 3.4);
  E.curva(function (t) { return [a, t, cfg.f(a, t)]; }, -2, 2, ROJO, 3.4);

  // rectas tangentes: sus pendientes SON las derivadas parciales
  var z0 = cfg.f(a, b), m1 = cfg.fx(a, b), m2 = cfg.fy(a, b), h = 1.1;
  E.segmento([a - h, b, z0 - h * m1], [a + h, b, z0 + h * m1], '#ffd166');
  E.segmento([a, b - h, z0 - h * m2], [a, b + h, z0 + h * m2], '#ff9f8a');
  E.flecha([a, b, z0], [a + h, b, z0 + h * m1], '#ffd166', 3, '∂z/∂x');
  E.flecha([a, b, z0], [a, b + h, z0 + h * m2], '#ff9f8a', 3, '∂z/∂y');
  E.punto([a, b, z0], MORADO, 7);
  E.texto(cfg.n, 10, 18);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;en el punto (' + a.toFixed(1) + ', ' + b.toFixed(1) +
      ', ' + z0.toFixed(2) + ')<br>' +
    '<span style="color:#dba949">' + cfg.fxs + ' = <strong>' + m1.toFixed(2) + '</strong></span>' +
      ' — pendiente de la curva dorada, moviéndose solo en x<br>' +
    '<span style="color:#f0a58a">' + cfg.fys + ' = <strong>' + m2.toFixed(2) + '</strong></span>' +
      ' — pendiente de la curva roja, moviéndose solo en y<br>' +
    '<span style="color:#8fb4d9">Cada curva de color es un <em>corte</em> de la superficie con ' +
    'una variable congelada. Derivar parcialmente es exactamente eso: tratar la otra variable ' +
    'como constante y derivar como en Cálculo I. Gira la escena para ver que son dos direcciones ' +
    'perpendiculares sobre la misma superficie.</span>';
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
  document.querySelectorAll('[data-limpiar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var host = document.querySelector('[data-viz="' + b.dataset.limpiar + '"]');
      if (host) { host._pts = []; OVA.viz.redibujar(); }
    });
  });
});

/* ══════════ S06 · Ley de enfriamiento de Newton ══════════ */
var ENFRIA = {
  pastel: { T0: 300, Tm: 70, t3: 3, T3: 200, tmax: 30,
            n: 'Pastel enfriándose', u: 'min',
            txt: 'T₀=300°, ambiente 70°, a los 3 min está a 200°' },
  bebida: { T0: 5, Tm: 22, t3: 10, T3: 12, tmax: 40,
            n: 'Bebida calentándose', u: 'min',
            txt: 'T₀=5°, ambiente 22°, a los 10 min está a 12°' },
  cafe:   { T0: 90, Tm: 20, t3: 5, T3: 70, tmax: 40,
            n: 'Café enfriándose', u: 'min',
            txt: 'T₀=90°, ambiente 20°, a los 5 min está a 70°' }
};

OVA.viz.registrar('enfriamiento', function (host) {
  var cfg = ENFRIA[q(host, 'select').value] || ENFRIA.pastel;
  var frac = parseFloat(q(host, '.tiempo').value) / 100;
  var tv = frac * cfg.tmax;
  // k a partir de T(t3)=T3: (T3-Tm)=(T0-Tm)e^{k t3}
  var k = Math.log((cfg.T3 - cfg.Tm) / (cfg.T0 - cfg.Tm)) / cfg.t3;
  var Tf = function (t) { return cfg.Tm + (cfg.T0 - cfg.Tm) * Math.exp(k * t); };
  var Tnow = Tf(tv);
  q(host, '.t-val').textContent = 't = ' + tv.toFixed(1) + ' ' + cfg.u;

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 300 });
  var Ttop = Math.max(cfg.T0, cfg.Tm) + 15, Tbot = Math.min(cfg.T0, cfg.Tm) - 15;
  L.ox = 48; L.oy = L.h - 34;
  L.sx = (L.w - 70) / cfg.tmax; L.sy = (L.h - 55) / (Ttop - Tbot);
  var c = L.ctx;
  // desplazar el origen vertical para el rango real
  var py = function (T) { return L.oy - (T - Tbot) * L.sy; };
  var px = function (t) { return L.ox + t * L.sx; };

  // ejes simples
  c.strokeStyle = '#888'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(L.ox, py(Tbot)); c.lineTo(L.ox, py(Ttop)); c.stroke();
  c.beginPath(); c.moveTo(L.ox, py(Tbot)); c.lineTo(px(cfg.tmax), py(Tbot)); c.stroke();

  // asíntota Tm (ambiente)
  c.strokeStyle = '#3a6ea5'; c.setLineDash([6, 4]); c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(px(0), py(cfg.Tm)); c.lineTo(px(cfg.tmax), py(cfg.Tm)); c.stroke();
  c.setLineDash([]);
  c.fillStyle = '#3a6ea5'; c.font = '11px ui-monospace,monospace';
  c.fillText('Tm = ' + cfg.Tm + '°', px(cfg.tmax) - 62, py(cfg.Tm) - 6);

  // curva T(t)
  c.strokeStyle = '#b0392c'; c.lineWidth = 2.5; c.beginPath();
  var i, first = true;
  for (i = 0; i <= cfg.tmax; i += cfg.tmax / 200) {
    var Xp = px(i), Yp = py(Tf(i));
    if (first) { c.moveTo(Xp, Yp); first = false; } else c.lineTo(Xp, Yp);
  }
  c.stroke();

  // puntos dato y punto actual
  function pt(t, T, col) { c.fillStyle = col; c.beginPath(); c.arc(px(t), py(T), 4, 0, 2 * Math.PI); c.fill(); }
  pt(0, cfg.T0, '#c68f2e');
  pt(cfg.t3, cfg.T3, '#1c7a4c');
  pt(tv, Tnow, '#7d4f9e');

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · ' + cfg.txt + '.<br>' +
    'Modelo: <strong>dT/dt = k(T − Tm)</strong>, solución T(t) = Tm + (T₀ − Tm)e^{kt} con ' +
    'k = ' + k.toFixed(4) + '.<br>' +
    'En t = ' + tv.toFixed(1) + ' ' + cfg.u + ': <strong>T = ' + Tnow.toFixed(1) + '°</strong>. ' +
    '<span style="color:#8fb4d9">La temperatura se acerca a la del ambiente (' + cfg.Tm +
    '°) de forma exponencial, pero nunca la cruza: Tm es una asíntota horizontal.</span>';
});

/* ══════════ S08 · Superposición: y = y_c + y_p ══════════ */
var SUPER = {
  decae: { yc: function (x) { return 2 * Math.exp(-x); }, yp: function () { return 3; },
           nyc: 'y_c = 2e^{−x}', nyp: 'y_p = 3', tmax: 4,
           n: 'Complementaria que decae + particular constante' },
  osc:   { yc: function (x) { return 1.5 * Math.exp(-0.4 * x) * Math.cos(3 * x); }, yp: function (x) { return 0.5 * x; },
           nyc: 'y_c = 1.5e^{−0.4x}cos 3x', nyp: 'y_p = 0.5x', tmax: 6,
           n: 'Complementaria oscilante + particular lineal' },
  crece: { yc: function (x) { return Math.exp(-1.2 * x); }, yp: function (x) { return 0.5 * x * x; },
           nyc: 'y_c = e^{−1.2x}', nyp: 'y_p = 0.5x²', tmax: 3,
           n: 'Transitorio que decae + respuesta permanente' }
};

OVA.viz.registrar('superposicion', function (host) {
  var cfg = SUPER[q(host, 'select').value] || SUPER.decae;
  var mostrar = q(host, '.mostrar') ? q(host, '.mostrar').value : 'todo';

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 300 });
  var xs = [], i;
  for (i = 0; i <= cfg.tmax; i += cfg.tmax / 120) xs.push(i);
  var vals = xs.map(function (x) { return { x: x, yc: cfg.yc(x), yp: cfg.yp(x), y: cfg.yc(x) + cfg.yp(x) }; });
  var lo = Infinity, hi = -Infinity;
  vals.forEach(function (v) {
    [v.yc, v.yp, v.y].forEach(function (w) { if (w < lo) lo = w; if (w > hi) hi = w; });
  });
  lo = Math.min(lo, 0) - 0.5; hi = hi + 0.5;
  L.ox = 46; L.oy = L.h - 30; L.sx = (L.w - 66) / cfg.tmax; L.sy = (L.h - 50) / (hi - lo);
  var c = L.ctx;
  var px = function (x) { return L.ox + x * L.sx; };
  var py = function (y) { return L.oy - (y - lo) * L.sy; };

  // ejes
  c.strokeStyle = '#888'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(L.ox, py(hi)); c.lineTo(L.ox, py(lo)); c.stroke();
  c.beginPath(); c.moveTo(L.ox, py(0)); c.lineTo(px(cfg.tmax), py(0)); c.stroke();

  function traza(key, col, dash, ancho) {
    c.strokeStyle = col; c.lineWidth = ancho; c.setLineDash(dash);
    c.beginPath();
    vals.forEach(function (v, j) {
      var X = px(v.x), Y = py(v[key]);
      if (j === 0) c.moveTo(X, Y); else c.lineTo(X, Y);
    });
    c.stroke(); c.setLineDash([]);
  }
  if (mostrar === 'todo' || mostrar === 'partes') {
    traza('yc', '#3a6ea5', [6, 4], 2);
    traza('yp', '#c68f2e', [6, 4], 2);
  }
  if (mostrar === 'todo' || mostrar === 'suma') {
    traza('y', '#b0392c', [], 2.6);
  }

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong>.<br>' +
    '<span style="color:#3a6ea5">' + cfg.nyc + '</span> (resuelve la homogénea) &nbsp;+&nbsp; ' +
    '<span style="color:#c68f2e">' + cfg.nyp + '</span> (una solución particular) &nbsp;=&nbsp; ' +
    '<span style="color:#b0392c">y = y_c + y_p</span> (solución general).<br>' +
    '<span style="color:#8fb4d9">Toda solución de una EDO lineal no homogénea es la suma de la ' +
    'complementaria y_c (con las constantes) más cualquier particular y_p. La y_c suele ser el ' +
    'transitorio que se desvanece; la y_p, la respuesta permanente.</span>';
});

/* ══════════════════════════════════════════════════════════
   CORTE III · S11–S14
   particular (S11) · resorte · pendulo (S12) · laplace (S13)
   traslacion · escalon (S14)
   ══════════════════════════════════════════════════════════ */
function marcoE(cv, alto, xmin, xmax, ymin, ymax) {
  var L = OVA.lienzo(cv, { alto: alto });
  var padL = 44, padR = 14, padT = 14, padB = 26;
  L.sx = (L.w - padL - padR) / (xmax - xmin); L.sy = (L.h - padT - padB) / (ymax - ymin);
  L.ox = padL - xmin * L.sx; L.oy = padT + ymax * L.sy;
  L.xmin = xmin; L.xmax = xmax; L.ymin = ymin; L.ymax = ymax; return L;
}
function ejesE(L, px, py) {
  var c = L.ctx, grid = OVA.color('cv-grid'), axis = OVA.color('cv-axis'), txt = OVA.color('cv-text'), v, p;
  c.strokeStyle = grid; c.lineWidth = 1; c.fillStyle = txt; c.font = '10px ui-monospace,monospace';
  for (v = Math.ceil(L.xmin / px - 1e-9) * px; v <= L.xmax + 1e-9; v += px) { p = L.px(v); c.beginPath(); c.moveTo(p, L.py(L.ymin)); c.lineTo(p, L.py(L.ymax)); c.stroke(); if (Math.abs(v) > 1e-9) c.fillText(String(Math.round(v * 100) / 100), p - 6, L.py(L.ymin) + 13); }
  for (v = Math.ceil(L.ymin / py - 1e-9) * py; v <= L.ymax + 1e-9; v += py) { p = L.py(v); c.beginPath(); c.moveTo(L.px(L.xmin), p); c.lineTo(L.px(L.xmax), p); c.stroke(); if (Math.abs(v) > 1e-9) c.fillText(String(Math.round(v * 100) / 100), L.px(L.xmin) - 34, p + 3); }
  c.strokeStyle = axis; c.lineWidth = 1.6;
  var yA = Math.min(Math.max(0, L.ymin), L.ymax), xA = Math.min(Math.max(0, L.xmin), L.xmax);
  c.beginPath(); c.moveTo(L.px(L.xmin), L.py(yA)); c.lineTo(L.px(L.xmax), L.py(yA)); c.stroke();
  c.beginPath(); c.moveTo(L.px(xA), L.py(L.ymin)); c.lineTo(L.px(xA), L.py(L.ymax)); c.stroke();
}
function clipE(L, fn) { var c = L.ctx; c.save(); c.beginPath(); c.rect(L.px(L.xmin), L.py(L.ymax), L.px(L.xmax) - L.px(L.xmin), L.py(L.ymin) - L.py(L.ymax)); c.clip(); fn(); c.restore(); }
function n3(v) { return (Math.round(v * 1000) / 1000).toFixed(3); }
function n4(v) { return (Math.round(v * 10000) / 10000).toFixed(4); }
function der1(f, x) { var h = 1e-4; return (f(x + h) - f(x - h)) / (2 * h); }
function der2(f, x) { var h = 1e-3; return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h); }
function leyenda(L, items) { var c = L.ctx; c.font = 'bold 11px ui-monospace,monospace'; items.forEach(function (it, i) { c.fillStyle = it[1]; c.fillText(it[0], L.px(L.xmin) + 6, 22 + 16 * i); }); }

/* ══════════ S11 · y = y_c + y_p: la particular y la ecuación ══════════ */
var PART = {
  lin:  { n: "y'' − 3y' + 2y = 4x", y1: function (x) { return Math.exp(x); }, y2: function (x) { return Math.exp(2 * x); }, yp: function (x) { return 2 * x + 3; },
          g: function (x) { return 4 * x; }, ode: function (x, y, yp, ypp) { return ypp - 3 * yp + 2 * y; }, syp: 'y_p = 2x + 3', syc: 'c₁eˣ + c₂e²ˣ', r: [0, 2, -6, 10], met: 'coeficientes indeterminados (g polinomio → y_p = Ax + B)' },
  exp:  { n: "y'' + y = e^{2x}", y1: Math.cos, y2: Math.sin, yp: function (x) { return Math.exp(2 * x) / 5; },
          g: function (x) { return Math.exp(2 * x); }, ode: function (x, y, yp, ypp) { return ypp + y; }, syp: 'y_p = e²ˣ/5', syc: 'c₁cos x + c₂sen x', r: [0, 3, -4, 8], met: 'coeficientes indeterminados (g exponencial → y_p = Ae²ˣ)' },
  res:  { n: "y'' + 4y = 8cos 2x (resonancia)", y1: function (x) { return Math.cos(2 * x); }, y2: function (x) { return Math.sin(2 * x); }, yp: function (x) { return 2 * x * Math.sin(2 * x); },
          g: function (x) { return 8 * Math.cos(2 * x); }, ode: function (x, y, yp, ypp) { return ypp + 4 * y; }, syp: 'y_p = 2x·sen 2x', syc: 'c₁cos 2x + c₂sen 2x', r: [0, 12, -25, 25], met: 'duplicación: g ya está en y_c → se multiplica por x; la amplitud crece sin límite' },
  dup:  { n: "y'' − 3y' + 2y = eˣ", y1: function (x) { return Math.exp(x); }, y2: function (x) { return Math.exp(2 * x); }, yp: function (x) { return -x * Math.exp(x); },
          g: Math.exp, ode: function (x, y, yp, ypp) { return ypp - 3 * yp + 2 * y; }, syp: 'y_p = −x·eˣ', syc: 'c₁eˣ + c₂e²ˣ', r: [0, 2, -6, 10], met: 'duplicación: eˣ es solución homogénea → y_p = Ax·eˣ' },
  sec:  { n: "y'' + y = sec x", y1: Math.cos, y2: Math.sin, yp: function (x) { return Math.cos(x) * Math.log(Math.abs(Math.cos(x))) + x * Math.sin(x); },
          g: function (x) { return 1 / Math.cos(x); }, ode: function (x, y, yp, ypp) { return ypp + y; }, syp: 'y_p = cos x·ln|cos x| + x·sen x', syc: 'c₁cos x + c₂sen x', r: [0, 1.4, -2, 4], met: 'variación de parámetros (sec x no admite coeficientes indeterminados)' }
};
OVA.viz.registrar('particular', function (host) {
  var cfg = PART[q(host, 'select').value] || PART.lin;
  var c1 = parseFloat(q(host, '.c1').value) / 10, c2 = parseFloat(q(host, '.c2').value) / 10;
  q(host, '.c1-val').textContent = 'c₁ = ' + c1.toFixed(1); q(host, '.c2-val').textContent = 'c₂ = ' + c2.toFixed(1);
  var y = function (x) { return c1 * cfg.y1(x) + c2 * cfg.y2(x) + cfg.yp(x); };
  var L = marcoE(q(host, 'canvas'), 320, cfg.r[0], cfg.r[1], cfg.r[2], cfg.r[3]);
  ejesE(L, cfg.r[1] > 5 ? 2 : 0.5, (cfg.r[3] - cfg.r[2]) > 20 ? 10 : 2);
  clipE(L, function () {
    OVA.curva(L, cfg.g, 'rgba(150,167,181,.9)', 1.4);
    OVA.curva(L, cfg.yp, ORO, 2.2);
    OVA.curva(L, y, AZUL, 3);
  });
  leyenda(L, [['— y = y_c + y_p', AZUL], ['— ' + cfg.syp, ORO], ['— g(x) (lado derecho)', 'rgba(150,167,181,.9)']]);
  var x0 = cfg.r[0] + 0.45 * (cfg.r[1] - cfg.r[0]);
  var resid = cfg.ode(x0, y(x0), der1(y, x0), der2(y, x0)) - cfg.g(x0);
  var residP = cfg.ode(x0, cfg.yp(x0), der1(cfg.yp, x0), der2(cfg.yp, x0)) - cfg.g(x0);
  var residC = cfg.ode(x0, c1 * cfg.y1(x0) + c2 * cfg.y2(x0), der1(function (x) { return c1 * cfg.y1(x) + c2 * cfg.y2(x); }, x0), der2(function (x) { return c1 * cfg.y1(x) + c2 * cfg.y2(x); }, x0));
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · y_c = ' + cfg.syc + ' · ' + cfg.syp + ' por ' + cfg.met + '.<br>' +
    'Comprobación numérica en x = ' + x0.toFixed(2) + ': la parte homogénea deja residuo <strong>' + n4(residC) + '</strong> (≈0), la particular reproduce g con residuo <strong>' + n4(residP) + '</strong> (≈0) y la suma también: <strong style="color:#c68f2e">' + n4(resid) + '</strong>.<br>' +
    '<span style="color:#8fb4d9">Mueve c₁ y c₂: cambian la curva pero no el residuo, porque y_c aporta cero al lado izquierdo. y_p es una sola función fija que «absorbe» el lado derecho.</span>';
});

/* ══════════ S12 · Masa-resorte: libre, amortiguado, forzado ══════════ */
var RES = {
  libre: { n: "x'' + 16x = 0 (libre, ω = 4)", f: function (t, x, v) { return -16 * x; }, tmax: 4, tipo: 'sin amortiguar: amplitud constante, periodo 2π/4 = π/2' },
  sobre: { n: "x'' + 5x' + 4x = 0 (sobreamortiguado)", f: function (t, x, v) { return -5 * v - 4 * x; }, tmax: 6, tipo: 'raíces −1 y −4: vuelve al equilibrio sin oscilar' },
  crit:  { n: "x'' + 4x' + 4x = 0 (crítico)", f: function (t, x, v) { return -4 * v - 4 * x; }, tmax: 6, tipo: 'raíz doble −2: el retorno más rápido sin oscilar' },
  sub:   { n: "x'' + 2x' + 10x = 0 (subamortiguado)", f: function (t, x, v) { return -2 * v - 10 * x; }, tmax: 6, tipo: 'm = −1 ± 3i: oscila con amplitude e^{−t} decreciente' },
  forz:  { n: "x'' + 4x = 3cos t (forzado, no resonante)", f: function (t, x, v) { return -4 * x + 3 * Math.cos(t); }, tmax: 12, tipo: 'x_p = cos t: suma de dos frecuencias (γ = 1, ω = 2), acotada' },
  reson: { n: "x'' + 4x = 8cos 2t (resonancia, γ = ω)", f: function (t, x, v) { return -4 * x + 8 * Math.cos(2 * t); }, tmax: 12, tipo: 'x_p = 2t·sen 2t: la amplitud crece linealmente, sin límite' }
};
function rk4sis(f, t, x, v, h) {   // una EDO de 2.º orden x'' = f(t,x,v)
  var k1x = v, k1v = f(t, x, v);
  var k2x = v + h / 2 * k1v, k2v = f(t + h / 2, x + h / 2 * k1x, v + h / 2 * k1v);
  var k3x = v + h / 2 * k2v, k3v = f(t + h / 2, x + h / 2 * k2x, v + h / 2 * k2v);
  var k4x = v + h * k3v, k4v = f(t + h, x + h * k3x, v + h * k3v);
  return [x + h / 6 * (k1x + 2 * k2x + 2 * k3x + k4x), v + h / 6 * (k1v + 2 * k2v + 2 * k3v + k4v)];
}
OVA.viz.registrar('resorte', function (host) {
  var cfg = RES[q(host, 'select').value] || RES.libre;
  var x0 = parseFloat(q(host, '.x0').value) / 10, v0 = parseFloat(q(host, '.v0').value) / 10;
  q(host, '.x0-val').textContent = 'x(0) = ' + x0.toFixed(1); q(host, '.v0-val').textContent = "x'(0) = " + v0.toFixed(1);
  var pts = [[0, x0]], t = 0, x = x0, v = v0, h = cfg.tmax / 1200, i, xmax = Math.max(1.2, Math.abs(x0) * 1.2), vmax = v;
  for (i = 0; i < 1200; i++) { var r = rk4sis(cfg.f, t, x, v, h); x = r[0]; v = r[1]; t += h; pts.push([t, x]); if (Math.abs(x) > xmax) xmax = Math.abs(x); }
  xmax = Math.min(xmax, 30) * 1.1;
  var L = marcoE(q(host, 'canvas'), 320, 0, cfg.tmax, -xmax, xmax);
  ejesE(L, cfg.tmax > 8 ? 2 : 1, xmax > 10 ? 10 : xmax > 3 ? 1 : 0.5);
  var c = L.ctx;
  clipE(L, function () {
    if (cfg === RES.sub) { OVA.curva(L, function (t) { return Math.sqrt(x0 * x0 + Math.pow((v0 + x0) / 3, 2)) * Math.exp(-t); }, 'rgba(176,57,44,.55)', 1.2); OVA.curva(L, function (t) { return -Math.sqrt(x0 * x0 + Math.pow((v0 + x0) / 3, 2)) * Math.exp(-t); }, 'rgba(176,57,44,.55)', 1.2); }
    c.strokeStyle = AZUL; c.lineWidth = 2.6; c.beginPath(); pts.forEach(function (p, k) { k ? c.lineTo(L.px(p[0]), L.py(p[1])) : c.moveTo(L.px(p[0]), L.py(p[1])); }); c.stroke();
    OVA.punto(L, 0, x0, ORO);
  });
  leyenda(L, [['— x(t)', AZUL]].concat(cfg === RES.sub ? [['— envolvente ±A e^{−t}', 'rgba(176,57,44,.8)']] : []));
  var xfin = pts[pts.length - 1][1], amax = 0; pts.forEach(function (p) { if (Math.abs(p[1]) > amax) amax = Math.abs(p[1]); });
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> con x(0) = ' + x0.toFixed(1) + ", x'(0) = " + v0.toFixed(1) + ' · ' + cfg.tipo + '.<br>' +
    'En t = ' + cfg.tmax + ': x = <strong>' + n3(xfin) + '</strong> · desplazamiento máximo en la ventana: <strong style="color:#c68f2e">' + n3(amax) + '</strong><br>' +
    '<span style="color:#8fb4d9">Cambia las condiciones iniciales: en los casos amortiguados la forma de la curva no cambia (la fija la ecuación), solo su tamaño. En resonancia, la amplitud crece sin importar de dónde parta.</span>';
});

/* ══════════ S12 · Péndulo no lineal frente a su linealización ══════════ */
OVA.viz.registrar('pendulo', function (host) {
  var th0 = parseFloat(q(host, '.th0').value) * Math.PI / 180;
  var modelo = q(host, 'select').value;   // pendulo | duro
  q(host, '.th0-val').textContent = 'θ₀ = ' + Math.round(th0 * 180 / Math.PI) + '°';
  var fNL = modelo === 'duro' ? function (t, x, v) { return -x - x * x * x; } : function (t, x, v) { return -Math.sin(x); };
  var fL = function (t, x, v) { return -x; };
  var tmax = 14, N = 2000, h = tmax / N, i, t, x, v, r, pNL = [[0, th0]], pL = [[0, th0]], cruces = [];
  t = 0; x = th0; v = 0;
  for (i = 0; i < N; i++) { var xa = x; r = rk4sis(fNL, t, x, v, h); x = r[0]; v = r[1]; t += h; pNL.push([t, x]); if (xa > 0 && x <= 0) cruces.push(t); }
  t = 0; x = th0; v = 0;
  for (i = 0; i < N; i++) { r = rk4sis(fL, t, x, v, h); x = r[0]; v = r[1]; t += h; pL.push([t, x]); }
  var T = cruces.length >= 2 ? cruces[1] - cruces[0] : NaN, ymax = Math.max(th0 * 1.15, 0.5);
  var L = marcoE(q(host, 'canvas'), 320, 0, tmax, -ymax, ymax);
  ejesE(L, 2, ymax > 2 ? 1 : 0.5);
  var c = L.ctx;
  clipE(L, function () {
    [[pL, 'rgba(150,167,181,.9)', 1.6], [pNL, AZUL, 2.6]].forEach(function (s) { c.strokeStyle = s[1]; c.lineWidth = s[2]; c.beginPath(); s[0].forEach(function (p, k) { k ? c.lineTo(L.px(p[0]), L.py(p[1])) : c.moveTo(L.px(p[0]), L.py(p[1])); }); c.stroke(); });
  });
  leyenda(L, [['— ' + (modelo === 'duro' ? "resorte duro x'' + x + x³ = 0" : "péndulo θ'' + sen θ = 0"), AZUL], ['— linealizado x″ + x = 0 (T = 2π)', 'rgba(150,167,181,.9)']]);
  var dif = (T - 2 * Math.PI) / (2 * Math.PI) * 100;
  q(host, '.viz-readout').innerHTML =
    '<strong>' + (modelo === 'duro' ? "Resorte duro x'' + x + x³ = 0" : "Péndulo θ'' + sen θ = 0") + '</strong> con amplitud inicial ' + Math.round(th0 * 180 / Math.PI) + '° (' + n3(th0) + ' rad), velocidad inicial 0.<br>' +
    'Periodo medido (integración RK4): <strong style="color:#c68f2e">' + n3(T) + '</strong> · periodo del modelo lineal: 2π = 6.283 · diferencia <strong>' + (dif >= 0 ? '+' : '') + dif.toFixed(1) + ' %</strong><br>' +
    '<span style="color:#8fb4d9">' + (modelo === 'duro' ? 'En el resorte duro la fuerza crece más rápido que x: a mayor amplitud, oscila más deprisa (periodo menor).' : 'En el péndulo, sen θ &lt; θ: la fuerza restauradora es menor que la lineal y el periodo crece con la amplitud. Con ángulos pequeños las dos curvas coinciden.') + ' El periodo de un sistema no lineal depende de la amplitud; el del lineal, no.</span>';
});

/* ══════════ S13 · La transformada de Laplace como integral ══════════ */
var LAP = {
  uno: { f: function (t) { return 1; }, F: function (s) { return 1 / s; }, n: 'f(t) = 1', sF: 'F(s) = 1/s', smin: 0.3 },
  t:   { f: function (t) { return t; }, F: function (s) { return 1 / (s * s); }, n: 'f(t) = t', sF: 'F(s) = 1/s²', smin: 0.3 },
  exp: { f: function (t) { return Math.exp(t); }, F: function (s) { return 1 / (s - 1); }, n: 'f(t) = eᵗ', sF: 'F(s) = 1/(s − 1), s > 1', smin: 1.3 },
  sen: { f: function (t) { return Math.sin(2 * t); }, F: function (s) { return 2 / (s * s + 4); }, n: 'f(t) = sen 2t', sF: 'F(s) = 2/(s² + 4)', smin: 0.3 },
  esc: { f: function (t) { return t >= 3 ? 2 : 0; }, F: function (s) { return 2 * Math.exp(-3 * s) / s; }, n: 'f(t) = 0 (t<3), 2 (t≥3)', sF: 'F(s) = 2e^{−3s}/s', smin: 0.3 }
};
OVA.viz.registrar('laplace', function (host) {
  var cfg = LAP[q(host, 'select').value] || LAP.uno;
  var s = cfg.smin + parseFloat(q(host, '.s').value) / 100 * 4;
  q(host, '.s-val').textContent = 's = ' + s.toFixed(2);
  var tmax = 8, L = marcoE(q(host, 'canvas'), 320, 0, tmax, -1.2, 2.4);
  ejesE(L, 1, 0.5);
  var g = function (t) { return Math.exp(-s * t) * cfg.f(t); };
  var n = 1600, h = tmax / n, I = 0, i;
  for (i = 0; i <= n; i++) { var w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); I += w * g(i * h); }
  I *= h / 3;
  var c = L.ctx;
  clipE(L, function () {
    c.fillStyle = 'rgba(198,143,46,.35)'; c.beginPath(); c.moveTo(L.px(0), L.py(0));
    for (i = 0; i <= 400; i++) { var t = tmax * i / 400; c.lineTo(L.px(t), L.py(g(t))); }
    c.lineTo(L.px(tmax), L.py(0)); c.closePath(); c.fill();
    OVA.curva(L, function (t) { return t >= 0 ? cfg.f(t) : NaN; }, AZUL, 2.2);
    OVA.curva(L, function (t) { return t >= 0 ? Math.exp(-s * t) : NaN; }, 'rgba(150,167,181,.9)', 1.3);
    OVA.curva(L, function (t) { return t >= 0 ? g(t) : NaN; }, ORO, 2.4);
  });
  leyenda(L, [['— f(t)', AZUL], ['— e^{−st}', 'rgba(150,167,181,.9)'], ['— f(t)·e^{−st}  (área = F(s))', ORO]]);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · ' + cfg.sF + '<br>' +
    'Con s = ' + s.toFixed(2) + ': área bajo f(t)e^{−st} en [0, ' + tmax + '] = <strong style="color:#c68f2e">' + n4(I) + '</strong> · fórmula F(' + s.toFixed(2) + ') = <strong>' + n4(cfg.F(s)) + '</strong>' +
    (Math.abs(I - cfg.F(s)) > 2e-3 ? ' (la cola más allá de t = 8 aún aporta: el decaimiento e^{−st} es lento para s pequeño)' : ' ✓') + '<br>' +
    '<span style="color:#8fb4d9">La transformada es una integral: multiplica f por el «amortiguador» e^{−st} y mide el área. Cuanto mayor es s, más rápido se apaga el integrando y menor es F(s). Para eᵗ hace falta s &gt; 1, o el área diverge.</span>';
});

/* ══════════ S14 · Traslación en t: f(t − a)·U(t − a) ══════════ */
var TRAS = {
  sen:  { f: function (t) { return Math.sin(t); }, F: function (s) { return 1 / (s * s + 1); }, n: 'f(t) = sen t', sF: 'F(s) = 1/(s² + 1)' },
  cuad: { f: function (t) { return t * t / 4; }, F: function (s) { return 0.5 / (s * s * s); }, n: 'f(t) = t²/4', sF: 'F(s) = 1/(2s³)' },
  dec:  { f: function (t) { return 2 * Math.exp(-0.5 * t); }, F: function (s) { return 2 / (s + 0.5); }, n: 'f(t) = 2e^{−t/2}', sF: 'F(s) = 2/(s + 1/2)' }
};
OVA.viz.registrar('traslacion', function (host) {
  var cfg = TRAS[q(host, 'select').value] || TRAS.sen;
  var a = parseFloat(q(host, '.a').value) / 10, s = 1.0;
  q(host, '.a-val').textContent = 'a = ' + a.toFixed(1);
  var tmax = 10, L = marcoE(q(host, 'canvas'), 320, 0, tmax, -1.5, 2.5);
  ejesE(L, 1, 0.5);
  var fa = function (t) { return t >= a ? cfg.f(t - a) : 0; };
  var n = 2000, h = tmax * 3 / n, I = 0, i;   // integral hasta 30 (e^{−t} ya es despreciable)
  for (i = 0; i <= n; i++) { var w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2); I += w * Math.exp(-s * i * h) * fa(i * h); }
  I *= h / 3;
  var c = L.ctx;
  clipE(L, function () {
    OVA.curva(L, function (t) { return t >= 0 ? cfg.f(t) : NaN; }, 'rgba(150,167,181,.9)', 1.4);
    OVA.curva(L, function (t) { return t >= 0 && t < a - 1e-9 ? 0 : NaN; }, AZUL, 3);
    OVA.curva(L, function (t) { return t >= a ? cfg.f(t - a) : NaN; }, AZUL, 3);
    c.strokeStyle = 'rgba(176,57,44,.6)'; c.setLineDash([4, 3]); c.lineWidth = 1.4; c.beginPath(); c.moveTo(L.px(a), L.py(L.ymin)); c.lineTo(L.px(a), L.py(L.ymax)); c.stroke(); c.setLineDash([]);
    OVA.punto(L, a, 0, ROJO);
  });
  leyenda(L, [['— f(t − a)·U(t − a)', AZUL], ['— f(t) original', 'rgba(150,167,181,.9)']]);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong>, ' + cfg.sF + ' · desplazada y «encendida» en t = a = ' + a.toFixed(1) + '<br>' +
    'Segundo teorema de traslación: L{f(t − a)U(t − a)} = e^{−as}F(s). En s = 1: e^{−' + a.toFixed(1) + '}·F(1) = <strong>' + n4(Math.exp(-a * s) * cfg.F(s)) + '</strong> · integral numérica de e^{−t}f(t−a)U(t−a) = <strong style="color:#c68f2e">' + n4(I) + '</strong> ✓<br>' +
    '<span style="color:#8fb4d9">Retrasar la función a unidades multiplica su transformada por e^{−as}: la forma F(s) no cambia, solo aparece el factor exponencial. Observa que antes de t = a la función vale cero: es «apagar hasta a y luego arrancar desde cero».</span>';
});

/* ══════════ S14 · Respuesta a un escalón: PVI con U(t − a) ══════════ */
var ESC = {
  rc:  { n: "y' + y = U(t − a), y(0) = 0", sol: function (t, a) { return t >= a ? 1 - Math.exp(-(t - a)) : 0; }, sY: 'Y = e^{−as}/(s(s+1))', sy: 'y = (1 − e^{−(t−a)})·U(t − a)', ymax: 1.4, desc: 'carga de un condensador que se conecta en t = a: sube hacia 1 sin sobrepasarlo' },
  osc: { n: "y'' + 4y = U(t − a), y(0) = y'(0) = 0", sol: function (t, a) { return t >= a ? 0.25 * (1 - Math.cos(2 * (t - a))) : 0; }, sY: 'Y = e^{−as}/(s(s²+4))', sy: 'y = ¼(1 − cos 2(t−a))·U(t − a)', ymax: 0.7, desc: 'un resorte sin amortiguar al que se le aplica una fuerza constante desde t = a: oscila entre 0 y ½ alrededor de ¼' }
};
OVA.viz.registrar('escalon', function (host) {
  var cfg = ESC[q(host, 'select').value] || ESC.rc;
  var a = parseFloat(q(host, '.a').value) / 10;
  q(host, '.a-val').textContent = 'a = ' + a.toFixed(1);
  var tmax = 12, L = marcoE(q(host, 'canvas'), 320, 0, tmax, -0.2, cfg.ymax);
  ejesE(L, 1, 0.25);
  var c = L.ctx;
  clipE(L, function () {
    OVA.curva(L, function (t) { return t >= 0 ? (t >= a ? 1 : 0) * (cfg.ymax > 1 ? 1 : 0.5) : NaN; }, 'rgba(150,167,181,.9)', 1.4);
    OVA.curva(L, function (t) { return t >= 0 ? cfg.sol(t, a) : NaN; }, AZUL, 3);
    c.strokeStyle = 'rgba(176,57,44,.6)'; c.setLineDash([4, 3]); c.lineWidth = 1.4; c.beginPath(); c.moveTo(L.px(a), L.py(L.ymin)); c.lineTo(L.px(a), L.py(L.ymax)); c.stroke(); c.setLineDash([]);
  });
  leyenda(L, [['— y(t)', AZUL], ['— fuerza U(t − a)' + (cfg.ymax > 1 ? '' : ' (escala ½)'), 'rgba(150,167,181,.9)']]);
  var t1 = a + 1, res = cfg === ESC.rc ? der1(function (t) { return cfg.sol(t, a); }, t1) + cfg.sol(t1, a) - 1 : der2(function (t) { return cfg.sol(t, a); }, t1) + 4 * cfg.sol(t1, a) - 1;
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · ' + cfg.sY + ' → <strong>' + cfg.sy + '</strong><br>' +
    'Antes de t = a la solución es idénticamente cero (nada la empuja); desde a, la respuesta es la misma curva sin importar el valor de a, solo desplazada. Comprobación numérica de la EDO en t = a + 1: residuo <strong style="color:#c68f2e">' + n4(res) + '</strong> ≈ 0.<br>' +
    '<span style="color:#8fb4d9">' + cfg.desc + '. El factor e^{−as} de la transformada es exactamente ese retraso.</span>';
});

})();
