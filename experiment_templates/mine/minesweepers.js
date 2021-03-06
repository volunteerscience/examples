var x1,y1,w1,h1; // upper left, width,height when zoomed all the way out
var cWidth = 650; // size of canvas
var cHeight = 450;

var xBoxes, yBoxes; // size of the grid

var paper; // raphael
var boxes; // all the boxes
var gap = 0;
var lineWidth = 1;


var curPlayer = 1;
var avatars = new Array();
var pColor = []; // color of players
var mColor = []; // color of mine analysis

// marks
var NONE = 0;
var SAFE = 1;
var FLAG = 2;
var LOOK = 3;

var mode = "walk"; // which action the user clicked on
var BK_GRND = "\u25EF"; //"\u0398"; //"\u06DE"; //"@";
var outline;
var clickedBox = null;
var leftButtonFlag = false;
var rightButtonFlag = false;
var data;

function Box(id, x, y, r, points) {
  var myBox = this; // for inner functions
  this.x = x;
  this.y = y;
  this.r = r;
  this.id = id;
  this.owner = 0; // who won it
  this.bomb = false;
  this.marked = null; // bomb, safe, etc
  this.neighbor = []; // neighboring boxes
  this.mark = [NONE,0]; // [mark,id of player making the mark]
  
  var s = "M ";
  for (var i = 0; i < points.length; i+=2) {
    s+=(x+points[i])+","+(y+points[i+1])+" L ";
  }
  s+= "Z";
  this.polygon = paper.path(s).attr('fill',pColor[0]);
  this.text = paper.text(x,y,"").attr({'text-anchor': 'middle', 'font': paper.getFont("Vegur"), 'font-size': 30, "font-weight": "bold"});
  this.text.node.setAttribute("pointer-events", "none");
  this.icon = paper.image("", x-r, y-r, r*2, r*2).hide();

//  this.draggingOver = []; // since there are multiple elements, keep track of all of them that we are dragging over
  
  this.canWalk = function() {
    return myBox.revealed || myBox.mark[0] == SAFE;
  };
  
  this.onDragEnter = function(e) {
    
 //     var data = e.dataTransfer.getData("Text");
//      var data = e.originalEvent.dataTransfer.getData("Text");
//      alert(data);
    if (data) {
      outline.box = myBox;
      outline.show();
      outline.transform("t"+myBox.x+","+myBox.y+" s1.2,1.2,0,0");
      e.preventDefault();
    }
  };

//  this.onDragLeave = function(e) {
//    var data = e.originalEvent.dataTransfer.getData("Text");
//    if (data) {
//      var idx;
//      idx = myBox.draggingOver.indexOf(e.target);
//      if (idx >= 0) {
//        myBox.draggingOver.splice(idx,1);
//      }        
//    }
//    if (myBox.draggingOver.length == 0) { // not over either element
//      if (myBox.outline != null) {
//        myBox.outline.remove();
//        myBox.outline = null;
//      }
//    }
//    e.preventDefault();
//  };
  
  this.onDragOver = function(e) {
    // stupid chrome won't let you do jack with getData
//    var data = e.originalEvent.dataTransfer.getData("Text");
//      alert(data);
    if (data) {
//      e.preventDefault(); // need this or the bounding box doesn't go away in chrome
      if (data == "walk") {
        if (myBox.revealed || myBox.mark[0] == SAFE) {
          e.preventDefault();
        }
      } else if (!myBox.revealed) {
        e.preventDefault();
      }
    }
  };

  
  // a: the mark
  // id: who done it
  // localEvent: true if it was generated by the local user, false if it was from the network
  this.doMark = function(a,id,localEvent) {
    if (myBox.revealed) return;
    
    if (localEvent) {
      if (a == myBox.mark[0] && myBox.mark[1] == myid) { // the 2nd part just changes the mark to your color if someone already marked it the same
        a = NONE;
      }
      submit('<mark box="'+myBox.id+'" val="'+a+'"/>');
    }
    myBox.mark = [a,id];    
    
    switch(a) {
    
    case FLAG:
      myBox.text.attr("text",BK_GRND);
      myBox.text.attr("fill",pColor[id]);      
      myBox.icon.attr("src",getFile("flag_s.png")).show();
      break;
      
    case LOOK:
      myBox.text.attr("text",BK_GRND);
      myBox.text.attr("fill",pColor[id]);      
      myBox.icon.attr("src",getFile("look_s.png")).show();
      break;
      
    case SAFE:
      myBox.text.attr("text",BK_GRND);
      myBox.text.attr("fill",pColor[id]);      
      myBox.icon.attr("src",getFile("check_s.png")).show();
      break;
      
    case NONE:
      myBox.icon.attr("src","").hide();
      myBox.text.attr("text","");
      break;
    }
  };
  
  this.onDrop = function(e) {
    
    log("onDrop");
    outline.hide();
//    var data = e.originalEvent.dataTransfer.getData("Text");
    if (data) {
      if (data == "walk") {
        if (myBox.revealed || myBox.mark[0] == SAFE) {
          myBox.walkToMe();
        }
      } else if (!myBox.revealed) {
        if (data == "flag") {
          myBox.doMark(FLAG,myid,true);
        } else if (data == "safe") {
          myBox.doMark(SAFE,myid,true);
        } else if (data == "look") {
          myBox.doMark(LOOK,myid,true);
        } else if (data == "clear") {
          myBox.doMark(NONE,myid,true);
        }
      }
    }
    data = null;
    e.preventDefault();
  }; 

  this.walkToMe = function() {
    // walk over to that box, if possible
    var avatar = avatars[myid];
    avatar.clearSay();
    if (myBox.canWalk()) {
      // calculate path as breadth first search, recursive
      var p = doBFS(avatar.currentlyOn.id,myBox.id);
      if (p == null) {
        avatar.say(["I can't find a way to get there."]);
      } else {
        submit('<walkPath p="'+p.join()+'"/>');
        var path = p.map(function(id) { return boxes[id] }); // ids => boxes
        avatar.setPath(path);        
      }
//      log(p);
//      submit('<walkPath l="'+avatar.x.toFixed(1)+','+avatar.y.toFixed(1)+','+avatar.angle.toFixed(1)+'" p="'+p.join()+'"/>');

    } else {
      if (myBox.mark[0] == FLAG) {
        avatar.say(["You're joking, right?","I'm not walking there."]);
      } else {
        avatar.say(["I'm not walking there","unless you mark it safe!"]);        
      }
    }    
  }; 
  
  this.onMouseDown = function(e) {
    var rightclick = false;
    if (e.which) rightclick = (e.which == 3);
    else if (e.button) rightclick = (e.button == 2);
//    log("onMouseDown right:"+rightclick);
    if (rightclick) {
      rightButtonFlag = true;
    } else {
      leftButtonFlag = true;
    }
    
    if (leftButtonFlag && rightButtonFlag) {
      if (myBox.revealed) {
        for (var i in myBox.neighbor) {
          var n = myBox.neighbor[i];
          if (!n.revealed && n.mark[0] != FLAG) {
            n.polygon.attr('fill',mColor[0]);
          }
        }
      }
      
    }
    
    clickedBox = myBox;
  }
  
  this.onClick = function(e) {
    if (inhibit_click) {  // this is a result of dragging the page
      inhibit_click = false;
      return;
    }
    
    if (leftButtonFlag && rightButtonFlag) {
      if (myBox.revealed) {
        // step 1: count the flags
        var flags = 0;
        for (var i in myBox.neighbor) {
          var n = myBox.neighbor[i];
          if (n.mark[0] == FLAG) {
            flags++
          }
        }
        
        for (var i in myBox.neighbor) {
          var n = myBox.neighbor[i];
          if (!n.revealed) {
            if (flags == myBox.val) {
              switch(n.mark[0]) {
              case NONE:
              case LOOK:
                n.doMark(SAFE, myid, true);
                n.polygon.attr('fill',pColor[0]);
                break;
              case SAFE:
                n.polygon.attr('fill',pColor[0]);
                break;
              } 
            } else {
              n.polygon.attr('fill',pColor[0]);
            }
          }
        }
      }
      return;
    }
    

//    var rightclick = false;
//    if (e.which) rightclick = (e.which == 3);
//    else if (e.button) rightclick = (e.button == 2);
    
    if (rightButtonFlag) {
      switch(myBox.mark[0]) {
      case NONE:
        newMark = FLAG;
        break;
      case FLAG:
        newMark = SAFE;
        break;
      case SAFE:
        newMark = LOOK;
        break;
      case LOOK:
        newMark = NONE;
        break;
      }
      myBox.doMark(newMark,myid,true);
    } else {
//    alert('mode:'+mode);
      if (mode == "walk") {
        myBox.walkToMe();
      } else if (mode == "look") {
        myBox.doMark(LOOK,myid,true);
      } else if (mode == "flag") {
        myBox.doMark(FLAG,myid,true);
      } else if (mode == "safe") {
        myBox.doMark(SAFE,myid,true);
      } else if (mode == "clear") {
        myBox.doMark(NONE,myid,true);
      }    
    }
  };
  
  
  $(this.polygon.node).on("dragover", this.onDragOver);
  $(this.icon.node).on("dragover", this.onDragOver);
  $(this.text.node).on("dragover", this.onDragOver);
  $(this.polygon.node).on("dragenter", this.onDragEnter);
  $(this.icon.node).on("dragenter", this.onDragEnter);
  $(this.text.node).on("dragenter", this.onDragEnter);
  $(this.polygon.node).on("dragleave", this.onDragLeave);
  $(this.icon.node).on("dragleave", this.onDragLeave);
  $(this.text.node).on("dragleave", this.onDragLeave);
  this.polygon.mousedown(this.onMouseDown);    
  this.icon.mousedown(this.onMouseDown);    
  this.text.mousedown(this.onMouseDown);    
  $(this.polygon.node).on("drop", this.onDrop);
  $(this.icon.node).on("drop", this.onDrop);
  $(this.text.node).on("drop", this.onDrop);
  
  
  this.revealed = false;
  // called when player steps on the square, or neighboring square has no bombs
  // return true if avatar should stop there
  this.reveal = function(playerId) {
    if (myBox.revealed) return false;
    myBox.revealed = true;
    
    if (playerId == myid) {
      submit('<reveal box="'+myBox.id+'"/>');
    }
    
    this.polygon.attr('fill',mColor[0]);
    switch(myBox.val) {
    case -2:
      // I'm the reward
      myBox.icon.attr("src",getFile("prize.png")).show();
      return true;
    case -1:
      // boom
      myBox.icon.attr("src",getFile("mine.png")).show();
      var avatar = avatars[playerId];
      avatar.action(2);
      avatar.active = false;
      avatar.say(["AAH!"]);
      revealAllBombs();
      return true;
    case 0:
      // this is a special case where you reveal your neighbors because you have a val of zero
      myBox.text.attr("text","");
      myBox.icon.attr("src","").hide();
      for (var i in myBox.neighbor) {
        // TODO: delay this until a later tick, to make it animate
        myBox.neighbor[i].reveal(0);
      }
      return false;
    default:
      // set the icon
      myBox.icon.attr("src","").hide();
      myBox.text.attr("text",myBox.val);
      myBox.text.attr("fill",mColor[myBox.val]);      
      return false;
    }
  };
  
  this.val = 0;
  
  this.addBox = function(b) {
    myBox.neighbor.push(b);
    if (myBox.val < 0) return; // I'm a bomb or a reward val is already set
    if (b.val == -1) { // a bomb
      myBox.val++;
    }
  };
}

