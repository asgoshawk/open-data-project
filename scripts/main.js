async function getCWBForcastData(locationName) {
    var authKey = config.CWB_Auth;
    var cwbURL = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-071?Authorization=" + authKey + "&format=JSON&locationName=" + locationName;
    let cwbForcast = await fetch(cwbURL).then(res => { return res.json() })
        .then(result => {
            data = result.records.locations[0].location[0].weatherElement;
            console.log(data);
            return data;
        })
        .catch(err => { console.log(err); });
    return cwbForcast;
};

async function getCWBObserveData(locationName) {
    var authKey = config.CWB_Auth;
    var cwbURL = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=" + authKey + "&format=JSON&locationName=" + locationName;
    let cwbObserve = await fetch(cwbURL).then(res => { return res.json() })
        .then(result => {
            data = result.records.location[0].weatherElement;
            console.log(data);
            return data;
        })
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

// Onload 
window.onload = function () {
    var locationNameForcast = "板橋區";
    getCWBForcastData(locationNameForcast).then(data => plotForcast(data[1]));


    var locationNameObserve = "板橋";
    getCWBObserveData(locationNameObserve);

    // // Loading page
    // window.addEventListener("load", function () {
    //     $(".loading").delay(1000).fadeOut("slow", function () {
    //         $(this).remove();
    //         $(".main").css({ "display": "block" });
    //     });
    // });

};