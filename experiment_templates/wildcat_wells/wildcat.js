var max_score = 1000;
var scale = 900;
var num_rounds = 15;

function initializeGame() {
  initializeHistory();
  initializeGameBoard();
  
  // delme, for testing color
//  for (var i = 1; i <= num_rounds; i++) {
//    setBar(myid,i,Math.floor(max_score*i/num_rounds), i*10, i*10);
//  }
}

function initializeGameBoard() {
//  alert(getFile("ground.jpg"));
  
  initializeMap(MAP_W, MAP_H, 0);
  buildMap(seed);
  $("#canvas").css("background-image","url('"+getFile("ground.jpg")+"')");
  paper = Raphael("canvas", MAP_W*P, MAP_H*P);
//  paper.circle(256,256,256);
  
  $('#canvas').bind('click', mapClick);  
}

function initializeHistory() {
  addHistoryPanel(myid, "You");
  addHistoryPanel(2, "Player 2");
  addHistoryPanel(3, "Player 3");
  addHistoryPanel(4, "Player 4");
}

var panelCtr = 0;
function addHistoryPanel(playerNum, name) {
  // first 3 have the bottom dashed
  panelCtr++;
  var extraClass = " bottom_dashed";
  if (panelCtr == 4) {
    extraClass = "";
  }
  
  var s = '<div class="history_panel'+extraClass+'">'+
            '<div class="history_title">'+name+'</div><div class="history_middle">'+
            '<div class="left_text rotate">Score</div>'+
            '<table class="history_table">';
  for (var i = 1; i <= num_rounds; i++) {
//          s+='<col width="25px"/>';
  }
            s+='<tr>';
  for (var i = 1; i <= num_rounds; i++) {
      s+='<td class="history_bar" height="85%" width="1"><div id="bar_'+playerNum+'_'+i+'" class="pre_round">?</div></td>';
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
  setBar(myid, round++, score, x, y);
}

function setBar(player,round,value, x, y) {
  var bar = $("#bar_"+player+"_"+round)
  
  bar.removeClass('pre_round');
  if (value < 0) {
    bar.addClass('skip_round');
    bar.html("X");
    return;
  }
  
  var fraction = Math.min(1.0,Math.max(0,value/max_score)); // 0-1
  var height = Math.floor(100*fraction);
  $("#mapValue").html(height);

  var midpoint = 0.4; // where yellow is; lower for more red on the chart, higher for more blue on the chart
  var r = 255;
  var g = 0;
  var b = 0;
  if (fraction < midpoint) {
    // blue => yellow
    r = g = Math.floor(255.0 * fraction/midpoint);
    b = 255-r;
  } else {
    // yellow => red
    r = 255;
    g = 255 - Math.floor(255* (fraction-midpoint)/(1.0-midpoint) );
    //b = 0; // from above    
  }
  var color = "rgb("+r+","+g+","+b+")";
  bar.html("");
  bar.css("background-color",color);
  bar.css("height",height+"%");
  
  var point = paper.rect(x-1,y-1,3,3);
  point.attr({fill: color, stroke: color});
}
