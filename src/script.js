const maleColour = '#00ceae';
const femaleColour = '#ffa300';
const unknownColour = '#6FC24D';
const noPBColour = '#95D03A';
const firstEverColour = '#8e5ea2';
const firstTimeHereColour = '#e21145';
const beenBeforeColour = '#00ADEF';

const milestoneTen ='#ffffffb6';
const milestoneTwentyFive = '#523585';
const milestoneFifty = '#C92E2E';
const milestoneHundred = '#222222';
const milestoneTwoFifty = '#394A36';
const milestoneFiveHundred = '#0162BA';
const milestoneThousand = '#E5C500';

const juniorMilestoneHalfMarathon = '#99d6ea';
const juniorMilestoneMarathon = '#c1cc26';
const juniorMilestoneUltra = '#ffa300';
const juniorMilestoneHundred = '#939393';
const juniorMilestoneTwoFifty = '#ffdd00';

function createVolunteers(target, meta) {
  const fig = document.createElement('div');
  fig.id = 'volunteers';
  fig.classList.add('info');
  target.append(fig);
  const viz = chrome.runtime.getURL('src/i/hiviz.svg');
  fig.innerHTML = `<img alt="A hi-viz vest" src="${viz}"><p>${meta.volunteers.count} Hi-Viz<br>Heroes</p>`;
}


function createGroup(target, id) {
  const group = document.createElement('div');
  group.id = id;
  group.classList.add('group');
  target.append(group);
  return group;
}


function createAges(target, meta) {
  const fig = document.createElement('div');
  fig.id = 'ages';
  fig.classList.add('info');
  target.append(fig);

  let total = 0;
  let count = 0;

  for (const group in meta.ageGroups) {
    const ages = group.replace(/\D/g, '-').split('-').filter(Boolean);
    if(ages.length === 0) continue;
    const avgAge = (parseInt(ages[0]) + parseInt(ages[ages.length - 1])) / 2;
    console.log(group, ages, avgAge);
    total += avgAge * meta.ageGroups[group];
    count += meta.ageGroups[group];
  }

  const averageAge = Number(total / count).toFixed(0);
  const cake = chrome.runtime.getURL('src/i/cake.svg');

  fig.innerHTML = `<img alt="A birthday cake" src="${cake}"><p>Average<br>Age: ${averageAge}</p>`;
}


function createTopAgeGrade(target, meta) {
  const fig = document.createElement('div');
  fig.id = 'agegrade';
  fig.classList.add('info');
  target.append(fig);

  // extract the highest age grade from the keys in meta.ageGrades
  const ageGrades = Object.keys(meta.ageGrades);
  const highestAgeGrade = Math.max(...ageGrades);

  const gauge = chrome.runtime.getURL('src/i/gauge.svg');

  fig.innerHTML = `<img alt="A gauge" src="${gauge}"><p>Top Age<br>Grade: ${highestAgeGrade}%</p>`;
}


function createTotalDistance(target, meta) {
  const fig = document.createElement('div');
  const COURSE_DISTANCE = isForJuniors() ? 2 : 5;
  fig.id = 'distance';
  fig.classList.add('info');
  target.append(fig);

  const todaysDistance = meta.finishers.length * COURSE_DISTANCE;
  const earthCircumference = 40075;
  const earthLaps = Math.ceil(earthCircumference / todaysDistance);

  const tape = chrome.runtime.getURL('src/i/earth.svg');

  fig.innerHTML = `<img alt="A tape measure" src="${tape}"><p>Together we covered ${todaysDistance.toLocaleString()}km today.<br>Enough to complete a relay around the Earth in ${earthLaps} days!</p>`;
}


function createGenderDonut(target, meta) {
  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown;
  const config = {
    id: 'gender-donut',
    message: `<h1>${participants}</h1><p>Participants</p>`,
    raw: [
      { label: 'Male', value: meta.genders.male, color: maleColour },
      { label: 'Female', value: meta.genders.female , color: femaleColour },
      { label: 'Unknown', value: meta.genders.unknown , color: unknownColour },
    ].sort((a, b) => b.value - a.value)  // Sort descending by value
  };
  createDonut(target, config);
}


