/* ══════════════════════════════════════════════════════════
   OVA · Motor común · Departamento de Ciencias Básicas · UNIAJC
   ----------------------------------------------------------
   Este archivo NO se edita al crear una semana nueva.
   Una semana solo aporta: HTML de teoría + OVA.quiz({...}).
   ══════════════════════════════════════════════════════════ */
(function (global) {
'use strict';

var OVA = {};
var LETRAS = ['a', 'b', 'c', 'd', 'e', 'f'];

/* ── 1. MathJax seguro ──────────────────────────────────────
   MathJax se carga con async, así que typesetPromise puede no
   existir todavía. Encadenamos siempre a startup.promise.     */
OVA.mj = function (el) {
  if (!global.MathJax || !global.MathJax.startup) return;
  global.MathJax.startup.promise
    .then(function () {
      return el ? global.MathJax.typesetPromise([el])
                : global.MathJax.typesetPromise();
    })
    .catch(function (e) { console.warn('MathJax:', e); });
};

/* ── 2. Modo oscuro ─────────────────────────────────────── */
var LISTENERS = [];
OVA.onTheme = function (fn) { LISTENERS.push(fn); };

OVA.toggleDark = function () {
  var dark = document.body.classList.toggle('dark');
  try { localStorage.setItem('ova-dark', dark ? '1' : '0'); } catch (e) {}
  document.querySelectorAll('[data-dark-toggle]').forEach(function (b) {
    b.textContent = dark ? '☀ Modo claro' : '☾ Modo oscuro';
    b.setAttribute('aria-pressed', String(dark));
  });
  LISTENERS.forEach(function (fn) { try { fn(dark); } catch (e) {} });
};

(function () {
  try { if (localStorage.getItem('ova-dark') === '1') document.body.classList.add('dark'); }
  catch (e) {}
})();

/* ── 3. Lectura de tokens de color para <canvas> ────────── */
OVA.color = function (name) {
  return getComputedStyle(document.body).getPropertyValue('--' + name).trim();
};

/* ── 4. Modo docente ────────────────────────────────────────
   Se activa con ?docente=1 en la URL. NO es seguridad: solo
   evita que el estudiante vea el solucionario por accidente.
   Las respuestas viven en el navegador de todos modos, por eso
   estos quices son de refuerzo y no dan nota.                 */
OVA.docente = /[?&]docente=1/.test(global.location.search);

/* ── 5. Contexto por programa académico ─────────────────── */
var PROGRAMAS = [
  ['adm', 'Administración de Empresas'],
  ['con', 'Contaduría Pública'],
  ['sis', 'Tecnología en Sistemas de la Información'],
  ['ele', 'Tecnología en Electrónica Digital']
];

OVA.setPrograma = function (valor) {
  try { localStorage.setItem('ova-programa', valor); } catch (e) {}
  document.querySelectorAll('.ctx-box').forEach(function (el) {
    el.classList.toggle('on', !!valor && el.dataset.prog === valor);
  });
  document.querySelectorAll('select[data-programa]').forEach(function (s) {
    s.value = valor;
  });
  OVA.mj();
};

function initProgramas() {
  document.querySelectorAll('select[data-programa]').forEach(function (sel) {
    if (!sel.options.length) {
      sel.appendChild(new Option('— Selecciona tu programa —', ''));
      PROGRAMAS.forEach(function (p) { sel.appendChild(new Option(p[1], p[0])); });
    }
    sel.addEventListener('change', function () { OVA.setPrograma(this.value); });
  });
  var guardado = '';
  try { guardado = localStorage.getItem('ova-programa') || ''; } catch (e) {}
  if (guardado) OVA.setPrograma(guardado);
}

/* ── 6. Validador del banco de preguntas ────────────────────
   Corre siempre; el aviso solo se muestra en modo docente.    */
function normalizar(s) {
  return String(s).replace(/\s|\\[,!;:]|\\displaystyle|\{|\}/g, '');
}

OVA.validar = function (cfg) {
  var errs = [];
  var pre = 'Quiz "' + (cfg.titulo || cfg.destino) + '"';
  if (!cfg.destino) errs.push(pre + ': falta "destino".');
  if (!Array.isArray(cfg.items) || !cfg.items.length) {
    errs.push(pre + ': no tiene preguntas.');
    return errs;
  }
  cfg.items.forEach(function (it, i) {
    var n = pre + ' · ítem ' + (i + 1);
    if (!it.enunciado) errs.push(n + ': sin enunciado.');
    if (!Array.isArray(it.opciones) || it.opciones.length < 2) {
      errs.push(n + ': necesita al menos 2 opciones.');
      return;
    }
    if (!Number.isInteger(it.correcta) || it.correcta < 0 || it.correcta >= it.opciones.length)
      errs.push(n + ': "correcta" debe ser un índice válido (0…' + (it.opciones.length - 1) + ').');
    var norm = it.opciones.map(normalizar);
    if (new Set(norm).size !== norm.length)
      errs.push(n + ': hay opciones repetidas o equivalentes.');
    if (!it.solucion) errs.push(n + ': sin explicación ("solucion").');
    if (!it.criterio) errs.push(n + ': sin criterio de aprendizaje.');
  });

  // Las claves no deben concentrarse en una misma posición: el estudiante
  // aprende el patrón y responde por posición en vez de por razonamiento.
  var letras = ['a', 'b', 'c', 'd', 'e', 'f'];
  if (cfg.items.length >= 3) {
    var cuenta = {};
    cfg.items.forEach(function (it) {
      if (Number.isInteger(it.correcta)) cuenta[it.correcta] = (cuenta[it.correcta] || 0) + 1;
    });
    Object.keys(cuenta).forEach(function (k) {
      var todas = cuenta[k] === cfg.items.length;
      if (todas || (cfg.items.length >= 4 && cuenta[k] / cfg.items.length > 0.5)) {
        errs.push(pre + ': ' + cuenta[k] + ' de ' + cfg.items.length +
          ' respuestas correctas están en la opción ' + letras[k] +
          '. Reordena las opciones para repartir las claves.');
      }
    });
  }
  return errs;
};

function mostrarErrores(errs) {
  if (!errs.length || !OVA.docente) return;
  var box = document.getElementById('ova-lint');
  if (!box) {
    box = document.createElement('div');
    box.id = 'ova-lint';
    document.querySelector('main').prepend(box);
  }
  box.classList.add('on');
  box.innerHTML = '<h4>⚠ Revisar antes de publicar (' + errs.length + ')</h4><ul>' +
    errs.map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ul>';
}

/* ── 7. Renderizador de quiz ────────────────────────────────
   Los id se generan aquí, así que es imposible que el motor
   busque un id que no existe: la causa del bug del OVA viejo. */
OVA.quiz = function (cfg) {
  var errs = OVA.validar(cfg);
  mostrarErrores(errs);

  var host = document.getElementById(cfg.destino);
  if (!host) { console.error('OVA.quiz: no existe #' + cfg.destino); return; }

  var uid = cfg.destino;
  var total = cfg.items.length;
  var estado = cfg.items.map(function () { return null; }); // null | true | false

  var html = '' +
    '<div class="quiz-head">' +
      '<div><strong>' + (cfg.titulo || 'Práctica') + '</strong>' +
        '<div class="quiz-progress" id="' + uid + '-prog">0 de ' + total + ' resueltas</div>' +
        '<div class="bar"><i id="' + uid + '-bar"></i></div>' +
      '</div>' +
      '<div class="q-actions">' +
        '<button class="btn ghost" type="button" data-act="reset">Empezar de nuevo</button>' +
      '</div>' +
    '</div>' +
    '<p style="font-size:.85rem;color:var(--muted);margin-bottom:.9rem">' +
      'Práctica de refuerzo. No tiene nota: responde, revisa la explicación y vuelve a intentarlo ' +
      'las veces que quieras.</p>';

  cfg.items.forEach(function (it, i) {
    var qid = uid + '-q' + i;
    html += '<div class="q" id="' + qid + '">' +
      '<div class="q-head">' +
        '<span class="q-n">Pregunta ' + (i + 1) + '</span>' +
        (it.etiqueta ? '<span class="tag">' + it.etiqueta + '</span>' : '') +
        (it.nivel ? '<span class="tag">' + ['', 'Básico', 'Intermedio', 'Avanzado'][it.nivel] + '</span>' : '') +
      '</div>' +
      '<div class="q-text">' + it.enunciado + '</div>' +
      '<div class="opts" role="radiogroup" aria-label="Pregunta ' + (i + 1) + '">';

    it.opciones.forEach(function (op, j) {
      var oid = qid + '-o' + j;
      html += '<label class="opt" for="' + oid + '" data-i="' + i + '" data-j="' + j + '">' +
        '<input type="radio" name="' + qid + '" id="' + oid + '" value="' + j + '">' +
        '<span class="k">' + LETRAS[j] + ')</span><span>' + op + '</span></label>';
    });

    html += '</div><div class="q-actions">' +
      (it.pista ? '<button class="btn ghost" type="button" data-act="pista" data-i="' + i + '">Ver pista</button>' : '') +
      '</div>' +
      (it.pista ? '<div class="q-pista" id="' + qid + '-pista">💡 ' + it.pista + '</div>' : '') +
      '<div class="q-sol" id="' + qid + '-sol">' + it.solucion + '</div>' +
      '</div>';
  });

  html += '<div class="quiz-fin" id="' + uid + '-fin"></div>';
  host.innerHTML = html;

  function pintar(i) {
    var q = document.getElementById(uid + '-q' + i);
    var it = cfg.items[i];
    q.querySelectorAll('.opt').forEach(function (o) {
      var j = +o.dataset.j;
      o.classList.remove('ok', 'no');
      o.classList.add('locked');
      if (j === it.correcta) o.classList.add('ok');
      else if (o.querySelector('input').checked) o.classList.add('no');
    });
    q.querySelector('#' + uid + '-q' + i + '-sol').classList.add('on');
    var p = q.querySelector('#' + uid + '-q' + i + '-pista');
    if (p) p.classList.add('on');
    OVA.mj(q);
  }

  function progreso() {
    var hechas = estado.filter(function (v) { return v !== null; }).length;
    var bien = estado.filter(function (v) { return v === true; }).length;
    document.getElementById(uid + '-prog').textContent = hechas + ' de ' + total + ' resueltas';
    document.getElementById(uid + '-bar').style.width = (hechas / total * 100) + '%';
    var fin = document.getElementById(uid + '-fin');
    if (hechas === total) {
      var flojos = [];
      estado.forEach(function (v, i) { if (!v && cfg.items[i].criterio) flojos.push(cfg.items[i].criterio); });
      fin.innerHTML = '<strong>Terminaste la práctica.</strong> Acertaste ' + bien + ' de ' + total +
        ' al primer intento.' +
        (flojos.length
          ? '<div class="sub-title">Para repasar</div><ul>' +
            [...new Set(flojos)].map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>'
          : '<p style="margin-top:.5rem">Dominaste todos los criterios de la sesión. 🎯</p>');
      fin.classList.add('on');
      OVA.mj(fin);
    } else {
      fin.classList.remove('on');
    }
  }

  host.addEventListener('click', function (ev) {
    var op = ev.target.closest('.opt');
    if (op && !op.classList.contains('locked')) {
      var i = +op.dataset.i, j = +op.dataset.j;
      op.querySelector('input').checked = true;
      if (estado[i] === null) estado[i] = (j === cfg.items[i].correcta);
      pintar(i);
      progreso();
      return;
    }
    var btn = ev.target.closest('button[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'pista') {
      var pi = +btn.dataset.i;
      document.getElementById(uid + '-q' + pi + '-pista').classList.toggle('on');
      btn.textContent = document.getElementById(uid + '-q' + pi + '-pista').classList.contains('on')
        ? 'Ocultar pista' : 'Ver pista';
      OVA.mj(document.getElementById(uid + '-q' + pi));
    }
    if (btn.dataset.act === 'reset') OVA.quiz(cfg);
  });

  if (OVA.docente) {
    cfg.items.forEach(function (_, i) {
      document.getElementById(uid + '-q' + i + '-sol').classList.add('on');
      var p = document.getElementById(uid + '-q' + i + '-pista');
      if (p) p.classList.add('on');
    });
  }

  OVA.mj(host);
};

/* ── 8. Visualizadores en <canvas> ──────────────────────────
   Registro: OVA.viz.registrar('nombre', function(cv){...})
   Uso en HTML: <div class="viz" data-viz="nombre">…</div>      */
var REG = {};
OVA.viz = {
  registrar: function (nombre, fn) { REG[nombre] = fn; },
  registrados: function () { return Object.keys(REG); },
  redibujar: function () {
    document.querySelectorAll('[data-viz]').forEach(function (host) {
      var nombre = host.dataset.viz;
      var out = host.querySelector('.viz-readout');
      var fn = REG[nombre];

      // Fallo ruidoso: si el visualizador no está registrado, el lector lo dice.
      // Antes esto no hacía nada y el canvas quedaba en blanco sin explicación.
      if (!fn) {
        var msg = 'No se cargó el visualizador «' + nombre + '». ' +
          'Comprueba que el archivo <code>assets/viz-*.js</code> correspondiente esté subido y ' +
          'actualizado, y recarga la página con <strong>Ctrl+F5</strong> para saltarte la caché.';
        if (out) out.innerHTML = '⚠ ' + msg;
        console.error('OVA · visualizador no registrado: "' + nombre + '". Registrados: [' +
                      Object.keys(REG).join(', ') + ']');
        return;
      }
      try {
        fn(host);
      } catch (err) {
        if (out) out.innerHTML = '⚠ Error al dibujar «' + nombre + '»: ' + err.message;
        console.error('OVA · error en el visualizador "' + nombre + '":', err);
      }
    });
  }
};

/* Prepara un canvas: resolución real (HiDPI), fondo del tema y ejes. */
OVA.lienzo = function (canvas, opts) {
  opts = opts || {};
  var dpr = Math.min(global.devicePixelRatio || 1, 2);
  var w = canvas.clientWidth || 640;
  var h = opts.alto || Math.round(w * 0.62);
  canvas.style.height = h + 'px';
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = OVA.color('cv-bg');
  ctx.fillRect(0, 0, w, h);
  return {
    ctx: ctx, w: w, h: h,
    ox: opts.ox !== undefined ? opts.ox : w / 2,
    oy: opts.oy !== undefined ? opts.oy : h / 2,
    sx: opts.sx || 40, sy: opts.sy || 40,
    px: function (x) { return this.ox + x * this.sx; },
    py: function (y) { return this.oy - y * this.sy; }
  };
};

OVA.ejes = function (L) {
  var c = L.ctx, grid = OVA.color('cv-grid'), axis = OVA.color('cv-axis'), txt = OVA.color('cv-text');
  c.strokeStyle = grid; c.lineWidth = 1;
  for (var x = L.ox % L.sx; x < L.w; x += L.sx) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, L.h); c.stroke(); }
  for (var y = L.oy % L.sy; y < L.h; y += L.sy) { c.beginPath(); c.moveTo(0, y); c.lineTo(L.w, y); c.stroke(); }
  c.strokeStyle = axis; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(0, L.oy); c.lineTo(L.w, L.oy); c.stroke();
  c.beginPath(); c.moveTo(L.ox, 0); c.lineTo(L.ox, L.h); c.stroke();
  c.fillStyle = txt; c.font = '10px ui-monospace,monospace';
  var paso = L.sx < 26 ? 2 : 1;
  for (var i = -Math.ceil(L.ox / L.sx); i <= Math.ceil((L.w - L.ox) / L.sx); i += paso) {
    if (i === 0) continue;
    var pxi = L.px(i);
    if (pxi < 12 || pxi > L.w - 8) continue;
    c.beginPath(); c.moveTo(pxi, L.oy - 3); c.lineTo(pxi, L.oy + 3); c.stroke();
    c.fillText(String(i), pxi - 3, L.oy + 14);
  }
  for (var k = -Math.ceil((L.h - L.oy) / L.sy); k <= Math.ceil(L.oy / L.sy); k += paso) {
    if (k === 0) continue;
    var pyk = L.py(k);
    if (pyk < 12 || pyk > L.h - 8) continue;
    c.beginPath(); c.moveTo(L.ox - 3, pyk); c.lineTo(L.ox + 3, pyk); c.stroke();
    c.fillText(String(k), L.ox + 6, pyk + 3);
  }
  c.font = 'bold 11px ui-monospace,monospace';
  c.fillText('x', L.w - 12, L.oy - 6);
  c.fillText('y', L.ox + 6, 12);
};

