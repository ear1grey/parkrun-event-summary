(function (global) {
  'use strict';

  /**
   * @param {Record<string, number>} ageGradeCounts
   * @returns {string|null}
   */
  function topAgeGradePercentDisplay(ageGradeCounts) {
    if (!ageGradeCounts || typeof ageGradeCounts !== 'object') {
      return null;
    }
    const keys = Object.keys(ageGradeCounts);
    if (keys.length === 0) {
      return null;
    }
    let best = -Infinity;
    for (const key of keys) {
      const numeric = parseFloat(String(key).replace(/%/g, '').trim(), 10);
      if (!Number.isFinite(numeric)) {
        continue;
      }
      if (numeric > best) {
        best = numeric;
      }
    }
    if (!Number.isFinite(best) || best === -Infinity) {
      return null;
    }
    return best.toFixed(2);
  }

  global.parkrunAgeGrade = {
    topAgeGradePercentDisplay,
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
