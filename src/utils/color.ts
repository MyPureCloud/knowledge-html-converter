import tinycolor from 'tinycolor2';

export const parseColorString = (colorString: string): string | undefined => {
  if (!colorString) {
    return undefined;
  }

  const color = tinycolor(colorString);
  if (color.isValid()) {
    return color.toHexString();
  }
  return undefined;
};