function revealAllBombs() {
  for (var i in boxes) {
    var box = boxes[i];
    if (box.revealed) continue;
    switch (box.val) {
    case -1:
      if (box.mark[0] != FLAG) { // if not marked, display the mine
        box.icon.attr("src",getFile("mine.png")).show(); 
      }
      break;
    case -2:
      box.icon.attr("src",getFile("prize.png")).show(); // reveal the prize
      break;
    default:
      if (box.mark[0] == FLAG) { // turn bogus flags into checks
        box.icon.attr("src",getFile("check_s.png")).show();        
      }
    }
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
//    log("fetchMove("+part+","+index+"):"+val);
    var theMove = $(val);
    var avatar = avatars[part];
    if (theMove.is('walkPath')) {
      var p = theMove.attr('p').split(',');  // waypoints: x1,y1,x2,y2...
      // this fast-forwards the early stuff
      if (index < initialMovesOfRound[part]) {
//        log("set startLoc["+part+"]:"+l);
        startLoc[part] = parseInt(p[0]);
      } else {
        if (part != myid) {
   //     if (index < initialMovesOfRound[part] || part != myid) {
          var p = theMove.attr('p').split(',');  // waypoints: x1,y1,x2,y2...
          var path = p.map(function(id) { return boxes[id] }); // ids => boxes
          avatar.setPath(path);        
        }
      }
    }
    
    if (index == initialMovesOfRound[part]-1) { // the last move of the initial group
//      log("startLoc["+part+"]:"+(typeof startLoc[part]));
      if (typeof startLoc[part] != 'undefined') {
//        log("startLoc["+part+"]:"+startLoc[part]);
//        avatar.angle = parseFloat(startLoc[part][2]);
        var b = boxes[startLoc[part]];
        avatar.currentlyOn = b;
        avatar.setLocation(b.x, b.y); // calls update
      }
    }
    
    if (theMove.is('reveal')) {
      boxes[parseInt(theMove.attr('box'))].reveal(part);
    }
    
    // don't re-mark my mark, because this interferes with right-clicking
    if (theMove.is('mark') && (part != myid || index <= initialMovesOfRound[myid])) { // we're initializing the game, or it's not my mark 
      boxes[parseInt(theMove.attr('box'))].doMark(parseInt(theMove.attr('val')),part,false);
    }
    
    if (theMove.is('win') && part != myid) {
      win(part, parseInt(theMove.attr('box')));
    }
    
    if (index < initialMovesOfRound[part]-1) {
      avatar.active = false;
    } else {
      avatar.active = true;
    }
  });
}

