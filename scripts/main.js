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
    let location = { lat: ObserveData.lat, lon: ObserveData.lon };
    let obsWeather = ObserveData.weatherElement;
    console.log(ObserveData);
    var wdir = obsWeather[1].elementValue;
    var wdsd = obsWeather[2].elementValue;
    var temp = obsWeather[3].elementValue;
    var humd = parseFloat(obsWeather[4].elementValue * 100);
    var pres = obsWeather[5].elementValue;
    var updateTime = ObserveData.time.obsTime;

    document.getElementById('temp').innerHTML = temp;
    document.getElementById('humd').innerHTML = humd.toString();
    document.getElementById('pres').innerHTML = pres;
    document.getElementById('wind').innerHTML = wdsd + ' ';
    document.getElementById('wdir').className = 'wi wi-wind ' + 'from-' + wdir + '-deg';

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
            console.log("done");
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
            console.log("main is null");
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
    console.log(dateTime.getHours());
    var clearDayNight = (dateTime.getHours() >= 6 && dateTime.getHours() <= 6) ? "sunny" : "clear";
    var clearDayNightText = (dateTime.getHours() >= 6 && dateTime.getHours() <= 6) ? "Day" : "Night";
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
    getCWBForcastData(locationNameForcast).then(data => plotForcast(data[1]));


    var locationNameObserve = "板橋";
    getCWBObserveData(locationNameObserve).then(data => updateObserveData(data));


    document.getElementById('refresh-observation').onclick = function () {
        getCWBObserveData(locationNameObserve).then(data => updateObserveData(data))
    };


    getPast24hrObserveData().then(data => plotPast24hrObserveData(data));
    // getPast12hrObserveData().then(data => waitMainDivShows(data)).then(data => console.log(data));
    // // Loading page
    // window.addEventListener("load", function () {
    //     $(".loading").delay(1000).fadeOut("slow", function () {
    //         $(this).remove();
    //         $(".main").css({ "display": "block" });
    //     });
    // });

};

