import { DocumentBodyLengthUnit } from '../blocks/document-body-table.js';

export interface Length {
  length: number;
  unit?: DocumentBodyLengthUnit;
}
