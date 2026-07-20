# Diagramas de funcionamiento — código Mermaid

Los 4 procesos en Mermaid, **versión detallada**: con las decisiones y
bifurcaciones reales del sistema (tipo de material, presupuesto, validaciones
que bloquean, cierre del vale).

Al final hay una **versión resumida** de cada uno, por si para exponer prefieres
algo más limpio.

**Cómo convertirlos a imagen:**
1. Abre https://mermaid.live
2. Pega el bloque de código (sin las líneas de ` ``` `)
3. Menú **Actions → PNG** (o **SVG**, si lo quieres nítido a cualquier tamaño)

> Este archivo vive en `herramientas/` porque **no se despliega**: el
> `.vercelignore` excluye esta carpeta. Es material de trabajo, no del sitio.

**Código de colores** (los oficiales del proyecto):

| | Significado |
|---|---|
| Naranja `#ff6b35` | Pasos del **residente** |
| Azul `#004e89` | Pasos del **checador** |
| Verde punteado `#1a936f` | Lo que pasa **fuera de la app** (el camión en la calle) |
| Rojo | **Bloqueos**: la app no deja avanzar |
| Verde sólido | El vale **emitido** / el PDF |
| Amarillo punteado | Notas y reglas |

---

# VERSIÓN DETALLADA

## 1) Material (Flete)

Conserva la bifurcación que de verdad importa — **pétreo vs. producto de corte**
al registrar el viaje — y el cierre que puede rebotar. Las validaciones que
bloquean van juntas en **una sola caja roja**, en vez de una por una: dicen lo
mismo y no alargan el diagrama.

> **Por qué este es más corto que el primero que hice.** En Mermaid no se puede
> acomodar el diagrama a mano: el alto lo decide el **número de eslabones de la
> cadena** (cada `A --> B` agrega un nivel). La versión anterior encadenaba los
> 6 campos del residente uno por uno y metía cada validación como rombo aparte:
> ~20 niveles. Aquí el residente es **una sola caja** y las validaciones son una
> nota: **9 niveles**. La regla es: *para acortarlo, quita flechas de la cadena
> principal, no busques una opción de configuración.*

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef checador fill:#e8f0f7,stroke:#004e89,stroke-width:2px,color:#2c3e50
    classDef viaje fill:#eafaf3,stroke:#1a936f,stroke-width:2px,stroke-dasharray:6 4,color:#2c3e50
    classDef bloqueo fill:#fdecea,stroke:#c0392b,stroke-width:2px,color:#922b21
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-width:1px,stroke-dasharray:4 3,color:#2c3e50

    A["<b>RESIDENTE · 1 · Crear el vale</b><br/>Obra → Material y Banco → Sindicato<br/>→ Requisición <i>(solo pétreo)</i> → Cantidad"]
    B["<b>CHECADOR · 2 · Asignar el vehículo</b><br/>Escanea el QR y confirma al operador"]
    C["<b>3 · Imprimir el ticket</b><br/>El camión se lo lleva al banco<br/><i>en corte, del #02 en adelante<br/>aquí se puede cambiar el banco</i>"]
    V["El camión va al banco, lo cargan<br/>y regresa con su remisión"]
    REG{"¿Tipo de<br/>material?"}
    RP["<b>Peso (ton)</b> editable<br/>+ <b>Folio de Remisión</b><br/><i>ton ÷ peso específico → m³</i>"]
    RC["<b>Capacidad (m³)</b> del vehículo,<br/>precargada y no editable<br/><i>sin folio</i>"]
    EV["<b>4 · Foto de evidencia + GPS</b><br/><i>las dos obligatorias</i>"]
    OTRO{"¿Hay otro<br/>viaje?"}
    CUAD{"<b>5 · Cerrar:</b> ¿tickets<br/>y viajes coinciden?"}
    FIN["Vale <b>EMITIDO</b><br/>PDF con QR + ticket físico"]

    BLOQ["<b>Lo que bloquea la app</b><br/>· Sin ticket impreso: <i>'Ticket requerido'</i><br/>· ~20 min mínimo entre viajes<br/>· Sin señal no hay nada <i>(no hay modo offline)</i><br/>· Jornada 8:00 AM – 3:00 AM"]
    N1["<b>El sindicato concilia con este PDF<br/>en la página web.</b><br/>Se comparte por WhatsApp. El QR abre<br/>la verificación sin iniciar sesión.<br/><i>Una sola reimpresión del PDF y del ticket.</i>"]

    A --> B --> C --> V --> REG
    REG -->|Pétreo| RP --> EV
    REG -->|Producto de corte| RC --> EV
    EV --> OTRO
    OTRO -->|Sí| C
    OTRO -->|No| CUAD
    CUAD -->|No: 'Viajes incompletos'| C
    CUAD -->|Sí| FIN
    OTRO -.-> BLOQ
    FIN -.-> N1

    class A residente
    class B,C,RP,RC,EV checador
    class V viaje
    class BLOQ bloqueo
    class FIN cierre
    class N1 nota
```

---

## 2) Renta de Camión

Aquí la renta es **por tiempo**, no por viaje. Las bifurcaciones: el
**presupuesto** de la obra (si se agotó, no hay vale), el **sindicato** según de
quién sea el camión, el **turno nocturno**, y cómo se cobra al cerrar.

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef checador fill:#e8f0f7,stroke:#004e89,stroke-width:2px,color:#2c3e50
    classDef viaje fill:#eafaf3,stroke:#1a936f,stroke-width:2px,stroke-dasharray:6 4,color:#2c3e50
    classDef bloqueo fill:#fdecea,stroke:#c0392b,stroke-width:2px,color:#922b21
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-width:1px,stroke-dasharray:4 3,color:#2c3e50

    subgraph RES ["RESIDENTE · crear el vale inicial"]
        A1["Nuevo vale → <b>Renta</b>"]
        PRE{"¿La obra tiene<br/>presupuesto de renta?"}
        NOPRE["Botón <b>'Presupuesto Agotado'</b><br/>deshabilitado.<br/>Contactar al administrador"]
        A2["Selecciona la <b>Obra</b><br/><i>la Empresa se autocompleta</i>"]
        A3["Elige el <b>Material</b><br/><i>es solo el de inicio:<br/>se puede cambiar después</i>"]
        SIND{"¿De quién es<br/>el camión?"}
        SCTM["Sindicato: <b>CTM</b>"]
        SGEEM["Sindicato: <b>Grupo GEEM</b>"]
        A4["<b>Fecha y Hora de Inicio</b>"]
        NOCT{"¿Turno<br/>nocturno?"}
        A5N["Marca la casilla<br/><i>da 12 h para completar</i>"]
        A6["<b>Crear Vale</b><br/><i>operador y vehículo<br/>quedan pendientes</i>"]
    end

    subgraph CHE ["CHECADOR · el turno"]
        B1["<b>Asignar el vehículo</b><br/>Escanea el QR del camión<br/>y confirma al operador"]
        C1["<b>Imprimir el ticket</b> de descarga<br/>Se anota el banco"]
        V["El camión va al banco,<br/>descarga y regresa"]
        E1["<b>Registrar el viaje</b><br/><i>un solo toque: aquí no se<br/>captura peso ni folio</i>"]
        OTRO{"¿Hay otro<br/>viaje?"}
        CIE["<b>Completar el vale</b>"]
        COBRO{"¿Cómo se cobra<br/>el turno?"}
        CD["Renta por <b>día completo</b>"]
        CM["Renta por <b>medio día</b>"]
        CH["Captura la <b>Hora de Fin</b>"]
        EV["<b>Evidencia obligatoria</b><br/>foto + ubicación"]
    end

    FIN["El vale queda <b>EMITIDO</b>"]
    PDF["Generar <b>PDF con QR</b><br/>+ imprimir <b>ticket físico</b>"]
    N1["<b>El sindicato concilia con este PDF<br/>en la página web.</b><br/>Se comparte por WhatsApp.<br/>El QR abre la verificación sin iniciar sesión<br/>y con los precios ocultos."]
    N2["<b>Un vale = un camión.</b><br/>Si ese día trabajan dos camiones,<br/>se crean dos vales."]
    N3["<b>Crítico:</b> los camiones están ligados<br/>a su sindicato. Si eliges el equivocado,<br/>no aparecerán al registrar los viajes."]

    A1 --> PRE
    PRE -->|No| NOPRE
    PRE -->|Sí| A2 --> A3 --> SIND
    SIND -->|Del sindicato| SCTM --> A4
    SIND -->|De la empresa / interno| SGEEM --> A4
    A4 --> NOCT
    NOCT -->|Sí| A5N --> A6
    NOCT -->|No| A6
    A6 --> B1 --> C1 --> V --> E1 --> OTRO
    OTRO -->|Sí| C1
    OTRO -->|No| CIE --> COBRO
    COBRO -->|Día completo| CD --> EV
    COBRO -->|Medio día| CM --> EV
    COBRO -->|Por horas| CH --> EV
    EV --> FIN --> PDF
    PDF -.-> N1
    A6 -.-> N2
    SIND -.-> N3

    class A1,A2,A3,SCTM,SGEEM,A4,A5N,A6 residente
    class B1,C1,E1,CIE,CD,CM,CH,EV checador
    class V viaje
    class NOPRE bloqueo
    class FIN,PDF cierre
    class N1,N2,N3 nota
```

---

## 3) Renta de Pipa

Mismo flujo que renta de camión, pero **dos campos son fijos**: sindicato
**Pipas** y material **Agua**. Eso elimina la bifurcación del sindicato.

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef checador fill:#e8f0f7,stroke:#004e89,stroke-width:2px,color:#2c3e50
    classDef viaje fill:#eafaf3,stroke:#1a936f,stroke-width:2px,stroke-dasharray:6 4,color:#2c3e50
    classDef bloqueo fill:#fdecea,stroke:#c0392b,stroke-width:2px,color:#922b21
    classDef fijo fill:#e6f7f1,stroke:#1a936f,stroke-width:3px,color:#14795a
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-width:1px,stroke-dasharray:4 3,color:#2c3e50

    subgraph RES ["RESIDENTE · crear el vale inicial"]
        A1["Nuevo vale → <b>Renta</b>"]
        PRE{"¿La obra tiene<br/>presupuesto?"}
        NOPRE["Botón <b>'Presupuesto Agotado'</b><br/>deshabilitado"]
        A2["Selecciona la <b>Obra</b>"]
        FIJO["<b>SIEMPRE FIJOS EN PIPA</b><br/>Sindicato = <b>Pipas</b><br/>Material = <b>Agua</b>"]
        A4["<b>Fecha y Hora de Inicio</b>"]
        NOCT{"¿Turno<br/>nocturno?"}
        A5N["Marca la casilla<br/><i>da 12 h para completar</i>"]
        A6["<b>Crear Vale</b><br/><i>operador y pipa<br/>quedan pendientes</i>"]
    end

    subgraph CHE ["CHECADOR · el turno"]
        B1["<b>Asignar la pipa</b><br/>Escanea el QR<br/>y confirma al operador"]
        C1["<b>Imprimir el ticket</b><br/>La pipa se lo lleva<br/>a la toma de agua"]
        V["La pipa va a llenar<br/>y regresa a la obra"]
        E1["<b>Registrar el viaje</b><br/><i>un solo toque</i>"]
        OTRO{"¿Hay otro<br/>llenado?"}
        CIE["<b>Completar el vale</b>"]
        COBRO{"¿Cómo se cobra<br/>el turno?"}
        CD["Renta por <b>día completo</b>"]
        CM["Renta por <b>medio día</b>"]
        CH["Captura la <b>Hora de Fin</b>"]
        EV["<b>Evidencia obligatoria</b><br/>foto + ubicación"]
    end

    FIN["El vale queda <b>EMITIDO</b>"]
    PDF["Generar <b>PDF con QR</b><br/>+ imprimir <b>ticket físico</b>"]
    N1["<b>El sindicato concilia con este PDF<br/>en la página web.</b><br/>Se comparte por WhatsApp.<br/>El QR abre la verificación sin iniciar sesión<br/>y con los precios ocultos."]
    N2["<b>Una pipa = un vale.</b><br/>Si ese día trabajan dos pipas,<br/>se crean dos vales."]

    A1 --> PRE
    PRE -->|No| NOPRE
    PRE -->|Sí| A2 --> FIJO --> A4 --> NOCT
    NOCT -->|Sí| A5N --> A6
    NOCT -->|No| A6
    A6 --> B1 --> C1 --> V --> E1 --> OTRO
    OTRO -->|Sí| C1
    OTRO -->|No| CIE --> COBRO
    COBRO -->|Día completo| CD --> EV
    COBRO -->|Medio día| CM --> EV
    COBRO -->|Por horas| CH --> EV
    EV --> FIN --> PDF
    PDF -.-> N1
    A6 -.-> N2

    class A1,A2,A4,A5N,A6 residente
    class FIJO fijo
    class B1,C1,E1,CIE,CD,CM,CH,EV checador
    class V viaje
    class NOPRE bloqueo
    class FIN,PDF cierre
    class N1,N2 nota
```

---

## 4) Flete Asfáltico

El único **sin ciclo y sin checador**. Su bifurcación fuerte está al final: el
modal del **ticket físico es obligatorio** y sale una copia a la vez, así que se
pasa dos veces por él.

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef bloqueo fill:#fdecea,stroke:#c0392b,stroke-width:2px,color:#922b21
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-width:1px,stroke-dasharray:4 3,color:#2c3e50

    subgraph RES ["RESIDENTE · todo en una sola sesión"]
        A1["Nuevo vale → <b>Asfálticos</b>"]
        A2["Selecciona la <b>Obra</b>"]
        A3["Elige el <b>Material asfáltico</b>"]
        A4["Elige <b>Sindicato</b>"]
        A5["Captura la <b>Cantidad</b><br/>de material"]
        A6["<b>Asigna el Vehículo</b><br/><i>aquí mismo, no después</i>"]
        A7["Agrega <b>Notas</b><br/>→ <b>Crear vale</b>"]
        A8["<b>Verificación de Foto</b><br/>Foto del ticket de planta<br/>+ ubicación"]
        FOTO{"¿La foto<br/>ya está lista?"}
        A9["<b>Compartir PDF por WhatsApp</b>"]
    end

    subgraph TIC ["Modal Ticket Físico · obligatorio"]
        T1["Imprimir"]
        IMP{"¿Imprimió<br/>bien?"}
        NOIMP["<b>'No, reintentar'</b><br/>vuelve a intentar"]
        COP{"¿Ya salieron<br/>las 2 copias?"}
        SINIMP["Confirmar que<br/><b>no hay impresora</b>"]
    end

    FIN["El vale queda <b>EMITIDO</b><br/>de inmediato"]
    N1["<b>El sindicato concilia con este PDF<br/>en la página web.</b><br/>Aquí se comparte en el paso 4,<br/><b>antes</b> de imprimir el ticket.<br/>El QR abre la verificación sin iniciar sesión."]
    N2["El modal <b>no se cierra</b> hasta que<br/>imprimas o confirmes que no hay<br/>impresora. Sale <b>una copia a la vez</b>."]

    A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7 --> A8 --> FOTO
    FOTO -->|No| A8
    FOTO -->|Sí| A9 --> T1 --> IMP
    IMP -->|No| NOIMP --> T1
    IMP -->|Sí| COP
    COP -->|No, falta la 2ª| NOIMP
    COP -->|Sí| FIN
    IMP -->|No hay impresora| SINIMP --> FIN
    A9 -.-> N1
    T1 -.-> N2

    class A1,A2,A3,A4,A5,A6,A7,A8,A9,T1 residente
    class NOIMP,SINIMP bloqueo
    class FIN cierre
    class N1,N2 nota
```

---

# VERSIÓN RESUMIDA

Solo los hitos y el ciclo, sin decisiones. Útil si el diagrama detallado queda
muy denso para proyectar.

## Material — resumido

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef checador fill:#e8f0f7,stroke:#004e89,stroke-width:2px,color:#2c3e50
    classDef viaje fill:#eafaf3,stroke:#1a936f,stroke-width:2px,stroke-dasharray:6 4,color:#2c3e50
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-dasharray:4 3,color:#2c3e50

    A["<b>1 · Crear el vale</b><br/>Obra, material, banco,<br/>sindicato y requisición"]
    B["<b>2 · Asignar el vehículo</b><br/>Escanea el QR del camión"]
    C["<b>3 · Imprimir el ticket</b><br/>El camión se lo lleva al banco"]
    D["Va al banco y regresa cargado<br/><i>fuera de la app</i>"]
    E["<b>4 · Registrar el viaje</b><br/>Peso o m³, foto y ubicación"]
    F{"¿Hay otro<br/>viaje?"}
    G["<b>5 · Completar y cerrar</b>"]
    H["Vale <b>EMITIDO</b><br/>PDF con QR + ticket físico"]
    N["<b>El sindicato concilia<br/>con este PDF en la página web.</b>"]

    A --> B --> C --> D --> E --> F
    F -->|Sí| C
    F -->|No| G --> H
    H -.-> N

    class A residente
    class B,C,E,G checador
    class D viaje
    class H cierre
    class N nota
```

## Renta de Camión — resumido

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef checador fill:#e8f0f7,stroke:#004e89,stroke-width:2px,color:#2c3e50
    classDef viaje fill:#eafaf3,stroke:#1a936f,stroke-width:2px,stroke-dasharray:6 4,color:#2c3e50
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-dasharray:4 3,color:#2c3e50

    A["<b>1 · Crear el vale inicial</b><br/>Obra, material, sindicato<br/>y hora de inicio"]
    B["<b>2 · Asignar el vehículo</b><br/>Escanea el QR del camión"]
    C["<b>3 · Imprimir el ticket</b><br/>de descarga"]
    D["Va al banco y regresa<br/><i>fuera de la app</i>"]
    E["<b>4 · Registrar el viaje</b><br/>Un solo toque"]
    F{"¿Hay otro<br/>viaje?"}
    G["<b>5 · Cerrar el turno</b><br/>Día, medio día u hora de fin"]
    H["Vale <b>EMITIDO</b><br/>PDF con QR + ticket físico"]
    N["<b>El sindicato concilia<br/>con este PDF en la página web.</b>"]
    R["<b>Un vale = un camión.</b>"]

    A --> B --> C --> D --> E --> F
    F -->|Sí| C
    F -->|No| G --> H
    H -.-> N
    A -.-> R

    class A residente
    class B,C,E,G checador
    class D viaje
    class H cierre
    class N,R nota
```

## Renta de Pipa — resumido

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef checador fill:#e8f0f7,stroke:#004e89,stroke-width:2px,color:#2c3e50
    classDef viaje fill:#eafaf3,stroke:#1a936f,stroke-width:2px,stroke-dasharray:6 4,color:#2c3e50
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-dasharray:4 3,color:#2c3e50

    A["<b>1 · Crear el vale inicial</b><br/>Obra y hora de inicio"]
    B["<b>2 · Asignar la pipa</b><br/>Escanea el QR"]
    C["<b>3 · Imprimir el ticket</b>"]
    D["Va a llenar y regresa<br/><i>fuera de la app</i>"]
    E["<b>4 · Registrar el viaje</b><br/>Un solo toque"]
    F{"¿Hay otro<br/>llenado?"}
    G["<b>5 · Cerrar el turno</b>"]
    H["Vale <b>EMITIDO</b><br/>PDF con QR + ticket físico"]
    N["<b>El sindicato concilia<br/>con este PDF en la página web.</b>"]
    P["<b>Siempre fijos:</b><br/>Sindicato = Pipas<br/>Material = Agua"]

    A --> B --> C --> D --> E --> F
    F -->|Sí| C
    F -->|No| G --> H
    H -.-> N
    A -.-> P

    class A residente
    class B,C,E,G checador
    class D viaje
    class H cierre
    class N,P nota
```

## Flete Asfáltico — resumido

```mermaid
flowchart TD
    classDef residente fill:#fff4e6,stroke:#ff6b35,stroke-width:2px,color:#2c3e50
    classDef cierre fill:#1a936f,stroke:#14795a,stroke-width:2px,color:#ffffff
    classDef nota fill:#fffbe6,stroke:#e0b050,stroke-dasharray:4 3,color:#2c3e50

    A["<b>1 · Crear el vale asfáltico</b><br/>Obra, material, sindicato<br/>y cantidad"]
    B["<b>2 · Asignar el vehículo</b><br/>Aquí mismo, no después"]
    C["<b>3 · Tomar la evidencia</b><br/>Foto del ticket de planta<br/>y ubicación"]
    D["<b>4 · Compartir el PDF</b><br/>Por WhatsApp"]
    E["<b>5 · Imprimir el ticket físico</b><br/>2 copias, una a la vez"]
    F["Vale <b>EMITIDO</b><br/>de inmediato"]
    N["<b>El sindicato concilia<br/>con este PDF en la página web.</b>"]

    A --> B --> C --> D --> E --> F
    D -.-> N

    class A,B,C,D,E residente
    class F cierre
    class N nota
```

---

## Si algo no renderiza

- Los `<b>` y `<br/>` dentro de las cajas necesitan **htmlLabels** activo. En
  mermaid.live viene activo por defecto; si usas otro visor y ves las etiquetas
  literales, quítalos y deja el texto plano.
- Si un diagrama detallado sale muy alto para tu diapositiva, cambia
  `flowchart TD` por `flowchart LR`: lo acuesta de izquierda a derecha.
- Los `subgraph` son las bandas por rol. Si estorban visualmente, bórralos
  (deja las cajas sueltas) — las flechas siguen funcionando igual.
