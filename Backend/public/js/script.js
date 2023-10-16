google.charts.load('current', { packages: ['corechart', 'line'] });
// google.charts.setOnLoadCallback(drawBasic);

const dateInput = document.getElementById('date');
const firstIntervalDate = document.getElementById('initial');
const secondIntervalDate = document.getElementById('final');
document.getElementById('button').addEventListener('click', drawInterval);

dateInput.addEventListener('change', async (value) => {
    const date = value.target.value;
    const response = await fetch(`http://localhost:8080/temperatures?` + new URLSearchParams({ date }));
    if (!response.ok) {
        return
    }
    const json = await response.json()
    let rows = toRows(json)
    drawChart(rows, 'chart_div')

});

async function drawInterval() {
    const startDate = firstIntervalDate.value;
    const endDate = secondIntervalDate.value;
    // convert the dates to datetime objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    let dataInfo = [];
    let idx = 0;
    // For cicle to iterate through the dates
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        let date = d.toISOString().split('T')[0];
        let data = await fetch(`http://localhost:8080/temperatures?` + new URLSearchParams({ date }))
        data = await data.json();
        let rows = toRows(data, 24 * idx);
        dataInfo = dataInfo.concat(rows);
        idx++;
    }
    console.log(dataInfo)
    drawChart(dataInfo, 'range_div')

}


function toRows(data, idx = 0) {
    let rows = [];
    for (const [time, tempData] of Object.entries(data)) {
        rows.push([parseInt(time) + idx, tempData.celcius, tempData.farenheit])
    }
    rows.sort((a, b) => a[0] - b[0])
    return rows;
}

function drawChart(dataInfo, id) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Celcius');
    data.addColumn('number', 'Fahrenheit');
    console.log(dataInfo)
    data.addRows(dataInfo);
    var options = {
        height: 600,
        hAxis: {
            title: 'Hour',
            textStyle: {
                color: '#fc3d41',
            }
        },
        vAxis: {
            title: 'Temperature',
            textStyle: {
                color: '#d7aa47',
            }
        }

           };

    var chart = new google.visualization.LineChart(document.getElementById(id));

    chart.draw(data, options);
}
