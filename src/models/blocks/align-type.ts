export enum AlignType {
  Center = 'Center',
  Left = 'Left',
  Right = 'Right',
  Justify = 'Justify',
}

const alignTypesByHtmlTextAlign: Record<string, AlignType> = {
  center: AlignType.Center,
  left: AlignType.Left,
  right: AlignType.Right,
  justify: AlignType.Justify,
};

export const cssTextAlignToAlignType = (
  textAlign: string,
): AlignType | undefined => {
  return textAlign
    ? alignTypesByHtmlTextAlign[textAlign.toLowerCase()]
    : undefined;
};
