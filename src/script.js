// Named colour palette
const genderColours = {
  male: '#3e95cd',
  female: '#ffa300',
  other: '#5ea28e',
  unknown: '#999999',
};

const milestoneColours = {
  c10: '#0E7C7B',
  c25: '#4D3691',
  c50: '#FF0200',
  c100: '#222222',
  c250: '#1EA073',
  c500: '#274EC8',
  c1000: '#BBBBBB',

  juniorHalf: '#F9C846',
  juniorMarathon: '#F97B22',
  juniorUltra: '#A020F0',
  junior100: '#222222',
  junior250: '#1EA073',
};

const firstTimerColours = {
  firstAnywhere: '#8e5ea2',
  firstHere: '#6FC24D',
  before: '#999999',
};

function createVolunteers(target, meta) {
  const fig = document.createElement('div');
  fig.id = 'volunteers';
  fig.classList.add('info');
  target.append(fig);
  const viz = chrome.runtime.getURL('src/i/hiviz.svg');
  fig.innerHTML = `<img alt="A hi-viz vest" src="${viz}"><p>${meta.volunteers.count} Volunteers</p>`;
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
    if (ages.length === 0) continue;
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
  const ageGradesRaw = Object.keys(meta.ageGrades);
  const ageGrades = ageGradesRaw.map(s => Number(s.replace('%', '')));
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
  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown + meta.genders.other;
  const config = {
    id: 'gender-donut',
    message: `<h1>${participants}</h1><p>Participants</p>`,
    raw: [
      { label: 'Male', value: meta.genders.male, color: genderColours.male },
      { label: 'Other', value: meta.genders.other, color: genderColours.other },
      { label: 'Female', value: meta.genders.female, color: genderColours.female },
      { label: 'Unknown', value: meta.genders.unknown, color: genderColours.unknown },
    ].sort((a, b) => b.value - a.value), // Sort descending by value
  };
  createDonut(target, config);
}


function createFirstDonut(target, meta) {
  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown + meta.genders.other;
  const firsts = meta.first.here + meta.first.anywhere;
  const config = {
    id: 'first-donut',
    message: `<h1>${firsts}</h1><p>First Timers</p><p>${Number(firsts / participants * 100).toFixed(1)}% of participants</p>`,
    raw: [
      { label: 'First ever!', value: meta.first.anywhere, color: firstTimerColours.firstAnywhere },
      { label: 'First time here', value: meta.first.here, color: firstTimerColours.firstHere },
      // Hide 'Participated here before' from the key and chart
      // { label: 'Participated here before', value: participants - firsts, color: firstTimerColours.before },
    ].sort((a, b) => b.value - a.value), // Sort descending by value
  };
  createDonut(target, config);
}


function createPBDonut(target, meta) {
  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown + meta.genders.other;
  const pbs = meta.pb.male + meta.pb.female + meta.pb.unknown + meta.pb.other;
  // Use the same PB/noPB colors as the histogram
  const pbShades = {
    male: '#3e95cd', // base
    malePB: '#6fb8e6',
    female: '#ffa300',
    femalePB: '#ffd580',
    other: '#5ea28e',
    otherPB: '#8edbb3',
    unknown: '#999999',
    unknownPB: '#cccccc',
  };

  const config = {
    id: 'donut-pb',
    message: `<h1>${pbs}</h1><p>Personal Bests</p><p>${Number(pbs / participants * 100).toFixed(1)}% of participants</p>`,
    raw: [
      { label: 'Male PB', value: meta.pb.male, color: pbShades.malePB },
      { label: 'Other PB', value: meta.pb.other, color: pbShades.otherPB },
      { label: 'Female PB', value: meta.pb.female, color: pbShades.femalePB },
      { label: 'No PB', value: participants - pbs, color: pbShades.unknown },
    ].sort((a, b) => b.value - a.value), // Sort descending by value
  };
  createDonut(target, config);
}


