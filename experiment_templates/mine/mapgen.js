function initializeSquareGrid(xBoxes, yBoxes, numMines, seed) {
  var grid = [];
  

  var boxWidth  = (cWidth -lineWidth)/xBoxes;
  var boxHeight = (cHeight-lineWidth)/yBoxes;
  
  // make the boxes square
  boxWidth = Math.min(boxWidth,boxHeight);
  boxWidth = 35;
  
  boxHeight = boxWidth;
  var w = boxHeight/2;
//  alert(boxWidth);
  var pts = [-w,-w, w,-w, w,w, -w,w];

  // center
  var width = boxWidth*xBoxes+lineWidth;
  var height = boxHeight*yBoxes+lineWidth;
  
  var scale = Math.max(width/cWidth,height/cHeight);
  w1 = cWidth*scale;
  h1 = cHeight*scale;
  x1 = -(w1-width)/2 - lineWidth*scale*2;
  y1 = -(h1-height)/2;
//  alert(x1+","+y1+","+w1+","+h1);
  paper.setViewBox(x1, y1, w1, h1, false);
  

  // layout the boxes
  for (var x = 0; x < xBoxes; x++) {
    grid[x] = []
    for (var y = 0; y < yBoxes; y++) {
      var newBox = new Box(boxes.length, x*boxWidth+w, y*boxHeight+w,w, pts);
      boxes.push(newBox);
      grid[x][y] = newBox;
    }
  }
  
  // set all the bombs
  Math.seedrandom(seed);
  var bombCt = -1; // first is the reward
  while (bombCt < numMines) {
    var x = Math.floor(Math.random()*xBoxes);
    var y = Math.floor(Math.random()*yBoxes);
    if (grid[x][y].val == 0) {
      if (bombCt == -1) {
        // set the reward first
        grid[x][y].val = -2;
      } else {
        grid[x][y].val = -1;
      } 
      bombCt++;
    }
  }
  
  
  var s = "M ";
  for (var i = 0; i < pts.length; i+=2) {
    s+=pts[i]+","+pts[i+1]+" L ";
  }
  s+= "Z";
  outline = paper.path(s).attr(
      {
        "stroke": "pink",
        "stroke-width": 3, 
        "stroke-linejoin": "round"
        ,"transform": "s1.2, 1.2, "+0+", "+0
      }).hide();
//  outline.onDragEnter = function(e) {
//    log("outline onDragEnter");
//    var data = e.originalEvent.dataTransfer.getData("Text");
//    if (data) {
//      if (this.box) {
//        return this.box.onDragEnter(e);
//      }
//    }
//  };
  
  // register connections -- cardinal directions need to come first to make the walking algorithm not funky, so we use 2 passes
  for (var y = 0; y < yBoxes; y++) {
    for (var x = 0; x < xBoxes; x++) {
      // row above
      if (y > 0) {
        grid[x][y].addBox(grid[x][y-1]); // N
      }
      
      // this row
      if (x > 0) {
        grid[x][y].addBox(grid[x-1][y]); // W
      }
      if (x < xBoxes-1) {
        grid[x][y].addBox(grid[x+1][y]); // E         
      }
      
      // row below
      if (y < yBoxes-1) {
        grid[x][y].addBox(grid[x][y+1]); // S
      }      
    }
  }

  for (var y = 0; y < yBoxes; y++) {
    for (var x = 0; x < xBoxes; x++) {
      // row above
      if (y > 0) {
        if (x > 0) {
          grid[x][y].addBox(grid[x-1][y-1]); // NW
        }
        if (x < xBoxes-1) {
          grid[x][y].addBox(grid[x+1][y-1]); // NE         
        }
      }
      
      // row below
      if (y < yBoxes-1) {
        if (x > 0) {
          grid[x][y].addBox(grid[x-1][y+1]); // SW
        }
        if (x < xBoxes-1) {
          grid[x][y].addBox(grid[x+1][y+1]); // SE         
        }
      }      
    }
  }
}

