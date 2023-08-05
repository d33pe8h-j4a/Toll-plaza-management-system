const navHome = $("nav.stroke");
$(window).scroll(() => {
    if (window.scrollY >= 100) {
        navHome.addClass('navbar-scrolled');
    }
    else if (window.scrollY < 100) {
        navHome.removeClass('navbar-scrolled');
    }
});

const updateBtn = $("button[name='update']");
updateBtn.click(function() {
    const updateBtnVal = $(this).attr('value');
    console.log(updateBtnVal);
    if (updateBtnVal !== 'admin')
        window.location.href = '#popup1';
});
