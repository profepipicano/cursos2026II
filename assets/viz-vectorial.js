/* ══════════════════════════════════════════════════════════
   Visualizadores · Cálculo Vectorial
   ----------------------------------------------------------
   conicas    §3  una sola familia recorrida por la excentricidad
   completar  §4  de la forma general a la canónica
   vectores   (semana 3 · funciones vectoriales)
   gradiente  (semanas 6–7 · derivadas parciales y gradiente)
   ══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var AZUL = '#3a6ea5', ORO = '#c68f2e', VERDE = '#1c7a4c', ROJO = '#b0392c', MORADO = '#7d4f9e';
function q(host, sel) { return host.querySelector(sel); }
var ctrl = q;

function flecha(L, x0, y0, x1, y1, color, ancho) {
  var c = L.ctx, a = L.px(x0), b = L.py(y0), d = L.px(x1), e = L.py(y1);
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = ancho || 2.5;
  c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke();
  var ang = Math.atan2(e - b, d - a), s = 9;
  c.beginPath(); c.moveTo(d, e);
  c.lineTo(d - s * Math.cos(ang - 0.4), e - s * Math.sin(ang - 0.4));
  c.lineTo(d - s * Math.cos(ang + 0.4), e - s * Math.sin(ang + 0.4));
  c.closePath(); c.fill();
}

/* ══════ §3 · Las cuatro cónicas son una sola familia ══════
   Foco en el origen, directriz vertical x = ℓ/e.
   r = ℓ / (1 + e·cosθ)  con ℓ (semi-latus rectum) FIJO.
   Mantener ℓ fijo en vez de la directriz es lo que hace que
   en e = 0 quede una circunferencia y no un punto.          */
OVA.viz.registrar('conicas', function (host) {
  var e = parseFloat(q(host, '.exc').value) / 100;
  var thP = parseFloat(q(host, '.punto').value) * Math.PI / 180;
  var L0 = 3;
  q(host, '.exc-val').textContent = 'e = ' + e.toFixed(2);

  var L = OVA.lienzo(host.querySelector('canvas'), { sx: 34, sy: 34 });
  L.ox = L.w * 0.62;
  OVA.ejes(L);
  var c = L.ctx;

  var den = function (t) { return 1 + e * Math.cos(t); };
  var rad = function (t) { return L0 / den(t); };

  // Directriz x = ℓ/e  (se va al infinito cuando e → 0)
  var d = e > 0.01 ? L0 / e : Infinity;
  if (isFinite(d) && L.px(d) < L.w - 4) {
    c.strokeStyle = VERDE; c.lineWidth = 2; c.setLineDash([7, 5]);
    c.beginPath(); c.moveTo(L.px(d), 0); c.lineTo(L.px(d), L.h); c.stroke();
    c.setLineDash([]);
    c.fillStyle = VERDE; c.font = 'bold 11px ui-monospace,monospace';
    c.fillText('directriz', L.px(d) + 5, 16);
  }

  // La cónica
  c.strokeStyle = AZUL; c.lineWidth = 3; c.lineJoin = 'round';
  c.beginPath();
  var trazando = false, signoPrev = null;
  for (var i = 0; i <= 1440; i++) {
    var t = i * Math.PI / 720;
    var D = den(t);
    if (Math.abs(D) < 0.02) { trazando = false; signoPrev = null; continue; }
    var s = D > 0 ? 1 : -1;
    if (signoPrev !== null && s !== signoPrev) trazando = false;
    signoPrev = s;
    var r = L0 / D, X = L.px(r * Math.cos(t)), Y = L.py(r * Math.sin(t));
    if (X < -600 || X > L.w + 600 || Y < -600 || Y > L.h + 600) { trazando = false; continue; }
    if (!trazando) { c.moveTo(X, Y); trazando = true; } else c.lineTo(X, Y);
  }
  c.stroke();

  // Punto P móvil con sus dos distancias
  var DP = den(thP), tipoOK = Math.abs(DP) > 0.02;
  var PF = NaN, PD = NaN;
  if (tipoOK) {
    var rP = L0 / DP, Px = rP * Math.cos(thP), Py = rP * Math.sin(thP);
    PF = Math.hypot(Px, Py);
    PD = isFinite(d) ? Math.abs(d - Px) : Infinity;
    c.strokeStyle = ROJO; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(L.px(0), L.py(0)); c.lineTo(L.px(Px), L.py(Py)); c.stroke();
    if (isFinite(d)) {
      c.strokeStyle = VERDE; c.setLineDash([4, 3]);
      c.beginPath(); c.moveTo(L.px(Px), L.py(Py)); c.lineTo(L.px(d), L.py(Py)); c.stroke();
      c.setLineDash([]);
    }
    OVA.punto(L, Px, Py, MORADO);
  }

  // Foco, centro y vértices
  OVA.punto(L, 0, 0, ROJO);
  c.fillStyle = ROJO; c.font = 'bold 11px ui-monospace,monospace';
  c.fillText('F', L.px(0) + 8, L.py(0) - 8);

  var tipo, det = '', a, b, cc;
  if (e < 0.005) {
    tipo = 'Circunferencia';
    det = 'radio = ' + L0.toFixed(2) + ' · el foco es el centro · la directriz se fue al infinito';
  } else if (e < 0.995) {
    tipo = 'Elipse';
    a = L0 / (1 - e * e); b = L0 / Math.sqrt(1 - e * e); cc = a * e;
    var cx = -cc;
    OVA.punto(L, cx, 0, ORO); OVA.punto(L, -2 * cc, 0, ROJO);
    c.fillStyle = ORO; c.fillText('C', L.px(cx) + 6, L.py(0) + 16);
    det = 'a = ' + a.toFixed(2) + ' · b = ' + b.toFixed(2) + ' · c = ' + cc.toFixed(2) +
          ' &nbsp;·&nbsp; verifica c² = a² − b²: ' + (cc * cc).toFixed(2) + ' = ' +
          (a * a).toFixed(2) + ' − ' + (b * b).toFixed(2);
  } else if (e < 1.005) {
    tipo = 'Parábola';
    det = 'el segundo foco se fue al infinito · vértice en x = ' + (L0 / 2).toFixed(2);
  } else {
    tipo = 'Hipérbola';
    a = L0 / (e * e - 1); cc = a * e; b = Math.sqrt(cc * cc - a * a);
    det = 'a = ' + a.toFixed(2) + ' · b = ' + b.toFixed(2) + ' · c = ' + cc.toFixed(2) +
          ' &nbsp;·&nbsp; verifica c² = a² + b²: ' + (cc * cc).toFixed(2) + ' = ' +
          (a * a).toFixed(2) + ' + ' + (b * b).toFixed(2);
  }

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 13px ui-monospace,monospace';
  c.fillText(tipo, 10, 18);
  c.font = '11px ui-monospace,monospace';
  c.fillText('r = 3/(1 + ' + e.toFixed(2) + '·cos θ)', 10, 34);

  q(host, '.viz-readout').innerHTML =
    '<strong style="font-size:1.05em">' + tipo + '</strong> &nbsp;·&nbsp; e = ' + e.toFixed(2) + '<br>' +
    det + '<br>' +
    (tipoOK && isFinite(PD)
      ? '<span style="color:#e08b7e">|PF|</span> = ' + PF.toFixed(3) +
        ' &nbsp;·&nbsp; <span style="color:#7fd4a4">dist(P, directriz)</span> = ' + PD.toFixed(3) +
        ' &nbsp;·&nbsp; cociente = <strong>' + (PF / PD).toFixed(3) + '</strong>'
      : 'Con e = 0 no hay directriz: todos los puntos están a la misma distancia del foco.') +
    '<br><span style="color:#8fb4d9">Mueve P por la curva: el cociente no cambia. <em>Ese</em> ' +
    'cociente constante es la excentricidad, y es lo único que distingue a las cuatro cónicas.</span>';
});

/* ══════ §4 · De la forma general a la canónica ══════ */
var PRESETS = {
  circ: {
    gen: 'x² + y² − 6x + 4y − 12 = 0',
    pasos: [
      ['Agrupar', 'Agrupamos por variable: $(x^2-6x) + (y^2+4y) = 12$'],
      ['Completar en x', 'La mitad de $-6$ es $-3$, y $(-3)^2=9$: &nbsp; $(x-3)^2 - 9$'],
      ['Completar en y', 'La mitad de $4$ es $2$, y $2^2=4$: &nbsp; $(y+2)^2 - 4$'],
      ['Reunir', '$(x-3)^2 + (y+2)^2 = 12 + 9 + 4 = 25$'],
      ['Identificar', 'Circunferencia de centro $(3,-2)$ y radio $5$.']
    ],
    A: 1, C: 1, clas: 'A = C ⟹ circunferencia',
    dibujo: { t: 'elipse', h: 3, k: -2, a: 5, b: 5 },
    res: 'Circunferencia · centro (3, −2) · r = 5 · e = 0'
  },
  para: {
    gen: 'x² − 8x − 4y + 4 = 0',
    pasos: [
      ['Aislar el término lineal en y', '$x^2-8x = 4y-4$'],
      ['Completar en x', '$(x-4)^2 - 16 = 4y - 4$'],
      ['Despejar', '$(x-4)^2 = 4y + 12 = 4(y+3)$'],
      ['Comparar con $(x-h)^2=4p(y-k)$', '$h=4$, $k=-3$, $4p=4 \\Rightarrow p=1$'],
      ['Identificar', 'Parábola de vértice $(4,-3)$, abre hacia arriba; foco $(4,-2)$, directriz $y=-4$.']
    ],
    A: 1, C: 0, clas: 'C = 0 ⟹ A·C = 0 ⟹ parábola',
    dibujo: { t: 'parabola', h: 4, k: -3, p: 1 },
    res: 'Parábola · vértice (4, −3) · foco (4, −2) · directriz y = −4 · e = 1'
  },
  elip: {
    gen: '4x² + 9y² − 16x + 18y − 11 = 0',
    pasos: [
      ['Agrupar y factorizar el coeficiente', '$4(x^2-4x) + 9(y^2+2y) = 11$'],
      ['Completar dentro de cada paréntesis', '$4[(x-2)^2-4] + 9[(y+1)^2-1] = 11$'],
      ['Cuidado con lo que sale', 'Al distribuir salen $-16$ y $-9$, <em>no</em> $-4$ y $-1$: hay que multiplicarlos por el coeficiente.'],
      ['Reunir', '$4(x-2)^2 + 9(y+1)^2 = 11 + 16 + 9 = 36$'],
      ['Dividir entre 36', '$\\dfrac{(x-2)^2}{9} + \\dfrac{(y+1)^2}{4} = 1$'],
      ['Elementos', '$a=3$, $b=2$, $c=\\sqrt{9-4}=\\sqrt{5}$, $e=\\sqrt5/3\\approx 0{,}745$']
    ],
    A: 4, C: 9, clas: 'A·C = 36 > 0 con A ≠ C ⟹ elipse',
    dibujo: { t: 'elipse', h: 2, k: -1, a: 3, b: 2 },
    res: 'Elipse · centro (2, −1) · a = 3, b = 2, c = √5 · e ≈ 0,745'
  },
  hip: {
    gen: '9x² − 16y² − 18x − 64y − 199 = 0',
    pasos: [
      ['Agrupar y factorizar', '$9(x^2-2x) - 16(y^2+4y) = 199$'],
      ['Completar', '$9[(x-1)^2-1] - 16[(y+2)^2-4] = 199$'],
      ['Ojo con el signo', 'El $-16$ multiplica al $-4$ y aporta $+64$ al lado izquierdo, así que pasa restando: $199 + 9 - 64$.'],
      ['Reunir', '$9(x-1)^2 - 16(y+2)^2 = 144$'],
      ['Dividir entre 144', '$\\dfrac{(x-1)^2}{16} - \\dfrac{(y+2)^2}{9} = 1$'],
      ['Elementos', '$a=4$, $b=3$, $c=\\sqrt{16+9}=5$, $e=5/4=1{,}25$; asíntotas $y+2=\\pm\\tfrac34(x-1)$']
    ],
    A: 9, C: -16, clas: 'A·C = −144 < 0 ⟹ hipérbola',
    dibujo: { t: 'hiperbola', h: 1, k: -2, a: 4, b: 3 },
    res: 'Hipérbola · centro (1, −2) · a = 4, b = 3, c = 5 · e = 1,25'
  },
  punto: {
    gen: 'x² + y² − 4x + 6y + 13 = 0',
    pasos: [
      ['Agrupar', '$(x^2-4x) + (y^2+6y) = -13$'],
      ['Completar', '$(x-2)^2 - 4 + (y+3)^2 - 9 = -13$'],
      ['Reunir', '$(x-2)^2 + (y+3)^2 = -13 + 4 + 9 = 0$'],
      ['Identificar', 'Una suma de cuadrados vale cero solo si ambos son cero: se reduce al <strong>punto</strong> $(2,-3)$.']
    ],
    A: 1, C: 1, clas: 'A = C, pero el lado derecho es 0 ⟹ caso degenerado',
    dibujo: { t: 'punto', h: 2, k: -3 },
    res: 'Caso degenerado · un solo punto: (2, −3)'
  },
  vacio: {
    gen: 'x² + y² + 2x + 2y + 3 = 0',
    pasos: [
      ['Agrupar', '$(x^2+2x) + (y^2+2y) = -3$'],
      ['Completar', '$(x+1)^2 - 1 + (y+1)^2 - 1 = -3$'],
      ['Reunir', '$(x+1)^2 + (y+1)^2 = -3 + 1 + 1 = -1$'],
      ['Identificar', 'Una suma de cuadrados nunca es negativa: <strong>ningún punto real</strong> satisface la ecuación.']
    ],
    A: 1, C: 1, clas: 'A = C, pero el lado derecho es negativo ⟹ conjunto vacío',
    dibujo: { t: 'vacio' },
    res: 'Caso degenerado · conjunto vacío: no hay solución real'
  }
};

