function createPBDonut(target, meta) {
  const fig = document.createElement('figure');
  fig.id="pb-donut";
  fig.classList.add("donut");
  const cap = document.createElement('figcaption');
  cap.id="pbdetails";
  fig.append(cap)
  const canvas = document.createElement('canvas');
  fig.append(canvas);
  target.append(fig);

  const participants = meta.genders.male + meta.genders.female + meta.genders.unknown;
  const pbs = meta.pb.male + meta.pb.female + meta.pb.unknown;
  
  cap.innerHTML=`<h1>${pbs}</h1><p>Personal Bests</p><p>${Number(pbs/participants*100).toFixed(1)}% of participants</p>`;

  // Prepare the data for the chart
  const data = {
    labels: ['Male', 'Female', 'Unknown', 'No PB'],
    datasets: [{
      data: [meta.pb.male, meta.pb.female, meta.pb.unknown, participants - pbs],
      backgroundColor: [c1, c2, c3, c4],
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
