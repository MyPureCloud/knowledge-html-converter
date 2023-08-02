declare module 'html-parse-stringify' {
  export function parse(html: string): AstElement[];

  export interface AstElement {
    type: 'tag' | 'text' | 'element';
    content?: string;
    voidElement?: boolean;
    name: string;
    attrs?: Record<string, string>;
    children?: AstElement[];
  }
}
