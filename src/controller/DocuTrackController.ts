import { ArbolBinario } from '../model/ArbolBinario';
import { ArbolView } from '../view/ArbolView';

interface Documento {
  nombre: string;
  esCarpeta: boolean;
}

/**
 * Orquesta los casos de uso del taller en orden. No contiene lógica estructural del BST:
 * delega en el Model y entrega los resultados a la View.
 */
export class DocuTrackController {
  /** 14 nombres (carpetas y archivos). Los archivos quedan siempre como hojas. */
  private static readonly DOCUMENTOS_INICIALES: Documento[] = [
    { nombre: 'Documentos', esCarpeta: true }, // raíz
    { nombre: 'Contratos', esCarpeta: true },
    { nombre: 'Proyectos', esCarpeta: true },
    { nombre: 'Bitacora', esCarpeta: true },
    { nombre: 'Actas.pdf', esCarpeta: false },
    { nombre: 'Compras', esCarpeta: true },
    { nombre: 'Cronograma.xlsx', esCarpeta: false },
    { nombre: 'Facturas', esCarpeta: true },
    { nombre: 'Reportes', esCarpeta: true }, // un solo hijo (Sistemas)
    { nombre: 'Entregas', esCarpeta: true },
    { nombre: 'Informes', esCarpeta: true }, // un solo hijo (Manual.pdf)
    { nombre: 'Manual.pdf', esCarpeta: false },
    { nombre: 'Sistemas', esCarpeta: true },
    { nombre: 'Usuarios.txt', esCarpeta: false },
  ];

  /** Intentos que deben ser rechazados por la política de duplicados / validaciones. */
  private static readonly INTENTOS_RECHAZADOS: Documento[] = [
    { nombre: 'DOCUMENTOS', esCarpeta: true }, // duplicado (ignora mayúsculas)
    { nombre: 'Compras', esCarpeta: false }, // duplicado exacto
    { nombre: '   ', esCarpeta: false }, // vacío
  ];

  private static readonly BUSQUEDAS = {
    izquierdo: ['Actas.pdf', 'cronograma.xlsx'],
    derecho: ['Manual.pdf', 'Usuarios.txt'],
    inexistentes: ['Backup', 'Zeta.docx'],
  };

  constructor(
    private readonly arbol: ArbolBinario,
    private readonly vista: ArbolView,
  ) {}

  ejecutar(): void {
    this.construirArbol();
    this.realizarBusquedas();
    this.realizarActualizaciones();
    this.realizarEliminaciones();
    this.mostrarRecorridos();
    this.mostrarMetricasFinales();
  }

  // 1. Construcción del árbol
  private construirArbol(): void {
    this.vista.mostrarEncabezado('CASO 1 · CONSTRUCCIÓN DEL ÁRBOL (14 documentos)');
    for (const doc of DocuTrackController.DOCUMENTOS_INICIALES) {
      this.vista.mostrarInsercion(this.arbol.insertar(doc.nombre, doc.esCarpeta));
    }

    this.vista.mostrarSubencabezado('Política de duplicados y validaciones');
    for (const doc of DocuTrackController.INTENTOS_RECHAZADOS) {
      this.vista.mostrarInsercion(this.arbol.insertar(doc.nombre, doc.esCarpeta));
    }

    this.vista.mostrarArbol(this.arbol.raiz, 'Árbol inicial');
  }

  // 2 y 3. Búsquedas
  private realizarBusquedas(): void {
    const { izquierdo, derecho, inexistentes } = DocuTrackController.BUSQUEDAS;
    this.vista.mostrarEncabezado('CASO 2 · BÚSQUEDAS RÁPIDAS (6)');

    this.vista.mostrarSubencabezado('Existentes en el subárbol izquierdo');
    izquierdo.forEach((n) => this.vista.mostrarBusqueda(this.arbol.buscar(n)));

    this.vista.mostrarSubencabezado('Existentes en el subárbol derecho');
    derecho.forEach((n) => this.vista.mostrarBusqueda(this.arbol.buscar(n)));

    this.vista.mostrarSubencabezado('Inexistentes');
    inexistentes.forEach((n) => this.vista.mostrarBusqueda(this.arbol.buscar(n)));
  }

  // 4. Actualizaciones selectivas (Eliminar + Insertar)
  private realizarActualizaciones(): void {
    this.vista.mostrarEncabezado('CASO 3 · ACTUALIZACIONES SELECTIVAS');

    this.actualizar('Actualizar en HOJA (archivo): Manual.pdf → Normas.pdf', 'Manual.pdf', 'Normas.pdf');
    this.actualizar('Actualizar nodo con UN HIJO: Reportes → Resumenes', 'Reportes', 'Resumenes');

    this.vista.mostrarSubencabezado('Actualización rechazada: el nombre nuevo ya existe');
    this.vista.mostrarActualizacion(this.arbol.actualizar('Compras', 'contratos'));

    this.actualizar('Actualizar en la RAÍZ: Documentos → Raiz', 'Documentos', 'Raiz');
  }

  // 5. Eliminaciones selectivas
  private realizarEliminaciones(): void {
    this.vista.mostrarEncabezado('CASO 4 · ELIMINACIONES SELECTIVAS');

    this.eliminar('Eliminar HOJA: Normas.pdf', 'Normas.pdf');
    this.eliminar('Eliminar nodo con UN HIJO: Resumenes', 'Resumenes');
    this.eliminar('Eliminar la RAÍZ (dos hijos → sucesor inorden): Entregas', 'Entregas');
  }

  // 6. Recorridos de verificación
  private mostrarRecorridos(): void {
    this.vista.mostrarEncabezado('CASO 5 · RECORRIDOS DE VERIFICACIÓN');
    this.vista.mostrarRecorrido('Preorden', this.arbol.preorden());
    this.vista.mostrarRecorrido('Inorden', this.arbol.inorden());
    this.vista.mostrarRecorrido('Postorden', this.arbol.postorden());
    this.vista.mostrarRecorrido('Por niveles', this.arbol.porNiveles());
    this.vista.mostrarSubencabezado('Verificación del BST');
    this.vista.mostrarVerificacionInorden(this.arbol.inordenEstaOrdenado());
  }

  // 7. Altura final
  private mostrarMetricasFinales(): void {
    this.vista.mostrarEncabezado('CASO 6 · MÉTRICAS FINALES');
    this.vista.mostrarArbol(this.arbol.raiz, 'Árbol final');
    this.vista.mostrarMetricasFinales(this.arbol.altura(), this.arbol.contarNodos());
  }

  private actualizar(titulo: string, antiguo: string, nuevo: string): void {
    this.vista.mostrarSubencabezado(titulo);
    this.vista.mostrarActualizacion(this.arbol.actualizar(antiguo, nuevo));
    this.vista.mostrarArbol(this.arbol.raiz);
  }

  private eliminar(titulo: string, nombre: string): void {
    this.vista.mostrarSubencabezado(titulo);
    this.vista.mostrarEliminacion(this.arbol.eliminar(nombre));
    this.vista.mostrarArbol(this.arbol.raiz);
  }
}