OVA.viz.registrar('completar', function (host) {
  var cfg = PRESETS[q(host, 'select').value] || PRESETS.circ;
  var paso = parseInt(q(host, '.paso').value, 10);
  var total = cfg.pasos.length;
  paso = Math.min(paso, total);
  q(host, '.paso-val').textContent = 'paso ' + paso + ' de ' + total;

  var html = '<div style="font-family:ui-monospace,monospace;font-size:.95rem;margin-bottom:.6rem">' +
             cfg.gen + '</div>';
  for (var i = 0; i < paso; i++) {
    html += '<div class="paso"><div class="paso-t">' + (i + 1) + '. ' + cfg.pasos[i][0] + '</div>' +
            cfg.pasos[i][1] + '</div>';
  }
  q(host, '.pasos').innerHTML = html;
  OVA.mj(q(host, '.pasos'));

  var L = OVA.lienzo(host.querySelector('canvas'), { sx: 26, sy: 26, alto: 260 });
  OVA.ejes(L);
  var c = L.ctx, D = cfg.dibujo, completo = paso >= total;
  var col = completo ? AZUL : 'rgba(128,150,175,.45)';

  if (D.t === 'elipse') {
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
    for (var t = 0; t <= 6.2832; t += 0.01) {
      var X = L.px(D.h + D.a * Math.cos(t)), Y = L.py(D.k + D.b * Math.sin(t));
      t ? c.lineTo(X, Y) : c.moveTo(X, Y);
    }
    c.closePath(); c.stroke();
    if (completo) OVA.punto(L, D.h, D.k, ORO);
  } else if (D.t === 'hiperbola') {
    c.strokeStyle = 'rgba(128,150,175,.6)'; c.lineWidth = 1.5; c.setLineDash([5, 4]);
    [1, -1].forEach(function (s) {
      c.beginPath();
      c.moveTo(L.px(D.h - 9), L.py(D.k - s * D.b / D.a * 9));
      c.lineTo(L.px(D.h + 9), L.py(D.k + s * D.b / D.a * 9));
      c.stroke();
    });
    c.setLineDash([]);
    c.strokeStyle = col; c.lineWidth = 3;
    [1, -1].forEach(function (s) {
      c.beginPath();
      for (var u = -2.4; u <= 2.4; u += 0.02) {
        var X = L.px(D.h + s * D.a * Math.cosh(u)), Y = L.py(D.k + D.b * Math.sinh(u));
        u === -2.4 ? c.moveTo(X, Y) : c.lineTo(X, Y);
      }
      c.stroke();
    });
    if (completo) OVA.punto(L, D.h, D.k, ORO);
  } else if (D.t === 'parabola') {
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
    for (var xx = -10; xx <= 14; xx += 0.05) {
      var Y2 = D.k + Math.pow(xx - D.h, 2) / (4 * D.p);
      var Py = L.py(Y2);
      if (Py < -50 || Py > L.h + 50) continue;
      xx === -10 ? c.moveTo(L.px(xx), Py) : c.lineTo(L.px(xx), Py);
    }
    c.stroke();
    if (completo) { OVA.punto(L, D.h, D.k, ORO); OVA.punto(L, D.h, D.k + D.p, ROJO); }
  } else if (D.t === 'punto') {
    if (completo) OVA.punto(L, D.h, D.k, ROJO);
  }

  if (D.t === 'vacio' && completo) {
    c.fillStyle = ROJO; c.font = 'bold 14px ui-monospace,monospace';
    c.fillText('∅  ningún punto real', L.w / 2 - 80, L.h / 2);
  }

  q(host, '.viz-readout').innerHTML =
    '<strong>Clasificación rápida:</strong> ' + cfg.clas + '<br>' +
    (completo
      ? '<strong style="color:#dba949">' + cfg.res + '</strong>'
      : '<span style="color:#8fb4d9">Avanza el deslizador para ver el siguiente paso. ' +
        'La curva se dibuja en firme cuando termines.</span>');
});

/* ══════ Semana 3 · Operaciones con vectores ══════ */
OVA.viz.registrar('vectores', function (host) {
  var ux = parseFloat(q(host, '.ux').value), uy = parseFloat(q(host, '.uy').value);
  var vx = parseFloat(q(host, '.vx').value), vy = parseFloat(q(host, '.vy').value);
  var modo = q(host, 'select').value;
  var L = OVA.lienzo(host.querySelector('canvas'), { sx: 34, sy: 34 });
  OVA.ejes(L);
  flecha(L, 0, 0, ux, uy, AZUL, 3); flecha(L, 0, 0, vx, vy, ORO, 3);
  var c = L.ctx; c.font = 'bold 12px ui-monospace,monospace';
  c.fillStyle = AZUL; c.fillText('u', L.px(ux) + 6, L.py(uy) - 4);
  c.fillStyle = ORO; c.fillText('v', L.px(vx) + 6, L.py(vy) - 4);
  var p = ux * vx + uy * vy, nu = Math.hypot(ux, uy), nv = Math.hypot(vx, vy);
  var cruz = ux * vy - uy * vx, extra = '';
  var ang = (nu && nv) ? Math.acos(Math.max(-1, Math.min(1, p / (nu * nv)))) * 180 / Math.PI : NaN;
  if (modo === 'suma') {
    c.setLineDash([4, 4]); c.strokeStyle = 'rgba(128,128,128,.6)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L.px(ux), L.py(uy)); c.lineTo(L.px(ux + vx), L.py(uy + vy));
    c.moveTo(L.px(vx), L.py(vy)); c.lineTo(L.px(ux + vx), L.py(uy + vy)); c.stroke();
    c.setLineDash([]);
    flecha(L, 0, 0, ux + vx, uy + vy, VERDE, 3);
    extra = '<strong style="color:#7fd4a4">u + v = (' + (ux + vx) + ', ' + (uy + vy) + ')</strong>';
  } else if (modo === 'proy') {
    var k = nv ? p / (nv * nv) : 0;
    flecha(L, 0, 0, k * vx, k * vy, ROJO, 4);
    extra = '<strong style="color:#f0a58a">proy<sub>v</sub>u = (' + (k * vx).toFixed(2) + ', ' +
            (k * vy).toFixed(2) + ')</strong>';
  } else {
    c.fillStyle = 'rgba(28,122,76,.22)'; c.beginPath();
    c.moveTo(L.px(0), L.py(0)); c.lineTo(L.px(ux), L.py(uy));
    c.lineTo(L.px(ux + vx), L.py(uy + vy)); c.lineTo(L.px(vx), L.py(vy));
    c.closePath(); c.fill();
    extra = '<strong style="color:#7fd4a4">Área = |u×v| = ' + Math.abs(cruz).toFixed(3) + '</strong>';
  }
  q(host, '.viz-readout').innerHTML =
    'u·v = <strong>' + p.toFixed(3) + '</strong> · |u| = ' + nu.toFixed(3) +
    ' · |v| = ' + nv.toFixed(3) + ' · ángulo ≈ <strong>' +
    (isFinite(ang) ? ang.toFixed(1) + '°' : '—') + '</strong>' +
    (Math.abs(p) < 1e-9 ? ' <span style="color:#7fd4a4">(perpendiculares)</span>' : '') +
    '<br>' + extra;
});

/* ══════ Semanas 6–7 · Curvas de nivel y gradiente ══════ */
var CAMPOS = {
  parab: { f: function (x, y) { return x * x + y * y; }, g: function (x, y) { return [2 * x, 2 * y]; }, n: 'f(x,y) = x² + y²' },
  silla: { f: function (x, y) { return x * x - y * y; }, g: function (x, y) { return [2 * x, -2 * y]; }, n: 'f(x,y) = x² − y²' },
  prod:  { f: function (x, y) { return x * y; },         g: function (x, y) { return [y, x]; },         n: 'f(x,y) = x·y' },
  onda:  { f: function (x, y) { return Math.sin(x) * Math.cos(y); },
           g: function (x, y) { return [Math.cos(x) * Math.cos(y), -Math.sin(x) * Math.sin(y)]; }, n: 'f(x,y) = sen x · cos y' }
};

OVA.viz.registrar('gradiente', function (host) {
  var cfg = CAMPOS[q(host, 'select').value] || CAMPOS.parab;
  var px = parseFloat(q(host, '.gx').value) / 10, py = parseFloat(q(host, '.gy').value) / 10;
  q(host, '.p-val').textContent = '(' + px.toFixed(1) + ', ' + py.toFixed(1) + ')';
  var L = OVA.lienzo(host.querySelector('canvas'), { sx: 40, sy: 40 });
  var c = L.ctx, paso = 4, i, j, lo = Infinity, hi = -Infinity, val = [];
  for (i = 0; i < L.w; i += paso) {
    val[i] = [];
    for (j = 0; j < L.h; j += paso) {
      var v = cfg.f((i - L.ox) / L.sx, (L.oy - j) / L.sy);
      val[i][j] = v; if (v < lo) lo = v; if (v > hi) hi = v;
    }
  }
  var oscuro = document.body.classList.contains('dark');
  for (i = 0; i < L.w; i += paso) for (j = 0; j < L.h; j += paso) {
    var t = (val[i][j] - lo) / (hi - lo || 1), banda = Math.floor(t * 9) / 9;
    c.fillStyle = oscuro ? 'rgba(143,180,217,' + (0.06 + banda * 0.4) + ')'
                         : 'rgba(34,80,125,' + (0.05 + banda * 0.35) + ')';
    c.fillRect(i, j, paso, paso);
  }
  OVA.ejes(L);
  var g = cfg.g(px, py), norma = Math.hypot(g[0], g[1]);
  if (norma > 1e-6) {
    var esc = 1.2 / Math.max(norma, 0.6);
    flecha(L, px, py, px + g[0] * esc, py + g[1] * esc, '#dba949', 3.5);
    var tx = -g[1] / norma, ty = g[0] / norma;
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.setLineDash([5, 4]);
    c.beginPath();
    c.moveTo(L.px(px - tx * 1.4), L.py(py - ty * 1.4));
    c.lineTo(L.px(px + tx * 1.4), L.py(py + ty * 1.4));
    c.stroke(); c.setLineDash([]);
  }
  OVA.punto(L, px, py, ROJO);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);
  q(host, '.viz-readout').innerHTML =
    'f(' + px.toFixed(1) + ', ' + py.toFixed(1) + ') = <strong>' + cfg.f(px, py).toFixed(3) + '</strong><br>' +
    '∇f = <strong style="color:#dba949">(' + g[0].toFixed(2) + ', ' + g[1].toFixed(2) + ')</strong>' +
    ' · |∇f| = ' + norma.toFixed(3) + '<br>' +
    '<span style="color:#8fb4d9">La flecha dorada apunta hacia donde f crece más rápido; ' +
    'la línea punteada es la curva de nivel, siempre perpendicular al gradiente.</span>';
});

/* ══════ S02 · Curvas paramétricas ══════ */
var PARAM = {
  circ:  { x: function (t) { return 2 * Math.cos(t); }, y: function (t) { return 2 * Math.sin(t); },
           t0: 0, t1: 6.2832, n: 'x = 2cos t,  y = 2sen t', car: 'x² + y² = 4', rap: '2 (constante)' },
  circ2: { x: function (t) { return 2 * Math.cos(2 * t); }, y: function (t) { return 2 * Math.sin(2 * t); },
           t0: 0, t1: 3.1416, n: 'x = 2cos 2t,  y = 2sen 2t', car: 'x² + y² = 4  (¡la misma curva!)',
           rap: '4 (el doble)' },
  horar: { x: function (t) { return 2 * Math.sin(t); }, y: function (t) { return 2 * Math.cos(t); },
           t0: 0, t1: 6.2832, n: 'x = 2sen t,  y = 2cos t', car: 'x² + y² = 4  (sentido horario)',
           rap: '2 (constante)' },
  elip:  { x: function (t) { return 3 * Math.cos(t); }, y: function (t) { return 1.6 * Math.sin(t); },
           t0: 0, t1: 6.2832, n: 'x = 3cos t,  y = 1,6sen t', car: 'x²/9 + y²/2,56 = 1', rap: 'variable' },
  parab: { x: function (t) { return t + 1; }, y: function (t) { return t * t; },
           t0: -2.2, t1: 2.2, n: 'x = t+1,  y = t²', car: 'y = (x − 1)²', rap: 'variable' },
  cicl:  { x: function (t) { return t - Math.sin(t); }, y: function (t) { return 1 - Math.cos(t); },
           t0: 0, t1: 12.566, n: 'x = t − sen t,  y = 1 − cos t', car: 'cicloide (sin forma cartesiana simple)',
           rap: 'cero en el suelo' },
  liss:  { x: function (t) { return 2.4 * Math.sin(3 * t); }, y: function (t) { return 2.4 * Math.sin(2 * t); },
           t0: 0, t1: 6.2832, n: 'x = 2,4sen 3t,  y = 2,4sen 2t', car: 'figura de Lissajous', rap: 'variable' }
};

