import { Nodo } from '../model/Nodo';
import {
  ResultadoActualizacion,
  ResultadoBusqueda,
  ResultadoEliminacion,
  ResultadoInsercion,
} from '../model/Resultados';

/** Presentación en consola. Solo formatea e imprime; no contiene lógica del BST. */
export class ArbolView {
  private static readonly ANCHO = 72;

  // ───────────────────────────── Estructura ─────────────────────────────

  mostrarEncabezado(titulo: string): void {
    const linea = '═'.repeat(ArbolView.ANCHO);
    console.log(`\n${linea}\n  ${titulo}\n${linea}`);
  }

  mostrarSubencabezado(titulo: string): void {
    console.log(`\n── ${titulo} ${'─'.repeat(Math.max(3, ArbolView.ANCHO - titulo.length - 4))}`);
  }

  mostrarMensaje(texto: string): void {
    console.log(`  ${texto}`);
  }

  // ───────────────────────────── Árbol ASCII ─────────────────────────────

  /** Dibuja el árbol con la raíz arriba y conectores ├── └── │. (I)=izquierdo, (D)=derecho. */
  mostrarArbol(raiz: Nodo | null, titulo = 'Árbol actual'): void {
    console.log(`\n  ${titulo}  [C]=carpeta  [A]=archivo`);
    if (raiz === null) {
      console.log('  (árbol vacío)');
      return;
    }

    const lineas: string[] = [this.etiqueta(raiz)];
    const dibujar = (nodo: Nodo, prefijo: string): void => {
      const hijos = [
        { lado: 'I', nodo: nodo.izquierdo },
        { lado: 'D', nodo: nodo.derecho },
      ].filter((h): h is { lado: string; nodo: Nodo } => h.nodo !== null);

      hijos.forEach((hijo, i) => {
        const ultimo = i === hijos.length - 1;
        lineas.push(`${prefijo}${ultimo ? '└── ' : '├── '}(${hijo.lado}) ${this.etiqueta(hijo.nodo)}`);
        dibujar(hijo.nodo, prefijo + (ultimo ? '    ' : '│   '));
      });
    };
    dibujar(raiz, '');

    console.log(lineas.map((l) => `  ${l}`).join('\n'));
  }

  // ───────────────────────────── Operaciones ─────────────────────────────

  mostrarInsercion(r: ResultadoInsercion): void {
    const tipo = r.esCarpeta ? 'carpeta' : 'archivo';
    if (r.exito) {
      const donde = r.padre ? `como hijo de "${r.padre}"` : 'como raíz';
      this.mostrarMensaje(`✔ Insertado ${tipo} "${r.nombre}" ${donde} (${r.comparaciones} comparaciones)`);
      return;
    }
    switch (r.motivo) {
      case 'DUPLICADO':
        this.mostrarMensaje(`✖ RECHAZADO (duplicado): "${r.nombre}" ya existe (${r.comparaciones} comparaciones)`);
        break;
      case 'NOMBRE_VACIO':
        this.mostrarMensaje('✖ RECHAZADO: el nombre no puede estar vacío');
        break;
      case 'PADRE_ES_ARCHIVO':
        this.mostrarMensaje(
          `✖ RECHAZADO: "${r.nombre}" colgaría del archivo "${r.padre}" y un archivo siempre es hoja`,
        );
        break;
    }
  }

  mostrarBusqueda(r: ResultadoBusqueda): void {
    if (r.encontrado && r.nodo) {
      const tipo = r.nodo.esCarpeta ? 'carpeta' : 'archivo';
      this.mostrarMensaje(
        `✔ HALLADO     "${r.nombre}" → ${tipo} "${r.nodo.nombre}" | comparaciones: ${r.comparaciones}`,
      );
    } else {
      this.mostrarMensaje(`✖ NO HALLADO  "${r.nombre}" | comparaciones: ${r.comparaciones}`);
    }
  }

  mostrarEliminacion(r: ResultadoEliminacion): void {
    if (!r.eliminado) {
      const razon = r.motivo === 'NOMBRE_VACIO' ? 'nombre vacío' : 'no existe en el árbol';
      this.mostrarMensaje(`✖ No se eliminó "${r.nombre}": ${razon}`);
      return;
    }
    this.mostrarMensaje(`✔ Eliminado "${r.nombre}" (${r.comparaciones} comparaciones)`);
    switch (r.caso) {
      case 'HOJA':
        this.mostrarMensaje('  Caso ejecutado: HOJA → se desenlazó el nodo de su padre');
        break;
      case 'UN_HIJO':
        this.mostrarMensaje(`  Caso ejecutado: UN HIJO → "${r.hijoReconectado}" se reconectó con el padre`);
        break;
      case 'DOS_HIJOS':
        this.mostrarMensaje(
          `  Caso ejecutado: DOS HIJOS → reemplazado por su sucesor inorden "${r.sucesor}" ` +
            '(mínimo del subárbol derecho)',
        );
        break;
    }
  }

  mostrarActualizacion(r: ResultadoActualizacion): void {
    const cambio = `"${r.nombreAntiguo}" → "${r.nombreNuevo}"`;
    if (!r.exito) {
      const razones: Record<string, string> = {
        NOMBRE_VACIO: 'alguno de los nombres está vacío',
        NO_ENCONTRADO: 'el nombre antiguo no existe',
        NOMBRE_NUEVO_EXISTE: 'el nombre nuevo ya existe (no se permiten duplicados)',
        INSERCION_RECHAZADA: 'la reinserción fue rechazada; el árbol queda intacto',
      };
      this.mostrarMensaje(`✖ Actualización rechazada ${cambio}: ${razones[r.motivo ?? 'NO_ENCONTRADO']}`);
      return;
    }
    this.mostrarMensaje(`✔ Actualizado ${cambio}  (Eliminar + Insertar)`);
    if (r.eliminacion) this.mostrarEliminacion(r.eliminacion);
    if (r.insercion) this.mostrarInsercion(r.insercion);
  }

  // ───────────────────────────── Recorridos y métricas ─────────────────────────────

  mostrarRecorrido(titulo: string, nodos: Nodo[]): void {
    const texto = nodos.map((n) => n.nombre).join(' → ');
    this.mostrarMensaje(`${titulo.padEnd(12)}: ${texto || '(vacío)'}`);
  }

  mostrarVerificacionInorden(ordenado: boolean): void {
    this.mostrarMensaje(
      ordenado
        ? '✔ El recorrido inorden está en orden ascendente → la propiedad BST se conserva'
        : '✖ El recorrido inorden NO está ordenado → la propiedad BST está rota',
    );
  }

  mostrarMetricasFinales(altura: number, totalNodos: number): void {
    this.mostrarMensaje(`Altura del árbol : ${altura} niveles (${Math.max(0, altura - 1)} aristas en el camino más largo)`);
    this.mostrarMensaje(`Total de nodos   : ${totalNodos}`);
  }

  // ───────────────────────────── Auxiliares ─────────────────────────────

  private etiqueta(nodo: Nodo): string {
    return `${nodo.esCarpeta ? '[C]' : '[A]'} ${nodo.nombre}`;
  }
}
