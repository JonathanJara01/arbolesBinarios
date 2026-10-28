import { Nodo } from './Nodo';
import {
  CasoEliminacion,
  ResultadoActualizacion,
  ResultadoBusqueda,
  ResultadoEliminacion,
  ResultadoInsercion,
} from './Resultados';

/**
 * Comparación ordinal e invariante a mayúsculas/minúsculas
 * (equivalente a StringComparison.OrdinalIgnoreCase de C#, que compara en mayúsculas).
 */
export function compararNombres(a: string, b: string): number {
  const x = a.toUpperCase();
  const y = b.toUpperCase();
  return x < y ? -1 : x > y ? 1 : 0;
}

/** BST simple (sin balanceo) que modela el repositorio jerárquico de documentos. */
export class ArbolBinario {
  raiz: Nodo | null = null;

  // ───────────────────────────── CRUD ─────────────────────────────

  /**
   * Inserta respetando la regla del BST (menor a la izquierda, mayor a la derecha).
   * Rechaza nombres vacíos, duplicados y cualquier intento de colgar un nodo de un archivo
   * (un archivo es siempre hoja).
   */
  insertar(nombre: string, esCarpeta: boolean): ResultadoInsercion {
    const limpio = (nombre ?? '').trim();
    if (limpio === '') {
      return { exito: false, nombre: limpio, esCarpeta, comparaciones: 0, motivo: 'NOMBRE_VACIO' };
    }

    const nuevo = new Nodo(limpio, esCarpeta);
    if (this.raiz === null) {
      this.raiz = nuevo;
      return { exito: true, nombre: limpio, esCarpeta, comparaciones: 0 };
    }

    let actual = this.raiz;
    let comparaciones = 0;
    for (;;) {
      comparaciones++;
      const cmp = compararNombres(limpio, actual.nombre);
      if (cmp === 0) {
        return { exito: false, nombre: limpio, esCarpeta, comparaciones, motivo: 'DUPLICADO' };
      }

      const lado = cmp < 0 ? 'izquierdo' : 'derecho';
      const siguiente = actual[lado];
      if (siguiente === null) {
        if (!actual.esCarpeta) {
          return {
            exito: false, nombre: limpio, esCarpeta, comparaciones,
            padre: actual.nombre, motivo: 'PADRE_ES_ARCHIVO',
          };
        }
        actual[lado] = nuevo;
        return { exito: true, nombre: limpio, esCarpeta, comparaciones, padre: actual.nombre };
      }
      actual = siguiente;
    }
  }

  /** Busca por nombre contando las comparaciones realizadas. */
  buscar(nombre: string): ResultadoBusqueda {
    const limpio = (nombre ?? '').trim();
    let actual = this.raiz;
    let comparaciones = 0;

    while (limpio !== '' && actual !== null) {
      comparaciones++;
      const cmp = compararNombres(limpio, actual.nombre);
      if (cmp === 0) {
        return {
          encontrado: true, nombre: limpio, comparaciones,
          nodo: { nombre: actual.nombre, esCarpeta: actual.esCarpeta },
        };
      }
      actual = cmp < 0 ? actual.izquierdo : actual.derecho;
    }
    return { encontrado: false, nombre: limpio, comparaciones, nodo: null };
  }

  /**
   * Elimina un nodo. Casos: hoja (desenlazar), un hijo (reconectar con el padre) y
   * dos hijos (reemplazar por el SUCESOR inorden = mínimo del subárbol derecho).
   */
  eliminar(nombre: string): ResultadoEliminacion {
    const limpio = (nombre ?? '').trim();
    if (limpio === '') {
      return { eliminado: false, nombre: limpio, comparaciones: 0, motivo: 'NOMBRE_VACIO' };
    }

    const estado: {
      comparaciones: number;
      caso?: CasoEliminacion;
      hijoReconectado?: string;
      sucesor?: string;
    } = { comparaciones: 0 };

    const eliminarEn = (nodo: Nodo | null): Nodo | null => {
      if (nodo === null) return null;

      estado.comparaciones++;
      const cmp = compararNombres(limpio, nodo.nombre);
      if (cmp < 0) {
        nodo.izquierdo = eliminarEn(nodo.izquierdo);
        return nodo;
      }
      if (cmp > 0) {
        nodo.derecho = eliminarEn(nodo.derecho);
        return nodo;
      }

      // Nodo encontrado
      if (nodo.izquierdo === null && nodo.derecho === null) {
        estado.caso = 'HOJA';
        return null;
      }
      if (nodo.izquierdo === null || nodo.derecho === null) {
        estado.caso = 'UN_HIJO';
        const hijo = (nodo.izquierdo ?? nodo.derecho) as Nodo;
        estado.hijoReconectado = hijo.nombre;
        return hijo;
      }

      estado.caso = 'DOS_HIJOS';
      const sucesor = this.minimo(nodo.derecho);
      estado.sucesor = sucesor.nombre;
      nodo.nombre = sucesor.nombre;
      nodo.esCarpeta = sucesor.esCarpeta;
      nodo.derecho = this.quitarMinimo(nodo.derecho);
      return nodo;
    };

    this.raiz = eliminarEn(this.raiz);

    if (estado.caso === undefined) {
      return { eliminado: false, nombre: limpio, comparaciones: estado.comparaciones, motivo: 'NO_ENCONTRADO' };
    }
    return { eliminado: true, nombre: limpio, ...estado };
  }

