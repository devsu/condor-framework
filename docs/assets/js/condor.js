(function ($) {
    "use strict"; // Start of use strict
    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 0)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });
    $('a.page-scroll').bind('click', function (event) {
      var elements = $(event.target).parent().parent().find("li");
      for(var i = 0; i < elements.length; i++) {
        $(elements[i]).removeClass('active');
      }
      $(event.target).parent().addClass('active');
    });

    $('a[href].page-scroll').each(function() {
      if (this.href == window.location.href) {
        $(this).parent().addClass('active');
      }
    });
    $('body').scrollspy({
        target: '.main-content',
        offset: 51
    });
})(jQuery); // End of use strict

