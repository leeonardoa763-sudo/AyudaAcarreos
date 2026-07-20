/* ============================================================================
   tutorial.js — Reproduce cada video AUTOMÁTICAMENTE al hacer scroll.

   La idea: mientras un paso está en pantalla, su video se reproduce solo; en
   cuanto sale de la vista, se pausa (así no suenan/gastan datos todos a la vez).

   La herramienta que usamos se llama "IntersectionObserver". Es del navegador
   (no hay que instalar nada). Su trabajo es AVISARNOS cuando un elemento entra
   o sale de la pantalla, sin que tengamos que estar midiendo el scroll a mano.
   ============================================================================ */

// 1) Buscamos en la página TODOS los videos del tutorial.
//    querySelectorAll(".telefono__video") devuelve una lista con todos los
//    elementos que tienen esa clase CSS.
const videos = document.querySelectorAll(".telefono__video");

// 2) Creamos el "observador". Recibe una función que el navegador llamará cada
//    vez que alguno de los videos entre o salga de la pantalla.
const observador = new IntersectionObserver(
  (entradas) => {
    // "entradas" es la lista de videos cuyo estado de visibilidad cambió.
    entradas.forEach((entrada) => {
      const video = entrada.target; // el <video> concreto que cambió

      if (entrada.isIntersecting) {
        // Está visible -> lo reproducimos.
        // play() puede fallar si el navegador bloquea el autoplay; por eso el
        // .catch() vacío: si falla, simplemente no hacemos nada (el usuario
        // siempre puede darle play a mano con los controles).
        video.play().catch(() => {});
      } else {
        // Ya no está visible -> lo pausamos para que no siga corriendo.
        video.pause();
      }
    });
  },
  {
    // threshold 0.5 = considera "visible" cuando al menos el 50% del video
    // está dentro de la pantalla. Sube el número (ej. 0.8) para que empiece
    // solo cuando esté casi completo; bájalo para que arranque antes.
    threshold: 0.5,
  },
);

// 3) Le decimos al observador que vigile cada uno de los videos.
videos.forEach((video) => observador.observe(video));
