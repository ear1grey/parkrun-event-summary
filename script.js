const c1 = '#3e95cd';
const c2 = '#8e5ea2';
const c3 = '#999999';

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
  if (!infographic) {
    infographic = document.createElement('div');
    infographic.id = 'infographic';
    infographic.innerHTML = `<code>Preparing Charts...</code>`
    document.querySelector(".Results-header").prepend(infographic);
  }
  return infographic;
}

function createGenderDonut(target, meta) {
    const fig = document.createElement('figure');
    fig.id="gender-donut";
    fig.classList.add("donut");
    const cap = document.createElement('figcaption');
    fig.append(cap)
    const canvas = document.createElement('canvas');
    fig.append(canvas);
    target.append(fig);
  
    const count = meta.genders.male + meta.genders.female + meta.genders.unknown;

    cap.innerHTML=`<h1>${count}</h1><p>Participants</p>`;

    // Prepare the data for the chart
    const data = {
      labels: ['Male', 'Female', 'Unknown'],
      datasets: [{
        data: [meta.genders.male, meta.genders.female, meta.genders.unknown],
        backgroundColor: [c1, c2, c3],
      }]
    };
  
    // Prepare the options for the chart
    const options = {
      color: '#fff',
      borderColor: 'transparent',
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
    };
  
    // Create a new Chart.js instance
    new Chart(canvas, {
      type: 'doughnut',
      data: data,
      options: options
    });
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
  createGenderDonut(infographic, meta);
  createDate(infographic);
}

function simplify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractMeta(finishers) {
  const meta = {};
  meta.genders = {male: 0, female: 0, unknown: 0};
  meta.achievement = {pb: 0, first: 0, other: 0};
  meta.clubs = {};
  meta.ageGroups = {};
  meta.positions = {};
  meta.runs = {};
  meta.vols = {};
  meta.ageGrades = {};
  meta.ages = {};

  console.log(finishers);
  for (const finisher of finishers) {
    console.log(finisher);
    if (finisher) {
      finisher.gender = finisher?.gender?.toLowerCase() ?? "unknown";
      meta.genders[finisher.gender]++;
    }
    if (finisher.achievement) {
      meta.achievement =  (meta.achievement[finisher.achievement] ?? 0) + 1;
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
    if (finisher.runs) {
      meta.runs[finisher.runs] = (meta.runs[finisher.runs] ?? 0) + 1;
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
  return meta;
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
    //setTimeout(start, 1);
    start();
  }
};

window.onload = delayedStart;
