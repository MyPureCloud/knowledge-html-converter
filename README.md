# knowledge-html-converter

Takes an html string as input and converts it to the json format of knowledge document variation content, which can be used in the Genesys Knowledge API: https://developer.genesys.cloud/devapps/api-explorer#post-api-v2-knowledge-knowledgebases--knowledgeBaseId--documents--documentId--variations

Please, note that this library is not stable yet and expect changes in how we translate html to the AST of the API. The code was extracted from the Knowledge Articles editor UI that converts the output of the html editor in the UI to the knowledge AST and we are still working on enhancing the code to better deal with html coming from an external source.

## Installation

`npm install knowledge-html-converter`

## Usage

```
import { convertHtmlToBlocks } from 'knowledge-html-converter';

const documentBodyBlocks = convertHtmlToBlocks('<html><body><p>Document content</p></body></html>');
```

This will convert html to blocks with default options, If needed you can customize the options

```
const documentBodyBlocks = convertHtmlToBlocks('<html><body><p>Document content</p></body></html>', { handleWidthWithUnits: true, baseFontSize: 32 });
```

NOTE: The package is now pure [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). It cannot be require()'d from CommonJS.

The value of `documentBodyBlocks` will be:

```
[
  {
    "type": "Paragraph",
    "paragraph": {
      "blocks": [
        {
          "type": "Text",
          "text": {
            "text": "Document content"
          }
        }
      ],
      "properties": {
        "fontType": "Paragraph"
      }
    }
  }
]
```

The json array returned by `convertHtmlToBlocks` can be used as the value of the `body.blocks` property in document variation create and update requests. For example:

```
fetch('https://api.mypurecloud.com/api/v2/knowledge/knowledgeBases/<kb-id>/documents/<doc-id>/variations/<variation-id>', {
  method: 'PATCH',
  headers: new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>',
  }),
  body: JSON.stringify({
    body: {
      blocks: [
        {
          "type": "Paragraph",
          "paragraph": {
            "blocks": [
              {
                "type": "Text",
                "text": {
                  "text": "Document content"
                }
              }
            ],
            "properties": {
              "fontType": "Paragraph"
            }
          }
        }
      ]
    }
  }),
});
```

### Default options

```
{
  handleWidthWithUnits: false,
  baseFontSize: 16
}
```

| SNO | OPTION               | DEFAULT VALUE | USAGE                                                                                                                                                                                                                                                           |
| --- | -------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | handleWidthWithUnits | false         | If set true, handles the table width with unit. Sample output will be ' width: 100, widthUnit: "Percentage" '.                                                                                                                                                  |
| 2   | baseFontSize         | 16            | The default text size in a browser is 16px. So for the default size, 16px is converted to 1em. If you need to override the default font-size, use this option like 'baseFontSize : 32'. For the option 'baseFontSize : 32', the conversion will be 32px to 1em. |

## Developer setup

Node v16, npm v8.

### Git Pre-commit Hooks

`npm run prepare`

Installs husky to run precommit hooks: eslint, prettier. See [.husky/pre-commit](.husky/pre-commit) and `"lint-staged"` in [package.json](package.json).

### Tests

`npm test`

Filtering test cases: tests use [Mocha](https://mochajs.org/), `describe` or `it` can be suffixed with `.only`. For example: `describe.only('suite name', ...);` or `it.only('test name', ...);`

Test coverage:

`npm run coverage`

The coverage report can be found at `coverage/index.html`.
