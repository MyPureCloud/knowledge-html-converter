export const parseColorString = (colorString: string): string | undefined => {
  if (!colorString) {
    return undefined;
  }

  return validateHexColor(colorString) || convertRgbToHex(colorString);
};

const validateHexColor = (colorString: string): string | undefined => {
  // hex colors can be '#00FF00' or '#0F0'
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  return regex.test(colorString) ? colorString : undefined;
};

const convertRgbToHex = (rgb: string): string | undefined => {
  const cleanRgb = rgb.replace(/ /g, '').replace(';', '');

  const matchRgbColors = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;
  const matchRgbaColors = /rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d{1,3})\)/;

  const match = matchRgbColors.exec(cleanRgb) || matchRgbaColors.exec(cleanRgb);

  if (match) {
    const [, r, g, b] = match.map((colorValue) => Number(colorValue));
    return rgbToHex(r, g, b);
  }
  return undefined;
};

const rgbToHex = (red: number, green: number, blue: number): string => {
  return (
    '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue)
  );
};

const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

// Todo tanslate predifined color values: https://www.w3schools.com/cssref/css_colors.php
