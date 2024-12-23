$(document).ready(function() {
    $('.carousel').slick({
        dots: false,            // No dots for navigation
        arrows: true,           // Enable arrows for navigation
        infinite: false,        // Disable infinite looping
        centerMode: true,      // No centering
        slidesToShow: 3,        // Adjust the number of visible items
        slidesToScroll: 1,      // Number of items to scroll at a time
        prevArrow: "<button type='button' class='mission-prev-arrow'><i class='fa fa-3x fa-chevron-circle-left'></i></button>",
        nextArrow: "<button type='button' class='mission-next-arrow'><i class='fa fa-3x fa-chevron-circle-right'></i></button>"
    });

    // Toggle header menu on click
    $(".menuToggler").click(function() {
        $(this).toggleClass("active");
        $("#header").toggleClass("active"); 
    });
});
