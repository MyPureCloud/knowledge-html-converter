import { ImageBlock } from './elements/image';
import { ListBlock } from './elements/list';
import { ParagraphBlock } from './elements/paragraph';
import { TableBlock } from './elements/table/table-models';
import { TextBlocks } from './elements/text';
import { VideoBlock } from './elements/video';

export enum TagNames {
  Paragraph = "p",
  Heading1 = "h1",
  Heading2 = "h2",
  Heading3 = "h3",
  Heading4 = "h4",
  Heading5 = "h5",
  Heading6 = "h6",
  Preformatted = "pre",
  OrderedList = "ol",
  UnorderedList = "ul",
  ListItem = "li",
  Bold = "strong",
  Italic = "em",
  Underline = "u",
  Strikethrough = "s",
  Subscript = "sub",
  Superscript = "sup",
  LineBreak = "br",
  Image = "img",
  Video = "iframe",
  Anchor = "a",
  Span = "span",
  Table = "table",
  ColumnGroup = "colgroup",
  Column = "col",
  TableBody = "tbody",
  TableHead = "thead",
  TableFooter = "tfoot",
  TableRow = "tr",
  DataCell = "td",
  HeaderCell = "th",
  Caption = "caption",
}

export enum BlockTypes {
  Paragraph = "Paragraph",
  OrderedList = "OrderedList",
  UnorderedList = "UnorderedList",
  ListItem = "ListItem",
  TextBlocks = "Text",
  TextBlock = "TextBlock",
  ImageBlock = "Image",
  VideoBlock = "Video",
  TableBlock = "Table",
}

export type Block =
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | VideoBlock
  | TableBlock
  | TextBlocks;

export enum StyleProperties {
  // Text block level
  FontSize = "font-size",
  BackgroundColor = "background-color",
  TextColor = "color",
  // Paragraph level
  Indentation = "padding-left",
  Align = "text-align",
  Float = "float",
  ListStyleType = "list-style-type",
  // Table level
  Border = "border",
  BorderWidth = "border-width",
  Width = "width",
  Height = "height",
  BorderSpacing = "border-spacing",
  MarginLeft = "margin-left",
  MarginRight = "margin-right",
  BorderStyle = "border-style",
  BorderColor = "border-color",
  VerticalAlign = "vertical-align",
  Scope = "scope",
  Padding = "padding",
}