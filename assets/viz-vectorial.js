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

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz]').forEach(function (h) {
    h.addEventListener('input', function () { OVA.viz.redibujar(); });
    h.addEventListener('change', function () { OVA.viz.redibujar(); });
  });
});
})();
