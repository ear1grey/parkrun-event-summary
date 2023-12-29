function createFirst(target, meta) {
  const fig = document.createElement('figure');
  fig.id="donut-first";
  fig.classList.add("donut");
  const cap = document.createElement('figcaption');
  cap.id="pbdetails";
  fig.append(cap)
  const canvas = document.createElement('canvas');
  fig.append(canvas);
  target.append(fig);

  const key = document.createElement('div');
  key.classList.add("key");
  fig.append(key);

  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown;
  const firsts = meta.first.here + meta.first.anywhere;
  
  cap.innerHTML=`<h1>${firsts}</h1><p>First Timers</p><p>${Number(firsts/participants*100).toFixed(1)}% of participants</p>`;

  // Prepare the data for the chart
  const data = {
    labels: ['First parkrun', 'First time here', 'Everyone else'],
    datasets: [{
      data: [meta.first.anywhere, meta.first.here, participants - firsts],
      backgroundColor: [c4, c7, c5],
    }]
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
          display: false
      }
    }
  };

  // Create a new Chart.js instance
  new Chart(canvas, {
    type: 'doughnut',
    data: data,
    options: options
  });
}
