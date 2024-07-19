import { DomNode } from 'html-parse-stringify';
import {
  DocumentBodyVideo,
  DocumentBodyVideoBlock,
  DocumentBodyVideoProperties,
} from '../models/blocks/document-body-video.js';
import { DocumentElementLength } from '../models/blocks/document-element-length.js';
import { getStyleKeyValues, getWidthWithUnit } from './table-properties.js';
import { StyleAttribute } from '../models/html/style-attribute.js';

export const generateVideoBlock = (
  iframeElement: DomNode,
): DocumentBodyVideoBlock => {
  return {
    type: 'Video',
    video: generateVideo(iframeElement),
  };
};

const generateVideo = (iframeElement: DomNode): DocumentBodyVideo => {
  const videoUrl = iframeElement.attrs?.src || '';

  const properties = getVideoProperties(iframeElement);

  return Object.assign({}, { url: videoUrl }, properties && { properties });
};

const getVideoProperties = (
  iframeElement: DomNode,
): DocumentBodyVideoProperties | undefined => {
  let videoProperties: DocumentBodyVideoProperties | undefined;

  if (iframeElement.attrs) {
    let width: DocumentElementLength | undefined;

    if (iframeElement.attrs?.width) {
      width = getWidthWithUnit({ width: iframeElement.attrs?.width });
    }

    if (iframeElement.attrs?.style) {
      const styleKeyValues = getStyleKeyValues(iframeElement);

      if (
        Object.prototype.hasOwnProperty.call(
          styleKeyValues,
          StyleAttribute.Width,
        )
      ) {
        width = getWidthWithUnit(styleKeyValues);
      }
    }

    if (width) {
      videoProperties = Object.assign({}, width && { width });
    }
  }

  return videoProperties;
};
