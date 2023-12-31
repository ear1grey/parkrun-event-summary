
function createPBDonut(target, meta) {
  const fig = document.createElement('figure');
  fig.id = 'donut-pb';
  fig.classList.add('donut');
  const cap = document.createElement('figcaption');
  cap.id = 'pbdetails';
  fig.append(cap);
  const canvas = document.createElement('canvas');
  fig.append(canvas);
  target.append(fig);

  const key = document.createElement('div');
  key.classList.add('key');
  fig.append(key);

  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown;
  const pbs = meta.pb.male + meta.pb.female + meta.pb.unknown;

  cap.innerHTML = `<h1>${pbs}</h1><p>Personal Bests</p><p>${Number(pbs / participants * 100).toFixed(1)}% of participants</p>`;

  // Prepare the data for the chart
  const data = {
    labels: ['Male PB', 'Female PB', 'No PB'],
    datasets: [{
      data: [meta.pb.male, meta.pb.female, participants - pbs],
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
        labels: {
          value: {
            color: 'white',
            font: {
              size: '24px',
              weight: 'bold',
            },
          },
        },
      },
    },
  };


  // Call the function after creating the chart
  const chart = new Chart(canvas, {
    type: 'doughnut',
    data,
    options,
  });
}
