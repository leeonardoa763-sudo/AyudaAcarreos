# CLAUDE.md — acarreos-ayuda (Centro de Ayuda / Tutoriales)

Sitio estático de **ayuda y tutoriales** para nuevos usuarios de la app móvil
Control de Acarreos. Explica, con video + texto paso a paso, cómo usar la app.
En el mismo proyecto vivirá después una **presentación** (reveal.js).

> Proyecto hermano de `appAcarreos` (app móvil Expo/React Native) y
> `web_acarreos/WebAcarreosVer` (web de verificación Vite/React). Este es
> independiente de ambos.

---

## QUÉ ES / A QUIÉN ENSEÑA

Dos operaciones básicas de campo:

- **Residentes** → crean vales (renta y material)
- **Checadores** → registran viajes (renta y material)

Cada una con su versión **renta** y **material**. Se empezó por lo más simple:
**Residente → crear vale de RENTA** (única lección terminada por ahora).

---

## STACK — deliberadamente simple

**HTML + CSS + JavaScript "vanilla". SIN framework, SIN build, SIN npm.**

- No hay paso de compilación: los archivos se abren directo en el navegador y se
  despliegan tal cual. `npm` NO se usa aquí.
- Probar en local: doble clic en `index.html`, o Live Server (VS Code), o
  `npx serve` para simular un servidor real (`http://localhost`).
- Elegido así **a propósito**: el usuario está aprendiendo a programar y quiere
  ver los fundamentos sin la "magia" de un framework.

### Iconos — fuente RECORTADA y auto-hospedada
Fuente **Material Design Icons** v`7.4.47`, el **mismo set** que usa la app
(`MaterialCommunityIcons`), así que los dibujos coinciden. Uso:
`<i class="mdi mdi-nombre"></i>`.

**Ya NO viene del CDN de jsDelivr.** El CDN costaba **723 KB** (338 KB de CSS +
394 KB de fuente) para usar 54 de sus 7,447 iconos, y si el CDN no respondía la
página se quedaba sin ningún icono — justo el escenario de obra con mala señal.
Ahora se sirve desde `css/iconos.css` + `css/iconos.woff2`: **8.5 KB, −99 %**.

> ⚠️ **Al agregar un icono nuevo hay que regenerar la fuente**, o no se verá:
> ```
> python herramientas/generar-iconos.py
> ```
> El script escanea todo el HTML/JS, junta los `mdi-*` que encuentre y recorta
> la fuente a esos. Necesita `fonttools` y `brotli` (ver el docstring del
> script). `css/iconos.css` y `css/iconos.woff2` son **generados: no editarlos
> a mano.**

**La regla base de `iconos.css` termina en `font-size: inherit` y
`line-height: inherit`. No quitarlos.** El shorthand de la línea anterior fija
24px; los `inherit` lo anulan para que el icono obedezca al `font-size` que le
pone `estilos.css` (`.paso__titulo .mdi { font-size: 1.4rem }`, etc.). Sin
ellos, todos los iconos del sitio se ven del mismo tamaño.

Nota: `mdi-truck-multiple` **no existe** en MDI 7.4.47 — se usaba en las dos
lecciones de "crear vale" y salía como cuadro vacío. Reemplazado por
`mdi-truck-plus`. Si el script aborta con "no existen en MDI", es exactamente
este tipo de error; verificar el nombre en https://pictogrammers.com/library/mdi/

---

## ESTRUCTURA