OVA.viz.registrar('parametricas', function (host) {
  var cfg = PARAM[ctrl(host, 'select').value] || PARAM.circ;
  var frac = parseFloat(ctrl(host, '.tpar').value) / 100;
  var tv = cfg.t0 + (cfg.t1 - cfg.t0) * frac;
  ctrl(host, '.t-val').textContent = 't = ' + tv.toFixed(2);

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 46, sy: 46 });
  OVA.ejes(L);
  var c = L.ctx;

  // parte ya recorrida en fuerte, el resto tenue
  var trazo = function (a, b, color, ancho) {
    c.strokeStyle = color; c.lineWidth = ancho; c.lineJoin = 'round';
    c.beginPath();
    for (var i = 0; i <= 300; i++) {
      var t = a + (b - a) * i / 300;
      var q = [L.px(cfg.x(t)), L.py(cfg.y(t))];
      i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]);
    }
    c.stroke();
  };
  trazo(cfg.t0, cfg.t1, 'rgba(150,167,181,.55)', 1.8);
  if (tv > cfg.t0) trazo(cfg.t0, tv, AZUL, 3.2);

  // punto móvil y sus proyecciones sobre los ejes
  var X = cfg.x(tv), Y = cfg.y(tv);
  c.strokeStyle = 'rgba(128,128,128,.55)'; c.lineWidth = 1; c.setLineDash([4, 4]);
  c.beginPath();
  c.moveTo(L.px(X), L.py(Y)); c.lineTo(L.px(X), L.oy);
  c.moveTo(L.px(X), L.py(Y)); c.lineTo(L.ox, L.py(Y));
  c.stroke(); c.setLineDash([]);
  OVA.punto(L, X, Y, ORO);
  OVA.punto(L, X, 0, ROJO, true);
  OVA.punto(L, 0, Y, VERDE, true);

  // vector velocidad (numérico)
  var d = 1e-4, vx = (cfg.x(tv + d) - cfg.x(tv - d)) / (2 * d),
                vy = (cfg.y(tv + d) - cfg.y(tv - d)) / (2 * d);
  var rap = Math.hypot(vx, vy), k = rap > 1e-6 ? 0.9 / Math.max(rap, 0.5) : 0;
  if (k) {
    c.strokeStyle = MORADO; c.fillStyle = MORADO; c.lineWidth = 2.6;
    var a1 = [L.px(X), L.py(Y)], b1 = [L.px(X + vx * k), L.py(Y + vy * k)];
    c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.stroke();
    var an = Math.atan2(b1[1] - a1[1], b1[0] - a1[0]);
    c.beginPath(); c.moveTo(b1[0], b1[1]);
    c.lineTo(b1[0] - 9 * Math.cos(an - 0.4), b1[1] - 9 * Math.sin(an - 0.4));
    c.lineTo(b1[0] - 9 * Math.cos(an + 0.4), b1[1] - 9 * Math.sin(an + 0.4));
    c.closePath(); c.fill();
  }

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  ctrl(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;·&nbsp; ' + cfg.car + '<br>' +
    'En t = ' + tv.toFixed(2) + ': &nbsp;<span style="color:#e08b7e">x = ' + X.toFixed(3) +
      '</span> &nbsp;·&nbsp; <span style="color:#7fd4a4">y = ' + Y.toFixed(3) + '</span>' +
      ' &nbsp;·&nbsp; rapidez |v| = <strong>' + rap.toFixed(3) + '</strong>' +
      ' &nbsp;(' + cfg.rap + ')<br>' +
    '<span style="color:#8fb4d9">La flecha morada apunta en el sentido del recorrido. ' +
    'Compara «2cos t» con «2cos 2t»: <em>la misma circunferencia</em> recorrida al doble de ' +
    'rapidez, y «2sen t» la recorre al revés. La curva no determina la parametrización.</span>';
});

/* ══════ S02 · Coordenadas polares ══════ */
var POLAR = {
  circR: { r: function (a) { return 2; }, t0: 0, t1: 6.2832, n: 'r = 2',
           car: 'circunferencia de radio 2 centrada en el origen' },
  circD: { r: function (a) { return 2 * Math.cos(a); }, t0: 0, t1: 3.1416, n: 'r = 2cos θ',
           car: 'circunferencia de radio 1 centrada en (1, 0)  →  (x−1)² + y² = 1' },
  card:  { r: function (a) { return 1.4 * (1 + Math.cos(a)); }, t0: 0, t1: 6.2832, n: 'r = 1,4(1 + cos θ)',
           car: 'cardioide: r(0) = 2,8 y r(π) = 0' },
  rosa3: { r: function (a) { return 2.4 * Math.cos(3 * a); }, t0: 0, t1: 3.1416, n: 'r = 2,4cos 3θ',
           car: 'rosa de 3 pétalos  (n impar ⟹ n pétalos)' },
  rosa4: { r: function (a) { return 2.4 * Math.cos(2 * a); }, t0: 0, t1: 6.2832, n: 'r = 2,4cos 2θ',
           car: 'rosa de 4 pétalos  (n par ⟹ 2n pétalos)' },
  lima:  { r: function (a) { return 1 + 2 * Math.cos(a); }, t0: 0, t1: 6.2832, n: 'r = 1 + 2cos θ',
           car: 'limaçon con rizo interior: r &lt; 0 en θ ∈ (2π/3, 4π/3)' },
  espir: { r: function (a) { return 0.32 * a; }, t0: 0, t1: 12.566, n: 'r = 0,32 θ',
           car: 'espiral de Arquímedes' }
};

OVA.viz.registrar('polares', function (host) {
  var cfg = POLAR[ctrl(host, 'select').value] || POLAR.card;
  var frac = parseFloat(ctrl(host, '.tpol').value) / 100;
  var av = cfg.t0 + (cfg.t1 - cfg.t0) * frac;
  ctrl(host, '.a-val').textContent = 'θ = ' + av.toFixed(2) + ' rad';

  var L = OVA.lienzo(ctrl(host, 'canvas'), { sx: 44, sy: 44 });
  OVA.ejes(L);
  var c = L.ctx;

  // malla polar: circunferencias y radios
  c.strokeStyle = 'rgba(150,167,181,.35)'; c.lineWidth = 1;
  for (var rr = 1; rr <= 4; rr++) {
    c.beginPath(); c.arc(L.ox, L.oy, rr * L.sx, 0, 6.2832); c.stroke();
  }
  for (var k = 0; k < 12; k++) {
    var an = k * Math.PI / 6;
    c.beginPath(); c.moveTo(L.ox, L.oy);
    c.lineTo(L.px(4.3 * Math.cos(an)), L.py(4.3 * Math.sin(an))); c.stroke();
  }

  var trazo = function (a, b, color, ancho) {
    c.strokeStyle = color; c.lineWidth = ancho; c.lineJoin = 'round';
    c.beginPath();
    for (var i = 0; i <= 400; i++) {
      var th = a + (b - a) * i / 400, rv = cfg.r(th);
      var q = [L.px(rv * Math.cos(th)), L.py(rv * Math.sin(th))];
      i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]);
    }
    c.stroke();
  };
  trazo(cfg.t0, cfg.t1, 'rgba(150,167,181,.55)', 1.8);
  if (av > cfg.t0) trazo(cfg.t0, av, AZUL, 3.2);

  // el radio vector actual
  var rv = cfg.r(av), X = rv * Math.cos(av), Y = rv * Math.sin(av);
  var negativo = rv < 0;
  c.strokeStyle = negativo ? ROJO : ORO; c.lineWidth = 2.8;
  c.beginPath(); c.moveTo(L.ox, L.oy); c.lineTo(L.px(X), L.py(Y)); c.stroke();
  // dirección θ, aunque r sea negativo
  c.strokeStyle = 'rgba(150,167,181,.9)'; c.lineWidth = 1.4; c.setLineDash([5, 4]);
  c.beginPath(); c.moveTo(L.ox, L.oy);
  c.lineTo(L.px(4.2 * Math.cos(av)), L.py(4.2 * Math.sin(av))); c.stroke();
  c.setLineDash([]);
  OVA.punto(L, X, Y, negativo ? ROJO : ORO);

  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 12px ui-monospace,monospace';
  c.fillText(cfg.n, 10, 18);

  ctrl(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;·&nbsp; ' + cfg.car + '<br>' +
    'θ = ' + av.toFixed(3) + ' rad = ' + (av * 180 / Math.PI).toFixed(1) + '°' +
      ' &nbsp;·&nbsp; r = <strong style="color:' + (negativo ? '#f0a58a' : '#dba949') + '">' +
      rv.toFixed(3) + '</strong>' +
      ' &nbsp;·&nbsp; cartesianas (' + X.toFixed(3) + ', ' + Y.toFixed(3) + ')<br>' +
    (negativo
      ? '<strong style="color:#f0a58a">r es negativo:</strong> el punto se dibuja en el sentido ' +
        '<em>opuesto</em> a la dirección θ (línea punteada). Eso es lo que genera el rizo interior.'
      : '<span style="color:#8fb4d9">El radio dorado sigue la dirección punteada θ. ' +
        'Prueba el limaçon y observa qué pasa cuando r se vuelve negativo.</span>');
});

/* ══════ S03 · Curvas en el espacio · velocidad y aceleración ══════ */
var CUR3D = {
  helice: { r: function (t) { return [1.4 * Math.cos(t), 1.4 * Math.sin(t), t / 3]; },
            v: function (t) { return [-1.4 * Math.sin(t), 1.4 * Math.cos(t), 1 / 3]; },
            a: function (t) { return [-1.4 * Math.cos(t), -1.4 * Math.sin(t), 0]; },
            t0: 0, t1: 9.4248, n: 'r(t) = ⟨1,4cos t, 1,4sen t, t/3⟩',
            com: 'hélice circular: rapidez constante y a siempre perpendicular a v' },
  circ:   { r: function (t) { return [2 * Math.cos(t), 2 * Math.sin(t), 0]; },
            v: function (t) { return [-2 * Math.sin(t), 2 * Math.cos(t), 0]; },
            a: function (t) { return [-2 * Math.cos(t), -2 * Math.sin(t), 0]; },
            t0: 0, t1: 6.2832, n: 'r(t) = ⟨2cos t, 2sen t, 0⟩',
            com: 'circunferencia en el plano z = 0: la aceleración apunta al centro' },
  twist:  { r: function (t) { return [t, t * t, t * t * t / 3]; },
            v: function (t) { return [1, 2 * t, t * t]; },
            a: function (t) { return [0, 2, 2 * t]; },
            t0: -1.6, t1: 1.6, n: 'r(t) = ⟨t, t², t³/3⟩',
            com: 'cúbica alabeada: no cabe en ningún plano' },
  recta:  { r: function (t) { return [t, 0.6 * t, 0.4 * t]; },
            v: function (t) { return [1, 0.6, 0.4]; },
            a: function (t) { return [0, 0, 0]; },
            t0: -2, t1: 2.4, n: 'r(t) = ⟨t, 0,6t, 0,4t⟩',
            com: 'recta en el espacio: aceleración nula' },
  nudo:   { r: function (t) { return [Math.cos(t) * (2 + Math.cos(3 * t)) / 2,
                                      Math.sin(t) * (2 + Math.cos(3 * t)) / 2,
                                      Math.sin(3 * t) / 2]; },
            v: null, a: null, t0: 0, t1: 6.2832,
            n: 'curva cerrada en el espacio',
            com: 'gira la escena: el cruce aparente se deshace al cambiar el punto de vista' }
};

OVA.viz.registrar('curva3d', function (host) {
  var cfg = CUR3D[ctrl(host, 'select').value] || CUR3D.helice;
  var th = parseFloat(ctrl(host, '.giro').value) / 100;
  var frac = parseFloat(ctrl(host, '.tpos').value) / 100;
  var tv = cfg.t0 + (cfg.t1 - cfg.t0) * frac;
  ctrl(host, '.giro-val').textContent = 'θ = ' + th.toFixed(2);
  ctrl(host, '.t-val').textContent = 't = ' + tv.toFixed(2);

  var E = OVA.esc3d(host.querySelector('canvas'), { th: th, ph: 0.5 });

  // encuadre: curva + sombra + ejes + puntas de las flechas
  var pts = [], i;
  for (i = 0; i <= 120; i++) {
    var P = cfg.r(cfg.t0 + (cfg.t1 - cfg.t0) * i / 120);
    pts.push(P); pts.push([P[0], P[1], 0]);
  }
  [[1,0,0],[0,1,0],[0,0,1]].forEach(function (e) {
    pts.push([e[0]*2.5, e[1]*2.5, e[2]*2.5]);
    pts.push([-e[0]*1.1, -e[1]*1.1, -e[2]*1.1]);
  });
  var Pt = cfg.r(tv);
  if (cfg.v) {
    var V = cfg.v(tv), A = cfg.a(tv);
    pts.push([Pt[0]+V[0], Pt[1]+V[1], Pt[2]+V[2]]);
    pts.push([Pt[0]+A[0], Pt[1]+A[1], Pt[2]+A[2]]);
  }
  E.ajustar(pts);

  E.ejes(2.5);
  E.sombra(cfg.r, cfg.t0, cfg.t1);
  E.curva(cfg.r, cfg.t0, cfg.t1, AZUL, 3);
  E.segmento(Pt, [Pt[0], Pt[1], 0], 'rgba(150,167,181,.9)', [3, 4]);

  var lectura = '';
  if (cfg.v) {
    var V2 = cfg.v(tv), A2 = cfg.a(tv);
    E.flecha(Pt, [Pt[0]+V2[0], Pt[1]+V2[1], Pt[2]+V2[2]], ORO, 3, 'v');
    if (Math.hypot(A2[0], A2[1], A2[2]) > 1e-9)
      E.flecha(Pt, [Pt[0]+A2[0], Pt[1]+A2[1], Pt[2]+A2[2]], ROJO, 3, 'a');
    var rap = Math.hypot(V2[0], V2[1], V2[2]);
    var pun = V2[0]*A2[0] + V2[1]*A2[1] + V2[2]*A2[2];
    lectura =
      'r(t) = ⟨' + Pt.map(function (u) { return u.toFixed(2); }).join(', ') + '⟩<br>' +
      '<span style="color:#dba949">v = ⟨' + V2.map(function (u) { return u.toFixed(2); }).join(', ') +
        '⟩</span> &nbsp;·&nbsp; rapidez |v| = <strong>' + rap.toFixed(4) + '</strong><br>' +
      '<span style="color:#f0a58a">a = ⟨' + A2.map(function (u) { return u.toFixed(2); }).join(', ') +
        '⟩</span> &nbsp;·&nbsp; v·a = <strong>' + pun.toFixed(4) + '</strong>' +
        (Math.abs(pun) < 1e-9 ? ' <span style="color:#7fd4a4">(perpendiculares)</span>' : '') + '<br>';
  }
  E.punto(Pt, MORADO, 6);
  E.texto(cfg.n, 10, 18);

  ctrl(host, '.viz-readout').innerHTML = lectura +
    '<span style="color:#8fb4d9">' + cfg.com + '. La línea punteada baja al plano z = 0, ' +
    'donde la curva gris es su <em>sombra</em>: sirve para leer la profundidad. ' +
    'Gira la escena con el primer deslizador.</span>';
});