/**
 * starter function for bfs()
 * 
 * @param start id of first box
 * @param dest id of last box
 */
function doBFS(start, dest) {
  var m = new Object();
  m[dest] = -1; // make sure not to reevaluate the dest
  return bfs(start, dest, m, [dest]);  // first evaluation is dest
}

/**
 * Breadth First Search
 * id of first box, id of last box, map[id] => id, queue: top is nearest to dest
 * 
 * start at the dest, then expand until finding start
 */ 
function bfs(start, dest, m, q) {
  if (q.length == 0) {
    return null; // no path
  }
  var cur = boxes[q.shift()];

  // sort this by closest to dest so they don't take somewhat bizarre choices, this may still be strange going around corners
  // bias towards cardinal directions?
  var neighbors = cur.neighbor;
  
  for (var i in neighbors) {
    var n = cur.neighbor[i];
    if (n.id == start) {
      // success!, now generate the path from m
      var ret = new Array();
      m[n.id] = cur.id;
      var next = start;
      do {
        ret.push(next);
        next = m[next];
      } while (next != dest);
      ret.push(dest);
      return ret;
    }
    if (n.canWalk() && typeof m[n.id] === "undefined") {
      m[n.id] = cur.id;
      q.push(n.id);
    }
  }

  return bfs(start, dest, m, q);
}

