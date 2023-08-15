declare module 'html-parse-stringify' {
  export function parse(html: string): DomNode[];

  export interface DomNode {
    type: DomNodeType;
    content?: string;
    voidElement?: boolean;
    name: string;
    attrs?: Record<string, string>;
    children?: DomNode[];
  }

  export const enum DomNodeType {
    Tag = 'tag',
    Text = 'text',
    Component = 'component',
  }
}