function createMilestonesDonut(target, meta) {
  const config = {
    id: 'dmilestones',
    message: `<h1>${meta.milestones.total}</h1><p style="text-align: center">Participant<br>milestones<br>achieved!</p>`,
    raw: isForJuniors()
      ? [
          { label: 'Half marathon (11)', value: meta.milestones.official[11]?.length || 0, color: milestoneColours.juniorHalf },
          { label: 'Marathon (21)', value: meta.milestones.official[21]?.length || 0, color: milestoneColours.juniorMarathon },
          { label: 'Ultra marathon (50)', value: meta.milestones.official[50]?.length || 0, color: milestoneColours.juniorUltra },
          { label: '100', value: meta.milestones.official[100]?.length || 0, color: milestoneColours.junior100 },
          { label: '250', value: meta.milestones.official[250]?.length || 0, color: milestoneColours.junior250 },
        ]
      : [
          { label: "10 (under 18's)", value: meta.milestones.official[10]?.length || 0, color: milestoneColours.c10 },
          { label: '25', value: meta.milestones.official[25]?.length || 0, color: milestoneColours.c25 },
          { label: '50', value: meta.milestones.official[50]?.length || 0, color: milestoneColours.c50 },
          { label: '100', value: meta.milestones.official[100]?.length || 0, color: milestoneColours.c100 },
          { label: '250', value: meta.milestones.official[250]?.length || 0, color: milestoneColours.c250 },
          { label: '500', value: meta.milestones.official[500]?.length || 0, color: milestoneColours.c500 },
          { label: '1K', value: meta.milestones.official[1000]?.length || 0, color: milestoneColours.c1000 },
        ],
    borderColor: '#fff',
  };
  createDonut(target, config);
}


