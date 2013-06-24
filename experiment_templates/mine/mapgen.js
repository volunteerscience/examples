
function initializeSquareGrid() {
  xBoxes = 10; //parseInt(variables['xBoxes']);
  yBoxes = 10; //parseInt(variables['yBoxes']);
  

  var boxWidth  = (cWidth -lineWidth)/xBoxes;
  var boxHeight = (cHeight-lineWidth)/yBoxes;
  
  // make the boxes square
  boxWidth = Math.min(boxWidth,boxHeight);
  boxHeight = boxWidth;
  var w = boxHeight/2;
  var pts = [-w,-w, w,-w, w,w, -w,w];

  // center
  var width = boxWidth*xBoxes+lineWidth;
  var height = boxHeight*xBoxes+lineWidth*2;
  x1 = -(cWidth-width)/2;
  y1 = (cHeight-height)/2;
  paper.setViewBox(x1, y1, cWidth, cHeight, false);
  

  for (var y = 0; y <= yBoxes; y++) {
    for (var x = 0; x <= xBoxes; x++) {
      // add the box
      var newBox = null;
      if (x < xBoxes && y < yBoxes) {
        newBox = new Box(boxes.length, x*boxWidth+boxWidth/2, y*boxHeight+boxHeight/2,boxWidth/4, pts);
        boxes.push(newBox);
      }
      
//      // horizontal line
//      if (x < xBoxes) {
//        var a = newBox; // the box below the line
//        var b = null;
//        if (y > 0) {
//          b = boxes[x + (y-1)*xBoxes]; // the box above the line
//        }
//        lines.push( new Line(lines.length, a, b, x*boxWidth+gap, y*boxWidth,  (x+1)*boxWidth-gap, y*boxWidth) );
//      }
//      
//      // vertical line
//      if (y < yBoxes) {
//        var a = newBox; // the box to the right of the line
//        var b = null;
//        if (x > 0) {
//          b = boxes[x-1 + y*xBoxes];
//        }
//        lines.push( new Line(lines.length, a, b, x*boxWidth, y*boxWidth+gap, x*boxWidth, (y+1)*boxWidth-gap) );
//      }
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


