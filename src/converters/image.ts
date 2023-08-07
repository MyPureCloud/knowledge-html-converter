import { AstElement } from 'html-parse-stringify';
import { StyleAttributes } from '../models/html';
import { BlockTypes } from '../models/blocks/block-type';
import { AlignType } from '../models/blocks/align-type';
import { ImageBlock, ImageProperties } from '../models/blocks/image';

export const generateImageBlock = (
  blockData: AstElement,
  imageProperties: ImageProperties = {},
): ImageBlock => {
  let imgUrl = blockData.attrs?.src || '';
  imgUrl = imgUrl
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"');
  const hyperlink = imageProperties.hyperlink
    ? imageProperties.hyperlink
    : null;
  const backgroundColor = imageProperties?.backgroundColor;
  let properties = getImageProperties(blockData);
  if (backgroundColor) {
    properties = { ...properties, ...{ backgroundColor } };
  }
  return {
    type: BlockTypes.ImageBlock,
    image: Object.assign(
      {},
      { url: imgUrl },
      hyperlink && { hyperlink },
      properties && { properties },
    ),
  };
};

export const convertRgbToHex = (rgb: string): string | undefined => {
  const colorsArray = rgb
    ?.replace('rgb(', '')
    .replace('rgba(', '')
    .replace(')', '')
    .replace(';', '')
    .split(/\s*,\s*/)
    .map((x) => Number.parseInt(x, 10));
  // If rgba(r,g,b,a), exclude opacity
  if (colorsArray?.length === 4) {
    colorsArray.pop();
  }
  return colorsArray?.length === 3
    ? rgbToHex(colorsArray[0], colorsArray[1], colorsArray[2])
    : undefined;
};

const getImageProperties = (
  blockData: AstElement,
): ImageProperties | undefined => {
  let imageProperties: ImageProperties | undefined;
  if (blockData.attrs) {
    let align: AlignType | undefined;
    let backgroundColor: string | undefined;
    if (blockData.attrs.style) {
      blockData.attrs.style
        .split(/\s*;\s*/) //split with extra spaces around the semi colon
        .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
        .map((keyValue) => {
          if (keyValue.length === 2) {
            if (
              keyValue[0] === StyleAttributes.Float &&
              keyValue[1].toLocaleLowerCase() === 'left'
            ) {
              align = AlignType.Left;
              return;
            } else if (
              keyValue[0] === StyleAttributes.Float &&
              keyValue[1].toLocaleLowerCase() === 'right'
            ) {
              align = AlignType.Right;
              return;
            } else if (
              keyValue[0] === 'display' &&
              keyValue[1].toLocaleLowerCase() === 'block'
            ) {
              // For center tiny mce adds style as "display: block; margin-left: auto; margin-right: auto;"
              align = AlignType.Center;
              return;
            }
          }
        });
    }
    if (align || backgroundColor) {
      imageProperties = Object.assign(
        {},
        align && { align },
        backgroundColor && { backgroundColor },
      );
    }
  }
  return imageProperties;
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