function createDonut(target, config) {
  // Create a wrapper to hold both key and donut, for centering
  const donutWrap = document.createElement('div');
  donutWrap.classList.add('donut-wrap');
  donutWrap.style.display = 'flex';
  donutWrap.style.flexDirection = 'column';
  donutWrap.style.alignItems = 'center';
  donutWrap.style.justifyContent = 'center';

  const key = document.createElement('div');
  key.classList.add('key');
  donutWrap.append(key);

  const fig = document.createElement('figure');
  fig.id = config.id;
  fig.classList.add('donut');
  const cap = document.createElement('figcaption');
  cap.innerHTML = config.message;
  fig.append(cap);
  const canvas = document.createElement('canvas');
  fig.append(canvas);
  donutWrap.append(fig);
  target.append(donutWrap);

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
    cutout: '65%',
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

    const p = document.createElement('p');
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

  // Add the histogram at the top, directly under the header
  createAgeGroupHistogram(infographic, meta);

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
// Add a stacked histogram for age group attendance by gender and PB status
function createAgeGroupHistogram(target, meta) {
  // Define colors for PB/noPB for each gender
  const pbShades = {
    male: '#3e95cd', // base
    malePB: '#6fb8e6',
    female: '#ffa300',
    femalePB: '#ffd580',
    other: '#5ea28e',
    otherPB: '#8edbb3',
    unknown: '#999999',
    unknownPB: '#cccccc',
  };

  // Combine JM/JW, SM/SW, VM/VW into single age groups
  function combineAgeGroupKey(key) {
    // e.g. JM10/JW10 -> J10, SM25/SW25 -> S25, VM70/VW70 -> V70
    return key.replace(/^J[MW]/, 'J').replace(/^S[MW]/, 'S').replace(/^V[MW]/, 'V');
  }

  // Aggregate all finishers into combined groups, excluding those with ageGroup containing '---'
  const combinedGroups = {};
  // Helper for assigning 10-year buckets (e.g., 0-9, 10-19, 20-29, ...)
  function getDecadeBucket(group) {
    // Accepts group keys like J10, J11, S25, V70, 10, 11, etc.
    const match = group.match(/(\d{1,2})/);
    if (!match) return group;
    const age = parseInt(match[1], 10);
    if (isNaN(age)) return group;
    const lower = Math.floor(age / 10) * 10;
    const upper = lower + 9;
    return `${lower}-${upper}`;
  }
  for (const finisher of meta.finishers) {
    const rawGroup = finisher.ageGroup;
    if (!rawGroup) continue;
    if (rawGroup.includes('---')) continue; // Exclude runners with no age
    if (rawGroup.includes('WWC') || rawGroup.includes('MWC')) continue; // Exclude WWC and MWC
    let group = combineAgeGroupKey(rawGroup);
    // Assign to 10-year bucket
    group = getDecadeBucket(group);
    if (!combinedGroups[group]) {
      combinedGroups[group] = {
        male: { pb: 0, noPB: 0 },
        female: { pb: 0, noPB: 0 },
        other: { pb: 0, noPB: 0 },
        unknown: { pb: 0, noPB: 0 },
      };
    }
    const gender = ['male', 'female', 'other', 'unknown'].includes(finisher.gender) ? finisher.gender : 'unknown';
    const isPB = finisher.achievement && finisher.achievement.includes('PB');
    if (isPB) {
      combinedGroups[group][gender].pb++;
    } else {
      combinedGroups[group][gender].noPB++;
    }
  }

  // Get all unique combined age groups, sorted numerically by lower bound
  const ageGroupsRaw = Object.keys(combinedGroups).sort((a, b) => {
    const aNum = parseInt(a.split('-')[0], 10);
    const bNum = parseInt(b.split('-')[0], 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.localeCompare(b);
  });
  // Custom labels: first bucket as '-19', last as 'n+', others as 'n-m'
  const ageGroupLabels = ageGroupsRaw.map((g, i, arr) => {
    const [start, end] = g.split('-').map(Number);
    if (i === 0) {
      // First bucket: '-19'
      return '-19';
    } else if (i === arr.length - 1) {
      // Last bucket: 'n+'
      return start + '+';
    } else {
      // Middle buckets: 'n-m'
      return g;
    }
  });

  // Prepare datasets for Chart.js (stacked bar)
  const groupData = combinedGroups;

  // Prepare datasets for Chart.js (stacked bar)
  const datasets = [];
  const genders = ['male', 'female', 'other', 'unknown'];
  // For each gender, push noPB (bottom) then PB (top)
  for (const gender of genders) {
    const noPBData = ageGroupsRaw.map(g => groupData[g][gender].noPB);
    if (noPBData.some(v => v > 0)) {
      datasets.push({
        label: gender.charAt(0).toUpperCase() + gender.slice(1) + ' noPB',
        data: noPBData,
        backgroundColor: pbShades[gender],
        stack: 'all',
      });
    }
    const pbData = ageGroupsRaw.map(g => groupData[g][gender].pb);
    if (pbData.some(v => v > 0)) {
      datasets.push({
        label: gender.charAt(0).toUpperCase() + gender.slice(1) + ' PB',
        data: pbData,
        backgroundColor: pbShades[gender + 'PB'],
        stack: 'all',
      });
    }
  }

  // Create the chart
  const fig = document.createElement('figure');
  fig.id = 'agegroup-histogram';
  fig.classList.add('histogram');
  const canvas = document.createElement('canvas');
  // Set the histogram height to match the donut diameter, plus extra for top labels (380px)
  canvas.height = 380;

  // Chart.js option: add extra top padding to chart area so top labels never overlap bars
  const extraTopPadding = 36; // px
  fig.append(canvas);
  target.append(fig);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ageGroupLabels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: extraTopPadding,
          left: 36,
          right: 36,
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        title: { display: false },
        datalabels: {
          display: function(context) {
            // ...existing code...
            return false;
          },
          textStrokeColor: 'black',
          textStrokeWidth: 4,
          color: 'white',
          font: {
              weight: 'bold',
              size: '24px',
              weight: 'bold',
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: 'white',
            maxRotation: 90,
            minRotation: 90,
            font: {
              size: '18px',
              weight: 'bold'
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          display: true,
          stacked: true,
          title: { display: true, text: 'Age Profile', color: 'white', font: { size: 36, weight: 'bold' } },
          beginAtZero: true,
          grid: {
            display: false,
          },
          ticks: {
            display: false
          },
        },
      },
    },
    plugins: [
      ...(window.ChartDataLabels ? [ChartDataLabels] : []),
      // Plugin to clip each bar to a rounded rectangle before drawing each dataset and custom datalabels
      {
        id: 'barClip',
        beforeDatasetsDraw(chart) {
          const {ctx} = chart;
          const datasets = chart.data.datasets;
          const meta0 = chart.getDatasetMeta(0);
          const metaSets = meta0.data;
          const radius = 4;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 24px sans-serif';
          // For each bar index
          for (let i = 0; i < metaSets.length; i++) {
            // Find the top and bottom of the stack for this bar
            let minY = Infinity, maxY = -Infinity, left = null, right = null;
            let stackTops = [];
            let stackBottoms = [];
            let stackTotal = 0;
            for (let d = 0; d < datasets.length; d++) {
              const bar = chart.getDatasetMeta(d).data[i];
              if (!bar) continue;
              const {x, y, base, width} = bar;
              if (left === null || x - width/2 < left) left = x - width/2;
              if (right === null || x + width/2 > right) right = x + width/2;
              minY = Math.min(minY, y, base);
              maxY = Math.max(maxY, y, base);
              stackTops.push(Math.min(y, base));
              stackBottoms.push(Math.max(y, base));
              stackTotal += datasets[d].data[i];
            }
            if (left !== null && right !== null && isFinite(minY) && isFinite(maxY)) {
              ctx.save();
              ctx.beginPath();
              const w = right - left;
              const h = maxY - minY;
              const r = Math.min(radius, w / 2, h / 2);
              ctx.moveTo(left + r, minY);
              ctx.lineTo(right - r, minY);
              ctx.quadraticCurveTo(right, minY, right, minY + r);
              ctx.lineTo(right, maxY - r);
              ctx.quadraticCurveTo(right, maxY, right - r, maxY);
              ctx.lineTo(left + r, maxY);
              ctx.quadraticCurveTo(left, maxY, left, maxY - r);
              ctx.lineTo(left, minY + r);
              ctx.quadraticCurveTo(left, minY, left + r, minY);
              ctx.closePath();
              ctx.clip();
              // Draw all stack segments for this bar
              for (let d = 0; d < datasets.length; d++) {
                const bar = chart.getDatasetMeta(d).data[i];
                if (bar && bar.draw) bar.draw(ctx);
              }
              // Draw custom datalabels for each stack segment if value >= 5
              for (let d = 0; d < datasets.length; d++) {
                const bar = chart.getDatasetMeta(d).data[i];
                if (!bar) continue;
                const value = datasets[d].data[i];
                // Only show label if segment is at least 10x the label's text height
                // Chart.js draws in canvas pixels, but the display may be scaled by DPR
                const dpr = window.devicePixelRatio || 1;
                const segmentHeight = Math.abs(bar.base - bar.y) / dpr;
                ctx.save();
                ctx.font = 'bold 24px sans-serif';
                let textHeight = 24;
                if (ctx.measureText) {
                  const metrics = ctx.measureText(value);
                  if ('actualBoundingBoxAscent' in metrics && 'actualBoundingBoxDescent' in metrics) {
                    textHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / dpr;
                  } else if ('fontBoundingBoxAscent' in metrics && 'fontBoundingBoxDescent' in metrics) {
                    textHeight = (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) / dpr;
                  } else {
                    textHeight = 1.2 * 24 / dpr;
                  }
                }
                ctx.restore();
                const margin = 4;
                if (value >= 6 && segmentHeight >= 3 * (textHeight + margin)) {
                  // Restore label to vertical center of the segment
                  const yTop = Math.min(bar.y, bar.base);
                  const yBottom = Math.max(bar.y, bar.base);
                  const yCenter = (yTop + yBottom) / 2;
                  const xCenter = bar.x;
                  ctx.save();
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.lineWidth = 4;
                  ctx.strokeStyle = 'black';
                  ctx.strokeText(value, xCenter, yCenter);
                  ctx.restore();
                  ctx.fillStyle = 'white';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(value, xCenter, yCenter);
                }
              }
              ctx.restore();
              // Draw total above the bar horizontally
              if (stackTotal > 0) {
                const bar = chart.getDatasetMeta(0).data[i];
                const xCenter = bar.x;
                let yAbove = minY - 24; // 24px above the top of the bar for more space
                // Ensure the label is always above the bar, but never overlaps it or goes off the canvas
                // The extraTopPadding ensures minY is never too close to the top
                ctx.save();
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'black';
                ctx.strokeText(stackTotal, xCenter, yAbove);
                ctx.fillStyle = 'white';
                ctx.fillText(stackTotal, xCenter, yAbove);
                ctx.restore();
              }
            }
          }
          ctx.restore();
          // Prevent Chart.js from drawing the bars and datalabels again
          return false;
        }
      },
      // Plugin to draw the rounded outline after bars
      {
        id: 'barOutline',
        afterDraw(chart) {
          const {ctx, chartArea} = chart;
          if (!chartArea) return;
          ctx.save();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#fff';
          const metaSets = chart.getDatasetMeta(0).data;
          const radius = 4;
          for (let i = 0; i < metaSets.length; i++) {
            // Find the top and bottom of the stack for this bar
            let minY = Infinity, maxY = -Infinity, left = null, right = null;
            for (let d = 0; d < chart.data.datasets.length; d++) {
              const bar = chart.getDatasetMeta(d).data[i];
              if (!bar) continue;
              const {x, y, base, width} = bar;
              if (left === null || x - width/2 < left) left = x - width/2;
              if (right === null || x + width/2 > right) right = x + width/2;
              minY = Math.min(minY, y, base);
              maxY = Math.max(maxY, y, base);
            }
            if (left !== null && right !== null && isFinite(minY) && isFinite(maxY)) {
              // Draw a rounded rectangle for the whole bar
              ctx.beginPath();
              const w = right - left;
              const h = maxY - minY;
              const r = Math.min(radius, w / 2, h / 2);
              ctx.moveTo(left + r, minY);
              ctx.lineTo(right - r, minY);
              ctx.quadraticCurveTo(right, minY, right, minY + r);
              ctx.lineTo(right, maxY - r);
              ctx.quadraticCurveTo(right, maxY, right - r, maxY);
              ctx.lineTo(left + r, maxY);
              ctx.quadraticCurveTo(left, maxY, left, maxY - r);
              ctx.lineTo(left, minY + r);
              ctx.quadraticCurveTo(left, minY, left + r, minY);
              ctx.closePath();
              ctx.stroke();
            }
          }
          ctx.restore();
        }
      }
    ],
  });

}



