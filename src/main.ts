import { DocuTrackController } from './controller/DocuTrackController';
import { ArbolBinario } from './model/ArbolBinario';
import { ArbolView } from './view/ArbolView';

// Punto de entrada: solo ensambla las capas e invoca al Controller (sin lógica de negocio).
new DocuTrackController(new ArbolBinario(), new ArbolView()).ejecutar();
