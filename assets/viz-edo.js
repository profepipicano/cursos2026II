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
})();
