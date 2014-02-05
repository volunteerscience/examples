function initialize() {
  $("#foo").html("initialized"); 
}

var idx = 0;
function submitBlast(amount) {
  idx++;
  for (var i = 1; i <= amount; i++) {
    submit("#"+idx+" "+i+" of "+amount);
  }
}

function doSubmitBlast() {
  submitBlast(parseInt($("#iterations").val()));
}