/* ══════════════════════════════════════════════════════════
   Visualizadores · Cálculo Vectorial
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', VERDE = '#1c7a4c', ROJO = '#b0392c';
function q(host, sel) { return host.querySelector(sel); }

function flecha(L, x0, y0, x1, y1, color, ancho) {
  var c = L.ctx, px0 = L.px(x0), py0 = L.py(y0), px1 = L.px(x1), py1 = L.py(y1);
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = ancho || 2.5;
  c.beginPath(); c.moveTo(px0, py0); c.lineTo(px1, py1); c.stroke();
  var ang = Math.atan2(py1 - py0, px1 - px0), s = 9;
  c.beginPath();
  c.moveTo(px1, py1);
  c.lineTo(px1 - s * Math.cos(ang - 0.4), py1 - s * Math.sin(ang - 0.4));
  c.lineTo(px1 - s * Math.cos(ang + 0.4), py1 - s * Math.sin(ang + 0.4));
  c.closePath(); c.fill();
}

/* ── Operaciones con vectores en el plano ───────────────── */
OVA.viz.registrar('vectores', function (host) {
  var ux = parseFloat(q(host, '.ux').value), uy = parseFloat(q(host, '.uy').value);
  var vx = parseFloat(q(host, '.vx').value), vy = parseFloat(q(host, '.vy').value);
  var modo = q(host, 'select').value;

  var L = OVA.lienzo(q(host, 'canvas'), { sx: 34, sy: 34 });
  OVA.ejes(L);

  flecha(L, 0, 0, ux, uy, AZUL, 3);
  flecha(L, 0, 0, vx, vy, ORO, 3);
  var c = L.ctx;
  c.font = 'bold 12px ui-monospace,monospace';
  c.fillStyle = AZUL; c.fillText('u', L.px(ux) + 6, L.py(uy) - 4);
  c.fillStyle = ORO;  c.fillText('v', L.px(vx) + 6, L.py(vy) - 4);

  var punto = ux * vx + uy * vy;
  var nu = Math.hypot(ux, uy), nv = Math.hypot(vx, vy);
  var cruz = ux * vy - uy * vx;
  var ang = (nu && nv) ? Math.acos(Math.max(-1, Math.min(1, punto / (nu * nv)))) * 180 / Math.PI : NaN;
  var extra = '';

  if (modo === 'suma') {
    c.setLineDash([4, 4]); c.strokeStyle = 'rgba(128,128,128,.6)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L.px(ux), L.py(uy)); c.lineTo(L.px(ux + vx), L.py(uy + vy));
    c.moveTo(L.px(vx), L.py(vy)); c.lineTo(L.px(ux + vx), L.py(uy + vy)); c.stroke();
    c.setLineDash([]);
    flecha(L, 0, 0, ux + vx, uy + vy, VERDE, 3);
    c.fillStyle = VERDE; c.fillText('u+v', L.px(ux + vx) + 6, L.py(uy + vy) - 4);
    extra = '<strong style="color:#7fd4a4">u + v = (' + (ux + vx) + ', ' + (uy + vy) + ')</strong> — ' +
            'la diagonal del paralelogramo.';
  } else if (modo === 'proy') {
    var k = nv ? punto / (nv * nv) : 0;
    flecha(L, 0, 0, k * vx, k * vy, ROJO, 4);
    c.setLineDash([4, 4]); c.strokeStyle = 'rgba(128,128,128,.6)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L.px(ux), L.py(uy)); c.lineTo(L.px(k * vx), L.py(k * vy)); c.stroke();
    c.setLineDash([]);
    extra = '<strong style="color:#f0a58a">proy<sub>v</sub>u = (' + (k * vx).toFixed(2) + ', ' +
            (k * vy).toFixed(2) + ')</strong> — la sombra de u sobre la dirección de v. ' +
            'Componente escalar: ' + (nv ? (punto / nv).toFixed(3) : '—') + '.';
  } else {
    c.fillStyle = 'rgba(28,122,76,.22)';
    c.beginPath();
    c.moveTo(L.px(0), L.py(0)); c.lineTo(L.px(ux), L.py(uy));
    c.lineTo(L.px(ux + vx), L.py(uy + vy)); c.lineTo(L.px(vx), L.py(vy));
    c.closePath(); c.fill();
    extra = '<strong style="color:#7fd4a4">Área del paralelogramo = |u×v| = ' + Math.abs(cruz).toFixed(3) +
            '</strong> — en el plano, el producto cruz es el escalar $u_xv_y-u_yv_x$.';
  }

  q(host, '.viz-readout').innerHTML =
    'u·v = <strong>' + punto.toFixed(3) + '</strong> &nbsp;·&nbsp; |u| = ' + nu.toFixed(3) +
    ' &nbsp;·&nbsp; |v| = ' + nv.toFixed(3) +
    ' &nbsp;·&nbsp; ángulo ≈ <strong>' + (isFinite(ang) ? ang.toFixed(1) + '°' : '—') + '</strong>' +
    (Math.abs(punto) < 1e-9 ? ' <span style="color:#7fd4a4">(perpendiculares)</span>' : '') +
    '<br>' + extra;
  OVA.mj(q(host, '.viz-readout'));
});

