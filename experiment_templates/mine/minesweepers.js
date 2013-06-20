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
var avatars = new Array();

function Box(id, x, y, r, polygon) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.lines = new Array();
  this.owner = 0; // who won it
  this.bomb = false;
  this.marked = null; // bomb, safe, etc
  this.polygon = polygon;
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

function roundInitialized(round) {
  for (var i = 1; i < numPlayers; i++) {
    if (initialMovesOfRound[i] > 0) {
      avatars[i].active = false;
    }
  }
}

var startLoc = new Array();
function newMove(part, index) {
  fetchMove(part, currentRound, index, function(val) {
//    log("fetchMove("+part+","+index+")");
    var theMove = $(val);
    var avatar = avatars[part];
    if (theMove.is('walkPath')) {
      var l = theMove.attr('l').split(',');  // start with their location: x,y,angle
      
      // this fast-forwards the early stuff
      if (index < initialMovesOfRound[part]) {
//        log("set startLoc["+part+"]:"+l);
        startLoc[part] = l;
      }
      
      if (index < initialMovesOfRound[part] || part != myid) {
        var p = theMove.attr('p').split(',');  // waypoints: x1,y1,x2,y2...
        var path = [];
        path.push( [ parseFloat(l[0]), parseFloat(l[1]) ] ); // avatar's current position at time of report
        for (var i = 0; i < p.length; i+=2) {
          path.push([parseFloat(p[i]),parseFloat(p[i+1])]); // add the next tuple to path  
        }
        avatar.setPath(path);
      }
    }
    
    if (index == initialMovesOfRound[part]-1) { // the last move
//      log("startLoc["+part+"]:"+(typeof startLoc[part]));
      if (typeof startLoc[part] != 'undefined') {
//        log("startLoc["+part+"]:"+startLoc[part]);
        avatar.angle = parseFloat(startLoc[part][2]);
        avatar.setLocation(parseFloat(startLoc[part][0]), parseFloat(startLoc[part][1])); // calls update
      }
    }
    
    if (index < initialMovesOfRound[part]-1) {
      avatar.active = false;
    } else {
      avatar.active = true;
    }
  });
}


function initialize() {
  initializeGame();
}

var NUM_COLORS = 6;
var STEP_SIZE = 5;
var R2 = Math.sqrt(2);
function initializeGame() {
//  $("#actionRow").html('<td><image id="flag" src="'+getFile("flag.png")+'"/></td><td></td><td><image id="safe" src="'+getFile("check.png")+'"/></td>')
  $("#flag").attr('src',getFile("flag.png"));
  $("#safe").attr('src',getFile("check.png"));
  startLoc = new Array();
  paper = Raphael("canvas", cWidth, cHeight);
  paper.clear();
  // paper.setViewBox(x, y, w, h, fit) // zoom/pan

  boxes = new Array();
  lines = new Array();

  Math.seedrandom(seed);
  var gridType = Math.floor(Math.random()*3); // 3 = 0-2
  gridType = 0;
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
  var myAvatarFactory = new AvatarFactory(getFile("volunteermen.png"),48,NUM_COLORS,6,5, [0,1,0,2],5, [3,4,5], paper);
  
  for (var i = 1; i <= numPlayers; i++) {
    avatars[i] = myAvatarFactory.build(i-1, boxes[0].x, boxes[0].y);
  }
//  background = paper.rect(-10, -10, cWidth+20, cHeight+20, 10).attr({fill: lightOrange, stroke: "none"});  
//  background.toBack();
  
  // disable drag starting on the canvas
  $('#canvas').bind("dragstart", function() {
    return false;
  });

  $('#action').click(function() { avatars[myid].action(0); });
  $('#canvas').click(function(e) {
    if (inhibit_click) {
      inhibit_click = false;
      return;
    }
    findCanvasCoords(this, e);
    canvasClick(e.canvasX, e.canvasY); 
  });

  // dragging the canvas
  $('#canvas').mousedown(function(e) {
    log("mousedown");
    fixPageX(e);
    var scaleX = cWidth/paper._viewBox[2];
    var scaleY = cHeight/paper._viewBox[3];
    var scaleF = Math.min(scaleX,scaleY);
    drag = { isDragging: false, 
             mStartX: e.pageX, mStartY: e.pageY,
             scale: scaleF,
             vx: paper._viewBox[0], vy: paper._viewBox[1]
           };
    $(window).mousemove(function(e) {
      log("mousemove");
      drag.isDragging = true;
      dragPage(e);
    });
    
    $(window).mouseup(function(e) {
      log("mouseup");
      if (drag.isDragging) {
        dragPage(e);
        inhibit_click = true; // prevent the click function
      }
      drag = null;
      $(window).unbind("mousemove");
      $(window).unbind("mouseup");
    });
  });
  
  $('#canvas').mousewheel(function(e, delta) {
    findCanvasCoords(this, e);
    zoom(e.canvasX, e.canvasY, 1-delta*0.1);
    e.preventDefault();
  });
  
  $('#zoomReset').click(function() {
    resetZoom(); 
  });   

  $('#zoomIn').click(function() {
    var avatar = avatars[myid];
    zoom(avatar.x,avatar.y,0.9); 
  });   

  $('#zoomOut').click(function() {
    var avatar = avatars[myid];
    zoom(avatar.x,avatar.y,1.1); 
  });   

  
  startAnimation();
}