```
acarreos-ayuda/
├── index.html                        # Portada: MENÚ de 4 botones grandes (nada más)
├── guia-renta-camion.html            # Guía Renta de Camión: MAPA + MODALES del checador
├── guia-material.html                # Guía Material (Flete): mapa (paso 1 listo, resto próximamente)
├── guia-asfaltico.html               # Guía Flete Asfáltico: UNA sola parada (crear vale) — proceso completo
├── guia-renta-pipa.html              # Guía Renta de Pipa: aún sin tutoriales (página puente)
├── ayuda-renta-crear-vale.html       # Lección: Residente crea vale de renta
├── ayuda-material-crear-vale.html    # Lección: Residente crea vale de material
├── ayuda-asfaltico-crear-vale.html   # Lección: Residente crea vale asfáltico
├── css/
│   ├── estilos.css               # TODOS los estilos, compartidos por todas las páginas
│   ├── iconos.css                # GENERADO — fuente MDI recortada a los 54 iconos usados
│   └── iconos.woff2              # GENERADO — la fuente en sí (4 KB)
├── herramientas/
│   └── generar-iconos.py         # Regenera los dos archivos de arriba (NO se despliega)
├── .vercelignore                 # Excluye herramientas/ y CLAUDE.md del sitio público
├── .gitignore                    # Excluye .vercel/ y el caché de la fuente
├── js/
│   ├── tutorial.js               # Autoplay de videos al hacer scroll (IntersectionObserver) — páginas de lección
│   ├── guia-modales.js           # Abre cada paso del checador en un modal (portada)
│   └── lupa.js                   # Amplía una imagen de ejemplo a pantalla completa
├── videos/                       # Clips .mp4 que graba el usuario (ver LEEME.txt)
│   └── LEEME.txt                 # Nombres EXACTOS que deben tener los videos
├── img/                          # (reservada) capturas/logo si hacen falta
└── vercel.json                   # Config mínima
```

### Portada = MENÚ de 4 botones (decisión del usuario)
`index.html` **no muestra pasos**. Solo pregunta "¿qué quieres ver?" con cuatro
botones grandes — **Material (Flete)**, **Renta de Camión**, **Renta de Pipa**,
**Flete Asfáltico** — cada uno un `<a>` a su página `guia-*.html`. Bloque `.menu`
en `estilos.css` sección 15 (CSS Grid `auto-fit`/`minmax`, 2 por fila en desktop,
1 en móvil; un color por tipo vía `.menu__boton--material|renta|pipa|asfaltico`).
Motivo: no abrumar al usuario nuevo con todos los procesos mezclados.

### Guías = MAPA del proceso
Cada `guia-*.html` muestra un **camino vertical** de paradas numeradas (clases
`.ruta`, `.ruta__parada`, `.ruta__num`, etc. en `estilos.css`, sección 13). Cada
parada con tutorial es un `<a>`; los nodos `.ruta__viaje` y `.ruta__ciclo` son
ilustrativos. Las paradas **sin tutorial todavía** son `<div>` con
`.ruta__parada--proximamente` (sección 16: apagadas, sin hover) + un
`<span class="etiqueta-proximamente">`. Las lecciones vuelven a **su guía**, no
a la portada.

**Pasos del checador = MODALES (no una página aparte).** Las paradas del checador
(asignar, ticket, registrar, completar) ya NO son enlaces a otra página: son
`<button data-paso="...">` que abren un **modal** con SOLO ese paso, aquí mismo.
El modal (`#modal-checador`) vive en `guia-renta-camion.html` **y también en
`guia-material.html`** (cada guía tiene el suyo, con el mismo `id` para que
`js/guia-modales.js` funcione en ambas sin cambios) y contiene los 4 pasos como
`<article class="modal__paso" data-paso data-siguiente>`; el JS deja visible el
activo (`.modal__paso--activo`). Botones: "Volver a la guía" (`data-cerrar`) y
"Siguiente paso" (`data-siguiente`, salta al `data-siguiente` del article activo).
Lógica en `js/guia-modales.js`; estilos en `estilos.css` sección 14. El paso
"ciclo" NO tiene modal propio: su mensaje va doblado dentro del modal de
"registrar" (la acción que se repite), y el nodo ilustrativo `.ruta__ciclo` con
su imagen sigue igual en el mapa. Por eso el video `renta-checador-paso-4.mp4`
(ciclo) quedó sin usar; los modales usan paso-1, 2, 3 y 5. El paso del
**residente** (crear vale) sí sigue siendo una página aparte: es una sola acción.