OVA.curva = function (L, fn, color, ancho) {
  var c = L.ctx;
  c.strokeStyle = color; c.lineWidth = ancho || 2.5;
  c.beginPath();
  var trazando = false;
  for (var p = 0; p <= L.w; p += 0.5) {
    var x = (p - L.ox) / L.sx, y = fn(x);
    if (!isFinite(y)) { trazando = false; continue; }
    var py = L.py(y);
    if (py < -20 || py > L.h + 20) { trazando = false; continue; }
    if (!trazando) { c.moveTo(p, py); trazando = true; } else { c.lineTo(p, py); }
  }
  c.stroke();
};

OVA.punto = function (L, x, y, color, hueco) {
  var c = L.ctx;
  c.lineWidth = 2.5;
  c.beginPath(); c.arc(L.px(x), L.py(y), 6, 0, Math.PI * 2);
  if (hueco) { c.fillStyle = OVA.color('cv-bg'); c.fill(); c.strokeStyle = color; c.stroke(); }
  else { c.fillStyle = color; c.fill(); }
};

/* ── 9. Navegación de guías largas ──────────────────────── */
function initGuiaNav() {
  var hdr = document.getElementById('top');
  function medir() {
    if (hdr) document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px');
  }
  medir();
  global.addEventListener('resize', medir);

  var nav = document.getElementById('guia-nav');
  if (!nav) return;
  var enlaces = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
  var secciones = enlaces.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });

  function marcar() {
    var corte = (hdr ? hdr.offsetHeight : 58) + 80;
    var activo = 0;
    secciones.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= corte) activo = i;
    });
    enlaces.forEach(function (a, i) { a.classList.toggle('aqui', i === activo); });
  }
  marcar();
  var tick = false;
  global.addEventListener('scroll', function () {
    if (tick) return;
    tick = true;
    global.requestAnimationFrame(function () { marcar(); tick = false; });
  }, { passive: true });
}

