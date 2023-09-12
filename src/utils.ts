export const truncateToSinglePrecisionFloat = (num: number) => {
  // knowledge api numbers are single precision floating point numbers
  return parseFloat(num.toPrecision(7));
};
