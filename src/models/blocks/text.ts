import { ContentBlockType } from './content-block';

export interface TextBlock {
  type: ContentBlockType.Text;
  text: Text;
}

export interface Text {
  text: string;
  marks?: Array<
    | TextMark.Bold
    | TextMark.Italic
    | TextMark.Underline
    | TextMark.Strikethrough
    | TextMark.Subscript
    | TextMark.Superscript
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
  target: TargetAction;
}

export enum TargetAction {
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

export enum TextMark {
  Bold = 'Bold',
  Italic = 'Italic',
  Underline = 'Underline',
  Strikethrough = 'Strikethrough',
  Subscript = 'Subscript',
  Superscript = 'Superscript',
}