function createFirstDonut(target, meta) {
  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown;
  const firsts = meta.first.here + meta.first.anywhere;
  const config = {
    id: 'first-donut',
    message: `<h1>${firsts}</h1><p>First Timers</p><p>${Number(firsts / participants * 100).toFixed(1)}% of participants</p>`,
    raw: [
      { label: 'First ever!', value: meta.first.anywhere, color: firstEverColour },
      { label: 'First time here', value: meta.first.here, color: firstTimeHereColour },
      { label: 'Participated here before', value: participants - firsts, color: beenBeforeColour },
    ].sort((a, b) => b.value - a.value)  // Sort descending by value
  };
  createDonut(target, config);
}


function createPBDonut(target, meta) {
  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown;
  const pbs = meta.pb.male + meta.pb.female + meta.pb.unknown;
  const config = {
    id: 'donut-pb',
    message: `<h1>${pbs}</h1><p>Personal Bests</p><p>${Number(pbs / participants * 100).toFixed(1)}% of participants</p>`,
    raw: [
      { label: 'Male PB', value: meta.pb.male, color: maleColour },
      { label: 'Female PB', value: meta.pb.female, color: femaleColour },
      { label: 'No PB', value: participants - pbs, color: noPBColour },
    ].sort((a, b) => b.value - a.value)  // Sort descending by value
  };
  createDonut(target, config);
}


function createMilestonesDonut(target, meta) {
  const config = {
    id: 'dmilestones',
    message: `<h1>${meta.milestones.total}</h1><p style="text-align: center">Participant<br>milestones<br>achieved!</p>`,
    raw: isForJuniors()
      ? [
          { label: 'Half marathon (11)', value: meta.milestones.official[11].length, color: juniorMilestoneHalfMarathon },
          { label: 'Marathon (21)', value: meta.milestones.official[21].length, color: juniorMilestoneMarathon },
          { label: 'Ultra marathon (50)', value: meta.milestones.official[50].length, color: juniorMilestoneUltra },
          { label: '100', value: meta.milestones.official[100].length, color: juniorMilestoneHundred },
          { label: '250', value: meta.milestones.official[250].length, color: juniorMilestoneTwoFifty },
        ]
      : [
          { label: '10', value: meta.milestones.official[10].length, color: milestoneTen },
          { label: '25', value: meta.milestones.official[25].length, color: milestoneTwentyFive },
          { label: '50', value: meta.milestones.official[50].length, color: milestoneFifty },
          { label: '100', value: meta.milestones.official[100].length, color: milestoneHundred },
          { label: '250', value: meta.milestones.official[250].length, color: milestoneTwoFifty },
          { label: '500', value: meta.milestones.official[500].length, color: milestoneFiveHundred },
          { label: '1K', value: meta.milestones.official[1000].length, color: milestoneThousand },
        ],
    borderColor: '#fff',
  };
  createDonut(target, config);
}


function createDonut(target, config) {
  const fig = document.createElement('figure');
  fig.id = config.id;
  fig.classList.add('donut');
  const cap = document.createElement('figcaption');
  cap.innerHTML = config.message;
  fig.append(cap);
  const canvas = document.createElement('canvas');
  fig.append(canvas);
  target.append(fig);

  const key = document.createElement('div');
  key.classList.add('key');
  fig.append(key);

  // Prepare the data for the chart
  const data = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
    }],
  };
  
  // add data from raw to the chart
  for (const item of config.raw) {
    if (item.value != 0) {
      data.labels.push(item.label);
      data.datasets[0].data.push(item.value);
      data.datasets[0].backgroundColor.push(item.color);
    }
  }

  addLegendToKey(key, data);

  // Prepare the options for the chart
  const options = {
    color: '#fff',
    cutout: "65%",
    borderColor: config.borderColor ?? '#fff',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        textStrokeColor: 'black',
        textStrokeWidth: 4,
        color: 'white',
        labels: {
          value: {
            font: {
              size: '24px',
              weight: 'bold',
            },
          },
        },
      },
    },
  };

  // Create a new Chart.js instance
  const chart = new Chart(canvas, {
    type: 'doughnut',
    data,
    options,
  });
}


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

  return result;
}


