// Main script
async function getCWBData(locationName) {
    var authKey = config.CWB_Auth;
    var cwbURL = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-063?Authorization=" + authKey + "&format=JSON&locationName=" + locationName;
    let cwbForcast;
    await fetch(cwbURL).then(res => { return res.json() })
        .then(result => { console.log(result.records.locations[0].location[0].weatherElement); })
        .catch(err => { console.log(err); })
};


// Onload 
window.onload = function () {
    var locationName = "大安區"
    getCWBData(locationName);

    // // Loading page
    // window.addEventListener("load", function () {
    //     $(".loading").delay(1000).fadeOut("slow", function () {
    //         $(this).remove();
    //         $(".main").css({ "display": "block" });
    //     });
    // });

};