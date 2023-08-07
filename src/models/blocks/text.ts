import { BlockTypes } from './block-type';

export interface TextBlocks {
  type: BlockTypes.TextBlocks;
  text: TextBlock;
}

export interface TextBlock {
  text: string;
  marks?: Array<
    | AllowedProperties.Bold
    | AllowedProperties.Italic
    | AllowedProperties.Underline
    | AllowedProperties.Strikethrough
    | AllowedProperties.Subscript
    | AllowedProperties.Superscript
  >;
  properties?: TextProperties;
  hyperlink?: string;
  hyperlinkProperties?: HyperlinkProperties;
}

export interface TextProperties {
  fontSize?: FontSize;
  textColor?: string;
  backgroundColor?: string;
}

export enum FontSize {
  XxSmall = '9px',
  XSmall = '10px',
  Small = '13.333px',
  Medium = '16px',
  Large = '18px',
  XLarge = '24px',
  XxLarge = '32px',
}

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

export enum TextDataType {
  Tag = 'tag',
  Text = 'text',
}

export enum AllowedProperties {
  Bold = 'Bold',
  Italic = 'Italic',
  Underline = 'Underline',
  Strikethrough = 'Strikethrough',
  Subscript = 'Subscript',
  Superscript = 'Superscript',
}
