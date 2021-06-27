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

async function waitMainDivShows(result) {
    var timeoutID = window.setInterval(function () {
        // console.log(document.getElementsByClassName("main")[0].style.height);
        if (document.getElementsByClassName("main")[0].style.display === 'block') {
            clearInterval(timeoutID);
            console.log("done");
            return result;
        } else {
            console.log("main is null");
        }
    }, 500);
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


function plotPast12hrObserveData(past12hrObserveData) {
    const padding = 10;
    var ticks = [];
    for (var i = 0; i < 72; i++) {
        ticks.push(i);
    };
    var tempPlot, humdPlot, presPlot, windPlot;

    var timeoutID = window.setInterval(function () {
        if (document.getElementsByClassName("main")[0].style.display === 'block') {
            console.log("done");
            var boxesInnerHeight = document.getElementsByClassName("overview2-item")[0].clientHeight;
            var boxesInnerWidth = document.getElementsByClassName("overview2-item")[0].clientWidth + padding * 2;

            var tempData = [
                {
                    x: ticks,
                    y: past12hrObserveData.temp,
                    fill: 'tozeroy',
                    type: 'scatter',
                    mode: 'lines',
                    line: {
                        color: '#86C232',
                        shape: 'spline'
                    },
                }
            ];

            var humdData = [
                {
                    x: ticks,
                    y: past12hrObserveData.humd,
                    fill: 'tozeroy',
                    type: 'scatter',
                    mode: 'lines',
                    line: {
                        color: '#86C232',
                        shape: 'spline'
                    },
                }
            ];

            var presData = [
                {
                    x: ticks,
                    y: past12hrObserveData.pres,
                    fill: 'tozeroy',
                    type: 'scatter',
                    mode: 'lines',
                    line: {
                        color: '#86C232',
                        shape: 'spline'
                    },
                }
            ];

            var windData = [
                {
                    x: ticks,
                    y: past12hrObserveData.wind,
                    fill: 'tozeroy',
                    type: 'scatter',
                    mode: 'lines',
                    line: {
                        color: '#86C232',
                        shape: 'spline'
                    },
                }
            ];

            var layout = {
                autosize: false,
                width: boxesInnerWidth,
                height: boxesInnerHeight * 0.4,
                plot_bgcolor: 'rgba(0, 0, 0, 0)',
                paper_bgcolor: 'rgba(0, 0, 0, 0)',
                xaxis: {
                    color: 'white',
                    fixedrange: true,
                    showgrid: false,
                    visible: false
                },
                yaxis: {
                    color: 'white',
                    fixedrange: true,
                    showgrid: false,
                    visible: false
                },
                margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 0,
                    pad: 0,
                },
                showlegend: false
            };

            var config = {
                responsive: true,
                showlegend: false,
                staticPlot: true,
                displayModeBar: false
            };
            tempPlot = Plotly.newPlot('plotlyTemp', tempData, layout, config);
            humdPlot = Plotly.newPlot('plotlyHumd', humdData, layout, config);
            presPlot = Plotly.newPlot('plotlyPres', presData, layout, config);
            windPlot = Plotly.newPlot('plotlyWind', windData, layout, config);
            clearInterval(timeoutID);
        } else {
            console.log("main is null");
        };
    }, 500);

    // var timeoutID = setTimeout(function () {
    //     console.log(document.getElementsByClassName("main")[0].style.display);
    //     console.log($(".overview2-item").outerHeight());
    //     checkInit = true;
    // }, 1000);
}


// Onload 
window.onload = function () {
    var locationNameForcast = "板橋區";
    getCWBForcastData(locationNameForcast).then(data => plotForcast(data[1]));


    var locationNameObserve = "板橋";
    getCWBObserveData(locationNameObserve).then(data => updateObserveData(data));


    document.getElementById('refresh-observation').onclick = function () {
        getCWBObserveData(locationNameObserve).then(data => updateObserveData(data))
    };


    getPast12hrObserveData().then(data => plotPast12hrObserveData(data));
    // getPast12hrObserveData().then(data => waitMainDivShows(data)).then(data => console.log(data));
    // // Loading page
    // window.addEventListener("load", function () {
    //     $(".loading").delay(1000).fadeOut("slow", function () {
    //         $(this).remove();
    //         $(".main").css({ "display": "block" });
    //     });
    // });

};