/* ══════ S03 · Movimiento de un proyectil ══════ */
OVA.viz.registrar('proyectil', function (host) {
  var v0 = parseFloat(ctrl(host, '.v0').value);
  var al = parseFloat(ctrl(host, '.ang').value) * Math.PI / 180;
  var frac = parseFloat(ctrl(host, '.tp').value) / 100;
  var g = 9.8;
  ctrl(host, '.v0-val').textContent = 'v₀ = ' + v0 + ' m/s';
  ctrl(host, '.ang-val').textContent = 'α = ' + (al * 180 / Math.PI).toFixed(0) + '°';

  var tf = 2 * v0 * Math.sin(al) / g;
  var tv = tf * frac;
  ctrl(host, '.t-val').textContent = 't = ' + tv.toFixed(2) + ' s';
  var X = function (t) { return v0 * Math.cos(al) * t; };
  var Y = function (t) { return v0 * Math.sin(al) * t - g * t * t / 2; };
  var alc = v0 * v0 * Math.sin(2 * al) / g;
  var hmax = Math.pow(v0 * Math.sin(al), 2) / (2 * g);

  var L = OVA.lienzo(ctrl(host, 'canvas'), { alto: 260 });
  var c = L.ctx, mI = 46, mD = 16, mA = 20, mB = 30;
  var W = L.w - mI - mD, H = L.h - mA - mB;
  var Xm = Math.max(alc, 1), Ym = Math.max(hmax, 1) * 1.25;
  var esc = Math.min(W / Xm, H / Ym);
  var PX = function (x) { return mI + x * esc; };
  var PY = function (y) { return mA + H - y * esc; };

  c.strokeStyle = OVA.color('cv-axis'); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(mI, mA); c.lineTo(mI, mA + H); c.lineTo(mI + W, mA + H); c.stroke();

  c.strokeStyle = 'rgba(150,167,181,.6)'; c.lineWidth = 1.8; c.beginPath();
  for (var i = 0; i <= 200; i++) { var t = tf * i / 200; i ? c.lineTo(PX(X(t)), PY(Y(t))) : c.moveTo(PX(X(t)), PY(Y(t))); }
  c.stroke();
  c.strokeStyle = AZUL; c.lineWidth = 3.2; c.beginPath();
  for (var j = 0; j <= 200; j++) { var t2 = tv * j / 200; j ? c.lineTo(PX(X(t2)), PY(Y(t2))) : c.moveTo(PX(X(t2)), PY(Y(t2))); }
  c.stroke();

  var vx = v0 * Math.cos(al), vy = v0 * Math.sin(al) - g * tv;
  var px = PX(X(tv)), py = PY(Y(tv)), k = 0.45 * esc / 1;
  [[vx * 0.35, vy * 0.35, ORO, 'v'], [0, -g * 0.35, ROJO, 'a']].forEach(function (F) {
    var bx = px + F[0] * esc * 0.9, by = py - F[1] * esc * 0.9;
    c.strokeStyle = F[2]; c.fillStyle = F[2]; c.lineWidth = 2.8;
    c.beginPath(); c.moveTo(px, py); c.lineTo(bx, by); c.stroke();
    var an = Math.atan2(by - py, bx - px);
    c.beginPath(); c.moveTo(bx, by);
    c.lineTo(bx - 9 * Math.cos(an - 0.4), by - 9 * Math.sin(an - 0.4));
    c.lineTo(bx - 9 * Math.cos(an + 0.4), by - 9 * Math.sin(an + 0.4));
    c.closePath(); c.fill();
    c.font = 'bold 12px ui-monospace,monospace';
    c.fillText(F[3], bx + 5, by - 4);
  });
  c.fillStyle = MORADO;
  c.beginPath(); c.arc(px, py, 6, 0, 6.2832); c.fill();
  c.fillStyle = OVA.color('cv-text'); c.font = '10px ui-monospace,monospace';
  c.fillText('0', mI - 8, mA + H + 14);
  c.fillText(alc.toFixed(1) + ' m', mI + W - 40, mA + H + 14);

  ctrl(host, '.viz-readout').innerHTML =
    'r(t) = ⟨' + X(tv).toFixed(2) + ', ' + Y(tv).toFixed(2) + '⟩ m &nbsp;·&nbsp; ' +
    '<span style="color:#dba949">v = ⟨' + vx.toFixed(2) + ', ' + vy.toFixed(2) + '⟩</span>' +
    ' &nbsp;·&nbsp; |v| = ' + Math.hypot(vx, vy).toFixed(2) + ' m/s<br>' +
    '<span style="color:#f0a58a">a = ⟨0, −9,8⟩ constante</span> &nbsp;·&nbsp; ' +
    'alcance = <strong>' + alc.toFixed(2) + ' m</strong> &nbsp;·&nbsp; altura máx = <strong>' +
    hmax.toFixed(2) + ' m</strong> &nbsp;·&nbsp; vuelo = ' + tf.toFixed(2) + ' s<br>' +
    '<span style="color:#8fb4d9">La componente horizontal de v <strong>nunca cambia</strong> ' +
    '(no hay fuerza horizontal); solo la vertical. Prueba α = 45°: da el alcance máximo, ' +
    'porque sen(2α) llega a 1.</span>';
});

/* ══════ S04 · Curvatura y triedro móvil ══════ */
var CURV = {
  helice: { r: function (t) { return [Math.cos(t), Math.sin(t), t / 2]; },
            t0: 0, t1: 9.4248, n: 'r(t) = ⟨cos t, sen t, t/2⟩',
            com: 'hélice: curvatura constante, como una circunferencia estirada' },
  circ:   { r: function (t) { return [1.8 * Math.cos(t), 1.8 * Math.sin(t), 0]; },
            t0: 0, t1: 6.2832, n: 'circunferencia de radio 1,8',
            com: 'κ = 1/a constante: el círculo osculador es la propia circunferencia' },
  parab:  { r: function (t) { return [t, t * t / 2, 0]; },
            t0: -2, t1: 2, n: 'r(t) = ⟨t, t²/2, 0⟩  (parábola)',
            com: 'curvatura máxima en el vértice y decreciente al alejarse' },
  recta:  { r: function (t) { return [t, 0.6 * t, 0.35 * t]; },
            t0: -2.2, t1: 2.2, n: 'recta en el espacio',
            com: 'κ = 0: una recta no se curva, y el círculo osculador tiene radio infinito' }
};

