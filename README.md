# OVA · Ciencias Básicas · UNIAJC

Material de apoyo por sesión para **Cálculo**, **Métodos Numéricos**, **Cálculo Vectorial**
y **Ecuaciones Diferenciales**. Sitio estático: no necesita servidor ni base de datos.

---

## 1. Publicarlo (una sola vez, ~5 minutos)

1. En GitHub: **New repository** → nombre `ova-dcb` → **Public** → *Create repository*.
2. En la página del repositorio vacío, haz clic en **uploading an existing file**.
3. Arrastra **el contenido** de la carpeta `ova-dcb` (los archivos sueltos y las carpetas
   `assets/`, `calculo/`, `metodos/`, `vectorial/`, `edo/`) y pulsa **Commit changes**.
4. Pestaña **Settings** → **Pages** → en *Source* elige **Deploy from a branch**,
   rama `main`, carpeta `/ (root)` → **Save**.
5. Espera 1–2 minutos. El sitio queda publicado en:

```
https://TU-USUARIO.github.io/ova-dcb/
```

> Sube el **contenido** de `ova-dcb`, no la carpeta metida dentro de otra carpeta.
> Si al terminar ves `ova-dcb/ova-dcb/…` en el repositorio, las rutas quedarán mal.
> El archivo `.nojekyll` debe ir incluido: evita que GitHub Pages procese el sitio con Jekyll.

### Enlaces que compartirás

| Qué | URL |
|---|---|
| Portada (los 4 cursos) | `…/ova-dcb/` |
| Un curso | `…/ova-dcb/edo/` |
| Una sesión | `…/ova-dcb/edo/s01.html` |
| Modo docente | `…/ova-dcb/edo/s01.html?docente=1` |

---

## 2. Qué hay construido

```
ova-dcb/
├── .nojekyll
├── index.html                  portada con los 4 cursos
├── assets/
│   ├── ova.css                 estilos comunes
│   ├── ova.js                  MOTOR: quiz, validador, canvas, modo oscuro
│   ├── estado.js               QUÉ GUÍAS ESTÁN PUBLICADAS (edítalo al publicar)
│   ├── viz-calculo.js          explorador de funciones · acercamiento al límite · tangente
│   ├── viz-metodos.js          error de truncamiento de Taylor · bisección iterativa
│   ├── viz-vectorial.js        productos vectoriales · gradiente y curvas de nivel
│   └── viz-edo.js              campo de direcciones con clic
├── calculo/     index.html + s01.html … s14.html   (las no escritas son avisos)
├── metodos/     index.html + s01.html … s14.html
├── vectorial/   index.html + s01.html … s14.html
└── edo/         index.html + s01.html … s14.html
```

Cada curso tiene su índice con las 5 sesiones del Corte I: la sesión 1 activa y
las demás marcadas como pendientes.

---

## 3. Publicar una guía nueva

Las 16 semanas de los cuatro cursos **ya están enlazadas**. Las que aún no tienen guía llevan a
una página de aviso, así que ningún enlace da error 404. Publicar consiste en dos pasos:

### Paso 1 — Reemplaza el archivo provisional

Sube la guía con el nombre que ya espera el índice: `calculo/s02.html`, `edo/s03.html`, etc.
GitHub te preguntará si quieres reemplazar el archivo existente. Di que sí.

### Paso 2 — Añade el número a `assets/estado.js`

```js
window.OVA_PUBLICADAS = {
  calculo:   [1, 2, 3],     ←  añade el 2
  vectorial: [1, 2, 3],
  metodos:   [1, 2, 3],
  edo:       [1, 2, 3, 4]
};
```

Eso es todo. La ficha del índice pasa de «Próximamente» a «Guía publicada», deja de verse
punteada y el contador «N de 12 guías publicadas» se recalcula solo.

**Nunca tienes que editar el HTML de los índices.** Ese fue el motivo de separar el estado en
su propio archivo: editar markup de fichas a mano es donde se cometen errores.

---

## 3b. Escribir la guía

1. Copia una guía ya publicada del mismo curso (por ejemplo `calculo/s01.html`) sobre el archivo
   provisional que vas a reemplazar.
2. Cambia el `<title>`, el encabezado y el bloque `.hero`.
3. Reemplaza el contenido de las `<section class="card">`. Clases disponibles:
   `.def`, `.nota`, `.callout-dark`, `.formulas`, `.ejemplo` + `.paso`, `.tbl`, `.carrera`.
4. Reemplaza el bloque `OVA.quiz({...})` del final y ajusta los `id` de los `<div>` destino.
5. Si necesitas un visualizador nuevo, añádelo al `assets/viz-*.js` del curso y **cambia el `?v=`
   en todas las páginas** (ver §7).

## 4. Formato del banco de preguntas

