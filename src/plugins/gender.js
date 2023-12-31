function createGenderDonut(target, meta) {
  const fig = document.createElement('figure');
  fig.id = 'donut-gender';
  fig.classList.add('donut');
  const cap = document.createElement('figcaption');
  fig.append(cap);
  const canvas = document.createElement('canvas');
  fig.append(canvas);
  target.append(fig);

  const key = document.createElement('div');
  key.classList.add('key');
  fig.append(key);


  const count = meta.genders.male + meta.genders.female + meta.genders.unknown;

  cap.innerHTML = `<h1>${count}</h1><p>Participants</p>`;

  // Prepare the data for the chart
  const data = {
    labels: ['Male', 'Female', 'Unknown'],
    datasets: [{
      data: [meta.genders.male, meta.genders.female, meta.genders.unknown],
      backgroundColor: [c1, c2, c5],
    }],
  };

  addLegendToKey(key, data);

  // Prepare the options for the chart
  const options = {
    color: '#fff',
    borderColor: 'transparent',
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
