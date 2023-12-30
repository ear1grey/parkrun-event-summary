
function createVolunteers(target, meta) {
  const fig = document.createElement('div');
  fig.id="volunteers";
  fig.classList.add("info");
  target.append(fig);
  const viz = chrome.runtime.getURL(`i/hiviz.svg`);
  fig.innerHTML=`<img alt="A hi-viz vest" src="${viz}"><p>${meta.volunteers.count} Hi-Viz<br>Heroes</p>`;
}


function createAges(target, meta) {
  const fig = document.createElement('div');
  fig.id="ages";
  fig.classList.add("info");
  target.append(fig);

  let total = 0;
  let count = 0;
  
  for (let group in meta.ageGroups) {
      let ages = group.replace(/\D/g, '-').split('-').filter(Boolean);
      let avgAge = (parseInt(ages[0]) + parseInt(ages[ages.length - 1])) / 2;
      total += avgAge * meta.ageGroups[group];
      count += meta.ageGroups[group];
  }
  
  let averageAge = Number(total / count).toFixed(0);
  const cake = chrome.runtime.getURL(`i/cake.svg`);

  fig.innerHTML=`<img alt="A birthday cake" src="${cake}"><p>Average<br>Age: ${averageAge}</p>`;
}
