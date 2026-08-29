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

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
