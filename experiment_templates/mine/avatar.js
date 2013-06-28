// sprite src (image), width of sprite, number of avatars, number of positions
// each column is a different color, each row is a different position
// walkPositions is a looping array of which position to render while walking
// speed is the default speed in pixels
// action map converts an action to an icon first action is action 0
function AvatarFactory(src, width, num, positions, clip, walkPositions, speed, actionMap, paper) {
  
  var PAPER = paper;
  var SPRITE_SRC = src;
  var SW = width; // sprite width
  var SW2 = SW/2; // sprite width/2
  var S_IMG_W = SW*num; 
  var S_IMG_H = SW*positions; 
  var S_CLIP = clip;
  var WALK_POSITIONS = walkPositions;
  var ACTION_MAP = actionMap;
  var SPEED = speed;
  var SIZE = 15; // distance to target before triggering it
  
  // color is a number 0-num
  function Avatar(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.stance = 0;
    this.angle = 90;
    this.walkPosition = 0;
    this.speed = SPEED;
    this.active = true;
    this.currentlyOn = null;

    // call this periodically to make the avatar walk
    this.step = function() {
      if (!this.active) return;
      if (this.path.length > 0) {
        if ( this.moveToward(this.path[0]) ) {
          // we got there
          this.path.shift();
        }
      }
    };

    this.path = []; // list of coordinates items with an x,y
    this.setPath = function(path) {
      this.path = path;
    };
    this.walkTo = function(obj) {
      this.path = [obj];
    };
    
    this.addWaypoint = function(obj) {
      this.path.push(obj);
    };
    
    /**
     * return true to stop
     */
    this.steppedOn = function(obj) {
//      log("steppedOn:"+obj.id);
      return false;
    };
    
    
    // move towards this coordinate one step by this.speed
    // returns true when there
    this.moveToward = function(obj) {
//      log('moveToward('+x+','+y+')');
      var dx = obj.x-this.x;
      var dy = obj.y-this.y;
      var len = Math.sqrt(dx*dx+dy*dy);
      if (len < SIZE && this.currentlyOn != obj) {
        
        if (this.steppedOn(obj)) {
          this.currentlyOn = obj;
          return false;  
        }
        this.currentlyOn = obj;
      }
      
//      log('moveToward('+x+','+y+'):('+dx+','+dy+'):'+len);
      if (len < this.speed) {
        this.move(dx,dy);
        return true;
      }
      this.move(this.speed*dx/len, this.speed*dy/len);
      return false;
    };
    
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
      
      this.setLocation(this.x+x, this.y+y);
    };
    
    this.setLocation = function(x,y) {
//      log('setLocation('+x+','+y+')');
      this.x=x;
      this.y=y;
      this.update();
    };
    
    // change the stance to the action
    this.action = function(actionNum) {
      this.stance = ACTION_MAP[actionNum];
//      log("action("+actionNum+"):"+this.stance);
      this.update();
    };

    // update the on-screen state
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
    
    // draw a cartoon bubble
    this.say = function(text) {
      alert(text);
    };
    
    this.img = PAPER.image(SPRITE_SRC, 0, 0, S_IMG_W, S_IMG_H);
    this.update();
  };
  
  this.build = function(color, x, y) {
    return new Avatar(color,x,y);
  };
  
}
