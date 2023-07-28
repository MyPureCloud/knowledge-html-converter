import { readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { convertHtmlToBlocks } from '../src/converter';
import { expect } from 'chai';

describe('converter', function() {
  describe('convertHtmlToBlocks', function() {

    generateInputOutputTestCases();

    /**
     * Generates test cases from subdirectories of test/convert-html-to-blocks.
     * Test case name: name of the subdirectory.
     * Input:  test/convert-html-to-blocks/subdirectory/input.html
     * Output: test/convert-html-to-blocks/subdirectory/output.json
     */
    function generateInputOutputTestCases() {
      const baseDir = join('test', 'convert-html-to-blocks');
      const dirNames = readdirSync(baseDir);

      dirNames.forEach(testCaseDirName => {
        const dirName = join(baseDir, testCaseDirName);
        it(testCaseDirName, async function() {
          const html = (await readFile(join(dirName, 'input.html'))).toString();
          const expectedJson = JSON.parse((await readFile(join(dirName, 'output.json'))).toString());

          const actualJson = convertHtmlToBlocks(html);

          expect(actualJson).to.deep.equal(expectedJson);
        });
      });
    }
  });
});
