// Printable roster for parkrun /futureroster/ pages.
// Scrapes the roster table and builds a single A4 page of roles and names
// that a Run Director can tick off on the day.

const PREFS_KEY = 'pes-roster-prefs';

const DEFAULT_PREFS = {
  roleStyle: 'full', // 'full' | 'short' | 'initials'
  layout: 'vertical', // 'vertical' = title above names, 'horizontal' = title beside names
  groupRoles: true,
  checkboxes: true,
};

// Initials for the standard parkrun role vocabulary. Anything not listed here
// falls back to generated initials.
const ROLE_INITIALS = {
  'Run Director': 'RD',
  'Volunteer Co-ordinator': 'VC',
  'Results Processor': 'RP',
  'Pre-event Setup': 'SET',
  'Event Day Course Check': 'CC',
  'Car Park Marshal': 'CPM',
  'First Timers Welcome': 'FTW',
  'Timekeeper': 'TK',
  'Finish Tokens': 'FT',
  'Finish Token Support': 'FTS',
  'Funnel Manager': 'FM',
  'Barcode Scanning': 'BS',
  'Marshal': 'M',
  'parkwalker': 'PW',
  'Tail Walker': 'TW',
  'Token Sorting': 'TS',
  'Post-event Close Down': 'CD',
  'Photographer': 'PH',
  'Report Writer': 'RW',
  'Sign Language Support': 'SLS',
  'Number Checker': 'NC',
  'Communications Person': 'CP',
  'Equipment Storage and Delivery': 'ESD',
  'Other': 'OTH',
};


// Short names for the standard parkrun role vocabulary, chosen to stay
// readable on a tick sheet. Anything not listed falls back to initials.
const ROLE_SHORT_NAMES = {
  'Run Director': 'RD',
  'Volunteer Co-ordinator': 'Volley Co',
  'Results Processor': 'Results',
  'Pre-event Setup': 'Setup',
  'Event Day Course Check': 'CCheck',
  'Car Park Marshal': 'Car Park',
  'First Timers Welcome': 'FirstTW',
  'Timekeeper': 'Timer',
  'Finish Tokens': 'Tokens',
  'Finish Token Support': 'Token Support',
  'Funnel Manager': 'FunMgr',
  'Barcode Scanning': 'Scanner',
  'Marshal': 'Marshal',
  'parkwalker': 'PWalk',
  'Tail Walker': 'TWalk',
  'Token Sorting': 'Sort',
  'Post-event Close Down': 'Closers',
  'Photographer': 'Photos',
  'Report Writer': 'Scribe',
  'Sign Language Support': 'Signing',
  'Number Checker': 'Numbers',
  'Communications Person': 'Comms',
  'Equipment Storage and Delivery': 'Equipment',
  'Other': 'Other',
};


function toInitials(role) {
  const initials = role
    .split(/[\s-]+/)
    .filter((word) => !/^(and|the|of|a|for)$/i.test(word))
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return initials || role;
}


// 'full' | 'short' | 'initials'
function displayRole(role, roleStyle) {
  if (roleStyle === 'initials') return ROLE_INITIALS[role] ?? toInitials(role);
  if (roleStyle === 'short') return ROLE_SHORT_NAMES[role] ?? role;
  return role;
}


function loadPrefs() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(PREFS_KEY));
  } catch {
    stored = null;
  }

  const prefs = { ...DEFAULT_PREFS, ...stored };

  // Migrate the earlier boolean 'abbreviate' preference to roleStyle.
  if (stored && !stored.roleStyle && stored.abbreviate) prefs.roleStyle = 'short';
  delete prefs.abbreviate;

  return prefs;
}


function savePrefs(prefs) {
  // dateIndex is intentionally excluded: it refers to this week's columns and
  // would point at the wrong event once the roster rolls on.
  const persistent = { ...prefs };
  delete persistent.dateIndex;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(persistent));
  } catch {
    // Storage unavailable (private browsing); preferences just won't persist.
  }
}


// Reads the roster table into { dates: [...], roles: [{ role, names: [] }] }
// where names is index-aligned with dates and '' means an unfilled slot.
function scrapeRoster() {
  const table = document.querySelector('#rosterTable');
  if (!table) return null;

  const dates = [...table.querySelectorAll('thead th')]
    .slice(1) // first header cell is the empty corner above the role column
    .map((th) => th.textContent.trim());

  const roles = [...table.querySelectorAll('tbody tr')].map((row) => {
    const heading = row.querySelector('th');
    return {
      role: heading ? heading.textContent.trim() : '',
      names: [...row.querySelectorAll('td')].map((td) => td.textContent.trim()),
    };
  }).filter((entry) => entry.role);

  return { dates, roles };
}


