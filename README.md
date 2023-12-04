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
