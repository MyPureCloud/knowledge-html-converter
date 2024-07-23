import { traverseBlocks } from '../../src/index.js';
import { DocumentBodyBlock } from '../../src/models/blocks/document-body-block.js';
import { expect } from 'chai';

describe('traverse-blocks', function () {
  it('should walk through all the leafs', () => {
    const blocks = [...traverseBlocks(generateDocument())];

    expect(blocks).length(16, 'blocks in the document');
    expect(blocks.filter((block) => block.type === 'Text')).length(
      4,
      'text blocks in the document',
    );
    expect(blocks.filter((block) => block.type === 'Image')).length(
      3,
      'image blocks in the document',
    );
  });

  function generateDocument(): DocumentBodyBlock[] {
    return [
      {
        type: 'Paragraph',
        paragraph: {
          blocks: [
            {
              type: 'Text',
              text: {
                text: 'Link 1',
                hyperlink: 'http://genesys.com/article=1',
              },
            },
          ],
        },
      },
      {
        type: 'OrderedList',
        list: {
          blocks: [
            {
              type: 'ListItem',
              blocks: [
                {
                  type: 'Text',
                  text: {
                    text: 'Link 2',
                    hyperlink: 'http://genesys.com/article=2',
                  },
                },
              ],
            },
            {
              type: 'ListItem',
              blocks: [
                {
                  type: 'Image',
                  image: {
                    url: 'http://genesys.com/3.png',
                    hyperlink: 'http://genesys.com/article=3',
                  },
                },
              ],
            },
          ],
        },
      },
      {
        type: 'Paragraph',
        paragraph: {
          blocks: [
            {
              type: 'Image',
              image: {
                url: 'http://genesys.com/4.jpg',
                hyperlink: 'http://genesys.com/article=4',
              },
            },
          ],
        },
      },
      {
        type: 'Table',
        table: {
          rows: [
            {
              cells: [
                {
                  blocks: [
                    {
                      type: 'OrderedList',
                      list: {
                        blocks: [
                          {
                            type: 'ListItem',
                            blocks: [
                              {
                                type: 'Text',
                                text: {
                                  text: 'Link 5',
                                  hyperlink: 'http://genesys.com/article=5',
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  blocks: [
                    {
                      type: 'Image',
                      image: {
                        url: 'http://genesys.com/6.png',
                        hyperlink: 'http://genesys.com/6',
                      },
                    },
                  ],
                },
              ],
            },
          ],
          properties: {
            caption: {
              blocks: [
                {
                  type: 'Paragraph',
                  paragraph: {
                    blocks: [
                      {
                        type: 'Text',
                        text: {
                          text: 'Caption text',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    ];
  }
});
