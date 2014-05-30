var max_score = 1000;
var scale = 900;
var num_rounds = 15;

function initializeGame() {
  initializeHistory();
  initializeGameBoard();
}

function initializeGameBoard() {
  initializeMap(MAP_W, MAP_H, 0);
  buildMap(seed);

  paper = Raphael("canvas", MAP_W*P, MAP_H*P);
  paper.circle(256,256,256);
  
  $('#canvas').bind('click', mapClick);  
}

function initializeHistory() {
  addHistoryPanel(myid, "You");
}

function addHistoryPanel(playerNum, name) {
  var s = '<div class="history_panel">'+
            '<div class="history_title">'+name+'</div><div class="history_middle">'+
            '<div class="left_text rotate">Score</div>'+
            '<table class="history_table">';
  for (var i = 1; i <= num_rounds; i++) {
//          s+='<col width="25px"/>';
  }
            s+='<tr>';
  for (var i = 1; i <= num_rounds; i++) {
//    if (i>6) {
      s+='<td class="history_bar" height="85%" width="1"><div id="bar_'+playerNum+'_'+i+'" class="pre_round">?</div></td>';
//    } else {
//      if (i==3) {
//        s+='<td class="history_bar" height="85%" width="1"><div class="skip_round">X</div></td>';        
//      } else {
//        var h = i*10; 
//        s+='<td class="history_bar" height="85%" width="1"><div style="background-color:#0000FF; height:'+h+'%;"></div></td>';              
//      }
//    }
  }
          s+= '</tr><tr>';
  for (var i = 1; i <= num_rounds; i++) {
            s+='<td class=""  height="15%" width="1">'+i+'</td>';
  }
        s+= '</tr></table>'+
            '</div><div class="history_foot">Round</div>'+
          '</div>';
//  alert(s);
  $("#history_wrapper").append(s);
}

function getScore(x,y) {
  return Math.min(max_score,Math.max(0,Math.floor(scale*map[x][y])));
}

var round = 1;
function mapClick(evt) {
  var offset = $(this).offset();
  var x = evt.clientX-offset.left;
  var y = evt.clientY-offset.top;
  var score = getScore(x,y);
  $("#mapValue").html(score);
  setBar(myid, round++, score)
}

function setBar(player,round,value) {
  var bar = $("#bar_"+player+"_"+round)
  
  bar.removeClass('pre_round');
  if (value < 0) {
    bar.addClass('skip_round');
    bar.html("X");
    return;
  }
  
  var height = Math.floor(100*value/max_score);
  $("#mapValue").html(height);
  
  var color = "#0000FF";
  bar.html("");
  bar.css("background-color",color);
  bar.css("height",height+"%");
}