```js
OVA.quiz({
  destino: 'quiz-ed02',            // id del <div> vacío donde se dibuja
  titulo:  'Factor integrante · 6 preguntas',
  items: [{
    etiqueta: 'Separables',        // opcional
    nivel: 2,                      // 1 básico · 2 intermedio · 3 avanzado
    criterio: 'Resolver una EDO separable',
    enunciado: 'La solución general de $\\dfrac{dy}{dx}=\\dfrac{y}{x}$ es:',
    opciones: ['$y = x + C$', '$y = Cx$', '$y = Ce^{x}$', '$y = \\ln x + C$'],
    correcta: 1,                   // ÍNDICE: 0=a, 1=b, 2=c, 3=d
    pista: 'Separa como $\\dfrac{dy}{y}=\\dfrac{dx}{x}$.',
    solucion: 'Explicación completa, incluido por qué falla el distractor típico.'
  }]
});
```

### Reglas que evitan el 95 % de los errores

- **Barra invertida doble** en LaTeX dentro de JavaScript: `\\dfrac`, `\\mathbb{R}`, `\\leq`.
- **Comillas.** Si el texto lleva un apóstrofo (por ejemplo la prima de `y'`), encierra
  la cadena en comillas **dobles**: `enunciado: "La ecuación $y' + 2y = 0$…"`.
  Con comillas simples el apóstrofo cierra la cadena y el quiz no carga.
- **Desigualdades** dentro de fórmulas: usa `\\lt` y `\\gt`, no `<` ni `>`.
- `correcta` es un **índice**, no una letra. La primera opción es `0`.
- Varía la posición de la respuesta correcta entre ítems.
- 5–6 preguntas por sesión es suficiente.
- `criterio` alimenta el resumen «Para repasar» del final: redáctalo como un verbo
  de desempeño («Resolver una EDO separable»), no como un tema («Separables»).

---

## 5. Validador

Cada página se autoevalúa al cargar. Con `?docente=1` aparece un aviso rojo si detecta:

- `correcta` fuera de rango o que no es un índice
- opciones repetidas o matemáticamente equivalentes
- ítems sin `solucion` o sin `criterio`
- quices sin preguntas o con `destino` inexistente

**Revisa siempre la página con `?docente=1` antes de compartir el enlace.**
Ese modo también abre todas las pistas y soluciones, útil para proyectar en clase.

Si el quiz no aparece en absoluto, es un error de sintaxis en el bloque `OVA.quiz`
(casi siempre comillas o barras invertidas). Abre F12 → *Console* y el mensaje
señalará la línea exacta.

---

## 6. Decisiones de diseño

- **Las prácticas no dan nota.** En un sitio estático las respuestas correctas viajan
  siempre al navegador y no hay forma de ocultarlas. Estos quices son refuerzo formativo;
  la calificación sale del trabajo escrito.
- **No se recoge ningún dato.** Solo se guardan localmente el programa académico elegido
  y la preferencia de modo oscuro. Nada sale del dispositivo del estudiante.
- **Un motor, cuatro cursos.** Arreglar algo en `assets/` beneficia a todas las semanas
  de todas las materias al mismo tiempo.
- **El contenido son datos, no HTML.** El motor genera los `id` de cada pregunta, así que
  no puede desincronizarse el identificador que busca el calificador con el que existe
  en la página — que fue el fallo que inutilizó seis de las ocho actividades del OVA anterior.

---

## 7. Si un gráfico sale en blanco

Es casi siempre un problema de archivos, no de código. El síntoma clásico es un recuadro vacío
con proporción 2:1 y la barra oscura de abajo sin texto: eso significa que el canvas se quedó en
su tamaño por defecto (300×150) porque **el visualizador nunca se ejecutó**.

Desde la versión actual, el propio lector te dice qué pasa. Si ves un aviso que empieza con ⚠,
sigue estos pasos en orden:

1. **Comprueba que el archivo esté subido.** Cada curso necesita el suyo:
   `assets/viz-calculo.js`, `viz-metodos.js`, `viz-vectorial.js`, `viz-edo.js`.
   En GitHub, entra a la carpeta `assets/` y verifica que estén los seis archivos.
2. **Comprueba que sea la versión nueva.** Ábrelo en GitHub y mira la fecha del último commit.
   Si subiste una versión anterior, vuelve a subirlo — GitHub te preguntará si quieres reemplazarlo.
3. **Salta la caché del navegador** con `Ctrl+F5` (o `Cmd+Shift+R` en Mac). GitHub Pages guarda
   los archivos en caché unos minutos y el navegador aún más.
4. **Mira la consola.** F12 → pestaña *Console*. Si dice `visualizador no registrado: "X"`,
   falta o está desactualizado el `viz-*.js` de ese curso, y te lista los que sí cargaron.

