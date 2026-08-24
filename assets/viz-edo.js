/* ══════════════════════════════════════════════════════════
   Visualizadores · Ecuaciones Diferenciales
   familia    S01  solución general vs particular (clic)
   verificar  S01  comprobar una solución por sustitución
   campo      S02  campo de direcciones con clic
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', ROJO = '#b0392c', VERDE = '#1c7a4c';
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
