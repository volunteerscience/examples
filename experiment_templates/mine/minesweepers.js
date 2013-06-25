var x1,y1; // upper left when zoomed out
var cWidth = 450; // size of canvas
var cHeight = 350;

var xBoxes, yBoxes; // size of the grid

var paper; // raphael
var boxes; // all the boxes
var gap = 0;
var lineWidth = 1;


var curPlayer = 1;
var avatars = new Array();
var pColor = []; // color of players
var mColor = []; // color of mine analysis

function Box(id, x, y, r, points) {
  var myBox = this; // for inner functions
  this.x = x;
  this.y = y;
  this.id = id;
  this.owner = 0; // who won it
  this.bomb = false;
  this.marked = null; // bomb, safe, etc
  this.neighbor = []; // neighboring boxes
  
  var s = "M ";
  for (var i = 0; i < points.length; i+=2) {
    s+=(x+points[i])+","+(y+points[i+1])+" L ";
  }
  s+= "Z";
  this.polygon = paper.path(s).attr('fill',pColor[0]);
  this.icon = paper.text(x,y,"?").attr({'text-anchor': 'middle', 'font': paper.getFont("Vegur"), 'font-size': 30});

  this.outline = null;
  this.draggingOver = []; // since there are multiple elements, keep track of all of them that we are dragging over
  
  this.onDragEnter = function(e) {
    
    var data = e.originalEvent.dataTransfer.getData("Text");
    if (data) {
      myBox.draggingOver.push(e.target);
      if (myBox.outline == null) {
        myBox.outline = paper.path(s).attr(
            {
              "stroke": "pink",
              "stroke-width": 3, 
              "stroke-linejoin": "round", 
              "transform": "s1.2, 1.2, "+myBox.x+", "+myBox.y
            });
      }
      e.preventDefault();
    }
  };

  this.onDragLeave = function(e) {
    var data = e.originalEvent.dataTransfer.getData("Text");
    if (data) {
      var idx;
        idx = myBox.draggingOver.indexOf(e.target);
        log(idx+" "+myBox.draggingOver.length);
        if (idx >= 0) {
          myBox.draggingOver.splice(idx,1);
        }        
      if (myBox.draggingOver.length == 0) { // not over either element
        if (myBox.outline != null) {
          myBox.outline.remove();
          myBox.outline = null;
        }
        e.preventDefault();
      }
    }
  };
  
  this.onDragOver = function(e) {
    var data = e.originalEvent.dataTransfer.getData("Text");
    if (data) {
      e.preventDefault();
    }
  };

  
  this.onDrop = function(e) {
    var data = e.originalEvent.dataTransfer.getData("Text");
    if (data) {
      myBox.draggingOver.length = 0; // clear the array
      if (myBox.outline != null) {
        myBox.outline.remove();
        myBox.outline = null;
      }
      if (data == "flag") {
        myBox.icon.attr("text","B");
      } else if (data == "safe") {
        myBox.icon.attr("text","S");
      }
      e.preventDefault();
    }
  };

  this.onClick = function(e) {
    // walk over to that box, if possible
//    myBox.polygon.attr('fill','red');
    var avatar = avatars[myid];
    
    // calculate path as breadth first search
//    avatar.box
    
  };
  
  
  $(this.polygon.node).on("dragover", this.onDragOver);
  $(this.icon.node).on("dragover", this.onDragOver);
  $(this.polygon.node).on("dragenter", this.onDragEnter);
  $(this.icon.node).on("dragenter", this.onDragEnter);
  $(this.polygon.node).on("dragleave", this.onDragLeave);
  $(this.icon.node).on("dragleave", this.onDragLeave);
  this.polygon.click(this.onClick);    
  this.icon.click(this.onClick);    
  $(this.polygon.node).on("drop", this.onDrop);
  $(this.icon.node).on("drop", this.onDrop);
  
  
  this.revealed = false;
  // called when player steps on the square, or neighboring square has no bombs
  this.reveal = function() {
    if (myBox.revealed) return;
    myBox.revealed = true;
    if (myBox.val == -2) {
      // I'm the reward
      myBox.icon.attr("text","$");
    } else if (myBox.val == 0) {
      // this is a special case where you reveal your neighbors because you have a val of zero
      myBox.icon.attr("text","");
      for (var i in myBox.neighbor) {
        myBox.neighbor[i].reveal();
      }
    } else {
      myBox.icon.attr("text",myBox.val);
      myBox.icon.attr("fill",mColor[myBox.val]);      
    }
  };
  
  this.val = 0;
  
  this.addBox = function(b) {
    if (myBox.val < 0) return; // I'm a bomb or a reward val is already set
    if (b.val == -1) { // a bomb
      myBox.val++;
    }
    myBox.neighbor.push(b);
  };
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
//    log("fetchMove("+part+","+index+"):"+val);
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
  pColor = ["#96848c", "#f68600","#0070c0","#7dcc15","#f10c0c","#fafa0d","#b402ff"];
  mColor = ["#849696", "#00F", "#0F0", "#F00", "#b402ff", "#8e220c", "", "#f44c0c", "#0cf1f4", "#1d0cf4", "#849685"];
  
  initializeGame();
}

var NUM_COLORS = 6;
var STEP_SIZE = 5;
var R2 = Math.sqrt(2);
function initializeGame() {
  $("#flag").attr('src',getFile("flag.png")).bind('dragstart', function(e) {
      e.originalEvent.dataTransfer.setData("Text",e.target.id);
  });
  
  $("#safe").attr('src',getFile("check.png")).bind('dragstart', function(e) {
      e.originalEvent.dataTransfer.setData("Text",e.target.id);
  });
  startLoc = new Array();
  paper = Raphael("canvas", cWidth, cHeight);
  paper.clear();
  // paper.setViewBox(x, y, w, h, fit) // zoom/pan

  boxes = new Array();

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
    initializeSquareGrid(10,10,10,seed);
  }
  
  avatars = new Array();
  var myAvatarFactory = new AvatarFactory(getFile("volunteermen.png"),48,NUM_COLORS,6,5, [0,1,0,2],5, [3,4,5], paper);
  
  // calcluate initial location
  Math.seedrandom(seed);
  var startLoc = [];
  for (var i = 1; i <= numPlayers; i++) {
    while(true) {
      var boxId = Math.floor(Math.random()*boxes.length);
      var box = boxes[boxId];
      if (box.val == 0 && startLoc.indexOf(boxId) == -1) {
        box.reveal();
        startLoc.push(boxId);
        avatars[i] = myAvatarFactory.build(i-1, box.x, box.y);   
        avatars[i].box = box;
        if (i == myid) {
          // TODO: don't submit on a refresh
          submit('<start box="+boxId+"/>');
        }
        break;
      }
    }
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
      drag.isDragging = true;
      dragPage(e);
    });
    
    $(window).mouseup(function(e) {
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
  if (true) return;
  
  // this allows an avatar to walk around freely on the map
  var avatar = avatars[myid];
  avatar.walkTo(x,y); // this tells the avatar to abandon its last action and go where you tell it
//  avatar.addWaypoint(x,y); // this forces the avatar to first go to all the waypoints you told it 
  var p = [].concat.apply([],avatar.path); // flatten path
  submit('<walkPath l="'+avatar.x.toFixed(1)+','+avatar.y.toFixed(1)+','+avatar.angle.toFixed(1)+'" p="'+p.join()+'"/>');
}