/**
 * zoom in/out from x,y (canvasX, canvasY)
 */
function zoom(x,y,delta) {
  var newW = paper._viewBox[2]*delta;
  var newH = paper._viewBox[3]*delta;
  
  var dx = x-paper._viewBox[0];
  var dy = y-paper._viewBox[1];

  var cX = x-dx*delta;
  var cY = y-dy*delta;
  
  paper.setViewBox(cX,cY,newW,newH);
}

/**
 * center on x,y
 * w is the width the frame should become
 */
function zoomTo(x,y,w) {
  var zr = w/2;
  var aspect = cWidth/cHeight;
  paper.animateViewBox(x-zr,y-zr*aspect,zr*2,zr*2*aspect,500,null);
//  paper.setViewBox(x-zr,y-zr*aspect,zr*2,zr*2*aspect,false);

}
  
function resetZoom() {
  paper.animateViewBox(x1, y1, cWidth, cHeight, 500,null);
//paper.setViewBox(x1, y1, cWidth, cHeight,false);
}


// set to an object while dragging
var drag = null;
var inhibit_click = false; // prevent the "click" event after a drag
function dragPage(e) {
  fixPageX(e);
  var x = drag.vx - (e.pageX-drag.mStartX)/drag.scale;
  var y = drag.vy - (e.pageY-drag.mStartY)/drag.scale;
  paper.setViewBox(x,y,paper._viewBox[2], paper._viewBox[3],false);
}

/**
 * IE 8 and earlier don't have a pageX variable, synthetically generate it
 * @param e
 */
function fixPageX(e) {
  if (typeof e.pageX === "undefined") {
    e.pageX = e.clientX + document.body.scrollLeft;
    e.pageY = e.clientY + document.body.scrollTop;
  }  
}

/**
 * e is the event
 * calculates e.canvasX, e.canvasY
 * 0.1 precision
 */
function findCanvasCoords(element, e) {
  var offset = $(element).offset();
  var scaleX = cWidth/paper._viewBox[2];
  var scaleY = cHeight/paper._viewBox[3];
  var scale = Math.min(scaleX,scaleY);

  fixPageX(e);
  
  var oX = e.pageX - offset.left;
  var oY = e.pageY - offset.top;
  var x = oX/ scale + paper._viewBox[0];
  var y = oY/ scale  + paper._viewBox[1];
  e.canvasX = parseFloat(x.toFixed(1));
  e.canvasY = parseFloat(y.toFixed(1));
}

var animTimer = null;
function startAnimation() {
  if (animTimer != null) return;
  animTimer = setInterval(doAnimation, 50); // 20FPS
}
function stopAnimation() {
  if (animTimer == null) return;
  clearInterval(animTimer);
  animTimer = null;
}

// called 20x/second
function doAnimation() {
  for (var i in avatars) {
    avatars[i].step();    
  }
}

function canvasClick(x,y) {
  var avatar = avatars[myid];
//  avatar.walkTo(x,y); 
  avatar.addWaypoint(x,y); 
  var p = [].concat.apply([],avatar.path); // flatten path
  submit('<walkPath l="'+avatar.x.toFixed(1)+','+avatar.y.toFixed(1)+','+avatar.angle.toFixed(1)+'" p="'+p.join()+'"/>');
}
