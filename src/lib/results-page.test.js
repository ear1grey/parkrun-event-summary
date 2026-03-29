import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadResultsPageScriptIntoWindow(window) {
  const path = join(__dirname, 'results-page.js');
  const code = readFileSync(path, 'utf8');
  window.eval(code);
}

describe('parkrunResultsPage', () => {
  let isParkrunEventResultsPage;

  beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      runScripts: 'dangerously',
      url: 'https://www.parkrun.com.au/coburg/results/2026-03-28/',
    });
    loadResultsPageScriptIntoWindow(dom.window);
    isParkrunEventResultsPage =
      dom.window.parkrunResultsPage.isParkrunEventResultsPage;
  });

  describe('isParkrunEventResultsPage', () => {
    it('accepts latest results URLs', () => {
      expect(
        isParkrunEventResultsPage(
          'https://www.parkrun.com.au/coburg/results/latestresults/',
        ),
      ).toBe(true);
    });

    it('accepts ISO date results URLs', () => {
      expect(
        isParkrunEventResultsPage(
          'https://www.parkrun.com.au/coburg/results/2026-03-28/',
        ),
      ).toBe(true);
    });

    it('accepts numeric segment results URLs', () => {
      expect(
        isParkrunEventResultsPage(
          'https://www.parkrun.org.uk/example/results/512/',
        ),
      ).toBe(true);
    });

    it('rejects event listing paths under results', () => {
      expect(
        isParkrunEventResultsPage(
          'https://www.parkrun.com.au/coburg/results/eventhistory/',
        ),
      ).toBe(false);
    });

    it('rejects unrelated URLs', () => {
      expect(isParkrunEventResultsPage('https://example.com/')).toBe(false);
      expect(isParkrunEventResultsPage('')).toBe(false);
    });
  });
});