function getEventName() {
  const heading = document.querySelector('h1');
  if (heading) {
    return heading.textContent.replace(/future volunteer roster/i, '').trim();
  }
  return document.title.split('|').pop().trim();
}


// Collapses consecutive rows sharing a role into one entry holding every name
// for that role, so "Marshal" isn't repeated ten times.
function groupByRole(rows) {
  const grouped = [];
  for (const { role, name } of rows) {
    const last = grouped[grouped.length - 1];
    if (last && last.role === role) {
      last.names.push(name);
    } else {
      grouped.push({ role, names: [name] });
    }
  }
  return grouped;
}


// Builds the list of { role, names } entries for one date column.
function entriesForDate(roster, dateIndex, prefs) {
  const rows = roster.roles.map(({ role, names }) => ({
    role,
    name: names[dateIndex] ?? '',
  }));

  return prefs.groupRoles ? groupByRole(rows) : rows.map((r) => ({ role: r.role, names: [r.name] }));
}


// True for a word parkrun has written as part of a surname, i.e. all caps.
// Single letters are excluded so a middle initial ("Andrew M SEDGMOND")
// doesn't get mistaken for the start of the surname.
function isSurnameWord(word) {
  const letters = word.replace(/[^\p{L}]/gu, '');
  return letters.length > 1 && letters === letters.toLocaleUpperCase();
}


// parkrun writes names as "Rich BOAKES", so the surname is the trailing run of
// capitalised words. This keeps compound surnames together ("Petru VAN DER
// WALT", "Catelin LE FRANC") and copes with multi-word forenames.
function splitName(name) {
  const words = name.split(/\s+/).filter(Boolean);

  let start = words.length;
  while (start > 0 && isSurnameWord(words[start - 1])) start -= 1;

  // No capitalised surname found; treat the last word as the surname.
  if (start === words.length) start = Math.max(0, words.length - 1);

  return {
    forenames: words.slice(0, start).join(' '),
    surname: words.slice(start).join(' '),
  };
}


// "BOAKES" -> "Boakes", preserving the separators inside compound surnames
// such as "CORNEWALL-WALKER" and "O'BRIEN".
function toTitleCase(text) {
  return text.toLocaleLowerCase().replace(
    /\p{L}+/gu,
    (word, offset) => {
      // Lowercase the "s" in forms like "O'Brien"/"D'Angelo" rather than
      // capitalising it into "O'Brien" -> "O'BrienS".
      const preceding = text[offset - 1];
      if (preceding === "'" && word.length === 1) return word;
      return word[0].toLocaleUpperCase() + word.slice(1);
    },
  );
}


function createSlot(name, prefs) {
  const slot = document.createElement('li');
  slot.className = 'pr-slot';

  if (prefs.checkboxes) {
    const box = document.createElement('span');
    box.className = 'pr-box';
    slot.append(box);
  }

  const label = document.createElement('span');
  label.className = 'pr-name';
  if (name) {
    const { forenames, surname } = splitName(name);
    if (forenames) {
      const first = document.createElement('span');
      first.className = 'pr-forename';
      first.textContent = `${toTitleCase(forenames)} `;
      label.append(first);
    }
    const last = document.createElement('span');
    last.className = 'pr-surname';
    last.textContent = toTitleCase(surname);
    label.append(last);
  } else {
    label.classList.add('pr-empty');
  }
  slot.append(label);
  return slot;
}


function createEntry({ role, names }, prefs) {
  const entry = document.createElement('div');
  entry.className = `pr-entry pr-${prefs.layout}`;

  const title = document.createElement('h3');
  title.className = 'pr-role';
  title.textContent = displayRole(role, prefs.roleStyle);
  title.title = role;

  const list = document.createElement('ul');
  list.className = 'pr-slots';
  for (const name of names) {
    list.append(createSlot(name, prefs));
  }

  entry.append(title, list);
  return entry;
}


function buildSheet(roster, dateIndex, prefs) {
  const sheet = document.createElement('div');
  sheet.id = 'pr-sheet';

  const header = document.createElement('header');
  header.className = 'pr-sheet-header';
  const heading = document.createElement('h1');
  heading.textContent = getEventName();
  const date = document.createElement('p');
  date.className = 'pr-date';
  date.textContent = roster.dates[dateIndex] ?? '';
  header.append(heading, date);

  const body = document.createElement('div');
  body.className = 'pr-columns';
  for (const entry of entriesForDate(roster, dateIndex, prefs)) {
    body.append(createEntry(entry, prefs));
  }

  sheet.append(header, body);
  return sheet;
}


