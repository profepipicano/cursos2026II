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
│   ├── viz-calculo.js          explorador de funciones · acercamiento al límite · tangente
│   ├── viz-metodos.js          error de truncamiento de Taylor · bisección iterativa
│   ├── viz-vectorial.js        productos vectoriales · gradiente y curvas de nivel
│   └── viz-edo.js              campo de direcciones con clic
├── calculo/     index.html + s01.html   Repaso de funciones
├── metodos/     index.html + s01.html   Errores y aproximación
├── vectorial/   index.html + s01.html   Vectores y geometría del espacio
└── edo/         index.html + s01.html   EDO de primer orden
```

Cada curso tiene su índice con las 5 sesiones del Corte I: la sesión 1 activa y
las demás marcadas como pendientes.

---

## 3. Crear la semana siguiente (~40 minutos)

1. Copia `<curso>/s01.html` → `<curso>/s02.html`.
2. Cambia el `<title>`, el encabezado y el bloque `.hero`.
3. Reemplaza el contenido de las `<section class="card">`. Clases disponibles:
   `.def`, `.nota`, `.callout-dark`, `.formulas`, `.ejemplo` + `.paso`, `.tbl`, `.carrera`.
4. Reemplaza el bloque `OVA.quiz({...})` del final y cambia el `id` del `<div>` destino.
5. En `<curso>/index.html`, convierte la ficha de esa sesión de
   `<div class="tile" aria-disabled="true">` a `<a class="tile" href="s02.html">`
   y actualiza su descripción.
6. Sube el archivo a GitHub. Publicado.

**No edites `assets/` al crear una semana.** Si necesitas algo que el motor no hace,
añádelo al motor una vez y servirá para los cuatro cursos a la vez.

---

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
