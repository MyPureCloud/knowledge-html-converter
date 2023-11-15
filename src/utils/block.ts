import { cssTextAlignToAlignType } from '../converters/paragraph.js';
import {
  getBorderColor,
  getBorderProperties,
  getBorderStyle,
  getBorderWidth,
} from '../converters/table-properties.js';
import { DocumentBlockProperties } from '../models/blocks/document-text.js';
import { StyleAttribute } from '../models/html/style-attribute.js';

export const getBlockProperties = (styles: string): DocumentBlockProperties => {
  let align;
  let horizontalAlign;
  let borderWidth;
  let borderStyle;
  let borderColor;
  let blockProperties;
  if (styles) {
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .filter(
        (keyValue) =>
          keyValue && keyValue.length === 2 && keyValue[0] && keyValue[1],
      ) //filter valid properties
      .map(([key, value]: string[]) => {
        const keyValues: Record<string, string> = { key: value };
        if (key === StyleAttribute.TextAlign) {
          align = cssTextAlignToAlignType(value);
        } else if (key === StyleAttribute.BorderWidth) {
          borderWidth = getBorderWidth(keyValues);
        } else if (key === StyleAttribute.BorderStyle) {
          borderStyle = getBorderStyle(keyValues);
        } else if (key === StyleAttribute.BorderColor) {
          borderColor = getBorderColor(keyValues);
        } else if (key === StyleAttribute.Border) {
          [borderWidth, borderStyle, borderColor] =
            getBorderProperties(keyValues);
        }
      });

    if (align || horizontalAlign || borderWidth || borderStyle || borderColor) {
      blockProperties = Object.assign(
        {},
        align && { align },
        horizontalAlign && { horizontalAlign },
        borderWidth && { borderWidth },
        borderStyle && { borderStyle },
        borderColor && { borderColor },
      );
    }
  }
  return blockProperties;
};
