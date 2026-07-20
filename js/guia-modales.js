/* ============================================================================
   guia-modales.js — Abre el tutorial de cada paso del CHECADOR en un modal.

   Idea general: en el mapa de la portada, los pasos del checador son <button>
   con un atributo data-paso (ej. data-paso="asignar"). Al tocar uno, mostramos
   una ventana flotante (el "modal") con SOLO ese paso. Dentro del modal hay un
   botón "Siguiente paso" que cambia al paso que sigue sin cerrar la ventana, y
   un botón/"X" para volver a la guía.

   Todo con JavaScript "de navegador" (sin librerías). Los conceptos clave:
   - querySelector / querySelectorAll: buscar elementos por su CSS.
   - dataset: leer atributos data-* (data-paso -> elemento.dataset.paso).
   - classList: agregar/quitar clases CSS (para mostrar/ocultar).
   - addEventListener: reaccionar a clics y teclas.
   ============================================================================ */

// --- 1) Agarramos las piezas del modal que vamos a usar muchas veces. --------
const modalFondo = document.getElementById("modal-checador"); // el telón + tarjeta
const pasos = document.querySelectorAll(".modal__paso"); // los 4 <article> de pasos

// Guardamos cuál paso se está viendo ahora (por su nombre: "asignar", etc.).
// Nos sirve para saber a quién pausarle el video y para el botón "Siguiente".
let pasoActual = null;

// --- 2) Mostrar un paso concreto dentro del modal. ---------------------------
// Recibe el nombre del paso (ej. "ticket"). Oculta todos los <article> y deja
// visible solo el que coincide. También arranca su video y pausa los demás.
function mostrarPaso(nombrePaso) {
  pasos.forEach((articulo) => {
    // ¿Este <article> es el que queremos mostrar?
    const esElActivo = articulo.dataset.paso === nombrePaso;

    // La clase .modal__paso--activo es la que en el CSS hace display: block.
    articulo.classList.toggle("modal__paso--activo", esElActivo);

    // Manejo de los videos de ESE paso: el activo se reproduce, el resto se
    // pausa y se rebobina para que no siga corriendo escondido.
    //
    // OJO: usamos querySelectorAll (plural) porque un paso puede tener MÁS DE
    // UN video. Pasa en la guía de material: el paso "Registrar el viaje" trae
    // uno para pétreo y otro para producto de corte. Con querySelector
    // (singular) solo se manejaba el primero y el segundo se quedaba
    // reproduciéndose al cambiar de paso.
    const videos = articulo.querySelectorAll(".telefono__video");

    videos.forEach((video, indice) => {
      // Solo arrancamos solo el PRIMER video del paso activo. Si el paso tiene
      // dos, reproducirlos a la vez marearía; el segundo lo arranca el usuario
      // con sus propios controles cuando llegue a él.
      if (esElActivo && indice === 0) {
        // play() puede fallar si el navegador bloquea el autoplay; el .catch()
        // vacío evita un error en consola (el usuario puede darle play a mano).
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  });

  pasoActual = nombrePaso;

  // La tarjeta del modal puede tener scroll propio; al cambiar de paso la
  // subimos hasta arriba para empezar a leer desde el título.
  const tarjeta = modalFondo.querySelector(".modal");
  if (tarjeta) tarjeta.scrollTop = 0;
}

// --- 3) Abrir el modal en un paso dado. --------------------------------------
function abrirModal(nombrePaso) {
  mostrarPaso(nombrePaso);
  modalFondo.hidden = false; // quitamos el atributo `hidden` -> se ve

  // Bloqueamos el scroll de la página de atrás para que solo se mueva el modal.
  document.body.style.overflow = "hidden";
}

// --- 4) Cerrar el modal (volver a la guía). ----------------------------------
function cerrarModal() {
  modalFondo.hidden = true;
  document.body.style.overflow = ""; // devolvemos el scroll normal a la página

  // Pausamos los videos del paso que quedó abierto, para que no sigan sonando
  // detrás del modal cerrado. Otra vez en plural: pueden ser varios.
  document
    .querySelectorAll(".modal__paso--activo .telefono__video")
    .forEach((video) => video.pause());

  pasoActual = null;
}

// --- 5) Conectar los BOTONES DEL MAPA (las paradas del checador). ------------
// Cada botón con data-paso abre el modal en ese paso.
document.querySelectorAll(".ruta__parada[data-paso]").forEach((boton) => {
  boton.addEventListener("click", () => abrirModal(boton.dataset.paso));
});

// --- 6) Conectar los BOTONES DENTRO DEL MODAL. -------------------------------
// Usamos "delegación de eventos": en vez de un listener por botón, ponemos uno
// solo en el modal y, cuando hay un clic, miramos QUÉ se tocó. Así funciona
// aunque los botones estén en distintos pasos.
modalFondo.addEventListener("click", (evento) => {
  const objetivo = evento.target;

  // a) Clic en el telón oscuro (fuera de la tarjeta blanca) -> cerrar.
  if (objetivo === modalFondo) {
    cerrarModal();
    return;
  }

  // closest() sube por los "padres" buscando un elemento que cumpla el CSS.
  // Sirve porque a veces el clic cae en el <i> del icono, no en el <button>.

  // b) Cualquier cosa con data-cerrar -> cerrar (la "X", "Volver", "Terminar").
  if (objetivo.closest("[data-cerrar]")) {
    cerrarModal();
    return;
  }

  // c) Botón "Siguiente paso": leemos a dónde va desde el <article> actual.
  //    OJO: pedimos `button[data-siguiente]` (no solo [data-siguiente]) porque el
  //    <article> del paso TAMBIÉN tiene data-siguiente (lo usamos como dato). Sin
  //    el "button", tocar el texto del paso saltaría de paso sin querer.
  if (objetivo.closest("button[data-siguiente]")) {
    const articuloActivo = modalFondo.querySelector(".modal__paso--activo");
    const siguiente = articuloActivo && articuloActivo.dataset.siguiente;
    if (siguiente) mostrarPaso(siguiente);
  }
});

// --- 7) Cerrar con la tecla Escape (atajo cómodo de teclado). ----------------
document.addEventListener("keydown", (evento) => {
  if (evento.key !== "Escape" || modalFondo.hidden) return;

  // CANDADO: si encima del modal hay una imagen ampliada (la "lupa" de
  // js/lupa.js), Escape es para ELLA, no para nosotros. Si no revisáramos esto,
  // una sola tecla cerraría las dos capas de golpe y el usuario perdería el
  // paso que estaba leyendo. Se cierra una capa a la vez, la de más arriba
  // primero.
  const lupa = document.getElementById("lupa");
  if (lupa && !lupa.hidden) return;

  cerrarModal();
});
