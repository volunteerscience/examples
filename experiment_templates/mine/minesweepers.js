var x1,y1; // upper left when zoomed out
var cWidth = 450; // size of canvas
var cHeight = 350;

var xBoxes, yBoxes; // size of the grid

var paper; // raphael
var boxes; // all the boxes
var lines; // all the lines
var gap = 0;
var lineWidth = 1;


var curPlayer = 1;
var scored = false;

function Box(id, x, y, r) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.lines = new Array();
  this.owner = 0; // who won it
  this.bomb = false;
  this.marked = null; // bomb, safe, etc
  
  this.icon = paper.text(x,y,"?").attr({'text-anchor': 'middle', 'font': paper.getFont("Vegur"), 'font-size': 30});
  this.icon.toBack();
  
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
  
  this.analyze = function() {
//    for (var i : lines) {
//      line
//    }
    myBox.icon.attr("text","2");
    myBox.icon.attr("fill","#F00");
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
  this.line.attr({'stroke': "#AAA", 'stroke-width': lineWidth, 'stroke-linecap': 'round'});
  this.line.toFront();
  
  var myLine = this;
  // get the box across the line
  this.other = function(box) {
    if (box == a) return b;
    if (box == b) return a;
    return null;
  }
}

var SW = 48; // sprite width
var SW2 = SW/2; // sprite width/2
var S_IMG_W = SW*6; 
var S_IMG_H = S_IMG_W; 
var S_CLIP = 5;

function Avatar(id, x, y) {
  this.id = id-1+Math.floor(Math.random()*6);;
  this.x = x;
  this.y = y;
  this.stance = 0;
  this.angle = 90;
  this.stanceWalk = 0;
  
  this.action = function() {
    this.stance = 3;
    this.update();
  }
  
  this.move = function(x,y) {
    this.stanceWalk++;
    if (this.stanceWalk > 3) {
      this.stanceWalk = 0;
    }
    
    if (x == 0) {
      if (y > 0) {
        this.angle = 180;
      } else if (y < 0) {
        this.angle = 0;
      }
    } else {
      var scaler = 1;
      if (x < 0) scaler = -1;
      this.angle = Math.atan(y/x) * 180/Math.PI + 90*scaler;
    }
    
//    alert(this.angle);
    
    switch(this.stanceWalk) {
    case 0:
    case 2:
      this.stance = 0;
      break;
    case 1:
      this.stance = 1;
      break;
    case 3:
      this.stance = 2;
      break;
    }    
      
    
    this.setLocation(this.x+x, this.y+y);
  }
  
  this.setLocation = function(x,y) {
    this.x=x;
    this.y=y;
    this.update();
  }
  
  this.update = function() {
    // rotate around me
    var rx = SW2+(this.id-1)*SW;
    var ry = SW2+(this.stance)*SW;

    var cr = (this.x-SW2+S_CLIP)+" "+(this.y-SW2+S_CLIP)+" "+(SW-2*S_CLIP)+" "+(SW-2*S_CLIP);
    this.img.attr({
//    this.img.animate({
       "clip-rect" : cr,
       "transform" : 
         "t"+(this.x-SW2-SW*(this.id-1))+","+(this.y-SW2-SW*this.stance) +
         "r"+this.angle+","+rx+","+ry
    });
  }
  
  //  alert(SPRITE_SRC);
//  this.img = paper.image(SPRITE_SRC, x-SW2, y-SW2, S_IMG_W, S_IMG_H);
  this.img = paper.image(SPRITE_SRC, 0, 0, S_IMG_W, S_IMG_H);
  this.update(); //.attr({"clip-rect" : "0 0 48 48"});
}

function newMove(part, index) {
  fetchMove(part, currentRound, index, function(val) {
    var theMove = $(val);
    if (theMove.is("click")) {
    }
  });
}

function initialize() {
  SPRITE_SRC = getFile("volunteermen.png");
  initializeGame();
}

var STEP_SIZE = 5;
var R2 = Math.sqrt(2);
function initializeGame() {
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
  
  avatars = new Array();
  avatars[1] = new Avatar(1,boxes[0].x,boxes[0].y);
//  background = paper.rect(-10, -10, cWidth+20, cHeight+20, 10).attr({fill: lightOrange, stroke: "none"});  
//  background.toBack();
  
  $('#moveN').click(function() { avatars[myid].move(0,-STEP_SIZE); });
  $('#moveNE').click(function() { avatars[myid].move(STEP_SIZE/R2,-STEP_SIZE/R2); });
  $('#moveE').click(function() { avatars[myid].move(STEP_SIZE, 0); });
  $('#moveSE').click(function() { avatars[myid].move(STEP_SIZE/R2, STEP_SIZE/R2); });
  $('#moveS').click(function() { avatars[myid].move(0,STEP_SIZE); });
  $('#moveSW').click(function() { avatars[myid].move(-STEP_SIZE/R2,STEP_SIZE/R2); });
  $('#moveW').click(function() { avatars[myid].move(-STEP_SIZE,0); });
  $('#moveNW').click(function() { avatars[myid].move(-STEP_SIZE/R2,-STEP_SIZE/R2); });
  $('#action').click(function() { avatars[myid].action(); });
  
  
  $('#zoomIn').click(function() {
   zoom(boxes[0]); 
  });  
}