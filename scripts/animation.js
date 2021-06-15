// Loading page
window.addEventListener("load", function () {
    $(".loading").delay(1000).fadeOut("slow", function () {
        $(this).remove();
        $(".main").css({ "display": "block" });
    });
});

$(".navbar-item").each(function () {
    $(this).click(function () {
        $(this).parent().siblings().children(".navbar-item").removeClass("active");
        $(this).addClass("active");
    });
});