function initialize() {
  document.onselectstart = function(){ return false; } // disabel text cursor in chrome
  document.oncontextmenu = function(){ return false; } // disable context menu
//  $('body').on('contextmenu', 'img', function(e){ return false; });
  
  pColor = ["#4960d2", "#f68600","#0070c0","#7dcc15","#f10c0c","#fafa0d","#b402ff"];
  mColor = ["#c7d4e7", "#414fbc", "#1d6705", "#ac0607", "#010282", "#7b0102", "#05797d", "#f44c0c", "#aa0809", "#1d0cf4", "#849685"];
  
  initializeGame();
}

var NUM_COLORS = 6;
var STEP_SIZE = 5;
var R2 = Math.sqrt(2);
function initializeGame() {
  $("#zoomOut").attr('src',getFile("magnifyOut.png"));
  $("#zoomReset").attr('src',getFile("magnifyReset.png"));
  $("#zoomMan").attr('src',getFile("magnifyMan.png"));
  $("#zoomIn").attr('src',getFile("magnifyIn.png"));
  
  $("#flag").attr('src',getFile("flag.png")).bind('dragstartt', function(e) {
      e.originalEvent.dataTransfer.setData("Text",e.target.id);
      data = e.target.id;
  });
  
  $("#look").attr('src',getFile("look.png")).bind('dragstartt', function(e) {
    e.originalEvent.dataTransfer.setData("Text",e.target.id);
    data = e.target.id;
  });

  $("#safe").attr('src',getFile("check.png")).bind('dragstartt', function(e) {
      e.originalEvent.dataTransfer.setData("Text",e.target.id);
      data = e.target.id;
  });
  
  $("#clear").attr('src',getFile("cancel.png")).bind('dragstartt', function(e) {
    e.originalEvent.dataTransfer.setData("Text",e.target.id);
    data = e.target.id;
  });

  $("#walk").attr('src',getFile("walk.png")).bind('dragstartt', function(e) {
//  $("#walk").attr('background-image',"url('" + getFile("walk.png") + "')").bind('dragstart', function(e) {
//  $("#walk").bind('dragstart', function(e) {
    e.originalEvent.dataTransfer.setData("Text",e.target.id);
    data = e.target.id;
  });

  $(".actionGroup").bind('dragstart', function(e) {
    e.originalEvent.dataTransfer.setData("Text",e.target.id);
    data = e.target.id;
  });
  
  $(".actionGroup").bind('dragend', function(e) {
    data = null;
    outline.hide();
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
//    initializeSquareGrid(10,10,10,seed); // easy
//    initializeSquareGrid(16,16,40,seed); // med
//    initializeSquareGrid(30,16,99,seed); // hard
    initializeSquareGrid(variables['xSquares'],variables['ySquares'],variables['mines'],seed); // custom
  }
  
  var avatarFile = getFile("volunteermen.png");
  $("#you").css('background-image','url("'+avatarFile+'")');
  $("#you").css('background-position',-48*(myid-1)+'px 0px');
  
  avatars = new Array();
  var myAvatarFactory = new AvatarFactory(avatarFile,48,NUM_COLORS,6,5, [0,1,0,2],5, [3,4,5], paper);
  
  // calcluate initial location
  Math.seedrandom(seed);
  var startLoc = [];
  for (var i = 1; i <= numPlayers+1; i++) { // extra one is for the goal
    var tries = 0;
    while (true) { 
      // pick a random box
      var boxId = Math.floor(Math.random()*boxes.length);
      var box = boxes[boxId];
      
      // if it's empty, and not already a starting location
      if ((box.val == 0 && box.revealed == false) || // try to put it on a zero that hasn't been revealed
          (box.val >= 0 && box.revealed == false && i == numPlayers+1) || // for the prize, it doesn't have to be on a zero 
          (tries > 40 && box.val >= 0 && box.revealed == false) || // if you try for a while, it doesn't have to be a zero
          (tries > 100 && box.val >= 0)) { // in this case we'll even take a revealed spot, just not a bomb
        if (i <= numPlayers) {
          box.reveal(0);
          startLoc.push(boxId);
          avatars[i] = myAvatarFactory.build(i-1, box.x, box.y);   
          avatars[i].currentlyOn = box;
          if (i == myid) {
            avatars[i].steppedOn = function(box) {
              if (box.val == -2) {
                win(myid,box.id);
              } 
              return box.reveal(myid);
            };
            // TODO: don't submit on a refresh
            submit('<start box="'+boxId+'"/>');
          }
          avatars[i].canMoveToward = function(box, dist) {
            if (dist < box.r*1.5) {
              return box.canWalk();
            }
            return true;
          };
        } else {
//          alert('win is on:'+box.id);
          box.val = -2;
          if (box.revealed) {
            box.revealed = false;
            box.reveal(0);
          }
        }
        break;
      }
      tries++;
    }
  }
//  background = paper.rect(-10, -10, cWidth+20, cHeight+20, 10).attr({fill: lightOrange, stroke: "none"});  
//  background.toBack();

  // disable drag starting on the canvas
  $('#canvas').bind("dragstart", function() {
    return false;
  });

  $('#action').click(function() { avatars[myid].action(0); });
//  $('#canvas').click(function(e) {
//    if (inhibit_click) {
//      inhibit_click = false;
//      return;
//    }
//    findCanvasCoords(this, e);
//    canvasClick(e.canvasX, e.canvasY); 
//  });

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
//      log("mouseup "+drag+" "+clickedBox);
      if (drag != null && drag.isDragging) {
        dragPage(e);
        inhibit_click = true; // prevent the click function
      } else {
        inhibit_click = false;
        if (clickedBox != null) {
          clickedBox.onClick(e);
        }
      }
      
      clickedBox = null;
      drag = null;
      leftButtonFlag = false;
      rightButtonFlag = false;
      $(window).unbind("mousemove");
      $(window).unbind("mouseup");
    });
  });

  $('.actionGroup').click(function() {
//    alert("action");
    $('.actionGroup').css('border-style','none');
    $(this).css('border-style','dashed');
    mode = $(this).attr("id");
  });
  $("#walk").css('border-style','dashed');
  mode = "walk";
  
  $('#canvas').mousewheel(function(e, delta) {
    findCanvasCoords(this, e);
    zoom(e.canvasX, e.canvasY, 1-delta*0.05);
    e.preventDefault();
  });
  
  $('#zoomReset').click(function() {
    resetZoom(); 
  });   

  $('#zoomMan').click(function() {
    zoomToAvatar(myid, boxes[0].r*9); 
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
  avatars[myid].say(["I walk through","minefields!"]);
}

function win(id, boxId) {
  log("win:"+id);
  if (id == myid) {
    submit('<win box="'+boxId+'"/>');
  }
  avatars[id].say(["Hooray!"]);
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

  // don't zoom out more than the full map
  if (newW > w1 || newH > h1) {
    cX = x1;
    cY = y1;
    newW = w1;
    newH = h1;
  }
  
  if (newW < boxes[0].r * 10) return;
  
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
  paper.animateViewBox(x1, y1, w1, h1, 500,null);
//paper.setViewBox(x1, y1, cWidth, cHeight,false);
}

function zoomToAvatar(id, w) {
  var a = avatars[id];
  
  paper.animateViewBox(a.x-w, a.y-w, w*2, w*2, 500,null);
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
//  e.originalEvent.preventDefault(); // attempt to disable drag icon in chrome failed
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

//function canvasClick(x,y) {
//  if (true) return;
//  
//  // this allows an avatar to walk around freely on the map
//  var avatar = avatars[myid];
//  avatar.walkTo(x,y); // this tells the avatar to abandon its last action and go where you tell it
////  avatar.addWaypoint(x,y); // this forces the avatar to first go to all the waypoints you told it 
//  var p = [].concat.apply([],avatar.path); // flatten path
//  submit('<walkPath l="'+avatar.x.toFixed(1)+','+avatar.y.toFixed(1)+','+avatar.angle.toFixed(1)+'" p="'+p.join()+'"/>');
//}
