/** Resultados que devuelve el Model para que la View los presente (el Model nunca imprime). */

export type MotivoRechazoInsercion =
  | 'NOMBRE_VACIO'
  | 'DUPLICADO'
  | 'PADRE_ES_ARCHIVO';

export interface ResultadoInsercion {
  exito: boolean;
  nombre: string;
  esCarpeta: boolean;
  comparaciones: number;
  /** Nombre del nodo del que cuelga el nuevo nodo (si se insertó). */
  padre?: string;
  motivo?: MotivoRechazoInsercion;
}

export interface ResultadoBusqueda {
  encontrado: boolean;
  nombre: string;
  comparaciones: number;
  nodo: { nombre: string; esCarpeta: boolean } | null;
}

export type CasoEliminacion = 'HOJA' | 'UN_HIJO' | 'DOS_HIJOS';

export interface ResultadoEliminacion {
  eliminado: boolean;
  nombre: string;
  comparaciones: number;
  caso?: CasoEliminacion;
  /** Caso UN_HIJO: nombre del hijo que se reconecta con el padre. */
  hijoReconectado?: string;
  /** Caso DOS_HIJOS: nombre del sucesor inorden que ocupa el lugar del nodo eliminado. */
  sucesor?: string;
  motivo?: 'NOMBRE_VACIO' | 'NO_ENCONTRADO';
}

export type MotivoRechazoActualizacion =
  | 'NOMBRE_VACIO'
  | 'NO_ENCONTRADO'
  | 'NOMBRE_NUEVO_EXISTE'
  | 'INSERCION_RECHAZADA';

export interface ResultadoActualizacion {
  exito: boolean;
  nombreAntiguo: string;
  nombreNuevo: string;
  motivo?: MotivoRechazoActualizacion;
  eliminacion?: ResultadoEliminacion;
  insercion?: ResultadoInsercion;
}
