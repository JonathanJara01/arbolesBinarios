# Taller Integrador – Árboles Binarios (DocuTrack S.A.)

**Universidad de Manizales · Facultad de Ciencias e Ingeniería · Programación III**
Actividad colaborativa I – BST de documentos (carpetas/archivos) con arquitectura MVC.

> El enunciado pide C#/.NET; por acuerdo del curso esta versión se desarrolla en **TypeScript (Node.js)**
> conservando la misma arquitectura, reglas y casos de uso.

## Integrante y responsabilidades

| Integrante | Responsabilidades |
|---|---|
| Jonathan Jaramillo | Trabajo individual: diseño e implementación del Model (`Nodo`, `ArbolBinario`), View (impresión ASCII y métricas), Controller (casos de uso), pruebas y documentación. |

## Requisitos para ejecutar

- Node.js 18 o superior (probado con 22) y npm.
- Terminal con UTF-8 para ver los conectores `├── └── │` (Windows Terminal / PowerShell 7; en `cmd` ejecutar antes `chcp 65001`).

```bash
npm install     # instala TypeScript y @types/node
npm start       # compila (tsc) y ejecuta dist/main.js
```

## Arquitectura MVC

```
src/
├── main.ts                          Punto de entrada: solo ensambla e invoca al Controller
├── model/
│   ├── Nodo.ts                      Nombre (clave), esCarpeta, izquierdo, derecho
│   ├── ArbolBinario.ts              CRUD, recorridos, altura (cero referencias a console)
│   └── Resultados.ts                Tipos de resultado devueltos a la View
├── view/
│   └── ArbolView.ts                 Impresión en consola, árbol ASCII, métricas
└── controller/
    └── DocuTrackController.ts       Secuencia los casos de uso; sin lógica estructural del BST
```

- **Model**: no imprime. Devuelve objetos de resultado (comparaciones, caso de eliminación, motivo de rechazo).
- **View**: solo presentación.
- **Controller**: orquesta; toda decisión estructural está en `ArbolBinario`.

## Reglas implementadas

- Clave: `Nombre`, comparación **ordinal sin distinguir mayúsculas** (equivale a `OrdinalIgnoreCase`).
- **Duplicados rechazados** y registrados en la View; también nombres vacíos.
- **Un archivo siempre es hoja**: `insertar` rechaza colgar un nodo de un archivo.
- **Actualizar = Eliminar + Insertar**, validando que el nombre nuevo no exista. Es atómico: se opera sobre una
  copia y solo se adopta si ambos pasos tienen éxito.
- **Eliminar**: hoja (desenlazar), un hijo (reconectar con el padre) y dos hijos → siempre **sucesor inorden**
  (mínimo del subárbol derecho), de forma consistente. La View informa el caso ejecutado.
- **Comparaciones** contadas en `buscar`, `insertar` y `eliminar`.
- **Altura** en niveles (vacío = 0, solo raíz = 1); la View también muestra las aristas del camino más largo.

## Casos de uso que ejecuta `Main`

1. Construcción con 14 nombres (+ 3 intentos rechazados) e impresión ASCII.
2. 6 búsquedas: 2 en el subárbol izquierdo, 2 en el derecho, 2 inexistentes, con comparaciones.
3. Actualizaciones: hoja (`Manual.pdf → Normas.pdf`), un hijo (`Reportes → Resumenes`), raíz (`Documentos → Raiz`),
   más un rechazo por nombre ya existente; árbol impreso tras cada una.
4. Eliminaciones: hoja (`Normas.pdf`), un hijo (`Resumenes`), raíz con dos hijos (`Entregas`); árbol impreso tras cada una.
5. Recorridos: preorden, inorden, postorden y por niveles (cola).
6. Altura y total de nodos del árbol final.

## ¿Qué recorrido confirma que el BST sigue ordenado?

El **inorden** (izquierdo → raíz → derecho). Como todo el subárbol izquierdo es menor que la raíz y todo el derecho
es mayor, visitar en ese orden produce los nombres en **orden ascendente**. Si alguna operación hubiera roto la
propiedad BST, el inorden saldría desordenado. El programa lo comprueba con `inordenEstaOrdenado()` y lo informa
tras las operaciones. Preorden, postorden y por niveles no garantizan una secuencia ordenada.

## Nota sobre el diseño

El BST simple es deliberado (Unidad 1): no se balancea, por lo que el orden de inserción determina la altura.
Si en una eliminación con dos hijos el sucesor fuera un archivo, este ocuparía una posición interna; en los datos
del taller los sucesores son carpetas, por lo que la regla "archivo = hoja" se mantiene.

## Entrega

Repositorio público en Git, último commit dentro de la fecha límite y, se recomienda, etiqueta `release-unidad1`:

```bash
git init
git add .
git commit -m "Taller árboles binarios"
git tag release-unidad1
```
