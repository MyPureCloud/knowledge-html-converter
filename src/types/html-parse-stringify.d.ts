declare var htmlParseStringify: htmlParseStringify.htmlParseStringify;

declare module htmlParseStringify {
  export interface htmlParseStringify {
    parse(html: string): AstElement[];
  }

  export interface AstElement {
    type: "tag" | "text" | "element";
    content?: string;
    voidElement?: boolean;
    name: string;
    attrs?: Record<string, string>;
    children?: AstElement[];
  }

  export interface IOptions {
    components: string[];
  }
}

declare module "html-parse-stringify" {
  export = htmlParseStringify;
}
