# knowledge-html-converter

Converts html to the knowledge document variation content json format used by the Genesys Knowledge API: https://developer.genesys.cloud/devapps/api-explorer#post-api-v2-knowledge-knowledgebases--knowledgeBaseId--documents--documentId--variations

## Installation

`npm install knowledge-html-converter`

## Usage

```
import { convertHtmlToBlocks } from 'knowledge-html-converter';

const documentBodyBlocks = convertHtmlToBlocks('<html><body><p>Document content</p></body></html>');
```

or

```
const knowledgeHtmlConverter = require('knowledge-html-converter');

const documentBodyBlocks = knowledgeHtmlConverter.convertHtmlToBlocks('<html><body><p>Document content</p></body></html>');
```

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

### Tests

`npm test`

Filtering test cases: tests use [Mocha](https://mochajs.org/), `describe` or `it` can be suffixed with `.only`. For example: `describe.only('suite name', ...);` or `it.only('test name', ...);`

Test coverage:

`npm run coverage`

The coverage report can be found at `coverage/index.html`.
