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

  describe('countVolunteers', () => {
    it('counts Volunteers table rows', () => {
      const html = `
        <!DOCTYPE html>
        <div class="Results"></div>
        <div class="Volunteers">
          <p>Thanks</p>
          <table class="Volunteers-table">
            <tbody>
              <tr class="Volunteers-table-row"><td>a</td></tr>
              <tr class="Volunteers-table-row"><td>b</td></tr>
            </tbody>
          </table>
        </div>
      `;
      const dom = new JSDOM(html, { runScripts: 'dangerously' });
      loadResultsPageScriptIntoWindow(dom.window);
      const { countVolunteers } = dom.window.parkrunResultsPage;
      expect(countVolunteers(dom.window.document)).toBe(2);
    });

    it('counts legacy volunteer links in paragraph', () => {
      const html = `
        <!DOCTYPE html>
        <div class="Results"></div>
        <div>
          <p><a href="/a">A</a> <a href="/b">B</a></p>
        </div>
      `;
      const dom = new JSDOM(html, { runScripts: 'dangerously' });
      loadResultsPageScriptIntoWindow(dom.window);
      const { countVolunteers } = dom.window.parkrunResultsPage;
      expect(countVolunteers(dom.window.document)).toBe(2);
    });
  });
});