function simplify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}


function extractMeta(finishers) {
  const meta = {};
  meta.genders = { male: 0, female: 0, unknown: 0, other: 0 };
  meta.achievement = {};
  meta.clubs = {};
  meta.ageGroups = {};
  meta.positions = {};
  meta.runs = {};
  meta.vols = {};
  meta.ageGrades = {};
  meta.ages = {};
  meta.firstTimer = { male: 0, female: 0, unknown: 0, other: 0 };
  meta.first = { here: 0, anywhere: 0 };
  meta.pb = { male: 0, female: 0, unknown: 0, other: 0 };
  meta.milestones = {};
  meta.milestones.junior = { 11: [], 21: [], 50: [], 100: [], 250: [] };
  meta.milestones.fiveK = { 10: [], 25: [], 50: [], 100: [], 250: [], 500: [], 1000: [] };
  meta.milestones.unofficial = { 150: [], 200: [], 300: [], 400: [], 600: [], 700: [], 800: [], 900: [] };
  meta.milestones.total = 0;

  const genderTerms = {
    female: ['Female', 'Kvinna', 'Kvinde', 'Kobieta', 'Femme', 'Frau', 'Weiblich', 'Naiset', 'Vrouw', 'Nainen', 'Donna', '女子', 'Kobieta', 'Kvinne', 'Moteris'],
    male: ['Male', 'Man', 'Mann', 'Mand', 'Männlich', 'Homme', 'Miehet', 'Mężczyzna', '男子', 'Vyras'],
  };

  for (const finisher of finishers) {
    // Determine gender assignment based on user intent:
    // - 'other': has name, but gender is empty or missing
    // - 'unknown': no name (placeholder/time only rows, non-barcode unknowns, or name is 'Unknown')
    let assignedGender = null;
    const nameVal = (finisher.name || '').trim().toLowerCase();
    const isUnknownName = !nameVal || nameVal === 'unknown';
    if (isUnknownName) {
      // No runner info or name is 'Unknown': unknown (non-barcode/placeholder)
      assignedGender = 'unknown';
      meta.genders.unknown++;
    } else if (typeof finisher.gender === 'string' && finisher.gender.length === 0) {
      // Runner exists, but no gender info: other
      assignedGender = 'other';
      meta.genders.other++;
    } else if (genderTerms.male.includes(finisher.gender)) {
      assignedGender = 'male';
      meta.genders.male++;
    } else if (genderTerms.female.includes(finisher.gender)) {
      assignedGender = 'female';
      meta.genders.female++;
    } else {
      // Runner exists, but gender string is not recognized: other
      assignedGender = 'other';
      meta.genders.other++;
    }
    finisher.gender = assignedGender;

    if (finisher.achievement) {
      meta.achievement[finisher.achievement] = (meta.achievement[finisher.achievement] ?? 0) + 1;

      const firstTimer = ['First Timer!', 'Første gang!', 'Erstteilnahme!', "Première perf' !", 'Erstläufer!', 'Nieuwe loper!', 'Ensikertalainen!', 'Prima volta!', '初参加!', 'Debiutant', 'Debut!', 'Naujokas!'];
      const newPB = ['New PB!', 'Neue PB!', "Meilleure perf' !", 'Nieuw PR!', 'Ny PB!', 'Oma ennätys!', 'Nuovo PB!', '自己ベスト!', 'Nowy PB!', 'Nytt PB!', 'Naujas geriausias asmeninis rezultatas!'];

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
        // Only add milestone 10 if it's a junior (ageGroup starts with J)
        if (finisher.runs === '10' && !finisher.ageGroup?.startsWith('J')) {
          // Skip non-juniors for milestone 10
        } else {
          meta.milestones.official[finisher.runs].push(finisher.name);
          meta.milestones.total++;
        }
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
  // Find the volunteers table and count the rows
  const table = document.querySelector('table.Volunteers-table');
  if (table) {
    const rows = table.querySelectorAll('tr.Volunteers-table-row');
    volunteers.count = rows.length;
  } else {
    volunteers.count = 0;
  }
  return volunteers;
}


function start() {
  Chart.register(ChartDataLabels);
  Chart.defaults.set('plugins.datalabels', {
    color: '#FFFFFF',
  });

  const url = String(window.location.href);

  const isLatestResultsPage = url.includes('/latestresults');
  // Match /results/12345/ or /results/YYYY-MM-DD/
  const isPreviousResultsPage = /\/results\/(\d+|\d{4}-\d{2}-\d{2})\//.test(url);
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
    // Always hide the 'No PB' key
    if (label === 'No PB') return;
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
