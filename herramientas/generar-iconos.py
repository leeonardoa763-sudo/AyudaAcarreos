"""
generar-iconos.py — Regenera css/iconos.css y css/iconos.woff2.

QUE HACE
    La fuente completa de Material Design Icons trae ~7,400 dibujos y pesa
    723 KB (CSS + fuente). Este sitio usa ~54. Este script lee TODO el HTML/JS
    del proyecto, junta los iconos que realmente aparecen, y genera una fuente
    recortada de ~8 KB con solo esos.

CUANDO CORRERLO
    Cada vez que agregues un icono nuevo (un <i class="mdi mdi-loquesea">) a
    cualquier pagina. Si no lo corres, ese icono NO se vera: no esta en la
    fuente recortada.

COMO CORRERLO
    Necesita Python y dos librerias. Desde la carpeta acarreos-ayuda/:

        python -m venv .venv
        .venv\\Scripts\\pip install fonttools brotli
        .venv\\Scripts\\python herramientas/generar-iconos.py

    (En Mac/Linux: .venv/bin/pip y .venv/bin/python)

    Requiere internet la primera vez: descarga la fuente original del CDN.

    OJO: si creas la carpeta .venv aqui dentro, agregala al .gitignore y NO la
    despliegues — son varios MB que no pintan nada en el sitio.

SI ALGO FALLA
    - "no existen en MDI": escribiste mal el nombre de un icono, o ese icono no
      existe en esta version. Buscalo en https://pictogrammers.com/library/mdi/
    - Para ver los iconos actuales sin correr nada: abre css/iconos.css, cada
      regla .mdi-xxx es uno.
"""

import re
import subprocess
import sys
import urllib.request
from pathlib import Path

VERSION = "7.4.47"  # fija a proposito: que no cambie sola con una actualizacion
BASE = f"https://cdn.jsdelivr.net/npm/@mdi/font@{VERSION}"

SITIO = Path(__file__).resolve().parent.parent
CSS_DIR = SITIO / "css"
CACHE = Path(__file__).resolve().parent / ".cache-mdi.woff2"


def descargar():
    """Trae el CSS original (para el mapa de codigos) y la fuente completa."""
    print(f"Descargando MDI v{VERSION}...")
    css = urllib.request.urlopen(f"{BASE}/css/materialdesignicons.min.css").read().decode("utf-8")
    if not CACHE.exists():
        CACHE.write_bytes(urllib.request.urlopen(f"{BASE}/fonts/materialdesignicons-webfont.woff2").read())
    return css


def iconos_del_sitio():
    """Busca 'mdi-loquesea' en todo el HTML, JS y en estilos.css."""
    archivos = [*SITIO.glob("*.html"), *(SITIO / "js").glob("*.js"), CSS_DIR / "estilos.css"]
    texto = "\n".join(a.read_text(encoding="utf-8", errors="ignore") for a in archivos if a.exists())
    # "mdi-set" es una clase auxiliar de MDI, no un icono.
    return sorted({m[4:] for m in re.findall(r"mdi-[a-z0-9]+(?:-[a-z0-9]+)*", texto)} - {"set"})


def main():
    css_original = descargar()

    # En el CSS original cada icono se ve asi: .mdi-truck::before{content:"\F07CB"}
    mapa = dict(re.findall(r'\.mdi-([a-z0-9-]+)::before\{content:"\\([0-9A-Fa-f]+)"\}', css_original))
    usados = iconos_del_sitio()

    faltan = [u for u in usados if u not in mapa]
    if faltan:
        print(f"\nERROR: estos iconos no existen en MDI v{VERSION}:")
        for f in faltan:
            print(f"   mdi-{f}")
        print("\nRevisa que esten bien escritos: https://pictogrammers.com/library/mdi/")
        return 1

    print(f"Iconos usados por el sitio: {len(usados)} (de {len(mapa)} disponibles)")

    # --- Recortar la fuente -------------------------------------------------
    unicodes = ",".join("U+" + mapa[u].upper() for u in usados)
    woff2 = CSS_DIR / "iconos.woff2"
    subprocess.run(
        [sys.executable, "-m", "fontTools.subset", str(CACHE),
         f"--unicodes={unicodes}", "--flavor=woff2",
         "--layout-features=", "--no-hinting", "--desubroutinize",
         f"--output-file={woff2}"],
        check=True,
    )

    # --- Escribir el CSS ----------------------------------------------------
    reglas = "\n".join(f'.mdi-{n}::before {{ content: "\\{mapa[n].upper()}"; }}' for n in usados)
    (CSS_DIR / "iconos.css").write_text(f"""/*
  iconos.css — Fuente de iconos Material Design Icons, RECORTADA.

  ARCHIVO GENERADO: NO EDITAR A MANO.
  Se regenera con:  python herramientas/generar-iconos.py
  (correlo cada vez que agregues un icono nuevo al sitio, o no se vera)

  Antes estos iconos venian del CDN de jsDelivr: 338 KB de CSS + 394 KB de
  fuente = 723 KB, para usar solo {len(usados)} de los {len(mapa)} iconos que trae MDI.
  Este archivo trae UNICAMENTE esos {len(usados)}, y se sirve desde nuestro propio Vercel:

    1. Pesa ~99% menos.
    2. Ya no depende de que el CDN responda. En obra, con senal mala, antes se
       corria el riesgo de que la pagina se quedara sin ningun icono.

  Basado en @mdi/font v{VERSION} (licencia Apache 2.0 / SIL OFL 1.1).
*/

@font-face {{
  font-family: "Material Design Icons";
  src: url("iconos.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  /* Mientras la fuente carga, muestra el texto con una fuente de respaldo en
     vez de dejar un hueco en blanco. */
  font-display: swap;
}}

/* Clase base: la que convierte un <i> en un icono.
   Copia fiel de la regla base del MDI original. Los dos "inherit" NO son
   opcionales: sin ellos el icono se queda clavado en 24px y deja de obedecer
   al font-size que le pone estilos.css (p.ej. .paso__titulo .mdi). */
.mdi::before,
.mdi-set {{
  display: inline-block;
  font: normal normal normal 24px/1 "Material Design Icons";
  font-size: inherit;
  line-height: inherit;
  text-rendering: auto;
  /* Suaviza el dibujo del icono. */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}}

/* Un icono por regla: el "content" es el codigo del dibujo dentro de la fuente. */
{reglas}
""", encoding="utf-8")

    kb = (woff2.stat().st_size + (CSS_DIR / "iconos.css").stat().st_size) / 1024
    print(f"\nOK  css/iconos.woff2 + css/iconos.css = {kb:.1f} KB (antes: 723 KB desde el CDN)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