function derNum(r, t, k) {
  var d = 1e-4, A = r(t - d), B = r(t + d), C0 = r(t);
  if (k === 1) return [(B[0]-A[0])/(2*d), (B[1]-A[1])/(2*d), (B[2]-A[2])/(2*d)];
  return [(B[0]-2*C0[0]+A[0])/(d*d), (B[1]-2*C0[1]+A[1])/(d*d), (B[2]-2*C0[2]+A[2])/(d*d)];
}
function cruz(u, v) {
  return [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
}
function norma(u) { return Math.hypot(u[0], u[1], u[2]); }
function unit(u) { var n = norma(u); return n > 1e-12 ? [u[0]/n, u[1]/n, u[2]/n] : [0,0,0]; }

OVA.viz.registrar('curvatura', function (host) {
  var cfg = CURV[q(host, 'select').value] || CURV.helice;
  var th = parseFloat(q(host, '.giro').value) / 100;
  var frac = parseFloat(q(host, '.tpos').value) / 100;
  var tv = cfg.t0 + (cfg.t1 - cfg.t0) * frac;
  q(host, '.giro-val').textContent = 'θ = ' + th.toFixed(2);
  q(host, '.t-val').textContent = 't = ' + tv.toFixed(2);

  var P = cfg.r(tv), d1 = derNum(cfg.r, tv, 1), d2 = derNum(cfg.r, tv, 2);
  var T = unit(d1);
  var cr = cruz(d1, d2);
  var kap = norma(cr) / Math.pow(norma(d1), 3);
  var rho = kap > 1e-9 ? 1 / kap : Infinity;
  var B = unit(cr), N = unit(cruz(B, T));

  var E = OVA.esc3d(host.querySelector('canvas'), { th: th, ph: 0.5 });
  var pts = [];
  for (var i = 0; i <= 120; i++) {
    var Q = cfg.r(cfg.t0 + (cfg.t1 - cfg.t0) * i / 120);
    pts.push(Q); pts.push([Q[0], Q[1], 0]);
  }
  [[1,0,0],[0,1,0],[0,0,1]].forEach(function (e) {
    pts.push([e[0]*2.4, e[1]*2.4, e[2]*2.4]); pts.push([-e[0]*1.1, -e[1]*1.1, -e[2]*1.1]);
  });
  [T, N, B].forEach(function (u) { pts.push([P[0]+u[0], P[1]+u[1], P[2]+u[2]]); });
  if (isFinite(rho) && rho < 6) {
    var C1 = [P[0]+rho*N[0], P[1]+rho*N[1], P[2]+rho*N[2]];
    for (var s = 0; s <= 24; s++) {
      var an = 2*Math.PI*s/24;
      pts.push([C1[0]-rho*Math.cos(an)*N[0]+rho*Math.sin(an)*T[0],
                C1[1]-rho*Math.cos(an)*N[1]+rho*Math.sin(an)*T[1],
                C1[2]-rho*Math.cos(an)*N[2]+rho*Math.sin(an)*T[2]]);
    }
  }
  E.ajustar(pts, 0.88);
  E.ejes(2.4);
  E.sombra(cfg.r, cfg.t0, cfg.t1);

  // círculo osculador
  if (isFinite(rho) && rho < 6) {
    var C2 = [P[0]+rho*N[0], P[1]+rho*N[1], P[2]+rho*N[2]];
    E.curva(function (s) {
      return [C2[0]-rho*Math.cos(s)*N[0]+rho*Math.sin(s)*T[0],
              C2[1]-rho*Math.cos(s)*N[1]+rho*Math.sin(s)*T[1],
              C2[2]-rho*Math.cos(s)*N[2]+rho*Math.sin(s)*T[2]];
    }, 0, 6.2832, 'rgba(198,143,46,.75)', 2);
    E.punto(C2, 'rgba(198,143,46,.9)', 4);
  }
  E.curva(cfg.r, cfg.t0, cfg.t1, AZUL, 3);
  E.flecha(P, [P[0]+T[0], P[1]+T[1], P[2]+T[2]], ORO, 3, 'T');
  E.flecha(P, [P[0]+N[0], P[1]+N[1], P[2]+N[2]], ROJO, 3, 'N');
  E.flecha(P, [P[0]+B[0], P[1]+B[1], P[2]+B[2]], VERDE, 3, 'B');
  E.punto(P, MORADO, 6);
  E.texto(cfg.n, 10, 18);

  var tn = T[0]*N[0]+T[1]*N[1]+T[2]*N[2];
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;en t = ' + tv.toFixed(2) + '<br>' +
    'Curvatura κ = <strong style="color:#dba949">' + kap.toFixed(5) + '</strong>' +
      ' &nbsp;·&nbsp; radio de curvatura ρ = 1/κ = <strong>' +
      (isFinite(rho) ? rho.toFixed(4) : '∞') + '</strong><br>' +
    'Triedro: |T| = ' + norma(T).toFixed(4) + ', |N| = ' + norma(N).toFixed(4) +
      ', |B| = ' + norma(B).toFixed(4) + ' &nbsp;·&nbsp; T·N = ' + tn.toExponential(2) + '<br>' +
    '<span style="color:#8fb4d9">' + cfg.com + '. El círculo dorado es el <em>osculador</em>: ' +
    'la circunferencia que mejor imita la curva en ese punto. Cuanto más cerrada la curva, ' +
    'menor su radio. Gira la escena para ver que T, N y B son mutuamente perpendiculares.</span>';
});

/* ══════ S04 · Límite de un campo escalar: depende del camino ══════ */
var CAMPO = {
  diff: { f: function (x, y) { var d = x*x + y*y; return d < 1e-14 ? 0 : (x*x - y*y) / d; },
          n: 'f(x,y) = (x² − y²)/(x² + y²)',
          caminos: [['y = 0', function (s) { return [s, 0]; }, 1],
                    ['x = 0', function (s) { return [0, s]; }, -1],
                    ['y = x', function (s) { return [s, s]; }, 0]],
          existe: false,
          com: 'Tres caminos, tres límites distintos: 1, −1 y 0. El límite NO existe.' },
  prod: { f: function (x, y) { var d = x*x + y*y; return d < 1e-14 ? 0 : x*y / d; },
          n: 'f(x,y) = xy/(x² + y²)',
          caminos: [['y = 0', function (s) { return [s, 0]; }, 0],
                    ['y = x', function (s) { return [s, s]; }, 0.5],
                    ['y = −x', function (s) { return [s, -s]; }, -0.5]],
          existe: false,
          com: 'Por los ejes da 0, pero por y = x da 1/2. El límite NO existe.' },
  ok:   { f: function (x, y) { var d = x*x + y*y; return d < 1e-14 ? 0 : x*x*y / d; },
          n: 'f(x,y) = x²y/(x² + y²)',
          caminos: [['y = 0', function (s) { return [s, 0]; }, 0],
                    ['x = 0', function (s) { return [0, s]; }, 0],
                    ['y = x', function (s) { return [s, s]; }, 0]],
          existe: true,
          com: 'Aquí SÍ existe y vale 0, pero probar caminos no lo demuestra: hace falta acotar.' }
};

OVA.viz.registrar('campoescalar', function (host) {
  var cfg = CAMPO[q(host, 'select').value] || CAMPO.diff;
  var th = parseFloat(q(host, '.giro').value) / 100;
  q(host, '.giro-val').textContent = 'θ = ' + th.toFixed(2);

  var E = OVA.esc3d(host.querySelector('canvas'), { th: th, ph: 0.5 });
  var pts = E.puntosSuperficie(cfg.f, -1.5, 1.5, -1.5, 1.5, 10);
  [[1,0,0],[0,1,0],[0,0,1]].forEach(function (e) {
    pts.push([e[0]*2, e[1]*2, e[2]*2]); pts.push([-e[0]*1.8, -e[1]*1.8, -e[2]*1.8]);
  });
  E.ajustar(pts, 0.86);
  E.ejes(2, 1.8);
  E.superficie(cfg.f, -1.5, 1.5, -1.5, 1.5, { n: 20, alfa: 0.92 });

  var cols = [ORO, ROJO, VERDE];
  cfg.caminos.forEach(function (cm, i) {
    E.curva(function (s) {
      var p = cm[1](s);
      return [p[0], p[1], cfg.f(p[0], p[1])];
    }, 0.02, 1.45, cols[i], 3.2);
  });
  E.punto([0, 0, 0], MORADO, 6);
  E.texto(cfg.n, 10, 18);

  var filas = cfg.caminos.map(function (cm, i) {
    var p = cm[1](1e-4);
    return '<span style="color:' + ['#dba949','#f0a58a','#7fd4a4'][i] + '">■ por ' + cm[0] +
      '</span>: f → <strong>' + cfg.f(p[0], p[1]).toFixed(4) + '</strong>';
  }).join(' &nbsp;·&nbsp; ');

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> &nbsp;cuando (x,y) → (0,0)<br>' + filas + '<br>' +
    (cfg.existe
      ? '<strong style="color:#7fd4a4">Los tres coinciden.</strong> '
      : '<strong style="color:#f0a58a">No coinciden ⟹ el límite no existe.</strong> ') +
    cfg.com +
    '<br><span style="color:#8fb4d9">En una variable solo había dos caminos, izquierda y derecha. ' +
    'En dos variables hay <em>infinitos</em>, y el límite debe dar lo mismo por todos. Por eso ' +
    'encontrar dos caminos discrepantes basta para negar, pero ninguna cantidad de caminos ' +
    'coincidentes basta para afirmar.</span>';
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});

/* ══════════ S06 · Derivadas parciales: cortes de la superficie ══════════ */
var PARCIAL = {
  parab: { f: function (x, y) { return x*x + y*y; },
           fx: function (x, y) { return 2*x; }, fy: function (x, y) { return 2*y; },
           n: 'f(x,y) = x² + y²', nfx: 'f_x = 2x', nfy: 'f_y = 2y' },
  sillabaja: { f: function (x, y) { return x*x - y*y; },
           fx: function (x, y) { return 2*x; }, fy: function (x, y) { return -2*y; },
           n: 'f(x,y) = x² − y²', nfx: 'f_x = 2x', nfy: 'f_y = −2y' },
  prod: { f: function (x, y) { return x*y; },
           fx: function (x, y) { return y; }, fy: function (x, y) { return x; },
           n: 'f(x,y) = x·y', nfx: 'f_x = y', nfy: 'f_y = x' }
};

OVA.viz.registrar('parciales', function (host) {
  var cfg = PARCIAL[q(host, 'select').value] || PARCIAL.parab;
  var a = parseFloat(q(host, '.px').value) / 10;
  var b = parseFloat(q(host, '.py').value) / 10;
  q(host, '.p-val').textContent = '(' + a.toFixed(1) + ', ' + b.toFixed(1) + ')';

  var E = OVA.esc3d(q(host, 'canvas'), { th: 0.9, ph: 0.45, alto: 340 });
  E.ajustar(E.puntosSuperficie(cfg.f, -2, 2, -2, 2, 8).concat([[0,0,0],[0,0,4]]));
  E.ejes(2.2);
  E.superficie(cfg.f, -2, 2, -2, 2, { n: 14, alfa: 0.5 });

  // traza en y=b (varía x): pendiente = f_x
  E.curva(function (x) { return [x, b, cfg.f(x, b)]; }, -2, 2, ROJO, 3);
  // traza en x=a (varía y): pendiente = f_y
  E.curva(function (y) { return [a, y, cfg.f(a, y)]; }, -2, 2, VERDE, 3);
  E.punto([a, b, cfg.f(a, b)], ORO, 6);

  var fxv = cfg.fx(a, b), fyv = cfg.fy(a, b);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · las derivadas parciales son las pendientes de los dos ' +
    'cortes en el punto (' + a.toFixed(1) + ', ' + b.toFixed(1) + ').<br>' +
    '<span style="color:#b0392c">Corte rojo (y = ' + b.toFixed(1) + ' fijo, varía x):</span> ' +
    'pendiente <strong>' + cfg.nfx + ' = ' + fxv.toFixed(2) + '</strong>.<br>' +
    '<span style="color:#1c7a4c">Corte verde (x = ' + a.toFixed(1) + ' fijo, varía y):</span> ' +
    'pendiente <strong>' + cfg.nfy + ' = ' + fyv.toFixed(2) + '</strong>.<br>' +
    '<span style="color:#8fb4d9">Cada parcial mide cómo cambia f al mover solo una variable, ' +
    'dejando la otra congelada. Son las pendientes de esas dos curvas de corte.</span>';
});

/* ══════════ S07 · Plano tangente a una superficie ══════════ */
var TANGENTE = {
  parab: { f: function (x, y) { return x*x + y*y; },
           fx: function (x, y) { return 2*x; }, fy: function (x, y) { return 2*y; },
           n: 'z = x² + y²' },
  domo: { f: function (x, y) { return 4 - x*x - y*y; },
           fx: function (x, y) { return -2*x; }, fy: function (x, y) { return -2*y; },
           n: 'z = 4 − x² − y²' },
  ondas: { f: function (x, y) { return 0.6*(x*x - y*y); },
           fx: function (x, y) { return 1.2*x; }, fy: function (x, y) { return -1.2*y; },
           n: 'z = 0.6(x² − y²)' }
};

OVA.viz.registrar('planotangente', function (host) {
  var cfg = TANGENTE[q(host, 'select').value] || TANGENTE.parab;
  var a = parseFloat(q(host, '.px').value) / 10;
  var b = parseFloat(q(host, '.py').value) / 10;
  q(host, '.p-val').textContent = '(' + a.toFixed(1) + ', ' + b.toFixed(1) + ')';

  var z0 = cfg.f(a, b), fxv = cfg.fx(a, b), fyv = cfg.fy(a, b);
  // plano tangente: z = z0 + fx(x-a) + fy(y-b)
  var plano = function (x, y) { return z0 + fxv*(x - a) + fyv*(y - b); };

  var E = OVA.esc3d(q(host, 'canvas'), { th: 0.85, ph: 0.5, alto: 340 });
  E.ajustar(E.puntosSuperficie(cfg.f, -2, 2, -2, 2, 8));
  E.ejes(2.2);
  E.superficie(cfg.f, -2, 2, -2, 2, { n: 14, alfa: 0.45 });
  // plano tangente (pequeño, alrededor del punto)
  E.superficie(plano, a - 1, a + 1, b - 1, b + 1, { n: 6, alfa: 0.4 });
  E.punto([a, b, z0], ROJO, 6);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · el plano tangente en (' + a.toFixed(1) + ', ' + b.toFixed(1) +
    ') toca la superficie sin atravesarla localmente.<br>' +
    'Ecuación: <strong>z = ' + z0.toFixed(2) + ' + (' + fxv.toFixed(2) + ')(x − ' + a.toFixed(1) +
    ') + (' + fyv.toFixed(2) + ')(y − ' + b.toFixed(1) + ')</strong><br>' +
    '<span style="color:#8fb4d9">Las pendientes del plano en las direcciones x e y son ' +
    'exactamente las derivadas parciales f_x = ' + fxv.toFixed(2) + ' y f_y = ' + fyv.toFixed(2) +
    '. El vector (f_x, f_y, −1) = (' + fxv.toFixed(1) + ', ' + fyv.toFixed(1) + ', −1) es normal ' +
    'a la superficie ahí.</span>';
});

/* ══════════ S08 · Extremos: mínimo, máximo o silla ══════════ */
var EXTREMO = {
  minimo: { f: function (x, y) { return x*x + y*y; },
            cx: 0, cy: 0, D: 4, fxx: 2, tipo: 'mínimo',
            n: 'f = x² + y²', desc: 'D = 4 > 0 y f_xx = 2 > 0' },
  maximo: { f: function (x, y) { return 4 - x*x - y*y; },
            cx: 0, cy: 0, D: 4, fxx: -2, tipo: 'máximo',
            n: 'f = 4 − x² − y²', desc: 'D = 4 > 0 y f_xx = −2 < 0' },
  silla:  { f: function (x, y) { return x*x - y*y; },
            cx: 0, cy: 0, D: -4, fxx: 2, tipo: 'punto de silla',
            n: 'f = x² − y²', desc: 'D = −4 < 0' }
};

OVA.viz.registrar('extremos', function (host) {
  var cfg = EXTREMO[q(host, 'select').value] || EXTREMO.minimo;
  var th = parseFloat(q(host, '.giro').value) / 100;
  q(host, '.giro-val').textContent = 'θ = ' + th.toFixed(2);

  var E = OVA.esc3d(q(host, 'canvas'), { th: th, ph: 0.5, alto: 340 });
  E.ajustar(E.puntosSuperficie(cfg.f, -2, 2, -2, 2, 8));
  E.ejes(2.2);
  E.superficie(cfg.f, -2, 2, -2, 2, { n: 16, alfa: 0.55 });
  E.punto([cfg.cx, cfg.cy, cfg.f(cfg.cx, cfg.cy)], MORADO, 7);

  var col = cfg.tipo === 'punto de silla' ? '#7d4f9e' : (cfg.tipo === 'máximo' ? '#b0392c' : '#1c7a4c');
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · punto crítico en (' + cfg.cx + ', ' + cfg.cy +
    ') donde ∇f = 0.<br>' +
    'Criterio del Hessiano: D = f_xx·f_yy − (f_xy)². Aquí <strong>' + cfg.desc + '</strong> → ' +
    '<strong style="color:' + col + '">' + cfg.tipo + '</strong>.<br>' +
    '<span style="color:#8fb4d9">Si D &gt; 0: es máximo (f_xx &lt; 0) o mínimo (f_xx &gt; 0). ' +
    'Si D &lt; 0: es un punto de silla, que sube en una dirección y baja en otra —ni máximo ni ' +
    'mínimo—. Gira la superficie para verlo.</span>';
});

/* ══════════ S09 · Integral doble: región y volumen ══════════ */
var REGION = {
  triang: { n: 'entre y = x² y y = x', ylo: function (x) { return x*x; },
            yhi: function (x) { return x; }, x0: 0, x1: 1, area: 1/6, narea: '1/6' },
  cuadr:  { n: 'rectángulo [0,1]×[0,1]', ylo: function (x) { return 0; },
            yhi: function (x) { return 1; }, x0: 0, x1: 1, area: 1, narea: '1' },
  bajocurva: { n: 'bajo y = 1 − x²', ylo: function (x) { return 0; },
            yhi: function (x) { return 1 - x*x; }, x0: 0, x1: 1, area: 2/3, narea: '2/3' }
};

OVA.viz.registrar('integraldoble', function (host) {
  var cfg = REGION[q(host, 'select').value] || REGION.triang;
  var nfranjas = Math.round(parseFloat(q(host, '.franjas').value));
  q(host, '.franjas-val').textContent = nfranjas + ' franjas';

  var L = OVA.lienzo(q(host, 'canvas'), { alto: 320 });
  L.ox = 50; L.oy = L.h - 40; L.sx = (L.w - 80) / 1.25; L.sy = (L.h - 70) / 1.25;
  OVA.ejes(L);
  var c = L.ctx;

  // franjas verticales (suma de Riemann de la integral iterada)
  var dx = (cfg.x1 - cfg.x0) / nfranjas, i;
  for (i = 0; i < nfranjas; i++) {
    var xm = cfg.x0 + (i + 0.5) * dx;
    var ylo = cfg.ylo(xm), yhi = cfg.yhi(xm);
    c.fillStyle = 'rgba(58,110,165,.28)';
    c.strokeStyle = 'rgba(58,110,165,.6)'; c.lineWidth = 1;
    var px = L.px(cfg.x0 + i * dx), pw = dx * L.sx;
    c.fillRect(px, L.py(yhi), pw, (yhi - ylo) * L.sy);
    c.strokeRect(px, L.py(yhi), pw, (yhi - ylo) * L.sy);
  }
  // curvas frontera
  OVA.curva(L, function (x) { return (x >= cfg.x0 && x <= cfg.x1) ? cfg.yhi(x) : NaN; }, ROJO, 2.5);
  OVA.curva(L, function (x) { return (x >= cfg.x0 && x <= cfg.x1) ? cfg.ylo(x) : NaN; }, VERDE, 2.5);

  // área aproximada
  var aprox = 0;
  for (i = 0; i < nfranjas; i++) {
    var xmi = cfg.x0 + (i + 0.5) * dx;
    aprox += (cfg.yhi(xmi) - cfg.ylo(xmi)) * dx;
  }

  q(host, '.viz-readout').innerHTML =
    '<strong>Región ' + cfg.n + '</strong> · una integral doble suma f(x,y) sobre toda esta región.<br>' +
    'El área es ∫∫ 1 dA = <strong>' + cfg.narea + ' ≈ ' + cfg.area.toFixed(4) + '</strong>. Con ' +
    nfranjas + ' franjas la suma de Riemann da ≈ <strong>' + aprox.toFixed(4) + '</strong>.<br>' +
    '<span style="color:#8fb4d9">La integral iterada barre primero en y (de la curva ' +
    '<span style="color:#1c7a4c">verde</span> a la <span style="color:#b0392c">roja</span>, ' +
    'cada franja) y luego suma todas las franjas en x. Más franjas → mejor aproximación.</span>';
});

/* ══════════════════════════════════════════════════════════
   CORTE III · S11–S14
   regionpolar · areasuperficie (S11) · solido3d · coordenadas3d (S12)
   jacobiano · centromasa (S13) · campovec (S14)
   ══════════════════════════════════════════════════════════ */

/* Lienzo 2D con rango a medida (misma idea que en viz-calculo). */
function marco2(cv, alto, xmin, xmax, ymin, ymax) {
  var L = OVA.lienzo(cv, { alto: alto });
  var padL = 40, padR = 14, padT = 14, padB = 24;
  var sx = (L.w - padL - padR) / (xmax - xmin), sy = (L.h - padT - padB) / (ymax - ymin);
  var s = Math.min(sx, sy);                      // misma escala en x e y (ángulos fieles)
  L.sx = s; L.sy = s;
  L.ox = padL + ((L.w - padL - padR) - s * (xmax - xmin)) / 2 - xmin * s;
  L.oy = padT + ((L.h - padT - padB) - s * (ymax - ymin)) / 2 + ymax * s;
  L.xmin = xmin; L.xmax = xmax; L.ymin = ymin; L.ymax = ymax;
  return L;
}
function ejes2(L, paso) {
  var c = L.ctx, grid = OVA.color('cv-grid'), axis = OVA.color('cv-axis'), txt = OVA.color('cv-text'), v, p;
  c.strokeStyle = grid; c.lineWidth = 1; c.fillStyle = txt; c.font = '10px ui-monospace,monospace';
  for (v = Math.ceil(L.xmin / paso) * paso; v <= L.xmax + 1e-9; v += paso) {
    p = L.px(v); c.beginPath(); c.moveTo(p, L.py(L.ymin)); c.lineTo(p, L.py(L.ymax)); c.stroke();
    if (Math.abs(v) > 1e-9) c.fillText(String(Math.round(v * 100) / 100), p - 6, L.py(L.ymin) + 13);
  }
  for (v = Math.ceil(L.ymin / paso) * paso; v <= L.ymax + 1e-9; v += paso) {
    p = L.py(v); c.beginPath(); c.moveTo(L.px(L.xmin), p); c.lineTo(L.px(L.xmax), p); c.stroke();
    if (Math.abs(v) > 1e-9) c.fillText(String(Math.round(v * 100) / 100), L.px(L.xmin) - 26, p + 3);
  }
  c.strokeStyle = axis; c.lineWidth = 1.6;
  var yA = Math.min(Math.max(0, L.ymin), L.ymax), xA = Math.min(Math.max(0, L.xmin), L.xmax);
  c.beginPath(); c.moveTo(L.px(L.xmin), L.py(yA)); c.lineTo(L.px(L.xmax), L.py(yA)); c.stroke();
  c.beginPath(); c.moveTo(L.px(xA), L.py(L.ymin)); c.lineTo(L.px(xA), L.py(L.ymax)); c.stroke();
}
function f3(v) { return (Math.round(v * 1000) / 1000).toFixed(3); }
function f2(v) { return (Math.round(v * 100) / 100).toFixed(2); }

/* Superficie paramétrica r(u,v) por el algoritmo del pintor (la del motor
   solo acepta z = f(x,y)). rgb = [R,G,B] base; sombreado por altura.  */
function supParam(E, fn, u0, u1, v0, v1, n, rgb, alfa) {
  var c = E.ctx, quads = [], i, j;
  for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
    var a = u0 + (u1 - u0) * i / n, b = u0 + (u1 - u0) * (i + 1) / n;
    var p = v0 + (v1 - v0) * j / n, q2 = v0 + (v1 - v0) * (j + 1) / n;
    var e = [fn(a, p), fn(b, p), fn(b, q2), fn(a, q2)], zc = 0, cen = [0, 0, 0], k;
    for (k = 0; k < 4; k++) { cen[0] += e[k][0] / 4; cen[1] += e[k][1] / 4; cen[2] += e[k][2] / 4; }
    quads.push({ d: E.prof(cen), e: e, z: cen[2] });
  }
  quads.sort(function (p, q) { return p.d - q.d; });
  var zs = quads.map(function (q) { return q.z; }), zmin = Math.min.apply(null, zs), zmax = Math.max.apply(null, zs);
  var oscuro = document.body.classList.contains('dark');
  quads.forEach(function (q) {
    var t = 0.55 + 0.45 * (q.z - zmin) / Math.max(zmax - zmin, 1e-9);
    c.fillStyle = 'rgba(' + (rgb[0] * t | 0) + ',' + (rgb[1] * t | 0) + ',' + (rgb[2] * t | 0) + ',' + alfa + ')';
    c.strokeStyle = oscuro ? 'rgba(20,40,60,.4)' : 'rgba(255,255,255,.4)'; c.lineWidth = 0.6;
    c.beginPath();
    for (var k = 0; k < 4; k++) { var pp = E.p(q.e[k]); k ? c.lineTo(pp[0], pp[1]) : c.moveTo(pp[0], pp[1]); }
    c.closePath(); c.fill(); c.stroke();
  });
}
function puntosParam(fn, u0, u1, v0, v1, n) {
  var pts = [], i, j;
  for (i = 0; i <= n; i++) for (j = 0; j <= n; j++) pts.push(fn(u0 + (u1 - u0) * i / n, v0 + (v1 - v0) * j / n));
  return pts;
}
/* Simpson 2D en coordenadas (u,v) rectangulares */
function simpson2(f, u0, u1, v0, v1, n) {
  n = n || 60; var hu = (u1 - u0) / n, hv = (v1 - v0) / n, s = 0, i, j;
  for (i = 0; i <= n; i++) for (j = 0; j <= n; j++) {
    var wi = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2), wj = (j === 0 || j === n) ? 1 : (j % 2 ? 4 : 2);
    s += wi * wj * f(u0 + i * hu, v0 + j * hv);
  }
  return s * hu * hv / 9;
}
function simpson1(f, a, b, n) {
  n = n || 400; var h = (b - a) / n, s = f(a) + f(b), i;
  for (i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}

/* ══════════ S11 · Región polar: celdas r·Δr·Δθ ══════════ */
var RPOL = {
  disco:  { n: 'disco r ≤ 3/2', rmax: function (t) { return 1.5; }, rmin: function (t) { return 0; }, t0: 0, t1: 2 * Math.PI, ex: 2.25 * Math.PI, sEx: '9π/4', int: '∫₀^{2π}∫₀^{3/2} r dr dθ' },
  anillo: { n: 'anillo 1 ≤ r ≤ 2', rmax: function (t) { return 2; }, rmin: function (t) { return 1; }, t0: 0, t1: 2 * Math.PI, ex: 3 * Math.PI, sEx: '3π', int: '∫₀^{2π}∫₁² r dr dθ' },
  sector: { n: 'sector r ≤ 3/2, 0 ≤ θ ≤ π/2', rmax: function (t) { return 1.5; }, rmin: function (t) { return 0; }, t0: 0, t1: Math.PI / 2, ex: 9 * Math.PI / 16, sEx: '9π/16', int: '∫₀^{π/2}∫₀^{3/2} r dr dθ' },
  cardio: { n: 'cardioide r ≤ 1 + cos θ', rmax: function (t) { return 1 + Math.cos(t); }, rmin: function (t) { return 0; }, t0: 0, t1: 2 * Math.PI, ex: 1.5 * Math.PI, sEx: '3π/2', int: '∫₀^{2π}∫₀^{1+cosθ} r dr dθ' }
};

OVA.viz.registrar('regionpolar', function (host) {
  var cfg = RPOL[q(host, 'select').value] || RPOL.disco;
  var n = parseInt(q(host, '.n').value, 10);
  var sinR = q(host, '.factor').value === 'sin';
  q(host, '.n-val').textContent = n + ' × ' + n + ' celdas';

  var L = marco2(q(host, 'canvas'), 330, -2.3, 2.3, -2.3, 2.3);
  ejes2(L, 1);
  var c = L.ctx, dt = (cfg.t0 === 0 && cfg.t1 > 6) ? 2 * Math.PI / n : (cfg.t1 - cfg.t0) / n;
  var Rm = 2, dr = Rm / n, suma = 0, i, j;
  for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
    var r0 = i * dr, r1 = r0 + dr, a0 = cfg.t0 + j * dt, a1 = a0 + dt;
    var rm = (r0 + r1) / 2, am = (a0 + a1) / 2;
    if (rm < cfg.rmin(am) || rm > cfg.rmax(am)) continue;
    suma += (sinR ? 1 : rm) * dr * dt;
    c.fillStyle = 'rgba(198,143,46,.35)'; c.strokeStyle = 'rgba(198,143,46,.8)'; c.lineWidth = 0.7;
    c.beginPath();
    c.arc(L.ox, L.oy, r1 * L.sx, -a1, -a0);
    c.arc(L.ox, L.oy, r0 * L.sx, -a0, -a1, true);
    c.closePath(); c.fill(); c.stroke();
  }
  // frontera
  c.strokeStyle = AZUL; c.lineWidth = 2.6; c.beginPath();
  for (i = 0; i <= 300; i++) { var t = cfg.t0 + (cfg.t1 - cfg.t0) * i / 300, rr = cfg.rmax(t); i ? c.lineTo(L.px(rr * Math.cos(t)), L.py(rr * Math.sin(t))) : c.moveTo(L.px(rr * Math.cos(t)), L.py(rr * Math.sin(t))); }
  c.stroke();
  if (cfg.rmin(0) > 0) { c.beginPath(); c.arc(L.ox, L.oy, cfg.rmin(0) * L.sx, 0, 2 * Math.PI); c.stroke(); }
  if (cfg.t1 - cfg.t0 < 6) { var rb = cfg.rmax(cfg.t0); c.beginPath(); c.moveTo(L.ox, L.oy); c.lineTo(L.px(rb * Math.cos(cfg.t0)), L.py(rb * Math.sin(cfg.t0))); c.moveTo(L.ox, L.oy); c.lineTo(L.px(rb * Math.cos(cfg.t1)), L.py(rb * Math.sin(cfg.t1))); c.stroke(); }

  q(host, '.viz-readout').innerHTML =
    '<strong>Región: ' + cfg.n + '</strong> · área exacta = ' + cfg.int + ' = <strong>' + cfg.sEx + ' ≈ ' + f3(cfg.ex) + '</strong><br>' +
    'Suma de ' + n + '×' + n + ' celdas polares con ' + (sinR ? '<strong style="color:#b0392c">Δr·Δθ (sin el factor r)</strong>' : '<strong style="color:#c68f2e">r·Δr·Δθ</strong>') +
    ': <strong>' + f3(suma) + '</strong>' + (sinR ? ' — no converge al área: una celda lejos del origen es más ancha que una cercana.' : ' — converge al área exacta al aumentar n.') + '<br>' +
    '<span style="color:#8fb4d9">Una celda polar es casi un rectángulo de lados Δr y r·Δθ (el arco). Por eso dA = r dr dθ: el factor r mide cuánto se estira el arco al alejarse del origen.</span>';
});

/* ══════════ S11 · Área de una superficie z = f(x,y) ══════════ */
var ASUP = {
  plano: { f: function (x, y) { return 0.5 * x + 0.5 * y + 0.5; }, fx: function () { return 0.5; }, fy: function () { return 0.5; },
           n: 'z = (x + y + 1)/2 sobre el disco r ≤ 1', S: Math.sqrt(1.5) * Math.PI, sS: '√(3/2)·π ≈ 3.848', fac: '√(1 + ¼ + ¼) = √(3/2) constante: S = √(3/2)·π' },
  parab: { f: function (x, y) { return x * x + y * y; }, fx: function (x) { return 2 * x; }, fy: function (x, y) { return 2 * y; },
           n: 'z = x² + y² sobre el disco r ≤ 1', S: Math.PI / 6 * (5 * Math.sqrt(5) - 1), sS: '(π/6)(5√5 − 1) ≈ 5.330', fac: '√(1 + 4x² + 4y²) = √(1 + 4r²): en polares, 2π∫₀¹ √(1+4r²) r dr' },
  hemi:  { f: function (x, y) { var s = 1 - x * x - y * y; return s > 0 ? Math.sqrt(s) : 0; }, fx: function (x, y) { var s = 1 - x * x - y * y; return s > 1e-6 ? -x / Math.sqrt(s) : NaN; }, fy: function (x, y) { var s = 1 - x * x - y * y; return s > 1e-6 ? -y / Math.sqrt(s) : NaN; },
           n: 'z = √(1 − x² − y²) (hemisferio) sobre r ≤ 1', S: 2 * Math.PI, sS: '2π ≈ 6.283', fac: '√(1 + fx² + fy²) = 1/√(1 − r²): crece hacia el borde, donde la superficie es vertical; con r = sen u la integral 2π∫₀¹ r/√(1−r²) dr se vuelve 2π∫₀^{π/2} sen u du = 2π',
           num: function () { return 2 * Math.PI * simpson1(Math.sin, 0, Math.PI / 2, 200); } }
};

OVA.viz.registrar('areasuperficie', function (host) {
  var cfg = ASUP[q(host, 'select').value] || ASUP.parab;
  var th = parseFloat(q(host, '.giro').value) / 100;
  var rr = 0.6, aa = 0.8;   // punto de muestra
  q(host, '.giro-val').textContent = 'θ = ' + th.toFixed(2);

  var E = OVA.esc3d(q(host, 'canvas'), { th: th, ph: 0.5, alto: 340 });
  var sup = function (r, t) { var x = r * Math.cos(t), y = r * Math.sin(t); return [x, y, cfg.f(x, y)]; };
  E.ajustar(puntosParam(sup, 0, 1, 0, 2 * Math.PI, 8).concat([[0, 0, 0], [1.3, 0, 0], [0, 1.3, 0], [0, 0, 1.3]]));
  E.ejes(1.3);
  // disco base (región R) en el plano z=0
  E.ctx.setLineDash([3, 4]); E.curva(function (t) { return [Math.cos(t), Math.sin(t), 0]; }, 0, 2 * Math.PI, 'rgba(150,167,181,.9)', 1.3); E.ctx.setLineDash([]);
  supParam(E, sup, 0, 1, 0, 2 * Math.PI, 18, [78, 122, 184], 0.55);
  // parche dA y su imagen dS
  var x0 = rr * Math.cos(aa), y0 = rr * Math.sin(aa), d = 0.12;
  var esq = [[x0 - d, y0 - d], [x0 + d, y0 - d], [x0 + d, y0 + d], [x0 - d, y0 + d]], k, p;
  E.ctx.fillStyle = 'rgba(176,57,44,.55)'; E.ctx.beginPath();
  for (k = 0; k < 4; k++) { p = E.p([esq[k][0], esq[k][1], 0]); k ? E.ctx.lineTo(p[0], p[1]) : E.ctx.moveTo(p[0], p[1]); }
  E.ctx.closePath(); E.ctx.fill();
  E.ctx.fillStyle = 'rgba(198,143,46,.85)'; E.ctx.beginPath();
  for (k = 0; k < 4; k++) { p = E.p([esq[k][0], esq[k][1], cfg.f(esq[k][0], esq[k][1])]); k ? E.ctx.lineTo(p[0], p[1]) : E.ctx.moveTo(p[0], p[1]); }
  E.ctx.closePath(); E.ctx.fill();
  for (k = 0; k < 4; k++) E.segmento([esq[k][0], esq[k][1], 0], [esq[k][0], esq[k][1], cfg.f(esq[k][0], esq[k][1])], 'rgba(150,167,181,.6)', [2, 3]);

  var fxv = cfg.fx(x0, y0), fyv = cfg.fy(x0, y0), fac = Math.sqrt(1 + fxv * fxv + fyv * fyv);
  var Snum = cfg.num ? cfg.num() : simpson2(function (r, t) { var x = r * Math.cos(t), y = r * Math.sin(t); var a = cfg.fx(x, y), b = cfg.fy(x, y); return Math.sqrt(1 + a * a + b * b) * r; }, 0, 1, 0, 2 * Math.PI, 120);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · S = ∬_R √(1 + f_x² + f_y²) dA = <strong>' + cfg.sS + '</strong>' +
    ' (numérico ' + f3(Snum) + ')<br>' +
    'En el punto rojo (r = ' + rr + '): f_x = ' + f2(fxv) + ', f_y = ' + f2(fyv) + ' → el parche <span style="color:#e08b7e">dA</span> del plano se convierte en un parche ' +
    '<span style="color:#c68f2e">dS</span> de la superficie <strong>' + f3(fac) + '</strong> veces más grande.<br>' +
    '<span style="color:#8fb4d9">' + cfg.fac + '. Cuanto más inclinada está la superficie, mayor es el factor.</span>';
});

/* ══════════ S12 · Sólidos de integrales triples ══════════ */
var SOL3 = {
  caja:  { n: 'caja [0,1]×[0,2]×[0,3]', V: 6, sV: '6', int: '∫₀¹∫₀²∫₀³ dz dy dx', sis: 'cartesianas',
           dib: function (E) { caja(E, 0, 1, 0, 2, 0, 3); }, pts: [[0, 0, 0], [1, 2, 3]] },
  tetra: { n: 'tetraedro x + y + z ≤ 1 (primer octante)', V: 1 / 6, sV: '1/6', int: '∫₀¹∫₀^{1−x}∫₀^{1−x−y} dz dy dx', sis: 'cartesianas',
           dib: function (E) { supParam(E, function (u, v) { return [u, v * (1 - u), (1 - u) * (1 - v)]; }, 0, 1, 0, 1, 10, [78, 122, 184], 0.6); cara(E, [[0, 0, 0], [1, 0, 0], [0, 1, 0]], 'rgba(198,143,46,.35)'); }, pts: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  parab: { n: 'entre z = x² + y² y z = 4', V: 8 * Math.PI, sV: '8π', int: '∫₀^{2π}∫₀²∫_{r²}^{4} r dz dr dθ', sis: 'cilíndricas',
           dib: function (E) { supParam(E, function (r, t) { return [r * Math.cos(t), r * Math.sin(t), r * r]; }, 0, 2, 0, 2 * Math.PI, 18, [78, 122, 184], 0.6); supParam(E, function (r, t) { return [r * Math.cos(t), r * Math.sin(t), 4]; }, 0, 2, 0, 2 * Math.PI, 10, [198, 143, 46], 0.35); }, pts: [[-2, -2, 0], [2, 2, 4]] },
  esfera:{ n: 'esfera ρ ≤ 1', V: 4 * Math.PI / 3, sV: '4π/3', int: '∫₀^{2π}∫₀^{π}∫₀¹ ρ² sen φ dρ dφ dθ', sis: 'esféricas',
           dib: function (E) { supParam(E, function (p, t) { return [Math.sin(p) * Math.cos(t), Math.sin(p) * Math.sin(t), Math.cos(p)]; }, 0, Math.PI, 0, 2 * Math.PI, 18, [78, 122, 184], 0.6); }, pts: [[-1, -1, -1], [1, 1, 1]] },
  cono:  { n: 'cono de helado: ρ ≤ 1, 0 ≤ φ ≤ π/3', V: Math.PI / 3, sV: 'π/3', int: '∫₀^{2π}∫₀^{π/3}∫₀¹ ρ² sen φ dρ dφ dθ', sis: 'esféricas',
           dib: function (E) { supParam(E, function (r, t) { return [r * Math.sin(Math.PI / 3) * Math.cos(t), r * Math.sin(Math.PI / 3) * Math.sin(t), r * Math.cos(Math.PI / 3)]; }, 0, 1, 0, 2 * Math.PI, 14, [198, 143, 46], 0.55); supParam(E, function (p, t) { return [Math.sin(p) * Math.cos(t), Math.sin(p) * Math.sin(t), Math.cos(p)]; }, 0, Math.PI / 3, 0, 2 * Math.PI, 14, [78, 122, 184], 0.6); }, pts: [[-1, -1, 0], [1, 1, 1]] }
};
function cara(E, pts, color) {
  var c = E.ctx; c.fillStyle = color; c.beginPath();
  pts.forEach(function (P, i) { var p = E.p(P); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
  c.closePath(); c.fill();
}
function caja(E, x0, x1, y0, y1, z0, z1) {
  var V = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  var caras = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]];
  caras.map(function (f) { var cen = [0, 0, 0]; f.forEach(function (i) { cen[0] += V[i][0] / 4; cen[1] += V[i][1] / 4; cen[2] += V[i][2] / 4; }); return { d: E.prof(cen), f: f }; })
       .sort(function (a, b) { return a.d - b.d; })
       .forEach(function (o) { cara(E, o.f.map(function (i) { return V[i]; }), 'rgba(78,122,184,.45)'); var c = E.ctx; c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 0.8; c.stroke(); });
}

OVA.viz.registrar('solido3d', function (host) {
  var cfg = SOL3[q(host, 'select').value] || SOL3.caja;
  var th = parseFloat(q(host, '.giro').value) / 100;
  q(host, '.giro-val').textContent = 'θ = ' + th.toFixed(2);
  var E = OVA.esc3d(q(host, 'canvas'), { th: th, ph: 0.45, alto: 340 });
  var lo = cfg.pts[0], hi = cfg.pts[cfg.pts.length - 1];
  E.ajustar(cfg.pts.concat([[0, 0, 0], [hi[0] * 1.2, 0, 0], [0, hi[1] * 1.2, 0], [0, 0, hi[2] * 1.2]]));
  E.ejes(Math.max(hi[0], hi[1], hi[2]) * 1.15, 0.6);
  cfg.dib(E);
  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · sistema natural: <strong>' + cfg.sis + '</strong><br>' +
    'V = ∭_E dV = ' + cfg.int + ' = <strong style="color:#c68f2e">' + cfg.sV + ' ≈ ' + f3(cfg.V) + '</strong><br>' +
    '<span style="color:#8fb4d9">La integral triple de 1 es el volumen; si se integra una densidad δ(x,y,z) en vez de 1, el resultado es la masa. Gira el sólido para ver las superficies que lo limitan.</span>';
});

/* ══════════ S12 · Coordenadas cilíndricas y esféricas de un punto ══════════ */
OVA.viz.registrar('coordenadas3d', function (host) {
  var rho = parseFloat(q(host, '.rho').value) / 10;
  var phi = parseFloat(q(host, '.phi').value) * Math.PI / 180;
  var tht = parseFloat(q(host, '.tht').value) * Math.PI / 180;
  q(host, '.rho-val').textContent = 'ρ = ' + rho.toFixed(1);
  q(host, '.phi-val').textContent = 'φ = ' + Math.round(phi * 180 / Math.PI) + '°';
  q(host, '.tht-val').textContent = 'θ = ' + Math.round(tht * 180 / Math.PI) + '°';
  var r = rho * Math.sin(phi), x = r * Math.cos(tht), y = r * Math.sin(tht), z = rho * Math.cos(phi);

  var E = OVA.esc3d(q(host, 'canvas'), { th: 0.8, ph: 0.45, alto: 340 });
  E.ajustar([[0, 0, 0], [2.3, 0, 0], [0, 2.3, 0], [0, 0, 2.3], [-0.5, -0.5, -0.3], [x, y, z]]);
  E.ejes(2.3, 0.5);
  // arco θ en el plano xy y arco φ desde el eje z
  E.curva(function (t) { return [0.6 * Math.cos(t), 0.6 * Math.sin(t), 0]; }, 0, tht, VERDE, 2);
  E.curva(function (p) { return [0.7 * Math.sin(p) * Math.cos(tht), 0.7 * Math.sin(p) * Math.sin(tht), 0.7 * Math.cos(p)]; }, 0, phi, MORADO, 2);
  E.segmento([0, 0, 0], [x, y, 0], VERDE, [4, 3]);          // r (proyección)
  E.segmento([x, y, 0], [x, y, z], AZUL, [4, 3]);           // z
  E.segmento([0, 0, 0], [x, y, z], ROJO);                   // ρ
  E.ctx.lineWidth = 2.4; E.ctx.strokeStyle = ROJO; var o = E.p([0, 0, 0]), pp = E.p([x, y, z]);
  E.ctx.beginPath(); E.ctx.moveTo(o[0], o[1]); E.ctx.lineTo(pp[0], pp[1]); E.ctx.stroke();
  E.punto([x, y, z], ORO, 6); E.punto([x, y, 0], VERDE, 4);
  var c = E.ctx; c.font = 'bold 11px ui-monospace,monospace';
  c.fillStyle = ROJO; c.fillText('ρ', (o[0] + pp[0]) / 2 + 6, (o[1] + pp[1]) / 2);
  var pr = E.p([x / 2, y / 2, 0]); c.fillStyle = VERDE; c.fillText('r', pr[0] + 4, pr[1] + 12);
  var pa = E.p([0.75 * Math.cos(tht / 2), 0.75 * Math.sin(tht / 2), 0]); c.fillText('θ', pa[0], pa[1] + 4);
  var pf = E.p([0.85 * Math.sin(phi / 2) * Math.cos(tht), 0.85 * Math.sin(phi / 2) * Math.sin(tht), 0.85 * Math.cos(phi / 2)]); c.fillStyle = MORADO; c.fillText('φ', pf[0] + 4, pf[1]);

  q(host, '.viz-readout').innerHTML =
    '<strong>Esféricas</strong> (ρ, φ, θ) = (' + rho.toFixed(1) + ', ' + Math.round(phi * 180 / Math.PI) + '°, ' + Math.round(tht * 180 / Math.PI) + '°) &nbsp;→&nbsp; ' +
    '<strong>cilíndricas</strong> (r, θ, z) = (' + f3(r) + ', ' + Math.round(tht * 180 / Math.PI) + '°, ' + f3(z) + ') &nbsp;→&nbsp; ' +
    '<strong>cartesianas</strong> (x, y, z) = (' + f3(x) + ', ' + f3(y) + ', ' + f3(z) + ')<br>' +
    'r = ρ sen φ = ' + f3(r) + ' · z = ρ cos φ = ' + f3(z) + ' · x = r cos θ · y = r sen θ · comprobación: √(x²+y²+z²) = ' + f3(Math.sqrt(x * x + y * y + z * z)) + ' = ρ<br>' +
    '<span style="color:#8fb4d9"><span style="color:#e08b7e">ρ</span> es la distancia al origen; <span style="color:#b08ad0">φ</span> se mide desde el eje z positivo (0 a π); <span style="color:#7fd4a4">θ</span> es el mismo ángulo de las polares, en el plano xy. Los elementos de volumen: dV = r dz dr dθ (cilíndricas) y dV = ρ² sen φ dρ dφ dθ (esféricas).</span>';
});

/* ══════════ S13 · Jacobiano: cómo una transformación deforma la malla ══════════ */
var JACO = {
  polar: { n: '(r, θ) → (x, y) = (r cos θ, r sen θ)', T: function (u, v) { return [u * Math.cos(v), u * Math.sin(v)]; }, J: function (u, v) { return u; }, sJ: '|J| = r',
           u0: 0.4, u1: 2, v0: 0, v1: Math.PI / 2, r: [-0.3, 2.3, -0.3, 2.3], lu: 'r', lv: 'θ' },
  lineal:{ n: '(u, v) → (x, y) = (u + v, u − v)', T: function (u, v) { return [u + v, u - v]; }, J: function () { return 2; }, sJ: '|J| = |(1)(−1) − (1)(1)| = 2',
           u0: 0, u1: 1, v0: 0, v1: 1, r: [-0.3, 2.3, -1.3, 1.3], lu: 'u', lv: 'v' },
  mitad: { n: '(u, v) → (x, y) = ((u+v)/2, (u−v)/2)', T: function (u, v) { return [(u + v) / 2, (u - v) / 2]; }, J: function () { return 0.5; }, sJ: '|J| = |(½)(−½) − (½)(½)| = ½',
           u0: 0, u1: 2, v0: 0, v1: 2, r: [-0.3, 2.3, -1.3, 1.3], lu: 'u', lv: 'v' },
  cuad:  { n: '(u, v) → (x, y) = (u², v)', T: function (u, v) { return [u * u, v]; }, J: function (u) { return 2 * u; }, sJ: '|J| = 2u',
           u0: 0.2, u1: 1.4, v0: 0, v1: 1, r: [-0.3, 2.3, -0.3, 1.3], lu: 'u', lv: 'v' }
};

OVA.viz.registrar('jacobiano', function (host) {
  var cfg = JACO[q(host, 'select').value] || JACO.polar;
  var n = parseInt(q(host, '.n').value, 10), t = parseFloat(q(host, '.celda').value) / 100;
  q(host, '.n-val').textContent = n + ' × ' + n;
  var i, j, L = marco2(q(host, 'canvas'), 330, cfg.r[0], cfg.r[1], cfg.r[2], cfg.r[3]);
  ejes2(L, 0.5);
  var c = L.ctx, du = (cfg.u1 - cfg.u0) / n, dv = (cfg.v1 - cfg.v0) / n;
  // celda resaltada
  var iu = Math.min(n - 1, Math.floor(t * n)), iv = Math.min(n - 1, Math.floor((1 - t) * n * 0.999));
  for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
    var u = cfg.u0 + i * du, v = cfg.v0 + j * dv, k, P;
    var esq = [[u, v], [u + du, v], [u + du, v + dv], [u, v + dv]];
    var sel = (i === iu && j === iv);
    c.fillStyle = sel ? 'rgba(176,57,44,.6)' : 'rgba(58,110,165,.18)'; c.strokeStyle = sel ? ROJO : 'rgba(58,110,165,.7)'; c.lineWidth = sel ? 2 : 0.8;
    c.beginPath();
    for (k = 0; k < 4; k++) { P = cfg.T(esq[k][0], esq[k][1]); k ? c.lineTo(L.px(P[0]), L.py(P[1])) : c.moveTo(L.px(P[0]), L.py(P[1])); }
    c.closePath(); c.fill(); c.stroke();
  }
  // área de la celda imagen (fórmula del polígono, con lados curvos muestreados)
  var u = cfg.u0 + iu * du, v = cfg.v0 + iv * dv, poly = [], m = 12, s;
  for (s = 0; s < m; s++) poly.push(cfg.T(u + du * s / m, v));
  for (s = 0; s < m; s++) poly.push(cfg.T(u + du, v + dv * s / m));
  for (s = 0; s < m; s++) poly.push(cfg.T(u + du - du * s / m, v + dv));
  for (s = 0; s < m; s++) poly.push(cfg.T(u, v + dv - dv * s / m));
  var A = 0; for (s = 0; s < poly.length; s++) { var p1 = poly[s], p2 = poly[(s + 1) % poly.length]; A += p1[0] * p2[1] - p2[0] * p1[1]; }
  A = Math.abs(A) / 2;
  var Jm = cfg.J(u + du / 2, v + dv / 2);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace'; c.fillText(cfg.n, L.px(L.xmin) + 6, 22);

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · ' + cfg.sJ + '<br>' +
    'Celda roja: ' + cfg.lu + ' ∈ [' + f2(u) + ', ' + f2(u + du) + '], ' + cfg.lv + ' ∈ [' + f2(v) + ', ' + f2(v + dv) + '] → área en el plano ' + cfg.lu + cfg.lv + ' = Δ' + cfg.lu + '·Δ' + cfg.lv + ' = ' + f3(du * dv) +
    '; área de su imagen en xy = <strong>' + f3(A) + '</strong>; cociente = <strong style="color:#c68f2e">' + f3(A / (du * dv)) + '</strong> ≈ |J| en el centro = ' + f3(Jm) + '<br>' +
    '<span style="color:#8fb4d9">El jacobiano es el factor local de cambio de área: dA = |J| du dv. Donde |J| es grande la malla se estira; donde es pequeño, se comprime. Mueve la celda y compara.</span>';
});

/* ══════════ S13 · Centro de masa de una lámina triangular ══════════ */
var LAMINA = {
  uno: { n: 'δ = 1 (homogénea)', d: function (x, y) { return 1; }, m: 0.5, cm: [1 / 3, 1 / 3], sm: '1/2', scm: '(1/3, 1/3)' },
  x:   { n: 'δ = x (más densa a la derecha)', d: function (x, y) { return x; }, m: 1 / 6, cm: [0.5, 0.25], sm: '1/6', scm: '(1/2, 1/4)' },
  y:   { n: 'δ = y (más densa arriba)', d: function (x, y) { return y; }, m: 1 / 6, cm: [0.25, 0.5], sm: '1/6', scm: '(1/4, 1/2)' }
};

OVA.viz.registrar('centromasa', function (host) {
  var cfg = LAMINA[q(host, 'select').value] || LAMINA.uno;
  var L = marco2(q(host, 'canvas'), 320, -0.15, 1.15, -0.15, 1.15);
  ejes2(L, 0.25);
  var c = L.ctx, n = 40, i, j, dmax = 1;
  for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
    var x = (i + 0.5) / n, y = (j + 0.5) / n; if (x + y > 1) continue;
    var t = cfg.d(x, y) / dmax;
    c.fillStyle = 'rgba(198,143,46,' + (0.15 + 0.75 * t) + ')';
    c.fillRect(L.px(i / n), L.py((j + 1) / n), L.sx / n + 0.5, L.sy / n + 0.5);
  }
  c.strokeStyle = AZUL; c.lineWidth = 2.4; c.beginPath(); c.moveTo(L.px(0), L.py(0)); c.lineTo(L.px(1), L.py(0)); c.lineTo(L.px(0), L.py(1)); c.closePath(); c.stroke();
  // centro de masa numérico
  var m = 0, mx = 0, my = 0, N = 200;
  for (i = 0; i < N; i++) for (j = 0; j < N; j++) { var xx = (i + 0.5) / N, yy = (j + 0.5) / N; if (xx + yy > 1) continue; var w = cfg.d(xx, yy) / (N * N); m += w; mx += xx * w; my += yy * w; }
  OVA.punto(L, mx / m, my / m, ROJO);
  OVA.punto(L, 1 / 3, 1 / 3, VERDE, true);
  c.fillStyle = OVA.color('cv-text'); c.font = 'bold 11px ui-monospace,monospace'; c.fillText('lámina 0 ≤ x, 0 ≤ y, x + y ≤ 1', L.px(0.35), L.py(0.9));

  q(host, '.viz-readout').innerHTML =
    '<strong>' + cfg.n + '</strong> · masa m = ∬ δ dA = <strong>' + cfg.sm + '</strong> · centro de masa (x̄, ȳ) = (∬xδ dA / m, ∬yδ dA / m) = <strong style="color:#e08b7e">' + cfg.scm + '</strong> (numérico: ' + f3(mx / m) + ', ' + f3(my / m) + ')<br>' +
    '<span style="color:#8fb4d9">El círculo verde es el centroide geométrico (1/3, 1/3). Cuando la densidad crece hacia un lado, el centro de masa (rojo) se desplaza hacia la zona más densa. En 3D la idea es idéntica con integrales triples.</span>';
});

