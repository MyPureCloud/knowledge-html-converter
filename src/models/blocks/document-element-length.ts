export enum DocumentElementLengthUnit {
  Percentage = 'Percentage',
  Em = 'Em',
  Px = 'Px',
}

export interface DocumentElementLength {
  value: number;
  unit: DocumentElementLengthUnit;
}