### Control de versiones de los assets

Todas las páginas enlazan los archivos con un sufijo de versión:

```html
<link rel="stylesheet" href="../assets/ova.css?v=20260827c">
<script src="../assets/viz-vectorial.js?v=20260827c"></script>
```

Ese `?v=` obliga al navegador a descargar el archivo de nuevo en lugar de usar el que tiene
guardado. **Cada vez que modifiques algo dentro de `assets/`, cambia ese número en todas las
páginas** (por ejemplo a `20260901a`). Si no lo haces, tus estudiantes podrían seguir viendo la
versión vieja durante horas.

---

## 8. Créditos, licencia y contacto

El pie de página se genera desde dos plantillas que viven en el HTML:

- **`index.html`** lleva el bloque completo: institución, departamento, autoría, licencia
  y fecha de última actualización.
- **El resto de páginas** lleva una versión compacta de dos líneas que enlaza a la portada.

### La dirección de correo no está en el código

El enlace «Reportar un error» **no contiene la dirección escrita**. Se guarda partida en dos
atributos y `assets/ova.js` la recompone al cargar la página:

```html
<a class="enlace-correo" data-u="fpipicano" data-d="profesores.uniajc.edu.co"
   data-asunto="OVA — Reporte">Reportar un error</a>
```

Los rastreadores de spam que leen el código fuente no encuentran una dirección válida, pero
para el estudiante el enlace funciona con normalidad. El asunto se completa automáticamente
con el nombre de la página desde la que se escribe, así que sabrás de inmediato a qué guía
se refiere el reporte.

**Si cambias de correo**, busca `data-u` y `data-d` en los 10 archivos HTML y actualízalos.

### Licencia

El material se publica bajo **CC BY-NC-SA 4.0**: cualquiera puede copiarlo y adaptarlo citando
la fuente, sin uso comercial, y compartiendo las obras derivadas con la misma licencia.
Si tu institución fija una política distinta, cambia el bloque `.cred-lic` de `index.html`
y la mención del pie compacto.

### Fecha de actualización

Está escrita a mano en el pie de `index.html`. Conviene actualizarla cada vez que publiques
una guía nueva: al estudiante le indica si lo que está viendo es lo más reciente.

---

## 9. Gráficas en tres dimensiones

Desde la Guía 3 de Cálculo Vectorial, el motor incluye `OVA.esc3d()`: una escena 3D con
proyección **ortográfica**, escrita a mano y **sin dependencias externas**. Se eligió ortográfica
y no en perspectiva porque en matemáticas conviene que las rectas paralelas se vean paralelas
y las longitudes sean comparables.

```js
var E = OVA.esc3d(canvas, { th: 0.9, ph: 0.5 });   // azimut e inclinación
E.ajustar(listaDePuntos3D);                        // encuadre automático
E.ejes(2.5).sombra(r, t0, t1).curva(r, t0, t1, color, 3);
E.flecha(P, Q, color, 3, 'v').punto(P, color);
```

**Lo que hace bien.** Encuadra solo (probado sin desbordes en 18 orientaciones), dibuja la sombra
sobre el plano z = 0 para dar profundidad, y funciona en modo oscuro.

**Su limitación, y conviene tenerla presente.** No hay eliminación de líneas ocultas: cuando la
curva pasa por detrás de un eje o de sí misma, se dibuja encima. Para curvas basta con girar la
escena, y por eso todos los visualizadores 3D llevan deslizador de giro.

**Cuando lleguen las superficies (semana 6)** habrá que añadir el algoritmo del pintor: trocear
la superficie en cuadriláteros, ordenarlos con `E.prof()` —que ya está implementada— y pintarlos
de atrás hacia adelante.

---

## 10. Superficies en 3D

`OVA.esc3d()` incluye `superficie(f, x0,x1, y0,y1, opts)`, que dibuja z = f(x,y) con el
**algoritmo del pintor**: trocea el dominio en cuadriláteros, los ordena por profundidad con
`prof()` y los pinta de atrás hacia adelante, de modo que lo cercano tapa lo lejano.

```js
var E = OVA.esc3d(canvas, { th: giro, ph: 0.52 });
E.ajustar(E.puntosSuperficie(f, -2, 2, -2, 2, 10));
E.ejes(2.6).superficie(f, -2, 2, -2, 2, { n: 18 });
```

Con una malla de 18×18 son 324 cuadriláteros y unas 2 600 operaciones de dibujo: **8 ms por
redibujado**, así que el deslizador de giro se mueve con fluidez. El color de cada cuadrilátero
depende de su altura, y se adapta al modo oscuro.

Esto resuelve la limitación que quedó anotada en la §9: ya hay eliminación de superficies ocultas
para mallas. Las curvas siguen dibujándose encima, que es lo deseable cuando representan un corte.
