"""
limpiar-svg.py — Adelgaza los SVG que exporta mermaid.live.

EL PROBLEMA
-----------
mermaid.live incrusta la fuente completa "Recursive Variable" dentro de cada
SVG, codificada en base64: son ~81 KB por archivo, y el mismo bloque se repite
en TODOS. Con 4 diagramas eso son ~325 KB de fuente duplicada.

Este sitio se abre en obra con mala señal — por eso la fuente de iconos se
recortó de 723 KB a 8.7 KB. Servir 325 KB de fuente duplicada desharia ese
trabajo.

LA SOLUCIÓN
-----------
Borrar el bloque @font-face. El SVG ya declara la familia como
    font-family: "Recursive Variable", arial, sans-serif
así que al quitar la fuente incrustada el navegador cae solo en Arial. El
diagrama se ve prácticamente igual (cambia un poco la forma de las letras) y el
archivo baja ~60 %.

También quita el <style> de animaciones de aristas, que aquí no se usan.

USO
---
    python herramientas/limpiar-svg.py ORIGEN.svg DESTINO.svg

o para procesar una carpeta entera dejando los limpios en img/:

    python herramientas/limpiar-svg.py --lote

No necesita instalar nada: solo usa la librería estándar de Python.
"""

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def limpiar(svg: str) -> str:
    """Devuelve el SVG sin las fuentes incrustadas ni las animaciones."""

    # 1) Fuera los bloques @font-face completos. Cada uno trae un src con un
    #    data-URI base64 gigante. El patrón es no-greedy para no comerse de más.
    svg = re.sub(r"@font-face\s*\{.*?\}", "", svg, flags=re.S)

    # 2) Por si quedara algún data-URI de fuente suelto fuera de un @font-face.
    svg = re.sub(r"url\(\"data:font/[^\"]*\"\)", "none", svg)

    # 3) Las animaciones de aristas (edge-animation-*) no se usan en estos
    #    diagramas: son para flechas que "corren". Solo ocupan.
    svg = re.sub(r"@keyframes[^{]*\{(?:[^{}]|\{[^{}]*\})*\}", "", svg, flags=re.S)

    # 4) Limpia las líneas en blanco que dejaron los borrados.
    svg = re.sub(r"\n\s*\n+", "\n", svg)

    return svg


def procesar(origen: Path, destino: Path) -> None:
    antes = origen.stat().st_size
    limpio = limpiar(origen.read_text(encoding="utf-8"))
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(limpio, encoding="utf-8")
    despues = destino.stat().st_size
    ahorro = 100 - round(100 * despues / antes)
    print(
        f"OK  {destino.name:32s} "
        f"{round(antes/1024):>4} KB -> {round(despues/1024):>3} KB  (-{ahorro} %)"
    )


def main() -> int:
    if len(sys.argv) == 2 and sys.argv[1] == "--lote":
        # Modo lote: toma los .svg de herramientas/ y los deja limpios en img/.
        # Los nombres de destino se definen aquí, a mano, porque mermaid.live
        # exporta todo con el mismo nombre genérico y hay que identificarlos.
        print("Modo lote: edita el diccionario MAPA dentro del script.")
        return 1

    if len(sys.argv) != 3:
        print(__doc__)
        return 1

    procesar(Path(sys.argv[1]), Path(sys.argv[2]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
