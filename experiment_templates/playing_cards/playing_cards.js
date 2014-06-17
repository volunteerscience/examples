/**
 * sets the background-position of element (expects string "id" or a jQuery object)
 * 
 * number: 1-13,A,J,Q,K
 * suit: 0-3, C,D,H,S, J=Joker, B=Back
 * 
 */
function playing_card_bp(number, suit) {
  var x = 100.0/12.0; // multiply x by the integer you want to draw
  var y = 25.0;
  
  var n_val = parseInt(number)-1;
  if (isNaN(n_val)) {
    switch(number[0].toLowerCase()) {
    case 'a':
      n_val = 0; 
      break;
    case 'j':
      n_val = 10; 
      break;
    case 'q':
      n_val = 11; 
      break;
    case 'k':
      n_val = 12; 
      break;
    }  
  }

  var s_val = parseInt(suit);
  if (isNaN(s_val)) {
    switch(suit[0].toLowerCase()) {
    case 'c':
      s_val = 0;
      break;
    case 'd':
      s_val = 1;
      break;
    case 'h':
      s_val = 2;
      break;
    case 's':
      s_val = 3;
      break;
    case 'j': // joker (can be 1 or 2) => 0 or 1
      s_val = 4;
      if (n_val > 1) {
        n_val = 1;
      }
      break;
    case 'b': // back
      s_val = 4;
      n_val = 2;
      break;
    }
  }
  x*=n_val;
  y*=s_val;
  var s = x+"% "+y+"%";
//  alert(s);
  return s;
}

function playing_card(element, number, suit) {
  // string to jQuery
  if (typeof(element) == "string") {
    element = $("#"+element);
  }
  
  var s = playing_card_bp(number, suit);

  element.css("background-position", s);  
}