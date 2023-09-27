const emPattern = /^\d+(?:\.\d+)?em$/;
const pxPattern = /^\d+(?:\.\d+)?px$/;
const percentagePattern = /^\d+(?:\.\d+)?%$/;

export const getLength = (size: string | undefined): number | undefined => {
  if (!size) {
    return undefined;
  }

  let value: number | undefined = undefined;
  if (emPattern.test(size)) {
    value = Number(size.replace(/\s*em\s*/g, ''));
  } else if (pxPattern.test(size)) {
    value = convertPixelsToEM(Number(size.replace(/\s*px\s*/g, '')));
  } else if (percentagePattern.test(size)) {
    value = convertPercentageToEM(Number(size.replace(/\s*%\s*/g, '')));
  }
  return value ? truncateToSinglePrecisionFloat(value) : value;
};

const convertPixelsToEM = (value: number): number => {
  return value / 16; // 16 is the base font-size for browsers
};

const convertPercentageToEM = (value: number): number => {
  // TODO tox-edit-area? pass in as an option?
  //const parentWidth = document.getElementsByClassName('tox-edit-area')[0].clientWidth - 32;
  const parentWidth = 1168;
  const pxValue = (parentWidth / 100) * value;
  return convertPixelsToEM(pxValue);
};

const truncateToSinglePrecisionFloat = (num: number): number => {
  // knowledge api numbers are single precision floating point numbers
  return parseFloat(num.toPrecision(7));
};
