import { AstElement } from 'html-parse-stringify';
import { BlockTypes } from '../models/blocks/block-type';
import { ImageBlock } from '../models/blocks/image';
import { AllowedProperties, TextBlocks } from '../models/blocks/text';
import { VideoBlock } from '../models/blocks/video';
import { generateTextBlocks } from './text';

export const generateHyperlinkBlock = (
  anchorElement: AstElement,
  marks: AllowedProperties[] = [],
): TextBlocks => {
  const textBlocks: (TextBlocks | ImageBlock | VideoBlock)[] = [];
  const hyperlinkFormattings = marks;
  let displayText = '';

  const hyperlink = anchorElement.attrs?.href || anchorElement.attrs?.title;
  anchorElement.children?.forEach((child) => {
    textBlocks.push(...generateTextBlocks(child, [], { hyperlink }));
  });
  const textBlock = textBlocks[0];
  if (hyperlink && textBlock && textBlock.type === BlockTypes.TextBlocks) {
    textBlocks.forEach((textContent) => {
      if (textContent.type === BlockTypes.TextBlocks) {
        displayText += textContent.text.text;
        if (textContent.text.marks) {
          hyperlinkFormattings.push(...textContent.text.marks);
        }
      }
    });
    textBlock.text.text = displayText;
    textBlock.text.hyperlink = hyperlink;
    if (hyperlinkFormattings.length > 0) {
      textBlock.text.marks = Array.from(new Set(hyperlinkFormattings));
    }
  }
  return textBlock as TextBlocks;
};
