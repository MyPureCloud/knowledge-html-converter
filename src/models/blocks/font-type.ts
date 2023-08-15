export enum FontType {
  Heading1 = 'Heading1',
  Heading2 = 'Heading2',
  Heading3 = 'Heading3',
  Heading4 = 'Heading4',
  Heading5 = 'Heading5',
  Heading6 = 'Heading6',
  Paragraph = 'Paragraph',
  Preformatted = 'Preformatted',
}

const fontTypesByHtmlTag: Record<string, FontType> = {
  h1: FontType.Heading1,
  h2: FontType.Heading2,
  h3: FontType.Heading3,
  h4: FontType.Heading4,
  h5: FontType.Heading5,
  h6: FontType.Heading6,
  p: FontType.Paragraph,
  pre: FontType.Preformatted,
};

export const htmlTagToFontType = (tag: string): FontType | undefined => {
  return tag ? fontTypesByHtmlTag[tag.toLowerCase()] : undefined;
};
