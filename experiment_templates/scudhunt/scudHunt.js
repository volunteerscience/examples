/**
 * 
 */
var MAP_WIDTH = 420;
var MAP_HEIGHT = 420;

var REGION_BACKGROUND_COLOR = "#c7d4e7";

var paper = null;

// initialized in initializeUnits;
var num_roles = 4;
var roleUnits = new Array();
var unitAvatarFactory = null;

function Region(id,name, x,y,polygon) {
  var me = this;
  this.id = id;
  this.name = name;
  
  this.x = x;
  this.y = y;
  this.polygon = polygon;
  
  polygon.attr('fill',REGION_BACKGROUND_COLOR);
  this.onClick = function() {
//    alert(id+" "+name+" ("+me.x+","+me.y+")");
    roleUnits[1][0].avatar.setLocation(me.x, me.y);
//    roleUnits[1][0].avatar.update();
  }
  
  polygon.click(this.onClick);  
}

function Unit(id, ownerId, name, icon, avatarId) {
  this.id = id;
  this.ownerId = ownerId; // role that owns it
  this.name = name;
  this.icon = icon;
  this.avatarId = avatarId;
  
  roleUnits[ownerId].push(this);
  
  
  this.buildAvatar = function(avatarFactory) {
    this.avatar = avatarFactory.build(avatarId,-100,-100); // build avatar off screen
  }
}

function initialize() {
  initializeUnits();
//  alert(roleUnits[1][0].name);
  initializeGameBoard();
}

function initializeGameBoard() {
  paper = Raphael("canvas", MAP_WIDTH, MAP_HEIGHT);
  paper.clear();
  buildSquareMap(5,5);
  initializeAvatars();
}

function initializeAvatars() {
  unitAvatarFactory.SCALE = REGION_WIDTH/unitAvatarFactory.width; //0.6;
  unitAvatarFactory.setPaper(paper);
  var factory = new AvatarFactory()
  for (var units_idx in roleUnits) {
    var units = roleUnits[units_idx];
    for (var unit_idx in units) {
      var unit = units[unit_idx];
      unit.buildAvatar(unitAvatarFactory);
    }
  }  
}

