
function createVolunteers(target, meta) {
  const fig = document.createElement('div');
  fig.id = 'volunteers';
  fig.classList.add('info');
  target.append(fig);
  const viz = chrome.runtime.getURL('src/i/hiviz.svg');
  fig.innerHTML = `<img alt="A hi-viz vest" src="${viz}"><p>${meta.volunteers.count} Hi-Viz<br>Heroes</p>`;
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
  fig.id = 'distance';
  fig.classList.add('info');
  target.append(fig);

  // calculate todays distance
  const todaysDistance = meta.finishers.length * 5;

  // add all the runs distances together  
  let totalDistance = 0;
  for (const finisher of meta.finishers) {
    totalDistance += finisher.runs * 5;
  }

  const earthCircumference = 40075;
  const earthLaps = Math.ceil(earthCircumference / todaysDistance);

  const tape = chrome.runtime.getURL('src/i/tape.svg');

  fig.innerHTML = `<img alt="A tape measure" src="${tape}"><p>Together we covered ${todaysDistance}km today!  That's enough to complete a relay around the Earth in ${earthLaps} days!</p>`;
}