**Nodo "viaje al banco" (`.ruta__viaje`):** solo texto (el camión va al banco y
regresa). **Nodo "Y se repite" (`.ruta__ciclo`):** muestra un diagrama con
`<img class="ruta__ciclo-img">`; para cambiarlo se reemplaza esa imagen (mismo
nombre). **Cada guía tiene la suya, no se reusan:** `img/ciclo-renta.jpg` en
renta (el camión va a **descargar**) e `img/ciclo-material.jpg` en material (va a
**cargar** y regresa con la remisión). Las dos llevan `data-ampliar` + su botón
`.boton-ampliar` para verse en grande con la lupa.
Nota histórica: el nodo de viaje tuvo antes un camión animado (SVG `<animateMotion>`)
y luego un diagrama de iconos + curvas punteadas; ambos se quitaron a pedido del usuario.

---

## CONVENCIONES

- **Idioma:** todo en **español** (texto visible, clases CSS, comentarios).
- **Comentarios MUY explicativos:** el usuario aprende con este proyecto. Comentar
  el **porqué**, no solo el qué. Al hacer cambios, explicarle en el chat qué se
  hizo y por qué (conceptos de HTML/CSS/JS).
- **CSS con nomenclatura tipo BEM:** `.bloque`, `.bloque__elemento`,
  `.bloque--modificador` (ej. `.nota` y `.nota--alerta`).
- **Paleta = variables CSS en `:root`** (ver abajo). Nunca hex hardcodeado suelto;
  usar `var(--color-...)`. Son los mismos colores oficiales de la app.
- **Navegación entre páginas = `<a href="...">`** con rutas **relativas**. Solo
  recurrir a JavaScript si la navegación es condicional (no es el caso hoy).

### Paleta (en `css/estilos.css`, `:root`)

| Variable | Hex | Uso |
|---|---|---|
| `--color-primary` | `#ff6b35` | Naranja: acentos, iconos de título, alertas |
| `--color-secondary` | `#004e89` | Azul: encabezados y títulos |
| `--color-accent` | `#1a936f` | Verde: notas informativas, tarjeta de éxito |
| `--color-surface` | `#ffffff` | Fondo de tarjetas |
| `--color-background` | `#f5f6fa` | Fondo general |
| `--color-text` | `#2c3e50` | Texto principal |
| `--color-text-soft` | `#7f8c8d` | Texto secundario |

---

## PATRONES DE LA LECCIÓN (reutilizar al crear nuevas)

- **Paso:** `<section class="paso">` con dos columnas — `.paso__texto` (número,
  título con icono, lista de instrucciones, notas) y `.telefono` (marco con el
  `<video>`). `.paso` usa flexbox con `flex-wrap`: en pantalla ancha van lado a
  lado; en móvil se apilan solos.
- **Marco de teléfono:** `.telefono` > `.telefono__muesca` + `<video class="telefono__video">`.
  El `<video>` usa `aspect-ratio: 9 / 18` + `object-fit: contain` (muestra el
  video completo sin recortar). Ese `9 / 18` es el único número a afinar según
  el video real.
- **Video:** atributos `controls muted loop playsinline preload="metadata"`.
  `muted` es OBLIGATORIO para que el navegador permita el autoplay; `loop` lo
  repite. El autoplay al hacer scroll lo maneja `js/tutorial.js`.
