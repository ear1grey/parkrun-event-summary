function createMilestonesDonut(target, meta) {
  const fig = document.createElement('figure');
  fig.id = 'dmilestones';
  fig.classList.add('donut');
  const cap = document.createElement('figcaption');
  fig.append(cap);
  const canvas = document.createElement('canvas');
  fig.append(canvas);
  target.append(fig);

  const key = document.createElement('div');
  key.classList.add('key');
  fig.append(key);

  // remove empty milestones
  for (const key of Object.keys(meta.milestones.official)) {
    if (meta.milestones.official[key].length === 0) {
      delete meta.milestones.official[key];
    }
  }

  // count official milestones
  let totalMilestones = 0;
  for (const key of Object.keys(meta.milestones.official)) {
    if (meta.milestones.official[key].length > 0) {
      totalMilestones += meta.milestones.official[key].length;
    }
  }

  // extract each specific milestone length
  const milestoneCounts = [];
  for (const key of Object.keys(meta.milestones.official)) {
    milestoneCounts.push(meta.milestones.official[key].length);
  }

  const cols = [];
  for (const col of Object.keys(meta.milestones.official)) {
    cols.push(milestoneColourList['c' + col]);
  }

  const labels = [];
  for (const label of Object.keys(meta.milestones.official)) {
    labels.push(label + ' parkruns');
  }


  cap.innerHTML = `<h1>${totalMilestones}</h1><p>Milestones</p>`;

  // Prepare the data for the chart
  const data = {
    labels,
    datasets: [{
      data: milestoneCounts,
      backgroundColor: cols,
    }],
  };

  addLegendToKey(key, data);


  // Prepare the options for the chart
  const options = {
    color: '#fff',
    borderColor: '#fff',
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
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
  new Chart(canvas, {
    type: 'doughnut',
    data,
    options,
  });
}
