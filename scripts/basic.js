// Loading page
var mainTurnOn = false;

window.addEventListener("load", function () {
    $(".loading").delay(1000).fadeOut("slow", function () {
        $(this).remove();
        $(".main").css({ "display": "block" });
        resizeDivToSquare();
        mainTurnOn = true;
        console.log($(".overview2-item").outerHeight());
    });
});

$(".navbar-item").each(function () {
    $(this).click(function () {
        $(this).parent().siblings().children(".navbar-item").removeClass("active");
        $(this).addClass("active");
    });
});

$(window).resize(function () {
    resizeDivToSquare();
});

function resizeDivToSquare() {
    $(function () {
        $(".overview1").outerHeight($(".overview1").outerWidth());
        $(".overview2").outerHeight(2 * $(".overview2").outerWidth());
        $(".overview2-item").outerHeight($(".overview2-item").outerWidth());
        $(".timeSeries").outerHeight($(".timeSeries").outerWidth());
    });
};