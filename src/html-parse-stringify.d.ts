declare module 'html-parse-stringify' {
  export function parse(html: string): AstElement[];

  export interface AstElement {
    type: AstElementType;
    content?: string;
    voidElement?: boolean;
    name: string;
    attrs?: Record<string, string>;
    children?: AstElement[];
  }

  export const enum AstElementType {
    Tag = 'tag',
    Text = 'text',
    Component = 'component',
  }
}
