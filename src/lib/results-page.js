(function (global) {
  'use strict';

  /**
   * @param {string} url
   * @returns {boolean}
   */
  function isParkrunEventResultsPage(url) {
    if (typeof url !== 'string') {
      return false;
    }
    if (url.includes('/latestresults')) {
      return true;
    }
    return /\/results\/(?:\d{4}-\d{2}-\d{2}|\d+)\//.test(url);
  }

  global.parkrunResultsPage = {
    isParkrunEventResultsPage,
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
