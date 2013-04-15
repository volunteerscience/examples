function initialize() {
  $('.square').click(function() {
     $(this).html('X');
     submit($(this).attr('id'));
  });
}