function initializeHexGrid() {
  xBoxes = 8; //parseInt(variables['xBoxes']);
  yBoxes = 5; //parseInt(variables['yBoxes']);


  var r3 = Math.sqrt(3)/2.0;
  var boxWidth = cWidth/(xBoxes*1.6);
  var dy = boxWidth*r3;
  
//  alert(boxWidth+" "+dy);


  x1 = -lineWidth;
  y1 = -lineWidth;
  paper.setViewBox(x1,y1, cWidth, cHeight, false);

  
  for (var y = 0; y < (yBoxes+1)*2; y++) {
    for (var x = 0; x <= xBoxes*1.5; x++) {
      var xOff = 0;
      if (y % 2 == 0) {
        xOff = 0.5;
      }
      
      if ((x+(y%2)) % 3 == 0) {
        var idx = Math.floor(((y/2)-1)*xBoxes + x/3); // index of box 1 row above
      
      
        var newBox = null;

        // top horizontal line
        if (x < xBoxes*1.5) { // this is false on the right edge       
          if (y < yBoxes*2) { // no boxes under the bottom lines
            newBox = new Box(boxes.length, (xOff+x+0.5)*boxWidth, (y+1)*dy, boxWidth/2);
            boxes.push(newBox);
          }
                    
          
          var a = newBox; // below
          var b = null;
          if (y > 1) { // not top rows
            b = boxes[idx]; // 1 row above
          }

          lines.push( new Line(lines.length, a, b, (x+xOff)*boxWidth+gap,y*dy, (x+xOff+1)*boxWidth-gap, y*dy) );
        }
         
        // diagional / behind x 
        if (y < yBoxes*2+1 &&  // right edge
           (y > 0 || x < xBoxes*1.5) && // upper right corner
           (y < yBoxes*2 || x > 0) // lower left corner
           ) {
          
          
          var a = newBox; // lower right
          var b = null;
          if (y > 0 && x > 0) { // not top row nor first column
            b = boxes[idx+xBoxes/2 +(y%2)-1]; // upper left
          }

          lines.push( new Line(lines.length, a, b, (x+xOff-0.5)*boxWidth+gap/2, (y+1)*dy-gap*r3, (x+xOff)*boxWidth-gap/2, y*dy+gap*r3) );
        }

        // delme
        if (newBox == null) {
          newBox = boxes[0];
        }

        // diagional \ before x 
        if (y > 0) {
          var a = null;
          if (x < xBoxes*1.5) { // right side
            a = boxes[idx]; // upper right
          }
            
          var b = null;
          if (x > 0) { // left side
            b = boxes[idx+xBoxes/2 +(y%2)-1]; // lower left
          }
          
          lines.push( new Line(lines.length, a, b, (x+xOff-0.5)*boxWidth+gap/2, (y-1)*dy+gap*r3, (x+xOff)*boxWidth-gap/2, y*dy-gap*r3) );
        }
      }
    }
  }
}

function initializeTriGrid() {
  xBoxes = 11; //parseInt(variables['xBoxes']); // must be odd
  yBoxes = 6; //parseInt(variables['yBoxes']);  // must be even


  var r3 = Math.sqrt(3)/2.0;
  var boxWidth = (cWidth-lineWidth)/(xBoxes/2+1);
  var dy = boxWidth*r3;

  var height = lineWidth + dy*(yBoxes+1);
  if (height > cHeight) {
     dy = (cHeight-lineWidth)/(yBoxes+1); 
     boxWidth = dy/r3;
  }
  height = lineWidth + dy*(yBoxes);
  var width = lineWidth + boxWidth*(xBoxes+0.5)/2;

  x1 = -(cWidth-width)/2;
  y1 = -(cHeight-height)/2;
  paper.setViewBox(x1, y1, cWidth, cHeight, false);

  
//  alert(boxWidth+" "+dy);
  
  for (var y = 0; y <= yBoxes; y++) {
    for (var x = 0; x <= xBoxes/2 + (y % 2); x++) {
      var xOff = 0;
      if (y % 2 == 0) {
        xOff = 0.5;
      }
      
        var idx = Math.floor((y-1)*xBoxes + x*2 - xBoxes/2 - (y%2) + 1); // box above x,y
        if (y == 1) {
          idx = Math.floor(x-1);
        }
      
      
        var newBoxT = null; // new box above horizontal line
        var newBoxB = null; // new box below horizontal line



        // horizontal line
        if (x < xBoxes/2+(y%2)-1) { // this is false on the right edge       
        
          if (y > 0) { // no boxes under the bottom lines
            newBoxT = new Box(boxes.length, (xOff+x+0.5)*boxWidth, (y-0.333)*dy, boxWidth/6);
            boxes.push(newBoxT);
          }
          if (y < yBoxes) { // no boxes under the bottom lines
            newBoxB = new Box(boxes.length, (xOff+x+0.5)*boxWidth, (y+0.333)*dy, boxWidth/6);
            boxes.push(newBoxB);
          }
  
        
          lines.push( new Line(lines.length, newBoxT, newBoxB, (x+xOff)*boxWidth+gap,y*dy, (x+xOff+1)*boxWidth-gap, y*dy) );
        }
        
        // diagional / right of x 
        if ( y > 0 &&  // top
             x < xBoxes/2 // right
           ) {
          
          
          var a = newBoxT; // lower right -- not created on right side, no prob
          var b = boxes[idx]; // above x,y

          lines.push( new Line(lines.length, a, b, (x+xOff)*boxWidth+gap/2, (y)*dy-gap*r3, (x+xOff+0.5)*boxWidth-gap/2, (y-1)*dy+gap*r3) );
        }

        // diagional \ before x 
        if (y > 0 && (y % 2 == 0 || x > 0)) {
          var a = null;
          if (x < xBoxes/2) {
            a = boxes[idx]; // above x,y
          }
          
          // lower left dot
          var b = boxes[boxes.length-4]; // 2 before this move -- but we added 2 new boxes
          if (x - y%2 + 1 > xBoxes/2) { // right side
            b = boxes[boxes.length-2]; // 2 before this move -- but we didn't add 2 new boxes 
          } 
          if (y == yBoxes) { // bottom row
            b = boxes[boxes.length-2];  // we created 1
            if ( x > xBoxes/2-1) { // very last virtex
              b = boxes[boxes.length-1];
            }
          }
          if (x == 0 && y%2==0) {
            b = null;
          }
          lines.push( new Line(lines.length, a, b, (x+xOff-0.5)*boxWidth+gap/2, (y-1)*dy+gap*r3, (x+xOff)*boxWidth-gap/2, y*dy-gap*r3) );
        }
      }
    
  }
}


