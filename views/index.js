let socket = null;
let term = null;
let chartlabels = []
let chartdata = []

let options = {
  type: 'line',
  data: {
    labels: chartlabels,
    datasets: [
			{
				data: chartdata,
				borderWidth: 1,
        fill: false,
        borderColor: 'rgb(53, 146, 213)',
        backgroundColor:'rgb(53, 146, 213)'
			}
		]
  },
  options: {
    legend: {
      display: false,
    },
    responsive: true,
    maintainAspectRatio:false,
  	scales: {
    	yAxes: [{
        scaleLabel: {
          display: true,
          labelString:'Score'
        },
        ticks: {
					reverse: false
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString:'Time'
        },
        ticks: {
					reverse: false
        }
      }]
    }
  }
}

let ctx = document.getElementById('myChart').getContext('2d');
let chart = new Chart(ctx, options);


function redrawChart() {
  chartlabels = [];
  chartdata =[];
  chart.data.datasets[0].data = chartdata;
  chart.data.labels = chartlabels;
}


function connectSocket(event) {
  let time = null;
  let now = null;
  term = document.getElementById("searchfield").value;
  event.preventDefault();
  document.getElementById("trackedterm").innerHTML = term;
  if (socket !== null) {
    socket.disconnect();

    redrawChart();

    socket = io.connect(window.location.hostname,{'forceNew':true});
    socket.emit('term', {term: term});

    socket.on('sentdata', function(data) {
      time = new Date().toLocaleTimeString();
      chartlabels.push(time);
      chartdata.push(data.sentimentScore);
      chart.update();
    });

  } else {
    socket = io.connect(window.location.hostname,{'forceNew':true});
    socket.emit('term', {term: term});
    socket.on('sentdata', function(data) {
      time = new Date().toLocaleTimeString();
      chartlabels.push(time);
      chartdata.push(data.sentimentScore);
      chart.update();
    });

  }
}
