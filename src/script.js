const c1 = '#3e95cd';
const c2 = '#ffa300';
const c3 = '#5ea28e';
const c4 = '#8e5ea2';
const c5 = '#999999';
const c6 = '#00ceae';
const c7 = '#6FC24D';
const c8 = '#F41C22';
const c9 = '#00ADEF';

const milestoneColourList = {
  c25: '#4D3691',
  c50: '#FF0200',
  c100: '#222222',
  c250: '#1EA073',
  c500: '#274EC8',
  c1000: '#BBBBBB',
};

function extractFinishers() {
  const table = document.querySelector('table.Results-table');
  const rows = table.querySelectorAll('.Results-table-row');
  const finishers = [];

  for (const row of rows) {
    const result = extractFinisherRow(row);
    if (result) finishers.push(result);
  }

  return finishers;
}

function extractFinisherRow(row) {
  const result = {};

  // Extract data attributes
  if (row.dataset.name) {
    result.name = row.dataset.name;
    result.ageGroup = row.dataset.agegroup;
    result.club = row.dataset.club;
    result.gender = row.dataset.gender;
    result.position = row.dataset.position;
    result.runs = row.dataset.runs;
    result.vols = row.dataset.vols;
    result.ageGrade = row.dataset.agegrade;
    result.achievement = row.dataset.achievement;
  }

  // // Extract inner text from each table data cell
  // const cells = row.querySelectorAll("td");
  // cells.forEach((cell, index) => {
  //   data[`cell${index + 1}`] = cell.innerText.trim();
  // });

  return result;
}

function createInfographicElement() {
  let infographic = document.querySelector('#infographic');
  const header = document.querySelector('.Results-header');
  if (header && !infographic) {
    infographic = document.createElement('div');
    infographic.id = 'infographic';
    infographic.innerHTML = '<code>Preparing Charts...</code>';
    header.prepend(infographic);
  }
  return infographic;
}


function createTitle(target) {
  const header = document.createElement('header');
  header.classList.add('event-location');

  const rhh1 = document.querySelector('.Results-header h1');
  const parkrunName = rhh1.textContent.trim();

  const rhspans = document.querySelectorAll('.Results-header span');
  const parkrunNumber = [...rhspans].at(-1).textContent.trim();

  const h1 = document.createElement('h1');
  h1.textContent = `${parkrunName} ${parkrunNumber}`;

  header.append(h1);
  target.append(header);
}

function createDate(target) {
  const header = document.createElement('div');
  header.classList.add('event-date');

  const h1 = document.createElement('h1');
  const d = document.querySelector('span.format-date');
  h1.textContent = d.textContent.trim();

  header.append(h1);
  target.append(header);
}

function generateInfographic(meta) {
  const infographic = document.querySelector('#infographic');
  infographic.innerHTML = '';
  createTitle(infographic);
  createDate(infographic);
  createGenderDonut(infographic, meta);
  createPBDonut(infographic, meta);
  createMilestonesDonut(infographic, meta);
  createFirst(infographic, meta);
  createAges(infographic, meta);
  createTopAgeGrade(infographic, meta);
  createVolunteers(infographic, meta);
  createTotalDistance(infographic, meta);
}

