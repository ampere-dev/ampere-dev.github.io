// Slick
$('.carousel').slick({
    slidesToShow: 3,
    dots: true,
});

// Swiper
const swiper = new Swiper('.carousel', {
    slidesPerView: 3,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});
