import { readFile } from 'fs/promises';
import { join } from 'path';
import { convertHtmlToBlocks } from '../../src';
import { expect } from 'chai';
import { Context } from 'mocha';
import { Block } from '../../src/models/blocks/block';

describe('convert-html-to-blocks', function () {
  describe('hyperlink', function () {
    it('hyperlink-with-formatting', test); // knowledge-administration-ui / hyperlink-utils.spec.ts / should generate hyperlink text blocks from html
    it('hyperlink-with-image', test); // knowledge-administration-ui / hyperlink-utils.spec.ts / should create an image block with hyperlink property when image is present inside anchor tag
  });

  describe('image', function () {
    it('image', test); // knowledge-administration-ui / image-block-utils.spec.ts / should generate image block from image html
    it('image-with-properties', test); // knowledge-administration-ui / image-block-utils.spec.ts / should generate image block with properties from image html
  });

  describe('list', function () {
    it('text-format-tags', test); // knowledge-administration-ui / list-block-utils.spec.ts / should generate list blocks from html
    it('text-format-tags2', test); // knowledge-administration-ui / list-block-utils.spec.ts / should generate list blocks from html
    it('video', test); // knowledge-administration-ui / list-block-utils.spec.ts / should generate list blocks from html
    it('nested-lists', test); // knowledge-administration-ui / list-block-utils.spec.ts / should generate nested list blocks with properties from mock html
    it('list-style-types', test);
  });

  describe('paragraph', function () {
    it('simple', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate paragraph blocks from html
    it('text-format-tags', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate paragraph blocks from html
    it('paragraph-and-list', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate paragraph blocks from html
    it('paragraph-with-video', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate paragraph blocks from html
    it('properties', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate paragraph blocks with properties from html
    it('properties2', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate paragraph block with paragraph level properties with common properties
    it('heading6', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate Heading6 block with properties
    it('heading2', test); // knowledge-administration-ui / paragraph-block-utils.spec.ts / should generate paragraph block with heading2
    it('white-spaces', test);
  });

  describe('table', function () {
    it('simple', test);
    it('properties', test); // knowledge-administration-ui / table-block-utils.spec.ts / should generate table blocks from html
    it('properties2', test); // knowledge-administration-ui / table-block-utils.spec.ts / should generate table blocks with properties in html
    it('merged-cells', test); // knowledge-administration-ui / table-block-utils.spec.ts / should generate table blocks with merged cells html
    it('nested-table', test); // knowledge-administration-ui / table-block-utils.spec.ts / should generate table blocks with nested table html
    it('caption-paragraph', test); // knowledge-administration-ui / table-block-utils.spec.ts / should generate table blocks with paragraph in caption block
    it('video', test); // knowledge-administration-ui / table-block-utils.spec.ts / should generate table blocks with video html
    it('text-format', test);
    it('white-spaces', test);
  });

  describe('text', function () {
    it('properties', test); // knowledge-administration-ui / text-block-utils.spec.ts / should generate text blocks with properties from html
    it('empty', test);
    it('plain-text', test);
  });

  describe('video', function () {
    it('simple', test); // knowledge-administration-ui / video-block-utils.spec.ts / should generate video blocks from html
  });

  /**
   * Tests convertHtmlToBlocks with
   * input:  test/convert-html-to-blocks/${...test.titlePath()}/input.html
   * output: test/convert-html-to-blocks/${...test.titlePath()}/output.json
   */
  async function test(this: Context): Promise<void> {
    const dirName = join('test', ...this.test!.titlePath());
    const html = (await readFile(join(dirName, 'input.html'))).toString();
    const expectedJson = JSON.parse(
      (await readFile(join(dirName, 'output.json'))).toString(),
    );

    const actualJson = convertHtmlToBlocks(html);

    try {
      expect(actualJson).to.deep.equal(expectedJson);
    } catch (error) {
      // add details only when there is an error to avoid constructing the detail text in every test
      addActualAndExpectedJsonsToErrorMessage(
        <Error>error,
        actualJson,
        expectedJson,
      );
      throw error;
    }
  }

  function addActualAndExpectedJsonsToErrorMessage(
    error: Error,
    actualJson: Block[],
    expectedJson: unknown,
  ): void {
    error.message =
      `\n- - - - - - - - - - - - - - - - - - - - -\n` +
      `actual json:\n` +
      `- - - - - - - - - - - - - - - - - - - - -\n` +
      `${JSON.stringify(actualJson, null, 2)}\n` +
      `- - - - - - - - - - - - - - - - - - - - -\n` +
      `expected json:\n` +
      `- - - - - - - - - - - - - - - - - - - - -\n` +
      `${JSON.stringify(expectedJson, null, 2)}\n` +
      error.message;
  }
});
