import { DomNode } from 'html-parse-stringify';
import { StyleAttribute } from '../models/html/style-attribute.js';
import { DocumentBodyBlockAlignType } from '../models/blocks/document-body-block.js';
import {
  DocumentBodyImage,
  DocumentBodyImageBlock,
  DocumentBodyImageProperties,
} from '../models/blocks/document-body-image.js';
import {
  getStyleKeyValues,
  getWidth,
  getWidthWithUnit,
} from './table-properties.js';
import { HtmlConverterOptions } from '../models/options/html-converter-options.js';
import { DocumentElementLength } from '../models/blocks/document-element-length.js';

export const generateImageBlock = (
  imageElement: DomNode,
  converterOptions: HtmlConverterOptions,
  imageProperties: DocumentBodyImageProperties = {},
  hyperlink: string | undefined = undefined,
): DocumentBodyImageBlock => {
  return {
    type: 'Image',
    image: generateImage(
      imageElement,
      converterOptions,
      imageProperties,
      hyperlink,
    ),
  };
};

const generateImage = (
  imageElement: DomNode,
  converterOptions: HtmlConverterOptions,
  imageProperties: DocumentBodyImageProperties = {},
  hyperlink: string | undefined = undefined,
): DocumentBodyImage => {
  let imgUrl = imageElement.attrs?.src || '';
  imgUrl = imgUrl
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"');
  const backgroundColor = imageProperties?.backgroundColor;
  let properties = getImageProperties(imageElement, converterOptions);
  if (backgroundColor) {
    properties = { ...properties, ...{ backgroundColor } };
  }
  return Object.assign(
    {},
    { url: imgUrl },
    hyperlink && { hyperlink },
    properties && { properties },
  );
};

const getImageProperties = (
  imageElement: DomNode,
  converterOptions: HtmlConverterOptions,
): DocumentBodyImageProperties | undefined => {
  let imageProperties: DocumentBodyImageProperties | undefined;
  if (imageElement.attrs) {
    let align: DocumentBodyBlockAlignType | undefined;
    let backgroundColor: string | undefined;
    let width: number | undefined;
    let widthWithUnit: DocumentElementLength | undefined;
    let altText: string | undefined;

    if (imageElement.attrs?.width) {
      width = getWidth({ width: imageElement.attrs?.width }, converterOptions);
      if (converterOptions.handleWidthWithUnits) {
        widthWithUnit = getWidthWithUnit({ width: imageElement.attrs?.width });
      }
    }

    if (imageElement.attrs.style) {
      const styleKeyValues = getStyleKeyValues(imageElement);

      align = getFloat(styleKeyValues);

      if (
        Object.prototype.hasOwnProperty.call(
          styleKeyValues,
          StyleAttribute.Width,
        )
      ) {
        width = getWidth(styleKeyValues, converterOptions);
        if (converterOptions.handleWidthWithUnits) {
          widthWithUnit = getWidthWithUnit(styleKeyValues);
        }
      }
    }

    if (imageElement.attrs.alt) {
      altText = imageElement.attrs.alt;
    }

    if (align || backgroundColor || width || widthWithUnit) {
      imageProperties = Object.assign(
        {},
        align && { align },
        backgroundColor && { backgroundColor },
        width && { width },
        widthWithUnit && { widthWithUnit },
        altText && { altText },
      );
    }
  }
  return imageProperties;
};

export const getFloat = (
  styleKeyValues: Record<string, string>,
): DocumentBodyBlockAlignType | undefined => {
  let float: DocumentBodyBlockAlignType | undefined;

  if (
    Object.prototype.hasOwnProperty.call(styleKeyValues, StyleAttribute.Float)
  ) {
    if (styleKeyValues[StyleAttribute.Float].toLocaleLowerCase() === 'left') {
      float = DocumentBodyBlockAlignType.Left;
    } else if (
      styleKeyValues[StyleAttribute.Float].toLocaleLowerCase() === 'right'
    ) {
      float = DocumentBodyBlockAlignType.Right;
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      styleKeyValues,
      StyleAttribute.Display,
    ) &&
    styleKeyValues[StyleAttribute.Display].toLocaleLowerCase() === 'block'
  ) {
    // For center tiny mce adds style as "display: block; margin-left: auto; margin-right: auto;"
    float = DocumentBodyBlockAlignType.Center;
  }

  return float;
};
