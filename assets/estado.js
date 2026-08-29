/* ══════════════════════════════════════════════════════════
   ESTADO DE PUBLICACIÓN
   ----------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar al publicar una
   guía nueva. Añade el número de la semana a la lista de su
   curso y los cuatro índices se actualizan solos: la etiqueta
   de la ficha pasa de «Próximamente» a «Guía publicada» y el
   contador de la portada se recalcula.

   Ejemplo: al publicar la semana 2 de Cálculo, cambia
       calculo: [1]      →      calculo: [1, 2]

   Recuerda subir también el archivo de la guía (calculo/s02.html)
   y cambiar el ?v= de los assets en las páginas si modificaste
   algo dentro de assets/.
   ══════════════════════════════════════════════════════════ */
window.OVA_PUBLICADAS = {
  calculo:   [1, 2, 3],
  vectorial: [1, 2, 3],
  metodos:   [1, 2, 3],
  edo:       [1, 2, 3, 4]
};
