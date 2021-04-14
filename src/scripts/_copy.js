// Copy //
url = window.location.href;

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(element).select();
  document.execCommand("copy");
  $temp.remove();
}

$(".copiar").on("click", function() {
  copyToClipboard(url);
});
