// sprite src (image), width of sprite, number of avatars, number of positions
// each column is a different color, each row is a different position
// walkPositions is a looping array of which position to render while walking
// action map converts an action to an icon first action is action 0
function AvatarFactory(src, width, num, positions, clip, walkPositions, actionMap, paper) {
  
  var PAPER = paper;
  var SPRITE_SRC = src;
  var SW = width; // sprite width
  var SW2 = SW/2; // sprite width/2
  var S_IMG_W = SW*num; 
  var S_IMG_H = SW*positions; 
  var S_CLIP = clip;
  var WALK_POSITIONS = walkPositions;
  var ACTION_MAP = actionMap;
  
  // color is a number 0-num
  function Avatar(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.stance = 0;
    this.angle = 90;
    this.walkPosition = 0;
    
    this.action = function(actionNum) {
      this.stance = ACTION_MAP[actionNum];
      this.update();
    }
    
    this.move = function(x,y) {
      
      // choose the position
      this.walkPosition++;
      if (this.walkPosition >= WALK_POSITIONS.length) {
        this.walkPosition = 0;
      }
      this.stance = WALK_POSITIONS[this.walkPosition];

      // calculate the angle
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
      
      
      this.setLocation(this.x+x, this.y+y);
    }
    
    this.setLocation = function(x,y) {
      this.x=x;
      this.y=y;
      this.update();
    }
    
    this.update = function() {
      // rotate around me
      var rx = SW2+(this.color)*SW;
      var ry = SW2+(this.stance)*SW;
  
      var cr = (this.x-SW2+S_CLIP)+" "+(this.y-SW2+S_CLIP)+" "+(SW-2*S_CLIP)+" "+(SW-2*S_CLIP);
      this.img.attr({
  //    this.img.animate({
         "clip-rect" : cr,
         "transform" : 
           "t"+(this.x-SW2-SW*(this.color))+","+(this.y-SW2-SW*this.stance) +
           "r"+this.angle+","+rx+","+ry
      });
    }
    
    //  alert(SPRITE_SRC);
  //  this.img = paper.image(SPRITE_SRC, x-SW2, y-SW2, S_IMG_W, S_IMG_H);
    this.img = PAPER.image(SPRITE_SRC, 0, 0, S_IMG_W, S_IMG_H);
    this.update(); //.attr({"clip-rect" : "0 0 48 48"});
  }
  
  this.build = function(color, x, y) {
    return new Avatar(color,x,y);
  }
}
