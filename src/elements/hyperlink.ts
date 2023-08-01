import { AstElement } from 'html-parse-stringify';
import { BlockTypes } from '../tags';
import { AllowedProperties, TextBlocks, generateTextBlocks } from './text';
import { ImageBlock } from './image';
import { VideoBlock } from './video';

export interface HyperlinkProperties {
  target: TargetActions;
}

export enum TargetActions {
  NotSet = 'not_set',
  NewWindow = 'new_window',
  PopupWindow = 'popup_window',
  SameWindow = 'same_window',
  ParentWindow = 'parent_window',
  OpenEmail = 'open_email',
  CopyEmail = 'copy_email',
  NewTab = 'new_tab',
}

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
