export type FontType =
  | 'Heading1'
  | 'Heading2'
  | 'Heading3'
  | 'Heading4'
  | 'Heading5'
  | 'Heading6'
  | 'Paragraph'
  | 'Preformatted';

const fontTypesByHtmlTag: Record<string, FontType> = {
  h1: 'Heading1',
  h2: 'Heading2',
  h3: 'Heading3',
  h4: 'Heading4',
  h5: 'Heading5',
  h6: 'Heading6',
  p: 'Paragraph',
  pre: 'Preformatted',
};

export const htmlTagToFontType = (tag: string): FontType | undefined => {
  return tag ? fontTypesByHtmlTag[tag.toLowerCase()] : undefined;
};
