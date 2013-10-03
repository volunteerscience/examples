// sprite src (image), width of sprite, number of avatars, number of positions
// each column is a different color, each row is a different position
// walkPositions is a looping array of which position to render while walking
// speed is the default speed in pixels
// action map converts an action to an icon first action is action 0
function AvatarFactory(src, width, num, positions, clip, walkPositions, speed, actionMap, paper) {
  var factory = this;
  
  
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
  this.SCALE = 1;
  this.width = width;
  
  this.setPaper = function(paper) {
    PAPER = paper;
  }
  
  // color is a number 0-num
  function Avatar(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.stance = 0;
    this.angle = 0;
    this.walkPosition = 0;
    this.speed = SPEED;
    this.active = true;
    this.currentlyOn = null;
    this.scale = factory.SCALE;
    var me = this;

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
    
    /**
     * this is called every from moveToward(obj), 
     * to see if the avatar can still step on this item --- or get any closer
     * it will just wait until it can, if it cant
     * return true to stop
     */
    this.canMoveToward = function(obj, dist) {
      return true;
    };
    
    
    this.onMouseDown = function(e) {
//      log("avatar onMouseDown:"+me.currentlyOn);
      // passthrough
      if (me.currentlyOn != null && typeof me.currentlyOn.onMouseDown == 'function') {
        me.currentlyOn.onMouseDown(e);
      }
    }

    
    // move towards this coordinate one step by this.speed
    // returns true when there
    this.moveToward = function(obj) {
//      log('moveToward('+x+','+y+')');
      var dx = obj.x-this.x;
      var dy = obj.y-this.y;
      var len = Math.sqrt(dx*dx+dy*dy);
      if (this.currentlyOn != obj) {
        if (!this.canMoveToward(obj, len)) {
          return false;
        }
        
        if (len < obj.r) {
          if (this.steppedOn(obj)) {
            this.currentlyOn = obj;
            return false;  
          }
          this.currentlyOn = obj;
        }
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
//      var cr = ((this.x-SW2+S_CLIP)*this.scale)+" "+((this.y-SW2+S_CLIP)*this.scale)+" "+((SW-2*S_CLIP)*this.scale)+" "+((SW-2*S_CLIP)*this.scale);

      this.img.attr({
  //    this.img.animate({
         "clip-rect" : cr,
         "transform" : 
           "t"+(this.x-SW2-SW*(this.color))+","+(this.y-SW2-SW*this.stance) +
           "r"+this.angle+","+rx+","+ry+
           "s"+this.scale+","+this.scale
      });
    }
    
    this.bubble = null;
    this.clearSay = function() {
      if (this.bubble != null) {
        this.bubble.clear();
        this.bubble = null;
      }
    }
    
    // draw a cartoon bubble
    this.say = function(text) {
      this.clearSay();
      this.bubble = new Bubble(text,this.x,this.y);
    };
    
    this.img = PAPER.image(SPRITE_SRC, 0, 0, S_IMG_W, S_IMG_H);
    
    this.img.mousedown(this.onMouseDown);   
    
    this.update();
  };
  
  this.build = function(color, x, y) {
    return new Avatar(color,x,y);
  };
  
  // text is an array of strings
  function Bubble(text,x,y) {
    x += Math.random()*6-3; // fix problem with the raphael caching bounding box, also to highlight a change
    y += Math.random()*6-3; // fix problem with the raphael caching bounding box, also to highlight a change
    var me = this;
    var H = 25; // text height
    var set = PAPER.set();
    
    var txt = [];
    var startY = y - text.length*H - 20;
    var minX = 100000;
    var minY = 100000;
    var maxW = -100;
    for (var i in text) {
      var t = PAPER.text(x,startY,text[i]).attr({
        'text-anchor': 'middle', 
        'font': PAPER.getFont("Vegur"), 
        'font-size': 20, 
        "fill":"#000000"
          });
      txt.push(t);
      startY += H;
      
      var bbox = t.getBBox();
      if (minX > bbox.x) {
        minX = bbox.x;
      }
      if (minY > bbox.y) {
        minY = bbox.y;
      }
      if (maxW < bbox.width) {
        maxW = bbox.width;
      }
      set.push(t);
    }
    
    var rect = PAPER.rect(minX-3,minY-3,maxW+6,text.length*H+6,10).attr({"fill" : "#FFFFFF", "stroke" : "#000000"});
    set.push(rect);

    var cleared = false;
    this.clear = function() {
      if (cleared) return;
      cleared = true;
      
      set.remove();
    };
    
    this.click = function(e) {
      me.clear();
    };
    
    for (var i in txt) {
      txt[i].toFront();
      txt[i].click(this.click);
    }
    rect.click(this.click);
    
    this.fit = function() {
      var bbox = rect.getBBox();
      var dx = 0;
      var dy = 0;
      if (bbox.x + bbox.width > PAPER._viewBox[0] + PAPER._viewBox[2]) { // hanging over the right side
        dx = (PAPER._viewBox[0] + PAPER._viewBox[2]) - (bbox.x + bbox.width);
      }
      
      if (bbox.x < PAPER._viewBox[0]) { // hanging over the left side
        dx = PAPER._viewBox[0] - bbox.x;
      }

      
      if (bbox.y + bbox.height > PAPER._viewBox[1] + PAPER._viewBox[3]) { // hanging over the bottom
        dy = (PAPER._viewBox[1] + PAPER._viewBox[3]) - (bbox.y + bbox.height);
      }
      
      if (bbox.y < PAPER._viewBox[1]) { // hanging over the top side
        dy = PAPER._viewBox[1] - bbox.y;
      }

      
      
      if (dx != 0 || dy != 0) {
        set.transform("T"+dx+","+dy);
      }
    }
    
    this.fit();
  };
}

