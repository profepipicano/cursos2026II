/* ══════════════════════════════════════════════════════════
   ESTADO DE PUBLICACIÓN
   ----------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar al publicar una
   guía nueva. Añade el número de la semana a la lista de su
   curso y los cuatro índices se actualizan solos: la etiqueta
   de la ficha pasa de «Próximamente» a «Guía publicada» y el
   contador de la portada se recalcula.

   Ejemplo: al publicar la semana 6 de Cálculo, añade el 6 a su lista:
       calculo: [1, 2, 3, 4]   pasa a ser   calculo: [1, 2, 3, 4, 6]

   Recuerda subir también el archivo de la guía (calculo/s06.html)
   y cambiar el ?v= de los assets en las páginas si modificaste
   algo dentro de assets/.
   ══════════════════════════════════════════════════════════ */
window.OVA_PUBLICADAS = {
  calculo:   [1, 2, 3, 4],
  vectorial: [1, 2, 3, 4],
  metodos:   [1, 2, 3, 4],
  edo:       [1, 2, 3, 4]
};
