google.charts.load('current', { packages: ['corechart', 'line'] });
// google.charts.setOnLoadCallback(drawBasic);

const dateInput = document.getElementById('date');
dateInput.addEventListener('change', async (value) => {
    const date = value.target.value;
    const response = await fetch(`http://localhost:8080/temperatures?` + new URLSearchParams({ date }));
    if (!response.ok) {
        return
    }
    const json = await response.json()
    let rows = toRows(json)
    drawChart(rows)

});

// async function refresh() {
//     const response = await fetch('http://localhost:8080/temperatures');
//     const data = await response.json();
//     const convertedData = convertData(data);
//     drawChart(convertedData);
// }


function toRows(data) {
    let rows = [];
    for (const [time, tempData] of Object.entries(data)) {
        rows.push([parseInt(time), tempData.celcius, tempData.farenheit])
    }
    rows.sort((a, b) => a[0] - b[0])
    return rows;
}

// function convertData(data) {
//     let result = [];

//     for (const [date, fullData] of Object.entries(data)) {
//         let rows = toRows(fullData)
//         result.push({
//             date,
//             rows
//         });
//     }

//     return result;
// }

function drawChart(dataInfo) {
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

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);
}