function simplify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractMeta(finishers) {
  const meta = {};
  meta.genders = { male: 0, female: 0, unknown: 0 };
  meta.achievement = {};
  meta.clubs = {};
  meta.ageGroups = {};
  meta.positions = {};
  meta.runs = {};
  meta.vols = {};
  meta.ageGrades = {};
  meta.ages = {};
  meta.firstTimer = { male: 0, female: 0, unknown: 0 };
  meta.first = { here: 0, anywhere: 0 };
  meta.pb = { male: 0, female: 0, unknown: 0 };
  meta.milestones = {};
  meta.milestones.official = { 25: [], 50: [], 100: [], 250: [], 500: [], 1000: [] };
  meta.milestones.unofficial = { 150: [], 200: [], 300: [], 400: [], 600: [], 700: [], 800: [], 900: [] };

  const genderTerms = {
    female: ["Female", "Kvinna", "Kvinde", "Kobieta", "Femme", "Frau", "Weiblich", "Naiset", "Vrouw", "Nainen", "Donna", "女子", "Kobieta", "Kvinne"],
    male: ["Male", "Man", "Mann", "Mand", "Männlich", "Homme", "Miehet", "Mężczyzna", "男子"]
  };

  for (const finisher of finishers) {

    if (finisher.gender) {
      if (genderTerms.male.includes(finisher.gender)) {
        meta.genders.male++;
        finisher.gender = "male";
      } else if (genderTerms.female.includes(finisher.gender)) {
        meta.genders.female++; 
        finisher.gender = "female";
      } else {
        meta.genders.unknown++;
        finisher.gender = "unknown";
      }
    } else {
      meta.genders.unknown++;
      finisher.gender = "unknown";
    }

    if (finisher.achievement) {
      meta.achievement[finisher.achievement] = (meta.achievement[finisher.achievement] ?? 0) + 1;

      const firstTimer = ["First Timer!", "Første gang!", "Première perf' !", "Erstläufer!", "Nieuwe loper!", "Ensikertalainen!", "Prima volta!", "初参加!", "Debiutant", "Debut!"];
      const newPB = ["New PB!", "Neue PB!", "Meilleure perf' !", "Nieuw PR!", "Ny PB!", "Oma ennätys!", "Nuovo PB!", "自己ベスト!", "Nowy PB!", "Nytt PB!"];

      // uk, at, de, nl, dk, fi, fr, jp, no, pl, se

      if (firstTimer.includes(finisher.achievement)) {
        meta.firstTimer[finisher.gender] = meta.firstTimer[finisher.gender] + 1 ?? 1;
        if (finisher.runs === '1') {
          meta.first.anywhere++;
        } else {
          meta.first.here++;
        }
      }

      if (newPB.includes(finisher.achievement)) {
        meta.pb[finisher.gender] = meta.pb[finisher.gender] + 1 ?? 1;
      }
    }
    if (finisher.club) {
      meta.clubs[finisher.club] = (meta.clubs[finisher.club] ?? 0) + 1;
    }
    if (finisher.ageGroup) {
      meta.ageGroups[finisher.ageGroup] = (meta.ageGroups[finisher.ageGroup] ?? 0) + 1;
    }
    if (finisher.position) {
      meta.positions[finisher.position] = (meta.positions[finisher.position] ?? 0) + 1;
    }
    if (finisher.vols) {
      meta.vols[finisher.vols] = (meta.vols[finisher.vols] ?? 0) + 1;
    }
    if (finisher.ageGrade) {
      meta.ageGrades[finisher.ageGrade] = (meta.ageGrades[finisher.ageGrade] ?? 0) + 1;
    }
    if (finisher.age) {
      meta.ages[finisher.age] = (meta.ages[finisher.age] ?? 0) + 1;
    }
    if (finisher.runs) {
      if (meta.milestones.official[finisher.runs]) {
        meta.milestones.official[finisher.runs].push(finisher.name);
      }
      if (meta.milestones.unofficial[finisher.runs]) {
        meta.milestones.unofficial[finisher.runs].push(finisher.name);
      }
    }
  }
  let totalVols = '0';
  for (const vol of Object.values(meta.vols)) {
    totalVols += vol;
  }
  meta.totalVols = totalVols;
  console.log(meta);
  return meta;
}

function extractVolunteers() {
  const volunteers = {};
  const volunteerDiv = document.querySelector('div.Results + div p');
  volunteers.count = volunteerDiv.querySelectorAll('a').length;
  return volunteers;
}

function start() {
  Chart.register(ChartDataLabels);
  Chart.defaults.set('plugins.datalabels', {
    color: '#FFFFFF',
  });

  const url = String(window.location.href);

  const isLatestResultsPage = url.includes('/latestresults');
  const isPreviousResultsPage = /\/results\/\d+\//.test(url);
  const isResultsPage = isLatestResultsPage || isPreviousResultsPage;

  if (!isResultsPage) {
    return;
  }

  const finishers = extractFinishers();
  const meta = extractMeta(finishers);
  meta.volunteers = extractVolunteers();
  meta.finishers = finishers;
  generateInfographic(meta);
}


function delayedStart() {
  if (document.title.includes('Human')) {
    // try and get a handle on the results header so we can
    // add a loading message
    const header = document.querySelector('.Results-header');
    if (header) {
      createInfographicElement();
    }
    setTimeout(delayedStart, 5);
  } else {
    createInfographicElement();
    start();
  }
}

function addLegendToKey(key, data) {
  data.labels.forEach((label, index) => {
    const legendItem = document.createElement('div');
    legendItem.style.backgroundColor = data.datasets[0].backgroundColor[index];
    legendItem.textContent = label;
    key.append(legendItem);
  });
}


window.onload = delayedStart;