  /**
   * Actualizar = Eliminar(nombreAntiguo) + Insertar(nombreNuevo).
   * Es atómico: se opera sobre una copia y solo se adopta si ambos pasos tienen éxito,
   * de modo que un rechazo nunca deja el árbol sin el nodo original.
   */
  actualizar(nombreAntiguo: string, nombreNuevo: string): ResultadoActualizacion {
    const antiguo = (nombreAntiguo ?? '').trim();
    const nuevo = (nombreNuevo ?? '').trim();
    const base = { nombreAntiguo: antiguo, nombreNuevo: nuevo };

    if (antiguo === '' || nuevo === '') return { exito: false, ...base, motivo: 'NOMBRE_VACIO' };

    const existente = this.buscar(antiguo);
    if (!existente.encontrado) return { exito: false, ...base, motivo: 'NO_ENCONTRADO' };
    if (this.buscar(nuevo).encontrado) return { exito: false, ...base, motivo: 'NOMBRE_NUEVO_EXISTE' };

    const copia = this.clonar();
    const eliminacion = copia.eliminar(antiguo);
    const insercion = copia.insertar(nuevo, existente.nodo!.esCarpeta);
    if (!insercion.exito) {
      return { exito: false, ...base, motivo: 'INSERCION_RECHAZADA', eliminacion, insercion };
    }

    this.raiz = copia.raiz;
    return { exito: true, ...base, eliminacion, insercion };
  }

  // ─────────────────────────── Recorridos ───────────────────────────

  preorden(): Nodo[] {
    const salida: Nodo[] = [];
    const visitar = (n: Nodo | null): void => {
      if (n === null) return;
      salida.push(n);
      visitar(n.izquierdo);
      visitar(n.derecho);
    };
    visitar(this.raiz);
    return salida;
  }

  inorden(): Nodo[] {
    const salida: Nodo[] = [];
    const visitar = (n: Nodo | null): void => {
      if (n === null) return;
      visitar(n.izquierdo);
      salida.push(n);
      visitar(n.derecho);
    };
    visitar(this.raiz);
    return salida;
  }

  postorden(): Nodo[] {
    const salida: Nodo[] = [];
    const visitar = (n: Nodo | null): void => {
      if (n === null) return;
      visitar(n.izquierdo);
      visitar(n.derecho);
      salida.push(n);
    };
    visitar(this.raiz);
    return salida;
  }

  /** Recorrido por niveles (BFS) usando una cola. */
  porNiveles(): Nodo[] {
    const salida: Nodo[] = [];
    if (this.raiz === null) return salida;

    const cola: Nodo[] = [this.raiz];
    let frente = 0; // índice de frente: evita el costo O(n) de Array.shift()
    while (frente < cola.length) {
      const n = cola[frente++];
      salida.push(n);
      if (n.izquierdo) cola.push(n.izquierdo);
      if (n.derecho) cola.push(n.derecho);
    }
    return salida;
  }

  // ───────────────────────────── Métricas ─────────────────────────────

  /** Altura en niveles: árbol vacío = 0, solo la raíz = 1 (aristas del camino más largo = altura - 1). */
  altura(): number {
    const calcular = (n: Nodo | null): number =>
      n === null ? 0 : 1 + Math.max(calcular(n.izquierdo), calcular(n.derecho));
    return calcular(this.raiz);
  }

  contarNodos(): number {
    return this.inorden().length;
  }

  /** Verifica que el recorrido inorden esté en orden estrictamente ascendente por nombre. */
  inordenEstaOrdenado(): boolean {
    const nodos = this.inorden();
    for (let i = 1; i < nodos.length; i++) {
      if (compararNombres(nodos[i - 1].nombre, nodos[i].nombre) >= 0) return false;
    }
    return true;
  }

  // ─────────────────────────── Auxiliares ───────────────────────────

  clonar(): ArbolBinario {
    const copiar = (n: Nodo | null): Nodo | null => {
      if (n === null) return null;
      const c = new Nodo(n.nombre, n.esCarpeta);
      c.izquierdo = copiar(n.izquierdo);
      c.derecho = copiar(n.derecho);
      return c;
    };
    const copia = new ArbolBinario();
    copia.raiz = copiar(this.raiz);
    return copia;
  }

  private minimo(nodo: Nodo): Nodo {
    let actual = nodo;
    while (actual.izquierdo !== null) actual = actual.izquierdo;
    return actual;
  }

  /** Desenlaza el mínimo del subárbol y devuelve la nueva raíz de ese subárbol. */
  private quitarMinimo(nodo: Nodo): Nodo | null {
    if (nodo.izquierdo === null) return nodo.derecho;
    nodo.izquierdo = this.quitarMinimo(nodo.izquierdo);
    return nodo;
  }
}
