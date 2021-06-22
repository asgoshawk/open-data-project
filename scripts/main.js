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
};

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

async function getPast12hrObserveData() {
    const cors = 'https://api.allorigins.win/raw?url=';
    const urlCWB = cors + 'https://www.cwb.gov.tw/V8/C/W/Observe/MOD/24hr/46688.html?';
    let cwbObserve = await fetch(urlCWB).then(res => { return res.text() })
        .then(result => {
            var $dom = $('<html>').html(result),
                alltd = $('td', $dom),
                temp = [],
                humd = [],
                pres = [],
                wind = [];

            for (var i = 0; i < 720; i += 10) {
                // 10 data in a oberservation cycle of 10 mins 
                // console.log($($(alltd[i]).find('span')[0]).text());  // span C & span F
                // console.log($($(alltd[i + 3]).find('span')[0]).text()); // span wind(float) & span wind(int)
                // console.log($(alltd[i + 6]).text()); // humd
                // console.log($(alltd[i + 7]).text()); // pres
                // console.log($(alltd[i + 8]).text()); // accum.rain
                temp.push(parseFloat($($(alltd[i]).find('span')[0]).text()));
                humd.push(parseInt($(alltd[i + 6]).text()));
                pres.push(parseFloat($(alltd[i + 7]).text()));
                wind.push(parseFloat($($(alltd[i + 3]).find('span')[0]).text()));
            };
            return { temp: temp, humd: humd, pres: pres, wind: wind };
        }).catch(err => { console.log(err); });
    return cwbObserve;
};

function plotPast12hrObserveData(past12hrObserveData) {
    var ticks = [];
    for (var i = 0; i < 72; i++) {
        ticks.push(i);
    };
    var d3 = Plotly.d3;
    var gd3_temp = d3.select('#plotlyTemp').style({ width: '100%', height: '50%' });


    var tempData = [
        {
            x: ticks,
            y: past12hrObserveData.temp,
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
        },
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 0,
        }
    };

    var config = {
        responsive: false,
        showlegend: false
    }
    Plotly.newPlot(gd3_temp.node(), tempData, layout, config);
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

    getPast12hrObserveData();//.then(data => plotPast12hrObserveData(data));
    // // Loading page
    // window.addEventListener("load", function () {
    //     $(".loading").delay(1000).fadeOut("slow", function () {
    //         $(this).remove();
    //         $(".main").css({ "display": "block" });
    //     });
    // });

};

