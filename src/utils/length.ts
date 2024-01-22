import { DocumentBodyLengthUnit } from '../models/blocks/document-body-table.js';
import { Length } from '../models/html/length.js';

const emPattern = /^\d+(?:\.\d+)?em$/;
const pxPattern = /^\d+(?:\.\d+)?px$/;
const percentagePattern = /^\d+(?:\.\d+)?%$/;

export const getLength = (
  size: string | undefined,
  baseFontSize: number = 16,
): number | undefined => {
  if (!size) {
    return undefined;
  }
  let value: number | undefined = undefined;
  if (emPattern.test(size)) {
    value = Number(size.replace(/\s*em\s*/g, ''));
  } else if (pxPattern.test(size)) {
    value = convertPixelsToEM(
      Number(size.replace(/\s*px\s*/g, '')),
      baseFontSize,
    );
  } else if (percentagePattern.test(size)) {
    // Since there is no target(parent) element avialable, considering 900px as default parent width
    // calculating the width of table. This issue will be resolved after adding widthUnit property in KAS variation (GKC-16072)
    const defaultParentWidth = 900; //px unit
    const percentage: number = Number(size.replace(/\s*%\s*/g, ''));
    value = convertPixelsToEM(
      (defaultParentWidth * percentage) / 100,
      baseFontSize,
    );
  }
  return value ? truncateToSinglePrecisionFloat(value) : value;
};

export const getLengthWithUnit = (
  size: string | undefined,
  baseFontSize: number = 16,
): Length | undefined => {
  if (!size) {
    return undefined;
  }

  let value: number | undefined = undefined;
  let unit: DocumentBodyLengthUnit | undefined;
  if (emPattern.test(size)) {
    value = Number(size.replace(/\s*em\s*/g, ''));
    unit = DocumentBodyLengthUnit.Em;
  } else if (pxPattern.test(size)) {
    value = convertPixelsToEM(
      Number(size.replace(/\s*px\s*/g, '')),
      baseFontSize,
    );
    unit = DocumentBodyLengthUnit.Em;
  } else if (percentagePattern.test(size)) {
    value = Number(size.replace(/\s*%\s*/g, ''));
    unit = DocumentBodyLengthUnit.Percentage;
  }
  const length = value ? truncateToSinglePrecisionFloat(value) : 0;
  return { length, unit };
};

export const convertPixelsToEM = (
  value: number,
  baseFontSize: number = 16,
): number => {
  return value / baseFontSize; // 16 is the base font-size for browsers
};

const truncateToSinglePrecisionFloat = (num: number): number => {
  // knowledge api numbers are single precision floating point numbers
  return parseFloat(num.toPrecision(7));
};