// Sets the horizontal-layout gutter to the widest title actually present, so
// short role names hand their spare width to the names beside them.
function sizeRoleGutter(sheet, body) {
  sheet.style.removeProperty('--pr-gutter');
  const roles = [...body.querySelectorAll('.pr-horizontal .pr-role')];
  if (roles.length === 0) return;

  // Measure each title's intrinsic width with the gutter constraint lifted --
  // reading scrollWidth while the box is fixed just echoes the current gutter.
  // min-content is the longest single word: titles may wrap onto a second line,
  // so the gutter only needs to be word-wide, leaving the rest for names.
  for (const role of roles) role.style.width = 'min-content';

  let widest = 0;
  for (const role of roles) {
    widest = Math.max(widest, role.getBoundingClientRect().width);
  }

  for (const role of roles) role.style.removeProperty('width');

  if (widest > 0) sheet.style.setProperty('--pr-gutter', `${Math.ceil(widest)}px`);
}


// Shrinks any name that still wraps until it sits on one line. Applied per
// name so one long entry doesn't shrink the whole sheet.
function fitNamesToOneLine(body) {
  const MIN_SCALE = 0.55;

  for (const name of body.querySelectorAll('.pr-name')) {
    name.style.removeProperty('font-size');
    if (name.classList.contains('pr-empty')) continue;

    // One line's height at the current size; wrapping makes the box taller.
    const lineHeight = parseFloat(getComputedStyle(name).lineHeight);
    if (!lineHeight || name.getBoundingClientRect().height <= lineHeight + 1) continue;

    // Shrink stepwise until it fits on one line or we hit the floor.
    for (let scale = 0.95; scale >= MIN_SCALE; scale -= 0.05) {
      name.style.fontSize = `${scale * 1.05}em`;
      const line = parseFloat(getComputedStyle(name).lineHeight);
      if (name.getBoundingClientRect().height <= line + 1) break;
    }
  }
}


// True when every entry sits inside the container's box. A multi-column
// container absorbs extra content by creating further columns off to the side
// rather than growing taller, so scrollHeight never reports the overflow --
// the reliable signal is an entry escaping the container's right or bottom edge.
function contentFits(body) {
  const bounds = body.getBoundingClientRect();
  const TOLERANCE = 1;

  // Check the leaf elements (role titles and names), not just the entries:
  // an entry's own box can sit within bounds while its text spills out of it.
  for (const node of body.querySelectorAll('.pr-role, .pr-slot')) {
    const box = node.getBoundingClientRect();
    if (box.bottom > bounds.bottom + TOLERANCE) return false;
    if (box.right > bounds.right + TOLERANCE) return false;
  }

  // A role title too wide for its column overflows its own box rather than
  // breaking mid-word, which stays inside the container but looks broken.
  for (const role of body.querySelectorAll('.pr-role')) {
    if (role.scrollWidth > role.clientWidth + TOLERANCE) return false;
  }
  return true;
}


