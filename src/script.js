const c1 = '#3e95cd';
const c2 = "#ffa300";
const c3 = '#5ea28e';
const c4 = '#8e5ea2';
const c5 = '#999999';
const c6 = "#00ceae";
const c7 = "#6FC24D";
const c8 = "#F41C22";
const c9 = "#00ADEF";

function extractFinishers() {
  const table = document.querySelector("table.Results-table");
  const rows = table.querySelectorAll(".Results-table-row");
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
  let infographic = document.querySelector("#infographic");
  const header = document.querySelector(".Results-header");
  if (header && !infographic) {
    infographic = document.createElement('div');
    infographic.id = 'infographic';
    infographic.innerHTML = `<code>Preparing Charts...</code>`;
    header.prepend(infographic);
  }
  return infographic;
}


function createTitle(target) {
  const header = document.createElement('header');
  header.classList.add("event-location");

  const h1 = document.createElement('h1');
  h1.textContent = document.title.split(" | ")[1];

  header.append(h1);
  target.append(header);
}

function createDate(target) {
  const header = document.createElement('div');
  header.classList.add("event-date");

  const h1 = document.createElement('h1');
  const d = document.querySelector("span.format-date");
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
  createFirst(infographic, meta);
  createVolunteers(infographic, meta);
  createAges(infographic, meta);
}

function simplify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractMeta(finishers) {
  const meta = {};
  meta.genders = {male: 0, female: 0, unknown: 0};
  meta.achievement = {};
  meta.clubs = {};
  meta.ageGroups = {};
  meta.positions = {};
  meta.runs = {};
  meta.vols = {};
  meta.ageGrades = {};
  meta.ages = {};
  meta.firstTimer = {male: 0, female: 0, unknown: 0};
  meta.first = {here: 0, anywhere: 0};
  meta.pb = {male: 0, female: 0, unknown: 0};

  console.log(finishers);
  for (const finisher of finishers) {
    console.log(finisher);
    if (finisher) {
      finisher.gender = finisher?.gender?.toLowerCase() ?? "unknown";
      meta.genders[finisher.gender]++;
    }
    if (finisher.achievement) {
      meta.achievement[finisher.achievement] = (meta.achievement[finisher.achievement] ?? 0) + 1;

      if (finisher.achievement === "First Timer!") {
        meta.firstTimer[finisher.gender] = meta.firstTimer[finisher.gender] + 1 ?? 1;
        if (finisher.runs === "1") {
          meta.first.anywhere++;
        } else {
          meta.first.here++;
        }
      }

      if (finisher.achievement === "New PB!") {
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

  }
  let totalVols = 0;
  for (let vol of Object.values(meta.vols)) {
    totalVols += vol;
    console.log(totalVols);
  }
  meta.totalVols = totalVols;
  return meta;
}

function extractVolunteers() {
  const volunteers = {};
  const volunteerDiv = document.querySelector("div.Results + div p");
  volunteers.count = volunteerDiv.querySelectorAll("a").length;
  return volunteers;
}

function start() {
  console.log("go");
  const url = String(window.location.href);

  const isLatestResultsPage = url.includes("/latestresults")
  const isPreviousResultsPage = /\/results\/\d+\//.test(url);
  const isResultsPage = isLatestResultsPage || isPreviousResultsPage;

  if (!isResultsPage) {
    console.log("Not a results page.");
    return;
  }

  const finishers = extractFinishers();
  const meta = extractMeta(finishers);
  meta.volunteers = extractVolunteers();
  meta.finishers = finishers;
  console.log(meta);
  generateInfographic(meta);

}


function delayedStart() {
  if (document.title.includes("Human")) {
    console.log("waiting");
    // try and get a handle on the results header so we can
    // add a loading message
    const header = document.querySelector(".Results-header");
    if (header) {
      createInfographicElement();
    }
    setTimeout(delayedStart, 5);
  } else {
    createInfographicElement();
    start();
  }
};

function addLegendToKey(key, data) {
  data.labels.forEach((label, index) => {
    const legendItem = document.createElement('div');
    legendItem.style.backgroundColor = data.datasets[0].backgroundColor[index];
    legendItem.textContent = label;
    key.append(legendItem);
  });
}


window.onload = delayedStart;
