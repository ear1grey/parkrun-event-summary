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

  /**
   * @param {Document} doc
   * @returns {number}
   */
  function countVolunteers(doc) {
    const fromRows = doc.querySelectorAll(
      'table.Volunteers-table tbody .Volunteers-table-row',
    );
    if (fromRows.length > 0) {
      return fromRows.length;
    }
    const legacyParagraph = doc.querySelector('div.Results + div p');
    if (legacyParagraph) {
      return legacyParagraph.querySelectorAll('a').length;
    }
    return 0;
  }

  global.parkrunResultsPage = {
    isParkrunEventResultsPage,
    countVolunteers,
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
