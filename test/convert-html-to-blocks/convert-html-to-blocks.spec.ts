import { readFile } from 'fs/promises';
import { join } from 'path';
import { convertHtmlToBlocks } from '../../src';
import { expect } from 'chai';
import { Context } from 'mocha';

describe('convert-html-to-blocks', function () {
  describe('basic', function () {
    it('empty', test);
    it('invalid-html', test);
    it('paragraph', test);
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

    expect(actualJson).to.deep.equal(expectedJson);
  }
});
