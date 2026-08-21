/* ══════════════════════════════════════════════════════════
   Visualizadores · Ecuaciones Diferenciales
   La pieza central: campo de direcciones donde el estudiante
   hace clic y ve nacer la curva solución por ese punto.
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