/* ── Curvas de nivel y gradiente ────────────────────────── */
var CAMPOS = {
  parab: { f: function (x, y) { return x * x + y * y; },       g: function (x, y) { return [2 * x, 2 * y]; },       n: 'f(x,y) = x² + y²' },
  silla: { f: function (x, y) { return x * x - y * y; },       g: function (x, y) { return [2 * x, -2 * y]; },      n: 'f(x,y) = x² − y²' },
  prod:  { f: function (x, y) { return x * y; },               g: function (x, y) { return [y, x]; },              n: 'f(x,y) = x·y' },
  onda:  { f: function (x, y) { return Math.sin(x) * Math.cos(y); },
           g: function (x, y) { return [Math.cos(x) * Math.cos(y), -Math.sin(x) * Math.sin(y)]; }, n: 'f(x,y) = sen x · cos y' }
};

OVA.viz.registrar('gradiente', function (host) {
  var cfg = CAMPOS[q(host, 'select').value] || CAMPOS.parab;
  var px = parseFloat(q(host, '.gx').value) / 10, py = parseFloat(q(host, '.gy').value) / 10;
  q(host, '.p-val').textContent = '(' + px.toFixed(1) + ', ' + py.toFixed(1) + ')';

  var L = OVA.lienzo(q(host, 'canvas'), { sx: 40, sy: 40 });
  var c = L.ctx, paso = 4, i, j;

  // Bandas de nivel por muestreo
  var lo = Infinity, hi = -Infinity, val = [];
  for (i = 0; i < L.w; i += paso) {
    val[i] = [];
    for (j = 0; j < L.h; j += paso) {
      var v = cfg.f((i - L.ox) / L.sx, (L.oy - j) / L.sy);
      val[i][j] = v;
      if (v < lo) lo = v; if (v > hi) hi = v;
    }
  }
  var oscuro = document.body.classList.contains('dark');
  for (i = 0; i < L.w; i += paso) {
    for (j = 0; j < L.h; j += paso) {
      var t = (val[i][j] - lo) / (hi - lo || 1);
      var banda = Math.floor(t * 9) / 9;
      c.fillStyle = oscuro
        ? 'rgba(143,180,217,' + (0.06 + banda * 0.4) + ')'
        : 'rgba(34,80,125,' + (0.05 + banda * 0.35) + ')';
      c.fillRect(i, j, paso, paso);
    }
  }
  OVA.ejes(L);

  // Gradiente en el punto
  var g = cfg.g(px, py), norma = Math.hypot(g[0], g[1]);
  if (norma > 1e-6) {
    var esc = 1.2 / Math.max(norma, 0.6);
    flecha(L, px, py, px + g[0] * esc, py + g[1] * esc, '#dba949', 3.5);
    // dirección tangente a la curva de nivel (perpendicular al gradiente)
    var tx = -g[1] / norma, ty = g[0] / norma;
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.setLineDash([5, 4]);
    c.beginPath();
    c.moveTo(L.px(px - tx * 1.4), L.py(py - ty * 1.4));
    c.lineTo(L.px(px + tx * 1.4), L.py(py + ty * 1.4));
    c.stroke(); c.setLineDash([]);
  }
  OVA.punto(L, px, py, '#b0392c');
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  q(host, '.viz-readout').innerHTML =
    'f(' + px.toFixed(1) + ', ' + py.toFixed(1) + ') = <strong>' + cfg.f(px, py).toFixed(3) + '</strong><br>' +
    '∇f = <strong style="color:#dba949">(' + g[0].toFixed(2) + ', ' + g[1].toFixed(2) + ')</strong>' +
    ' &nbsp;·&nbsp; |∇f| = ' + norma.toFixed(3) + '<br>' +
    '<span style="color:#8fb4d9">La flecha dorada apunta hacia donde f crece más rápido. ' +
    'La línea blanca punteada es la curva de nivel: siempre perpendicular al gradiente.</span>';
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
