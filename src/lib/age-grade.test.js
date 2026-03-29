import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadAgeGradeScriptIntoWindow(window) {
  const path = join(__dirname, 'age-grade.js');
  const code = readFileSync(path, 'utf8');
  window.eval(code);
}

describe('parkrunAgeGrade', () => {
  it('picks 86.60 as top age grade for Portsmouth Lakeside style keys', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      runScripts: 'dangerously',
    });
    loadAgeGradeScriptIntoWindow(dom.window);
    const { topAgeGradePercentDisplay } = dom.window.parkrunAgeGrade;

    const counts = {
      '77.32%': 40,
      '85.08%': 12,
      '86.60%': 1,
    };

    expect(topAgeGradePercentDisplay(counts)).toBe('86.60');
  });

  it('returns null when there are no age grades', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      runScripts: 'dangerously',
    });
    loadAgeGradeScriptIntoWindow(dom.window);
    const { topAgeGradePercentDisplay } = dom.window.parkrunAgeGrade;

    expect(topAgeGradePercentDisplay({})).toBeNull();
  });
});