// Finds the largest font size (and column count) that keeps the sheet on one
// page. Larger text is preferred, so columns are only added when they let the
// content grow. Runs against the live layout, hence the forced reflows.
function fitToPage(sheet) {
  const body = sheet.querySelector('.pr-columns');
  let best = { size: 0, columns: 1 };

  // Measure with names at their natural size, so a name that needs shrinking
  // doesn't make the whole sheet look bigger than it is.
  for (const name of body.querySelectorAll('.pr-name')) {
    name.style.removeProperty('font-size');
  }

  for (let columns = 1; columns <= 5; columns += 1) {
    body.style.columnCount = columns;

    let low = 5;
    let high = 40;
    let fits = 0;

    // Binary search the largest size that still fits at this column count.
    while (high - low > 0.2) {
      const mid = (low + high) / 2;
      sheet.style.fontSize = `${mid}px`;
      // The gutter is measured in px, so it must be re-sized at each trial.
      sizeRoleGutter(sheet, body);
      if (contentFits(body)) {
        fits = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    if (fits > best.size) best = { size: fits, columns };
  }

  // Nothing fit even at the minimum; use the smallest size across most columns.
  if (best.size === 0) best = { size: 5, columns: 5 };

  body.style.columnCount = best.columns;
  sheet.style.fontSize = `${best.size}px`;
  sizeRoleGutter(sheet, body);
  fitNamesToOneLine(body);
}


function createControls(roster, prefs, rerender) {
  const controls = document.createElement('div');
  controls.className = 'pr-controls';

  const dateWrap = document.createElement('label');
  dateWrap.className = 'pr-control pr-date-picker';
  dateWrap.append('Event date ');
  const dateSelect = document.createElement('select');
  roster.dates.forEach((date, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = date;
    dateSelect.append(option);
  });
  dateSelect.value = prefs.dateIndex;
  dateSelect.addEventListener('change', () => {
    // Deliberately not saved: next week's roster has different dates, so the
    // picker should always open on the next event rather than a stale choice.
    prefs.dateIndex = Number(dateSelect.value);
    rerender();
  });
  dateWrap.append(dateSelect);

  const options = [
    { key: 'groupRoles', label: 'Group repeated roles' },
    { key: 'checkboxes', label: 'Tick boxes' },
  ].map(({ key, label }) => {
    const wrap = document.createElement('label');
    wrap.className = 'pr-control';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = prefs[key];
    input.addEventListener('change', () => {
      prefs[key] = input.checked;
      savePrefs(prefs);
      rerender();
    });
    wrap.append(input, label);
    return wrap;
  });

  function createSelect(className, labelText, key, choices) {
    const wrap = document.createElement('label');
    wrap.className = `pr-control ${className}`;
    wrap.append(`${labelText} `);
    const select = document.createElement('select');
    for (const [value, label] of choices) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.append(option);
    }
    select.value = prefs[key];
    select.addEventListener('change', () => {
      prefs[key] = select.value;
      savePrefs(prefs);
      rerender();
    });
    wrap.append(select);
    return wrap;
  }

  const rolesWrap = createSelect('pr-role-picker', 'Roles', 'roleStyle', [
    ['full', 'Full titles'],
    ['short', 'Short names'],
    ['initials', 'Initials'],
  ]);

  const layoutWrap = createSelect('pr-layout-picker', 'Layout', 'layout', [
    ['vertical', 'Titles above names'],
    ['horizontal', 'Titles beside names'],
  ]);

  const print = document.createElement('button');
  print.className = 'pr-print';
  print.textContent = 'Print';
  print.addEventListener('click', () => window.print());

  const close = document.createElement('button');
  close.className = 'pr-close';
  close.textContent = 'Close';
  close.addEventListener('click', closeOverlay);

  controls.append(dateWrap, rolesWrap, layoutWrap, ...options, print, close);
  return controls;
}


function closeOverlay() {
  document.querySelector('#pr-overlay')?.remove();
  document.body.classList.remove('pr-printing');
  document.removeEventListener('keydown', onKeydown);
}


function onKeydown(event) {
  if (event.key === 'Escape') closeOverlay();
}


function openOverlay() {
  const roster = scrapeRoster();
  if (!roster || roster.dates.length === 0) return;

  closeOverlay();

  const prefs = loadPrefs();
  if (typeof prefs.dateIndex !== 'number' || !roster.dates[prefs.dateIndex]) {
    prefs.dateIndex = 0;
  }

  const overlay = document.createElement('div');
  overlay.id = 'pr-overlay';

  const page = document.createElement('div');
  page.className = 'pr-page';

  function rerender() {
    page.replaceChildren();
    const sheet = buildSheet(roster, prefs.dateIndex, prefs);
    page.append(sheet);
    fitToPage(sheet);
  }

  overlay.append(createControls(roster, prefs, rerender), page);
  document.body.append(overlay);
  document.body.classList.add('pr-printing');
  document.addEventListener('keydown', onKeydown);

  rerender();
  // Re-fit if fonts finish loading after the first measurement.
  document.fonts?.ready.then(() => {
    const sheet = page.querySelector('#pr-sheet');
    if (sheet) fitToPage(sheet);
  });
}


function addBanner() {
  if (!document.querySelector('#rosterTable')) return;

  const banner = document.createElement('div');
  banner.id = 'pr-banner';

  const text = document.createElement('span');
  text.textContent = 'Want to format this roster for printing? No problem, ';

  const link = document.createElement('button');
  link.id = 'pr-banner-link';
  link.textContent = 'click here!';
  link.addEventListener('click', openOverlay);

  banner.append(text, link);
  document.body.prepend(banner);
}


addBanner();