/* ══════════ S14 · Campo vectorial, integral de línea y Green ══════════ */
var CAMPOV = {
  rot:  { n: 'F = (−y, x)', P: function (x, y) { return -y; }, Q: function (x, y) { return x; }, Py: -1, Qx: 1, cons: false, f: null, sf: '' },
  grad: { n: 'F = (2xy, x²) = ∇(x²y)', P: function (x, y) { return 2 * x * y; }, Q: function (x, y) { return x * x; }, Py: '2x', Qx: '2x', cons: true, f: function (x, y) { return x * x * y; }, sf: 'f = x²y' },
  rad:  { n: 'F = (x, y) = ∇(½(x² + y²))', P: function (x, y) { return x; }, Q: function (x, y) { return y; }, Py: 0, Qx: 0, cons: true, f: function (x, y) { return (x * x + y * y) / 2; }, sf: 'f = ½(x² + y²)' },
  ciz:  { n: 'F = (y, 0) (cizalla)', P: function (x, y) { return y; }, Q: function (x, y) { return 0; }, Py: 1, Qx: 0, cons: false, f: null, sf: '' }
};
var CURVA = {
  circ: { n: 'círculo unitario (cerrada, antihoraria)', r: function (t) { return [Math.cos(t), Math.sin(t)]; }, dr: function (t) { return [-Math.sin(t), Math.cos(t)]; }, t0: 0, t1: 2 * Math.PI, cerrada: true, area: Math.PI, ini: '(1, 0)', fin: '(1, 0)',
          dentro: function (x, y) { return x * x + y * y <= 1; } },
  parab:{ n: 'parábola y = x²/4 de (0,0) a (2,1)', r: function (t) { return [2 * t, t * t]; }, dr: function (t) { return [2, 2 * t]; }, t0: 0, t1: 1, cerrada: false, ini: '(0, 0)', fin: '(2, 1)' },
  recta:{ n: 'segmento recto de (0,0) a (2,1)', r: function (t) { return [2 * t, t]; }, dr: function (t) { return [2, 1]; }, t0: 0, t1: 1, cerrada: false, ini: '(0, 0)', fin: '(2, 1)' },
  cuad: { n: 'cuadrado [0,1]² (cerrada, antihoraria)', r: function (t) { var s = t * 4, k = Math.floor(Math.min(s, 3.999)), u = s - k; return [[u, 0], [1, u], [1 - u, 1], [0, 1 - u]][k]; },
          dr: function (t) { var k = Math.floor(Math.min(t * 4, 3.999)); return [[4, 0], [0, 4], [-4, 0], [0, -4]][k]; }, t0: 0, t1: 1, cerrada: true, area: 1, ini: '(0, 0)', fin: '(0, 0)',
          dentro: function (x, y) { return x >= 0 && x <= 1 && y >= 0 && y <= 1; } }
};