function createInfographicElement() {
  let infographic = document.querySelector('#infographic');
  if (infographic) return;

  const header = document.querySelector('.Results-header');
  if (header) {
    infographic = document.createElement('div');
    infographic.id = 'infographic';
    infographic.innerHTML = '<code>Preparing Charts...</code>';
    header.before(infographic);

    let p = document.createElement('p');
    p.id = 'linkToChromeExtension';
    p.innerHTML = 'Infographic made with the <a href="https://chromewebstore.google.com/detail/parkrun-event-summary/nfdbgfodockojbhmenjohphggbokgmaf">parkrun Event Summary</a> Chrome extension.';
    header.before(p);
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
  
  const ghead = createGroup(infographic, 'ghead'); 
  createTitle(ghead);
  createDate(ghead);

  const gcharts = createGroup(infographic, 'gcharts'); 
  createGenderDonut(gcharts, meta);
  createPBDonut(gcharts, meta);
  createFirstDonut(gcharts, meta);
  createMilestonesDonut(gcharts, meta);

  const g1 = createGroup(gcharts, 'g1');
  createTopAgeGrade(g1, meta);
  createAges(g1, meta);
  createVolunteers(g1, meta);

  const g2 = createGroup(gcharts, 'g1');
  createTotalDistance(g2, meta);
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
  meta.first = { here: 0, anywhere: 0 };
  meta.pb = { male: 0, female: 0, unknown: 0 };
  meta.milestones = {};
  meta.milestones.junior = { 11: [], 21: [], 50: [], 100: [], 250: [] };
  meta.milestones.fiveK = { 10: [], 25: [], 50: [], 100: [], 250: [], 500: [], 1000: [] };
  meta.milestones.unofficial = { 150: [], 200: [], 300: [], 400: [], 600: [], 700: [], 800: [], 900: [] };
  meta.milestones.total = 0;

  const genderTerms = {
    female: ["Female", "Kvinna", "Kvinde", "Kobieta", "Femme", "Frau", "Weiblich", "Naiset", "Vrouw", "Nainen", "Donna", "女子", "Kobieta", "Kvinne", "Moteris"],
    male: ["Male", "Man", "Mann", "Mand", "Männlich", "Homme", "Miehet", "Mężczyzna", "男子", "Vyras"]
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

      const firstTimer = ["First Timer!", "Første gang!", "Erstteilnahme!", "Première perf' !", "Erstläufer!", "Nieuwe loper!", "Ensikertalainen!", "Prima volta!", "初参加!", "Debiutant", "Debut!", "Naujokas!"];
      const newPB = ["New PB!", "Neue PB!", "Meilleure perf' !", "Nieuw PR!", "Ny PB!", "Oma ennätys!", "Nuovo PB!", "自己ベスト!", "Nowy PB!", "Nytt PB!", "Naujas geriausias asmeninis rezultatas!"];

      // uk, at, de, nl, dk, fi, fr, jp, no, pl, se

      if (firstTimer.includes(finisher.achievement)) {
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
      meta.milestones.official = isForJuniors()
        ? meta.milestones.junior
        : meta.milestones.fiveK;
      if (meta.milestones.official[finisher.runs]) {
        meta.milestones.official[finisher.runs].push(finisher.name);
        meta.milestones.total++;
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


function isForJuniors() {
  return window.location.href.includes('-juniors/');
}


window.onload = delayedStart;