/* ── 10. Enlaces de contacto ────────────────────────────────
   La dirección no se escribe en el HTML: se guarda partida en
   dos atributos y se recompone aquí. Los rastreadores de spam
   que leen el código fuente no encuentran una dirección válida. */
function initContacto() {
  var titulo = document.querySelector('#top .top-titles h1');
  var pagina = (titulo ? titulo.textContent : document.title).trim();
  document.querySelectorAll('.enlace-correo[data-u]').forEach(function (a) {
    var u = a.getAttribute('data-u'), d = a.getAttribute('data-d');
    if (!u || !d) return;
    var asunto = (a.getAttribute('data-asunto') || 'OVA') + ' — ' + pagina;
    a.setAttribute('href', 'mailto:' + u + String.fromCharCode(64) + d +
                   '?subject=' + encodeURIComponent(asunto));
    a.removeAttribute('data-u');
    a.removeAttribute('data-d');
  });
}

/* ── 11. Arranque ───────────────────────────────────────── */
function init() {
  initProgramas();
  initGuiaNav();
  initContacto();
  document.querySelectorAll('[data-dark-toggle]').forEach(function (b) {
    b.addEventListener('click', OVA.toggleDark);
    b.textContent = document.body.classList.contains('dark') ? '☀ Modo claro' : '☾ Modo oscuro';
  });
  OVA.mj();
  OVA.viz.redibujar();
  OVA.onTheme(function () { OVA.viz.redibujar(); });
  var t;
  global.addEventListener('resize', function () {
    clearTimeout(t); t = setTimeout(function () { OVA.viz.redibujar(); }, 150);
  });
  if (OVA.docente) document.body.dataset.docente = '1';
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

global.OVA = OVA;
})(window);
