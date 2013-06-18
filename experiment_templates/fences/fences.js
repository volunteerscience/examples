var orange = "#f7941e";
var lightOrange = "#f7dab7";

var x1,y1; // upper left when zoomed out
var cWidth = 450; // size of canvas
var cHeight = 350;

var xBoxes, yBoxes; // size of the grid

var pColor; // player colors
var score = new Array(); // player => int

var paper; // raphael
var boxes; // all the boxes
var lines; // all the lines
var gap = 5;
var lineWidth = 6;


var curPlayer = 1;
var scored = false;

function Box(id, x, y, r) {
  this.id = id;
  this.lines = new Array();
  this.owner = 0; // who won it

  this.circle = paper.circle(x,y,r);
  this.circle.attr("stroke-width",0);
  this.circle.toBack();
  
  // called when a player clicked a neighboring box
  var myBox = this;
  this.update = function(player) {
    for (var idx in myBox.lines) {
      var line = myBox.lines[idx];
      if (line.owner == 0) return;
    }
    myBox.captured(player);
    score[player]++;
    take.push(myBox.id);
//    log("incremented score:"+player+" : "+score[player]);
    scored = true;
  }
  
  this.captured = function(player) {
    myBox.owner = player;
    myBox.circle.attr("fill",pColor[player]);
  }
}


var take = [];
function Line(id, boxA, boxB, x1, y1, x2, y2) {
  this.id = id;
  
  // so you can set either a or b, or both
  if (boxA == null) {
    boxA = boxB;
    boxB = null;
  }
  
  
  this.a = boxA;
  this.b = boxB;
  
  boxA.lines.push(this);
  
  if (boxB != null) {
    boxB.lines.push(this);
  }
  this.owner = 0; // who clicked it
  
  this.line = paper.path("M"+x1+","+y1+"L"+x2+","+y2);
  this.line.attr({'stroke': pColor[0], 'stroke-width': lineWidth, 'stroke-linecap': 'round'});
  this.line.toFront();
  
  var myLine = this;
  // doSubmit is so feedback doesn't cause a new submit
  this.click = function(player, doSubmit) {
    if (myLine.owner != 0) return;  // this fence is taken
    scored = false;   
    
    log("click("+player+")");
    myLine.line.attr('stroke', pColor[player]);
    myLine.owner = player;
    
    if (doSubmit && player == myid) {
      take = [];
      myLine.a.update(player);
      if (myLine.b != null) {
        myLine.b.update(player);
      }
      
      // submit move  
      var takeStr = '';      
      if (take.length > 0) {
        takeStr = ' score="'+score[myid]+'" take="'+take.join()+'"';
      } else {
        curPlayer++;
        if (curPlayer > numPlayers) curPlayer = 1; 
      }
      updateTurn();
      submit('<click line="'+myLine.id+'"'+takeStr+'>');
    }
  }
  
  this.line.click(function() {
    if (curPlayer != myid) return;  // wait your turn
    myLine.click(myid, true);
  });
}

function newMove(part, index) {
  fetchMove(part, currentRound, index, function(val) {
    var theMove = $(val);
    if (theMove.is("click")) {
      var line = parseInt(theMove.attr('line'));
      lines[line].click(part, false); 
      if (theMove.attr('take') === undefined) {
        curPlayer = part+1;
        if (curPlayer > numPlayers) curPlayer = 1; 
      } else {
        score[part] = theMove.attr('score');
        var taken = theMove.attr('take').split(',');
        for (var i in taken) {
          boxes[taken[i]].captured(part);
        }
        curPlayer = part;
      }
      updateTurn();
    }
  });
}

function updateTurn() {
  // move turn marker
  $('.turnMarker').hide();
  $('#player_'+curPlayer+' .turnMarker').show();
  
  for (var i = 1; i <= numPlayers; i++) {
    $('#player_'+i+' .score').html(score[i]);
  }
  
  if (curPlayer == myid) {
    $("#playerCommand").html("Your turn!");
    // start clock
  } else {
    // stop clock
    $("#playerCommand").html("Waiting for opponent.");    
  }
}


function initialize() {
  pColor = new Array();
  pColor[0] = "#AAA";
  pColor[1] = "#F00";
  pColor[2] = "#33F";
  pColor[3] = "#75d700"; //"#659A22"; //"#9AC92C";
  pColor[4] = orange;
    
  for (var i = 1; i <= numPlayers; i++) {
    $("#turnBox").append('<div id="player_'+i+'" class="playerRow"><div class="score">0</div><div class="playerIcon round-corner5" style="background-color:'+pColor[i]+';">'+i+'</div><div class="turnMarker"></div></div>');
  }
    
  initializeGame(10,10);
  
  $('#zoomButton').click(function() {
   zoom(boxes[7]); 
  });
}

function initializeGame() {
  xBoxes = 8; //parseInt(variables['xBoxes']);
  yBoxes = 6; //parseInt(variables['yBoxes']);

  for (var i = 1; i <= numPlayers; i++) {
    score[i] = 0;
  }
  
  paper = Raphael("canvas", cWidth, cHeight);
  paper.clear();
  // paper.setViewBox(x, y, w, h, fit) // zoom/pan

  boxes = new Array();
  lines = new Array();

  Math.seedrandom(seed);
  var gridType = Math.floor(Math.random()*3); // 3 = 0-2
  switch (gridType) {
  case 1:
    initializeHexGrid();
    break;
  case 2:
    initializeTriGrid();
    break;
  default:
    initializeSquareGrid();
  }
  
//  background = paper.rect(-10, -10, cWidth+20, cHeight+20, 10).attr({fill: lightOrange, stroke: "none"});  
//  background.toBack();
  
  updateTurn();
  
}

function zoomCallback(x,y,w,h) {
  
}

var zoomed = false;
function zoom(box) {
  if (zoomed) {
    paper.animateViewBox(x1, y1, cWidth, cHeight, 500,null);
  } else {
    box.captured(1);
    var x = box.circle.attr('cx');
    var y = box.circle.attr('cy');
    var r = box.circle.attr('r');
    var zr = r*4;
    var aspect = cWidth/cHeight;
    paper.animateViewBox(x-zr,y-zr*aspect,zr*2,zr*2*aspect,500,null);

//    log("("+x+","+y+","+r+") ("+(x-zr)+","+(x-zr)+")");
  }
  zoomed = !zoomed;
}
