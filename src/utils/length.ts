const emPattern = /^\d+(?:\.\d+)?em$/;
const pxPattern = /^\d+(?:\.\d+)?px$/;

export const getLength = (size: string | undefined): number | undefined => {
  if (!size) {
    return undefined;
  }

  let value: number | undefined = undefined;
  if (emPattern.test(size)) {
    value = Number(size.replace(/\s*em\s*/g, ''));
  } else if (pxPattern.test(size)) {
    value = convertPixelsToEM(Number(size.replace(/\s*px\s*/g, '')));
  }
  return value ? truncateToSinglePrecisionFloat(value) : value;
};

export const convertPixelsToEM = (value: number): number => {
  return value / 16; // 16 is the base font-size for browsers
};

const truncateToSinglePrecisionFloat = (num: number): number => {
  // knowledge api numbers are single precision floating point numbers
  return parseFloat(num.toPrecision(7));
};
