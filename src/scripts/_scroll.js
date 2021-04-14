/* Scroll */
var posScroll = 0;

function checarScroll() {
  posAtual = $(window).scrollTop();
  if (posAtual != 0) {
    $("body").addClass('scrolled');
    if (posAtual >= posScroll) {
      posScroll = posAtual;
      $("body").removeClass('scrollup');
      $('.top-bar input').prop('checked', false);
    } else {
      posScroll = posAtual;
      $("body").addClass('scrollup');
    }
  } else {
    $("body").removeClass('scrolled').removeClass('scrollup');
  }
}
checarScroll();
$(window).scroll(function() {
  checarScroll();
  $(".tooltip").removeClass('ativo');
});
