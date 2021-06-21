async function getCWBForcastData(locationName) {
    var authKey = config.CWB_Auth;
    var cwbURL = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-071?Authorization=" + authKey + "&format=JSON&locationName=" + locationName;
    let cwbForcast = await fetch(cwbURL).then(res => { return res.json() })
        .then(result => { return result.records.locations[0].location[0].weatherElement; })
        .catch(err => { console.log(err); });
    return cwbForcast;
};

async function getCWBObserveData(locationName) {
    var authKey = config.CWB_Auth;
    var cwbURL = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=" + authKey + "&format=JSON&locationName=" + locationName;
    let cwbObserve = await fetch(cwbURL).then(res => { return res.json() })
        .then(result => { return result.records.location[0].weatherElement; })
        .catch(err => { console.log(err); });
    return cwbObserve;
};

function plotForcast(forcastData) {
    var timeStamp = forcastData.time.map(item => {
        var date1 = new Date(item.startTime).getTime();
        var date2 = new Date(item.startTime).getTime();
        return new Date((date1 + date2) / 2);
    });
    var dataValue = forcastData.time.map(item => item.elementValue[0].value);
    console.log(timeStamp);

    var data = [
        {
            x: timeStamp,
            y: dataValue,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'white',
                shape: 'spline'
            },
        }
    ];

    var layout = {
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        xaxis: {
            color: 'white',
        },
        yaxis: {
            color: 'white'
        }
    };

    var config = { responsive: true }
    Plotly.newPlot('plotlyForcast', data, layout, config);
    // var timeSeriseData = forcastData.time
}

function updateObserveData(ObserveData) {
    console.log(ObserveData);
    var wdir = ObserveData[1].elementValue;
    var wdsd = ObserveData[2].elementValue;
    var temp = ObserveData[3].elementValue;
    var humd = parseFloat(ObserveData[4].elementValue * 100);
    var pres = ObserveData[5].elementValue;

    document.getElementById('temp').innerHTML = temp;
    document.getElementById('humd').innerHTML = humd.toString();
    document.getElementById('pres').innerHTML = pres;
    document.getElementById('wind').innerHTML = wdsd + ' ';
    // document.getElementById('wdir').style.transform = "rotate(" + wdir.toString() + "deg)";
    document.getElementById('wdir').className = 'wi wi-wind ' + 'from-' + wdir + '-deg';


};

// Onload 
window.onload = function () {
    var locationNameForcast = "板橋區";
    getCWBForcastData(locationNameForcast).then(data => plotForcast(data[1]));


    var locationNameObserve = "板橋";
    getCWBObserveData(locationNameObserve).then(data => updateObserveData(data));


    document.getElementById('refresh-observation').onclick = function () {
        getCWBObserveData(locationNameObserve).then(data => updateObserveData(data))
    };
    // // Loading page
    // window.addEventListener("load", function () {
    //     $(".loading").delay(1000).fadeOut("slow", function () {
    //         $(this).remove();
    //         $(".main").css({ "display": "block" });
    //     });
    // });

};