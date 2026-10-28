/**
 * Nodo del árbol de documentos de DocuTrack.
 * Representa una carpeta o un archivo; la clave del BST es `nombre`.
 */
export class Nodo {
  izquierdo: Nodo | null = null;
  derecho: Nodo | null = null;

  constructor(
    public nombre: string,
    public esCarpeta: boolean,
  ) {}

  get esHoja(): boolean {
    return this.izquierdo === null && this.derecho === null;
  }

  get cantidadHijos(): number {
    return (this.izquierdo ? 1 : 0) + (this.derecho ? 1 : 0);
  }
}