OVA.viz.registrar('campovec', function (host) {
  var F = CAMPOV[q(host, '.campo').value] || CAMPOV.rot;
  var C = CURVA[q(host, '.curva').value] || CURVA.circ;
  var tt = C.t0 + (C.t1 - C.t0) * parseFloat(q(host, '.t').value) / 100;
  q(host, '.t-val').textContent = 't = ' + f2(tt);

  var L = marco2(q(host, 'canvas'), 340, -1.6, 2.4, -1.6, 1.6);
  ejes2(L, 0.5);
  var c = L.ctx, i, j;
  // campo
  for (i = -3; i <= 4; i++) for (j = -3; j <= 3; j++) {
    var x = i * 0.5, y = j * 0.5, vx = F.P(x, y), vy = F.Q(x, y), nm = Math.hypot(vx, vy);
    if (nm < 1e-9) continue;
    var sc = 0.22 * Math.min(1, nm / 1.5) / nm;
    flecha(L, x, y, x + vx * sc, y + vy * sc, 'rgba(150,167,181,.75)', 1.2);
  }
  // curva
  c.strokeStyle = AZUL; c.lineWidth = 2.6; c.beginPath();
  for (i = 0; i <= 400; i++) { var P = C.r(C.t0 + (C.t1 - C.t0) * i / 400); i ? c.lineTo(L.px(P[0]), L.py(P[1])) : c.moveTo(L.px(P[0]), L.py(P[1])); }
  c.stroke();
  // punto, F y tangente
  var p = C.r(tt), d = C.dr(tt), nd = Math.hypot(d[0], d[1]), T = [d[0] / nd, d[1] / nd];
  var Fv = [F.P(p[0], p[1]), F.Q(p[0], p[1])], FT = Fv[0] * T[0] + Fv[1] * T[1];
  flecha(L, p[0], p[1], p[0] + T[0] * 0.5, p[1] + T[1] * 0.5, VERDE, 2.2);
  var nF = Math.hypot(Fv[0], Fv[1]); if (nF > 1e-9) flecha(L, p[0], p[1], p[0] + Fv[0] * 0.5 / Math.max(1, nF), p[1] + Fv[1] * 0.5 / Math.max(1, nF), ROJO, 2.4);
  OVA.punto(L, p[0], p[1], ORO);
  c.font = 'bold 11px ui-monospace,monospace'; c.fillStyle = ROJO; c.fillText('— F', L.px(L.xmin) + 6, 22); c.fillStyle = VERDE; c.fillText('— T (tangente unitaria)', L.px(L.xmin) + 6, 38);

  // integral de línea numérica
  var W = simpson1(function (t) { var r = C.r(t), v = C.dr(t); return F.P(r[0], r[1]) * v[0] + F.Q(r[0], r[1]) * v[1]; }, C.t0, C.t1, 800);
  var html = '<strong>' + F.n + '</strong> sobre <strong>' + C.n + '</strong><br>' +
    'En t = ' + f2(tt) + ': F = (' + f2(Fv[0]) + ', ' + f2(Fv[1]) + '), F·T = <strong>' + f2(FT) + '</strong> (' + (FT > 0.01 ? 'el campo empuja a favor' : FT < -0.01 ? 'el campo frena' : 'perpendicular: no trabaja') + ') &nbsp;·&nbsp; ' +
    '∫_C F·dr = ∫ F(r(t))·r′(t) dt = <strong style="color:#c68f2e">' + f3(W) + '</strong><br>';
  html += 'Criterio: ∂P/∂y = ' + F.Py + ', ∂Q/∂x = ' + F.Qx + ' → ' + (F.cons ? '<strong style="color:#7fd4a4">conservativo</strong> (' + F.sf + ')' : '<strong style="color:#e08b7e">no conservativo</strong>') + '. ';
  if (F.cons && !C.cerrada) html += 'Teorema fundamental: f' + C.fin + ' − f' + C.ini + ' = ' + f3(F.f(C.r(C.t1)[0], C.r(C.t1)[1]) - F.f(C.r(C.t0)[0], C.r(C.t0)[1])) + ' ✓ (no depende del camino).';
  if (F.cons && C.cerrada) html += 'Curva cerrada → ∮ F·dr = 0 ✓.';
  if (!F.cons && C.cerrada) {
    var rot = (typeof F.Qx === 'number' ? F.Qx : 0) - (typeof F.Py === 'number' ? F.Py : 0);
    html += 'Green: ∮ P dx + Q dy = ∬ (Q_x − P_y) dA = ' + rot + ' × área ' + f3(C.area) + ' = <strong>' + f3(rot * C.area) + '</strong> ✓.';
  }
  if (!F.cons && !C.cerrada) html += 'Compara con el otro camino entre los mismos extremos: el valor cambia porque el campo no es conservativo.';
  html += '<br><span style="color:#8fb4d9">La integral de línea suma, a lo largo de la curva, la componente del campo en la dirección del movimiento (F·T). Arrastra t y observa el signo de F·T.</span>';
  q(host, '.viz-readout').innerHTML = html;
});

})();