- **Notas:** `.nota` (verde, informativa) y `.nota--alerta` (naranja, "cuidado si
  te equivocas"). Cada una abre con un `<i class="mdi ...">`.
- **Cierre:** tarjeta `.resultado` (verde) que es un `<a href="index.html">` —
  toda la tarjeta funciona como botón de "Volver al inicio".
- **Imagen ampliable (lupa):** para que una foto de ejemplo se pueda ver en
  grande, basta ponerle `data-ampliar="img/archivo.jpg"`. El cursor de lupa sale
  solo (regla `img[data-ampliar]`, sin clase extra). Se acompaña de un
  `<button class="boton-ampliar">` con el **mismo** `data-ampliar` — en celular
  nadie adivina que la foto se toca. La página debe
  incluir el `<div class="lupa" id="lupa" hidden>` y cargar `js/lupa.js`. Es
  genérico: sirve para cualquier imagen de cualquier página. Estilos en la
  sección **17** de `estilos.css`.
  > **Ojo con Escape:** `guia-modales.js` y `lupa.js` escuchan los dos la tecla.
  > Por eso `lupa.js` se carga **después** y `guia-modales.js` tiene un candado
  > que no cierra el modal si la lupa está abierta. Así Escape cierra una capa a
  > la vez, la de arriba primero.

### Videos — convención de nombres
Un `.mp4` (H.264) por paso, vertical, corto (5–15 s) y comprimido. Nombres:
`renta-paso-1.mp4` … `renta-paso-5.mp4`. Al colocarlos en `videos/` aparecen
solos (el HTML ya apunta a esos nombres). Detalle completo en `videos/LEEME.txt`.

### Videos — COMPRESIÓN OBLIGATORIA antes de desplegar

Las grabaciones de pantalla salen del celular a 1080×2340 y 2–11 Mbps. Los 31
clips pesaban **360 MB**; comprimidos quedaron en **29 MB (−92 %)** sin
diferencia visible (el texto de la UI se lee igual). Todo video nuevo debe pasar
por esto — si no, un checador en obra se descarga 30 MB por un clip de 10 s y se
agota el ancho de banda del plan Hobby (100 GB/mes).

```
ffmpeg -i ORIGEN.mp4 \
  -vf "scale='if(gt(ih,iw),720,-2)':'if(gt(ih,iw),-2,720)'" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
  -movflags +faststart -an DESTINO.mp4
```

Por qué cada parte:
- **720 px de ancho.** El marco `.telefono` mide ~300 px en pantalla; 1080 px era
  servir 3.5× más píxeles de los que se ven.
- **El `if` en `scale`.** Los clips vienen mezclados: unos reportan `1080x2340` y
  otros `2340x1080` con etiqueta `rotate: 90`. La condición escala por el lado
  corto en ambos casos.
- **`-crf 26`.** Se comparó contra 28: la diferencia de peso era ~600 KB y 26 deja
  el texto más nítido. Menor número = mejor calidad y más peso.
- **`-an`.** Algunos clips traen audio AAC, pero el HTML los reproduce con `muted`
  (obligatorio para el autoplay). Ese audio nunca se oye: solo pesa.
- **`+faststart`.** Mueve el índice del MP4 al inicio para que empiece a
  reproducirse sin descargar el archivo completo. Crítico con señal mala en obra.

Nota: al recomprimir, ffprobe puede reportar hasta ~0.5 s menos de duración. No
se pierde contenido — es un artefacto de los timestamps variables (VFR) de la
grabación; el conteo de cuadros se mantiene o sube.

**Los originales sin comprimir están en `d:\Documents\Acarreos\videos-originales-ayuda\`**,
deliberadamente FUERA de esta carpeta: Vercel despliega el directorio completo y
un respaldo adentro subiría los 360 MB de todas formas.

---

## FLUJO REAL DE "CREAR VALE DE RENTA"

Fuente de verdad: `appAcarreos/src/screens/ValeRentaScreen.js`. El texto del
tutorial debe coincidir con la app. Resumen:

1. Nuevo vale → elegir **Renta** (`SeleccionarTipoValeScreen`).
2. **Datos de Vale:** Obra (la Empresa se autocompleta) → Material → Sindicato →
   Fecha y Hora de Inicio.
3. Casilla opcional **Turno nocturno** (da 12 h para completar).
4. Botón **Crear Vale** (si no hay presupuesto: "Presupuesto Agotado",
   deshabilitado).
5. Modal de éxito: operador y vehículo quedan **pendientes** (se asignan luego en
   Acarreos; eso lo hace el checador).

### Reglas de negocio a reflejar en el texto
- **Material** es dinámico: es solo el material base de inicio; se puede cambiar
  al registrar los viajes. No importa no saberlo con certeza al crear el vale.
- **Sindicato:** normalmente **CTM**; camión de empresa/interno → **Grupo GEEM**.
  CRÍTICO: los sindicatos están enlazados a los camiones; uno equivocado hace que
  esos camiones no aparezcan al registrar viajes.
- **Presupuesto:** arriba se muestra el presupuesto de la obra para renta; si se
  agota no se pueden crear vales; para más, contactar al administrador.
- **Un vale = un camión.** Para 2 camiones ese día, se crean 2 vales.

---

## FLUJO REAL DE MATERIAL — CHECADOR (pétreo y producto de corte)

Fuente de verdad: `appAcarreos/src/componets/acarreos/helpersMaterial/`
(`TicketsMaterialSection.js`, `ViajesMaterialSection.js`, `ModalCambiarBanco.js`,
`ModalEvidenciaViaje.js`, `ValeFormCompletarNormal.js`) y
`src/hooks/useViajesMaterial.js`.

**No hay dos pantallas.** Pétreo (`id_tipo_de_material = 1`: grava, arena, base) y
producto de corte (tipo 3: tepetate, escombro) usan **el mismo flujo**; lo que cambia
es el material que se eligió al crear el vale. Por eso `guia-material.html` es **un
solo camino** y las diferencias se marcan con los chips `Solo pétreo` / `Solo corte`
(mismo criterio que ya usaba la lección del residente con la Requisición).

Ciclo obligatorio: **ticket → viaje → ticket → viaje**. Sin ticket impreso, la app
bloquea el viaje con *"Ticket requerido"*.

### Las 4 diferencias reales

| | Pétreo | Producto de corte |
|---|---|---|
| Registrar viaje | **Peso (ton)** editable + **Folio de Remisión** obligatorio | **Capacidad (m³)** precargada del vehículo, **no editable**, sin folio |
| Conversión | ton ÷ peso específico → m³ | el m³ va directo |
| Cambiar banco por viaje | no existe (siempre el mismo banco) | **sí**, al imprimir el ticket #02 en adelante |
| Requisición en el ticket impreso | sí aparece | no aparece |

Asignar vehículo, foto de evidencia (obligatoria, con validación GPS) y cerrar el
vale son idénticos en los dos.

### Reglas que el tutorial debe reflejar
- **Tiempo mínimo entre viajes:** ~20 min por defecto (`obras.min_minutos_entre_viajes`).
- **Jornada:** 8:00 AM – 3:00 AM. Un vale de jornada anterior ya no acepta viajes.
- **Sin soporte offline:** sin señal no se puede imprimir ticket ni registrar viaje.
- **Reimpresión:** ticket y PDF, **una sola vez** cada uno.
- **Para cerrar:** tickets y viajes deben coincidir, si no sale *"Viajes incompletos"*.
- El **QR** del ticket/PDF abre `web-acarreos.vercel.app/vale/{folio}` **sin sesión**;
  los precios quedan ocultos.

### Nota sobre el CSS y el JS que esto agregó
- `.modal__variante` (+ `--petreo` / `--corte`) en `estilos.css` sección 14: barra de
  color a la izquierda para separar los dos caminos dentro del paso "Registrar el
  viaje". Es el **único** paso que tiene dos bloques.
- `js/guia-modales.js` pasó de `querySelector` a `querySelectorAll` para los videos:
  un paso puede tener **más de uno**. Autoplay solo del primero; el segundo lo
  arranca el usuario con sus controles.

---

## DEPLOY

**Proyecto Vercel dedicado `acarreos-ayuda`** (cuenta personal
`bruno-leonardos-projects-54c4577c`, plan Hobby). **YA DESPLEGADO** en
producción:

### 🔗 https://acarreos-ayuda.vercel.app

### Repo: https://github.com/leeonardoa763-sudo/AyudaAcarreos (privado)

**Conectado a Vercel: `git push` despliega solo.** Ya no hay que correr nada a
mano:

```
git add -A
git commit -m "lo que cambiaste"
git push
```

`main` → producción. Cualquier otra rama → deploy de *preview* con su propia URL
(útil para revisar un cambio antes de que lo vean los usuarios).

Si alguna vez hace falta desplegar sin pasar por git (por ejemplo para probar
algo rápido sin commit):

```
vercel deploy --prod --yes
```

Ojo: el nombre del repo (`AyudaAcarreos`) y el de la carpeta/proyecto Vercel
(`acarreos-ayuda`) son distintos. Es normal, no hay que "arreglarlo".

**URLs con `.html`** (decisión del usuario): `/guia-material.html`,
`/guia-renta-camion.html`, etc. **NO activar `cleanUrls`** en `vercel.json`: la
app móvil enlaza a estas rutas ya compiladas y quitarles el `.html` las rompe.
Además así lo que se abre en local con doble clic es idéntico a producción.

---

## ESTADO / ROADMAP

- [x] Scaffold (index hub, css, js).
- [x] Lección **Residente: crear vale de renta** (pasos, notas, iconos, autoplay,
      botón de volver).
- [x] Lección **Residente: crear vale de material**.
- [x] Lección **Residente: crear vale asfáltico**.
- [x] Portada convertida en **menú de 4 botones** (Material / Renta de Camión /
      Renta de Pipa / Flete Asfáltico). El mapa del proceso pasó a
      `guia-renta-camion.html`; material y asfáltico tienen su propia guía.
- [x] Lección **Checador: registrar viajes de renta** — ahora como **modales por
      paso** dentro de `index.html` (la página `ayuda-renta-registrar-viajes.html`
      se retiró; su contenido pasó a los modales). Lógica en `js/guia-modales.js`.
- [x] Lección **Checador: registrar viajes de material** — `guia-material.html` pasó
      de 4 paradas (3 en "próximamente") a **6 paradas + 2 nodos ilustrativos**, con
      su propio `#modal-checador` de 5 pasos: asignar → ticket → registrar → banco →
      completar. El paso "registrar" se bifurca en pétreo/corte con `.modal__variante`.
      La parada "Cambiar el banco de un viaje" es **solo corte** (lleva su chip).
- [x] Colocar los videos reales que grabe el usuario (incl. `renta-checador-paso-1..5.mp4`
      y los 6 de `material-checador-*`). Los 31 están puestos y comprimidos.
- [x] **Comprimir los videos**: 360 MB → 29 MB (−92 %). Receta en la sección de videos.
- [x] Desplegar en Vercel (proyecto `acarreos-ayuda`, producción):
      **https://acarreos-ayuda.vercel.app**
- [x] **Iconos auto-hospedados y recortados**: 723 KB (CDN) → 8.5 KB (−99 %), y ya
      no dependen de que jsDelivr responda. Ver sección "Iconos".
- [x] **Repo en GitHub** (privado) **conectado a Vercel**: `git push` despliega solo.
- [ ] Enlazar el Centro de Ayuda desde la app móvil (`appAcarreos`).
- [ ] Pendiente menor: favicon + `<meta name="description">` (hoy al compartir el
      link por WhatsApp sale sin ícono ni descripción).
- [ ] Tutoriales de **Renta de Pipa** (`guia-renta-pipa.html` está vacía a
      propósito, solo redirige a Renta de Camión).
- [ ] **Presentación** (reveal.js) en el mismo proyecto.

---

## AL TRABAJAR EN ESTE PROYECTO

- Ir **paso a paso**, un cambio a la vez, y **explicarle al usuario** el porqué
  (está aprendiendo).
- Reutilizar los patrones/clases existentes antes de crear estilos nuevos.
- Nuevas lecciones = copiar la estructura de `ayuda-renta-crear-vale.html` y
  activar su parada en la `guia-*.html` que corresponda: cambiar el
  `<div class="ruta__parada ruta__parada--proximamente">` por un
  `<a class="ruta__parada" href="...">`, y sustituir el
  `<span class="etiqueta-proximamente">` por el `<span class="ruta__ir">`.
- La portada (`index.html`) casi nunca se toca: son solo 4 botones fijos.
