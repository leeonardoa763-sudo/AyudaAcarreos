/* ============================================================================
   lupa.js — Ver una imagen de ejemplo EN GRANDE.

   El problema: las fotos de ejemplo (una remisión, una requisición…) están
   dentro de un desplegable y, a veces, dentro de un modal. Ahí se ven
   chiquitas y no se alcanza a leer lo importante (el folio, el peso).

   La solución: al tocar la imagen (o su botón "Ampliar imagen"), se abre una
   capa negra a pantalla completa con esa misma foto en grande.

   Es GENÉRICO: no sabe nada de remisiones ni de material. Funciona con
   CUALQUIER elemento que tenga el atributo data-ampliar con la ruta de una
   imagen. Para usarlo en otra página solo hay que copiar el <div class="lupa">
   y cargar este archivo.

   Conceptos de JavaScript que aparecen aquí:
   - closest(): sube por los "padres" buscando quién cumple un CSS. Sirve porque
     el clic puede caer en el <i> del icono y no en el <button>.
   - delegación de eventos: en vez de un listener por imagen, ponemos UNO en el
     documento y ahí revisamos qué se tocó. Así funciona incluso con las
     imágenes que están escondidas dentro de un <details> cerrado.
   ============================================================================ */

// --- 1) Las piezas de la lupa. ----------------------------------------------
const lupa = document.getElementById("lupa");
const lupaImg = document.getElementById("lupa-img");

// Si esta página no tiene lupa en su HTML, no hacemos nada. Sin este "portero",
// las líneas de abajo tronarían con un error en la consola.
if (lupa && lupaImg) {
  // --- 2) Abrir la lupa con una imagen concreta. ----------------------------
  function abrirLupa(rutaImagen, textoAlternativo) {
    lupaImg.src = rutaImagen;
    lupaImg.alt = textoAlternativo || "Imagen ampliada";
    lupa.hidden = false; // quitamos `hidden` -> se ve (ver .lupa[hidden] en el CSS)
  }

  // --- 3) Cerrar la lupa. --------------------------------------------------
  // OJO: aquí NO tocamos el scroll de la página (document.body.style.overflow).
  // Cuando la lupa se abre desde dentro del modal, ese scroll ya lo bloqueó
  // guia-modales.js; si lo "devolviéramos" al cerrar la lupa, el modal quedaría
  // abierto pero con la página de atrás moviéndose. Mejor no meternos.
  function cerrarLupa() {
    lupa.hidden = true;
    lupaImg.src = ""; // soltamos la imagen para no dejarla cargada en memoria
  }

  // --- 4) Un solo listener de clics para todo. ------------------------------
  document.addEventListener("click", (evento) => {
    // a) ¿Se tocó algo que pide ampliar? (la imagen o el botón "Ampliar")
    const disparador = evento.target.closest("[data-ampliar]");
    if (disparador) {
      abrirLupa(
        disparador.dataset.ampliar,
        // Si el disparador es la imagen misma, reaprovechamos su alt.
        disparador.getAttribute("alt") || disparador.dataset.ampliarAlt
      );
      return;
    }

    // Si la lupa está cerrada, ya no hay nada más que revisar.
    if (lupa.hidden) return;

    // b) Clic en la "X" -> cerrar.
    if (evento.target.closest("[data-lupa-cerrar]")) {
      cerrarLupa();
      return;
    }

    // c) Clic en el fondo negro (fuera de la imagen) -> cerrar.
    //    Preguntamos si el clic NO cayó dentro de la imagen: así, tocar la foto
    //    para verla mejor no la cierra sin querer.
    if (!evento.target.closest(".lupa__img")) {
      cerrarLupa();
    }
  });

  // --- 5) Cerrar con Escape. ------------------------------------------------
  // Importante: guia-modales.js también escucha Escape para cerrar el modal.
  // Como la lupa se abre ENCIMA del modal, allá agregamos un candado que revisa
  // si la lupa está abierta y, en ese caso, deja pasar el Escape para nosotros.
  // Así una sola tecla cierra una capa a la vez, empezando por la de arriba.
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !lupa.hidden) {
      cerrarLupa();
    }
  });
}
