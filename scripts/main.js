// Basic functions
function max() {
    var args = Array.prototype.slice.call(arguments);
    return Math.max.apply(Math, args.filter(function (val) {
        return !isNaN(val);
    }));
};

function min() {
    var args = Array.prototype.slice.call(arguments);
    return Math.min.apply(Math, args.filter(function (val) {
        return !isNaN(val);
    }));
};

// API and Plot functions
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
        .then(result => { return result.records.location[0] })
        .catch(err => { console.log(err); });
    return cwbObserve;
};

async function getPast24hrObserveData() {
    const cors = 'https://api.allorigins.win/raw?url=';
    const urlCWB = cors + 'https://www.cwb.gov.tw/V8/C/W/Observe/MOD/24hr/46688.html?';
    temp = [];
    humd = [];
    pres = [];
    wind = [];
    await fetch(urlCWB).then(res => { return res.text() })
        .then(result => {
            var ownerDocument = document.implementation.createHTMLDocument('virtual'),
                dom = $('html', ownerDocument).html(result),
                alltd = $('td', dom);
            for (var i = 0; i < 1440; i += 10) {
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
        }).catch(err => { console.log(err); });
    return { temp: temp.reverse(), humd: humd.reverse(), pres: pres.reverse(), wind: wind.reverse() };
};

function plotForcast(forcastData) {
    var checkPlotsExist = false;
    console.log(forcastData);
    var forcastData = forcastData[1];

    var timeStamp = forcastData.time.map(item => {
        var date1 = new Date(item.startTime).getTime();
        var date2 = new Date(item.startTime).getTime();
        return new Date((date1 + date2) / 2);
    });


    // var timeSeriseData = forcastData.time

    function plotTemp(plotH, plotW) {

        var commonLayout = {
            autosize: false,
            width: plotW * 0.9,
            height: plotH * 0.8,
            plot_bgcolor: 'rgba(0, 0, 0, 0)',
            paper_bgcolor: 'rgba(0, 0, 0, 0)',
            xaxis: {
                // fixedrange: true,
                gridcolor: '#6B6E70',
                color: 'white',
                title: {
                    text: "Forcast Time"
                }
            },
            yaxis: {
                // fixedrange: true,
                gridcolor: '#6B6E70',
                color: 'white',
                title: {
                    text: "Temperature (°C)"
                }
            },
            margin: {
                l: 50,
                r: 0,
                b: 50,
                t: 0,
            },
            font: {
                family: "Arial",
                size: 15,
            }
            // showlegend: false
        };


        var dataValue = forcastData.time.map(item => item.elementValue[0].value);

        var data = [
            {
                x: timeStamp,
                y: dataValue,
                type: 'scatter',
                mode: 'lines',
                line: {
                    color: '#86C232',
                    shape: 'spline'
                },
            }
        ];

        var config = { responsive: true }
        Plotly.newPlot('plotlyForcast', data, commonLayout, config);
    };

    function plotHumd() {

    };

    function plot12PoP() {

    };

    var timeID = setInterval(() => {
        if (mainTurnOn) {
            var boxesInnerHeight = document.getElementsByClassName("forcast-content")[0].clientHeight;
            var boxesInnerWidth = document.getElementsByClassName("forcast-content")[0].clientWidth;

            plotTemp(boxesInnerHeight, boxesInnerWidth);
            clearInterval(timeID);
            checkPlotsExist = true;
        };
    }, 500);

    window.addEventListener('resize', function () {
        if (checkPlotsExist) {
            var boxesInnerHeight = document.getElementsByClassName("forcast-content")[0].clientHeight;
            var boxesInnerWidth = document.getElementsByClassName("forcast-content")[0].clientWidth;
            var updateLayout = {
                width: boxesInnerWidth * 0.9,
                height: boxesInnerHeight * 0.8,
            };
            Plotly.relayout('plotlyForcast', updateLayout);
        }
    });

};

function updateObserveData(ObserveData) {
    let location = { lat: ObserveData.lat, lon: ObserveData.lon };
    let obsWeather = ObserveData.weatherElement;
    // console.log(ObserveData);
    let wdir = obsWeather[1].elementValue;
    let wdsd = Math.round((parseFloat(obsWeather[2].elementValue) * 10) / 10).toFixed(1);
    let temp = Math.round((parseFloat(obsWeather[3].elementValue) * 10) / 10).toFixed(1);
    let humd = Math.round(parseFloat(obsWeather[4].elementValue * 100));
    let pres = Math.round(parseFloat(obsWeather[5].elementValue));
    let uv = Math.round(parseFloat(obsWeather[13].elementValue));
    let vis = obsWeather[19].elementValue;
    let precip = Math.round(parseFloat(obsWeather[6].elementValue));

    let updateTime = ObserveData.time.obsTime;

    document.getElementById('temp').innerHTML = temp;
    document.getElementById('humd').innerHTML = humd;
    document.getElementById('pres').innerHTML = pres;
    document.getElementById('wind').innerHTML = wdsd + ' ';
    document.getElementById('wdir').className = 'wi wi-wind ' + 'from-' + wdir + '-deg';

    document.getElementById('uv-index').innerHTML = (uv >= 0) ? uv : "N/A";
    document.getElementById('visibility').innerHTML = vis;
    document.getElementById('precipitaion-24h').innerHTML = precip;

    updateWeatherDescription(obsWeather[20].elementValue, updateTime);
    return location;
};

// function getPast24hrData(location) {
//     var api = "http://history.openweathermap.org/data/2.5/history/city?",
//         loc = "lat=" + location.lat + "&lon=" + location.lon + "&",
//         type = "type=hour&"
//     key = "appid=" + config.OpenWeather_Auth;
//     let url = api + loc + type + key;
//     console.log("myurl:" + url);
//     fetch(url).then(res => { return res.json() })
//         .then(result => { console.log(result); })
//         .catch(err => { console.log(err) })
// }

function plotPast24hrObserveData(past24hrObserveData) {
    const padding = 10;
    var checkPlotsExist = false;
    var ticks = [];
    for (var i = 0; i < 144; i++) {
        ticks.push(i);
    };
    let maxT = max(...past24hrObserveData.temp),
        minT = min(...past24hrObserveData.temp),
        maxH = max(...past24hrObserveData.humd),
        minH = min(...past24hrObserveData.humd),
        maxP = max(...past24hrObserveData.pres),
        minP = min(...past24hrObserveData.pres),
        maxW = max(...past24hrObserveData.wind),
        minW = min(...past24hrObserveData.wind);

    function plot4WeatherElements() {
        if (document.getElementsByClassName("main")[0].style.display === 'block') {
            console.log("Loaded completely.");
            clearInterval(timeoutID);
            var boxesInnerHeight = document.getElementsByClassName("overview2-item")[0].clientHeight;
            var boxesInnerWidth = document.getElementsByClassName("overview2-item")[0].clientWidth + padding * 2;
            var commonDataSetting = {
                x: ticks,
                fill: 'tozeroy',
                type: 'scatter',
                mode: 'lines',
                line: {
                    color: '#86C232',
                    shape: 'spline'
                }
            };

            var commonLayout = {
                autosize: false,
                width: boxesInnerWidth,
                height: boxesInnerHeight * 0.4,
                plot_bgcolor: 'rgba(0, 0, 0, 0)',
                paper_bgcolor: 'rgba(0, 0, 0, 0)',
                xaxis: {
                    fixedrange: true,
                    showgrid: false,
                    visible: false
                },
                yaxis: {
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

            var tempData = Object.assign({}, commonDataSetting, {
                y: past24hrObserveData.temp,
            });

            var humdData = Object.assign({}, commonDataSetting, {
                y: past24hrObserveData.humd,
            });

            var presData = Object.assign({}, commonDataSetting, {
                y: past24hrObserveData.pres,
            });

            var windData = Object.assign({}, commonDataSetting, {
                y: past24hrObserveData.wind,
            });

            var tempLayout = Object.assign({}, commonLayout, {
                yaxis: {
                    autorange: false,
                    showgrid: false,
                    visible: false,
                    range: [minT - (maxT - minT) * 0.1, maxT]
                },
            });

            var humdLayout = Object.assign({}, commonLayout, {
                yaxis: {
                    autorange: false,
                    showgrid: false,
                    visible: false,
                    range: [minH - (maxH - minH) * 0.1, maxH]
                },
            });

            var presLayout = Object.assign({}, commonLayout, {
                yaxis: {
                    autorange: false,
                    showgrid: false,
                    visible: false,
                    range: [minP - (maxP - minP) * 0.1, maxP]
                },
            });

            var windLayout = Object.assign({}, commonLayout, {
                yaxis: {
                    autorange: false,
                    showgrid: false,
                    visible: false,
                    range: [max(minW - (maxW - minW) * 0.1, 0), maxW]
                },
            });

            tempPlot = Plotly.newPlot('plotlyTemp', [tempData], tempLayout, config);
            humdPlot = Plotly.newPlot('plotlyHumd', [humdData], humdLayout, config);
            presPlot = Plotly.newPlot('plotlyPres', [presData], presLayout, config);
            windPlot = Plotly.newPlot('plotlyWind', [windData], windLayout, config);

            checkPlotsExist = true;
        } else {
            console.log("Wait for main div loaded.");
        };
    };

    var timeoutID = window.setInterval(plot4WeatherElements, 500);

    window.addEventListener('resize', function () {
        if (checkPlotsExist) {
            var boxesInnerHeight = document.getElementsByClassName("overview2-item")[0].clientHeight;
            var boxesInnerWidth = document.getElementsByClassName("overview2-item")[0].clientWidth + padding * 2;
            var updateLayout = {
                width: boxesInnerWidth,
                height: boxesInnerHeight * 0.4,
            };
            Plotly.relayout('plotlyTemp', updateLayout);
            Plotly.relayout('plotlyHumd', updateLayout);
            Plotly.relayout('plotlyPres', updateLayout);
            Plotly.relayout('plotlyWind', updateLayout);
        }
    });

};

function updateWeatherDescription(description, time) {
    var dateTime = new Date(time);
    var clearDayNight = (dateTime.getHours() >= 6 && dateTime.getHours() <= 18) ? "wi-day-sunny" : "wi-night-clear";
    var clearDayNightText = (dateTime.getHours() >= 6 && dateTime.getHours() <= 18) ? "Day" : "Night";
    let cssCode =
        (description.search("晴") > -1) ? clearDayNight :
            (description.search("有霾") > -1 || description.search("有靄") > -1) ? "wi-dust" :
                (description.search("有霧") > -1) ? "wi-fog" :
                    (description.search("陣雨") > -1) ? "wi-showers" :
                        (description.search("有雨") > -1) ? "wi-rain" :
                            (description.search("有雷雨") > -1) ? "wi-storm-showers" :
                                (description.search("大雷雨") > -1) ? "wi-thunderstorm" :
                                    (description.search("陰") > -1) ? "wi-cloud" :
                                        (description.search("多雲") > -1) ? "wi-cloudy" : clearDayNight;

    let descriptionText =
        (description.search("晴") > -1) ? "Clear" :
            (description.search("有霾") > -1) ? "Hazzy" :
                (description.search("有靄") > -1) ? "Misty" :
                    (description.search("有霧") > -1) ? "Foggy" :
                        (description.search("陣雨") > -1) ? "Rain showers" :
                            (description.search("有雨") > -1) ? "Rainny" :
                                (description.search("有雷雨") > -1) ? "Storm showers" :
                                    (description.search("大雷雨") > -1) ? "Thunderstorm" :
                                        (description.search("陰") > -1) ? "Cloudy" :
                                            (description.search("多雲") > -1) ? "Partly cloudy" : clearDayNightText;


    document.getElementById('weather-description-icon').className = "wi " + cssCode;
    document.getElementById('weather-description-text').innerHTML = descriptionText;

}
// Onload 
window.onload = function () {
    var locationNameForcast = "板橋區";
    getCWBForcastData(locationNameForcast).then(data => plotForcast(data));

    var locationNameObserve = "板橋";
    getCWBObserveData(locationNameObserve).then(data => updateObserveData(data));

    document.getElementById('refresh-observation').onclick = function () {
        getCWBObserveData(locationNameObserve).then(data => updateObserveData(data))
    };

    getPast24hrObserveData().then(data => plotPast24hrObserveData(data));

    mapboxToken = config.mapbox_Auth;
    const mymap = L.map('mapid').setView([24.999447, 121.433812], 8);
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    let urlRadar = "https://opendata.cwb.gov.tw/fileapi/opendata/MSC/O-A0058-005.png";
    let imageBounds = [[17.75, 115.0], [29.25, 126.5]];
    L.imageOverlay(urlRadar, imageBounds).addTo(mymap);

    var timeIDForMap = setInterval(() => {
        if (mainTurnOn) {
            mymap.invalidateSize();
            clearInterval(timeIDForMap)
        }
    }, 500);

    // Get Radar time
    fetch("https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0058-005?Authorization=CWB-8A2389CC-DCF3-45E8-B410-305B35B47F5B&downloadType=WEB&format=JSON")
        .then(res => res.json()).then(data => {
            let dTime = new Date(data.cwbopendata.dataset.time.obsTime);
            let date = [dTime.getFullYear(), dTime.getMonth() + 1, dTime.getDate()].join("/");
            let hour = (dTime.getHours() < 10) ? "0" : "" + dTime.getHours();
            let min = (dTime.getMinutes() < 10) ? "0" : "" + dTime.getMinutes();
            let time = [hour, min].join(":");
            let timeStr = "Last update : " + date + " " + time;
            document.getElementById("radar-update-time").innerHTML = timeStr;
            // console.log(timeStr);
        })
        .catch(err => { console.log(err) })

};

