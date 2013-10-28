/**
 * communication features
 */
var playerChat = true; // players can chat
var allyUnitPlacement = true; // can see ally's unit placement if it remains on map, and in history
var realTimeUnitPlacement = true; // can see ally's unit placement as they do it -- in other words, for the current turn
var localSitRep = true; // situation reports show your local reports (overridden if global is true)
var globalSitRep = true; // situation reports show everyone's reports
var localMapScans = true; // show your assets' scans on the map
var globalMapScans = true; // show everyone's assets' scans on the map (overrides local)
var cumulativeMapScans = true; // if true, current round shows cumulation of all scans so far, not just yesterday
var allowMapHistory = true; // allow players to view previous states of the board
var showNumberOfRounds = true;  // do we tell the players how many rounds they have?
var showNumberOfTargets = true;  // do we tell the players how many targets they have?
var allowGroupTargetPlace = true; // true if the group decides where the targets go
var roundDuration = 90;
var numRows = 5;
var numCols = 5;

var MAP_WIDTH = 440;
var MAP_HEIGHT = 420;

var ROUND_ZERO = 100;
var FIRST_ACTUAL_ROUND = 101;

var REGION_BACKGROUND_COLOR = "#c7d4e7";
var REGION_SELECTION_COLOR = "#b7e4d7";
var REGION_FAIL_COLOR = "#f7d4e7";

var ASSET_BACKGROUND_COLOR = REGION_BACKGROUND_COLOR;
var ASSET_SELECTION_COLOR = REGION_SELECTION_COLOR;
var ASSET_HOVER_COLOR = REGION_FAIL_COLOR;
var ASSET_WAIT_COLOR = "#dddddd";

var paper = null;
var selectedUnit = null;

// initialized in initializeUnits;
var TARGET_ROLE = 0;
var num_roles = 4;
var roleUnits = new Array(); // units indexed by role, then first/second etc
var unitAvatarFactory = null;
var units = new Array(); // unit indexed by id
var instructionAssets = [] // array of assets
var ROUND_NOUN = "Round"; // what you call a Round: Day, Hour, Turn... etc
var ROUND_NOUN_PLURAL = "Rounds"; 
var TARGET_NOUN = "Target"; 
var TARGET_NOUN_PLURAL = "Targets";
var numRounds = 5;
var numTargets = 4;
var choiceAvatarId = 1; // what to render as the user's choice

var roleToPlayer = new Array();
var roleName = new Array();

function getUnits(playerId) {
  var ret = [];
  for (var role = 1; role <= num_roles; role++) {
    if (roleToPlayer[role] == playerId) {
      ret = ret.concat(roleUnits[role]);
    }
  }

  return ret;
}

function getFirstRole(playerId) {
  for (var role = 1; role <= num_roles; role++) {
    if (roleToPlayer[role] == playerId) {
      return role;
    }
  }
  return -1;
}

var VALUE_NOTHING = 0;
var VALUE_DECOY = 1;
var VALUE_TARGET = 2;
var VALUE_DISPLAY = ['0','?','X'];
var VALUE_COLOR = ['#44CC44','#FFFF44','#CC4444'];


var popupDelay = null;
function hidePopup(delay) {
  popup.txt.hide();
  popup.hide();
  clearInterval(popupDelay);
  popupDelay = null;
}

function showPopup(x,y,txt,delay) {
  if (delay > 0) {
    if (popupDelay != null) {
      clearInterval(popupDelay);
      popupDelay = null;
    }
    popupDelay = setInterval(function() {
      showPopup(x,y,txt,0);     
    }, delay);
    return;
  }

  if (inInstructions) {
    instructionShowPopup(txt);
  }
  
//  log("showPopup("+x+","+y+")");
  popup.txt.transform('T'+x+','+y);
  popup.txt.attr({text: txt});
  var boundsOrig = popup.txt.getBBox();
  var bounds = {
      x: boundsOrig.x-5, 
      y: boundsOrig.y-3, 
      width: boundsOrig.width+10,
      height: boundsOrig.height+6
  };
  
  var newX = x;
  var newY = y;
  if (bounds.x < 20) {
    newX = x+(20-bounds.x);
  } else if (bounds.x+bounds.width > MAP_WIDTH-20) {
    newX = x-(bounds.x+bounds.width - (MAP_WIDTH-20));
  }
  
  if (bounds.y < 20) {
    newY = y+(20-bounds.y);
  } else if (bounds.y > MAP_HEIGHT-20) {
    newY = y-(bounds.y - (MAP_HEIGHT-20));
  }

  if (newX != x || newY != y) {
    showPopup(newX,newY,txt,0);
    return;
  }
  
  popup.attr(bounds);
  popup.toFront();
  popup.txt.toFront();
  popup.show();
  popup.txt.show();
}

var STATI_PER_ROW = 4;
var STATI_PER_COL = 4;

function Region(id,name, x,y, x1,y1, polygon) {
  var me = this;
  this.id = id;
  this.name = name;
  
  this.x = x;
  this.y = y;
  this.polygon = polygon;
  this.status = []; // text element on the region: 0,?,X
  this.addStatus = function(letter, unitName) {
    // tX, tY are where the letter goes, based on how many there are already
    var xOff = Math.floor(this.status.length/(STATI_PER_ROW*STATI_PER_COL))*10; // if we fill up the whole square, start putting more in between the letters
    var tX = x1 + xOff +// left side
      20*(this.status.length % STATI_PER_ROW); // this makes the text word wrap
    var tY = 10+y1 + // top
      20* (Math.floor(this.status.length/STATI_PER_ROW) % STATI_PER_COL);

    // add a new txt element
    var txt = paper.text(tX,tY,letter).attr({'text-anchor': 'start', 'font-size': '20px', 'font-weight':'bold', 'fill': VALUE_COLOR[VALUE_DISPLAY.indexOf(letter)]});

    // this is the popup behavior to determine which unit claimed the status
    txt.click(function() {
      if (selectedUnit == null) {
        var dY = -30;
        if (me.row == 0) {
          dY = 30;
        }
        showPopup(tX,tY+dY,unitName,0);
      } else {
        me.onClick();
      }
    });
    txt.mouseover(function() {
      if (selectedUnit == null) {
        var dY = -30;
        if (me.row == 0) {
          dY = 30;
        }
        showPopup(tX,tY+dY,unitName,700);
      } else {
        me.mouseOver();
      }      
    });
    txt.mouseout(function() {
      if (selectedUnit == null) {
        hidePopup(0);
      }
    });
    
    this.status.push(txt);
  }

  
  this.groups = new Array(); // the groups I belong to -- ROW, COL, etc
  this.value = VALUE_NOTHING;
  
  polygon.attr('fill',REGION_BACKGROUND_COLOR);
  this.onClick = function() {
    if (selectedUnit != null) {
      if (selectedUnit.effect(me).length == 0) {
        if (inInstructions) {
          if (instructionCantMove(selectedUnit, me)) {
            return;
          } 
        }
        alert(selectedUnit.cantMoveAlert(me));
        return;
      }
      
      if (!inInstructions) {
        submit('<place unit="'+selectedUnit.id+'" region="'+me.id+'"/>');
        showCurrentBoard();
      }
      selectedUnit.setNextRegion(me);

      deselectAllUnits();
    }
  };
  
  this.onMouseDown = this.onClick;
  
  this.mouseOver = function() {
    // highlight effected squares
    if (selectedUnit != null) {
      clearRegionHighlights();
      selectedUnit.showEffect(me);
    }
  };

  this.mouseOut = function() {
    if (selectedUnit != null) {
      clearRegionHighlights();
      if (selectedUnit.nextRegion != null) {
        selectedUnit.showEffect(selectedUnit.nextRegion);        
      }
    }
  }
  
  this.highlight = function(enable) {
    if (enable) {
      polygon.attr('fill', REGION_SELECTION_COLOR);
    } else {
      polygon.attr('fill', REGION_BACKGROUND_COLOR);      
    }
  };
  
  this.markInvalid = function() {
    polygon.attr('fill', REGION_FAIL_COLOR);
  }
  
  polygon.click(this.onClick);  
  polygon.mouseover(this.mouseOver);  
  polygon.mouseout(this.mouseOut);  
}


function clearRegionHighlights() {
  for (idx in regions) {
    var region = regions[idx];
    region.highlight(false);
  }
}

function clearRegionStatus() {
  for (idx in regions) {
    var region = regions[idx];
    for (var s in region.status) {
      region.status[s].remove();
    }
    region.status = []; 
  }
}


function isMyUnit(unit) {
  return roleToPlayer[unit.ownerId] == myid;
}

/**
 * 
 * @param id
 * @param ownerId
 * @param name
 * @param short_description
 * @param long_description
 * @param icon
 * @param avatarId
 * @param reportTable[actual][result_prob] --         
 *         actual  0  ?  X
 * report
 *   0           
 *   ?
 *   X
 * @returns                 
 *                   
 */
function Unit(id, ownerId, name, short_description, long_description, icon, avatarId, reportTable) {
  var unitMe = this;
  units[id] = this;
  this.id = id;
  this.ownerId = ownerId; // role that owns it
  this.name = name;
  this.icon = icon;
  this.avatarId = avatarId;
  this.short_description = short_description;
  this.long_description = long_description;
  this.reportTable = reportTable;
  this.wait = 0;
  this.remainsOnBoard = false; // set this to true for all assets that stay on the board after a turn
  this.waitString = "Dead";
  
  roleUnits[ownerId].push(this);
  
  this.currentRegion = null; // which region I'm at
  this.nextRegion = null; // which region I'll go to next
  
  this.buildAvatar = function(avatarFactory) {
    this.avatar = avatarFactory.build(avatarId,-100,-100); // build avatar off screen
    this.avatar.origMouseDown = this.avatar.onMouseDown;
    this.avatar.onMouseDown = function(e) {
      if (selectedUnit == null) {
        if (isMyUnit(unitMe) || unitMe.ownerId == TARGET_ROLE) {
          unitMe.select();
          return;
        }
      }
      unitMe.avatar.origMouseDown(e);
    }
    
    // unbind the original
    this.avatar.img.unmousedown(this.avatar.origMouseDown);
    this.avatar.img.mousedown(this.avatar.onMouseDown);   
  };
  
  this.select = function() {
    deselectAllUnits();
    if (currentRound == FIRST_ACTUAL_ROUND+numRounds) {
      if (this.ownerId != TARGET_ROLE) return; // on target selection round, only targets may be moved
    } else if (currentRound > FIRST_ACTUAL_ROUND+numRounds) {
      return; // no units may be moved
    }
    if (submitted) return;
    selectedUnit = this;
    this.avatar.img.toFront();
    $('.asset[asset="'+this.id+'"]').css('background-color',ASSET_SELECTION_COLOR);
    if (this.nextRegion != null) {
      clearRegionHighlights();
      this.showEffect(this.nextRegion);
    }
  };
  
  this.clearLocation = function() {
//    log(this.id+" clearLocation");
    this.avatar.currentlyOn = null;
    this.avatar.setLocation(-200, -200);    
  }
  
  this.setLocation = function(region) {
    if (region == null) {
      log(this.id+" null");
      this.clearLocation();
      return;
    }
    if (allyUnitPlacement || isMyUnit(unitMe)) {
      log(this.id+" "+region.id);
      this.avatar.currentlyOn = region;
      this.avatar.setLocation(region.x, region.y);
    }
  }
  
  this.setNextRegion = function(region) {
//    log(this.id+".setNextRegion("+region+")");

    if (inInstructions) {
      if (instructionSetNextRegion(this,region)) {
        return;
      }
    }

    
    this.nextRegion = region;
    if (region == null) {
      this.clearLocation();
      this.setStatus("");
    } else {
      this.setStatus(region.name);
      if (this.ownerId == TARGET_ROLE && !inInstructions && !$("#currentRound").hasClass('selectedTab')) return; // if target moves, only change it on if we're on the currentRoundTab
      this.setLocation(region);
    }
    
  };
  
  this.setCurrentRegion = function(region) {
    log(this.id+".setCurrentRegion("+region+")");
    this.currentRegion = region;
    if (this.remainsOnBoard) {
      if (this.wait == 0) {
        this.setNextRegion(region);
      }
    }
  }
  
  this.setStatus = function(status) {
    $('.asset[asset="'+this.id+'"] .status').html(status);    
  }
  
  // override me if unit affects more regions than self, return row, col, etc
  this.effect = function(region) {
    return [region];
  };
  
  this.showEffect = function(region) {
    var regions = this.effect(region);
    for (idx in regions) {
      var r = regions[idx];
      r.highlight(true);
    }
    if (regions.length == 0) {
      region.markInvalid();
    }
  };
  
  /**
   * Calculate if the unit should wait next turn.
   */
  this.doWait = function(region) {
    return 0;
  };
  
  this.setWait = function(wait) {
    var needResurrect = false;
    if (wait == 0 && this.wait != 0) {
      needResurrect = true;
    }
    this.wait = wait;
    
    if (needResurrect) {
      this.resurrect();
    }

    if (this.wait == 0) {
      // enable button
      $('.asset[asset="'+this.id+'"]').css('background-color',ASSET_BACKGROUND_COLOR); // enable button
    } else {
      // disable button      
      var myUnits = getUnits(myid);
      $('.asset[asset="'+this.id+'"]').css('background-color',ASSET_WAIT_COLOR); // disable button
    }
    this.setWaitStatus(wait);
  }
  
  this.setWaitStatus = function(wait) {
    if (wait == 0) {
      this.setStatus("");
    } else {
      this.setStatus(this.waitString);
    }
  }
  
  this.doSensor = function(region) {
    return getReport(region.value, this.reportTable);
  };
  
  /**
   * each is a list of region names
   */
  this.buildSituationReport = function(no, possible, confirmed, wait) {
    var ret = [];
    var madeMove = false;
    if (no.length > 0) {
      ret.push("No target at "+no.join(","));
      madeMove = true;
    }
    if (possible.length > 0) {
      ret.push("Possible target at "+possible.join(","));
      madeMove = true;
    }
    if (confirmed.length > 0) {
      ret.push("Target confirmed at "+confirmed.join(","));
      madeMove = true;
    }
    
    var waitRep = this.buildWaitReport(madeMove, wait);
    if (waitRep != null) {
      ret.push(waitRep);
    }
    return ret;
  };
  
  /**
   * note: you can compare the unit's current wait status to decide what to do
   * 
   * @madeMove: true if they were on the board last time and found anything 
   * @wait: the new wait status
   */
  this.buildWaitReport = function(madeMove, wait) {
    if (wait != this.wait) {
      if (wait == 0) {
        return "Reporting for duty.";
      } if (wait < 0) {
        return this.waitString;
      } if (wait > 0) {
        if (wait == 1) {
          return "Will be ready next turn.";
        } else {
          return "Will be ready in "+wait+" turns.";
        }
      }
    }
    return null;
  }
  
  this.initTurn = function() {
    if (this.wait != 0) {
      this.currentRegion = null;
    }
  };
  
  this.resurrect = function() {
    this.setStatus("");
  };
  
  this.cantMoveAlert = function(region) {
    return "You can't move the "+this.name+" to this region.";
  };
}

/**
 * return the report from the table
 * @param actual
 * @param table
 * @returns 0, 1, or 2
 */
function getReport(actual, table) {
  var possibilities = table[actual];
  var roll = Math.random();
  
  var totalChance = 0;
  for (var ret = 0; ret <= 2; ret++) {
    totalChance+=table[actual][ret];
    if (roll < totalChance) {
      return ret;
    }
  }
  return 2;
}

function deselectAllUnits() {
  $('.asset').each(function() {
    var unitId = $(this).attr('asset');
    var unit = units[unitId];
    if (unit.wait == 0) {
      $(this).css('background-color',ASSET_BACKGROUND_COLOR); 
    } else {
      $(this).css('background-color',ASSET_WAIT_COLOR); 
    }
  });
  selectedUnit = null;
  clearRegionHighlights();  
}

function assignPlayersRoundRobin() {
  roleToPlayer = new Array();
  var pid = 1;
  for (var r = 1; r <= num_roles; r++) {
    roleToPlayer[r] = pid;
    pid++;
    if (pid > numPlayers) {
      pid = 1;
    }
  }
}


function initialize() {
  for (var r = ROUND_ZERO; r <= FIRST_ACTUAL_ROUND+numRounds; r++) { // also the submission round
    commandHistory[r] = new Array();
  }

  initializeUnits(1);
  
  assignPlayersRoundRobin();
  
//  alert(roleUnits[1][0].name);
  initializeGameBoard();
  
  runAllInstructions();
}


function initializeGameBoard() {
  if (paper == null) {
    paper = Raphael("canvas", MAP_WIDTH, MAP_HEIGHT);
  }
  paper.clear();
  popup = paper.rect(0,0,50,30,5).attr({'fill':'#CCCCCC','opacity':0.5});
  popup.hide();
  popup.txt = paper.text(0,0,"").attr({'text-anchor': 'middle', 'font-size': '20px', 'font-weight':'bold', 'fill': '#222222'});
  popup.txt.hide();
  
  buildSquareMap(numRows, numCols, numTargets, 0);
  if (myid == 1) {
    submit('<game targets="'+targetRegions+'"/>');
  }
  initializeHistory();
  initializeAvatars();
  initChat();
  initScrollPane();
  startAnimation();
}

function initializeHistory() {
  $('#roundHistory').html('<span id="currentRound" class="roundTab selectedTab" onclick="showCurrentBoard();">Current</span>');
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

function initializeMyAssets() {
  var myUnits = getUnits(myid);
  initializeAssets(myUnits);
}

function initializeAssets(myUnits) {
  var assetWrapper = $('#assets');
  assetWrapper.html("");
  for (idx in myUnits) {
    var unit = myUnits[idx];
    var assetDiv = assetWrapper.append(
        '<div class="asset" asset="'+unit.id+'" title="'+unit.long_description+'"><img src="'+unit.icon+'"/>'+
          '<div class="status">'+(unit.nextRegion == null ? "" : unit.nextRegion.name)+'</div>'+
          '<p class="heading">'+unit.name+'</p><p>'+unit.short_description+'</p></div>');
  }
  $('.asset').click(function() {
    var unitId = $(this).attr('asset');
    var unit = units[unitId];
    if (unit.wait != 0) {
      return;
    }
    unit.select();
  });
  $('.asset').hover(function() {    
    var unitId = $(this).attr('asset');
    var unit = units[unitId];
    if (unit.wait != 0) {
      $(this).css('background-color',ASSET_WAIT_COLOR);
      return;
    }
    
    if (selectedUnit != null && $(this).attr('asset') == selectedUnit.id) {
      $(this).css('background-color',ASSET_SELECTION_COLOR);       
    } else {
      $(this).css('background-color',ASSET_HOVER_COLOR);           
    }
  },function() {
    var unitId = $(this).attr('asset');
    var unit = units[unitId];
    if (unit.wait != 0) {
      $(this).css('background-color',ASSET_WAIT_COLOR); 
      return;
    }
    
    if (selectedUnit != null && $(this).attr('asset') == selectedUnit.id) {
      $(this).css('background-color',ASSET_SELECTION_COLOR);       
    } else {
      $(this).css('background-color',ASSET_BACKGROUND_COLOR); 
    }
  });
}

/**
 * maps round => role => list of commands
 */
var commandHistory = new Array();
var submitted = false;
var guess = new Array();
function submitMove() {
  if (inInstructions) {
    instructionSubmitMove();
    return;
  }
  
  if (submitted) return;
  submitted = true;
  if (currentRound-ROUND_ZERO > numRounds) {
    $('#go').fadeOut();
    $("#playerControls").fadeOut();
    $("#q1").fadeIn();
    return;
  }  
  
  $('#go').html("Waiting for Team");
  
  Math.seedrandom(seed*myid*(currentRound+7));
  var submission = "";
  var myUnits = getUnits(myid);

  for (idx in myUnits) {
    var unit = myUnits[idx];
    var wait = unit.wait;
    if (unit.nextRegion == null ) {
      if (unit.wait > 0) {
        wait = unit.wait-1;
      }
      if (unit.remainsOnBoard && unit.currentRegion != null && unit.wait == 0) {
        unit.nextRegion = unit.currentRegion;
      }
    }
    
    // NOTE: previous block can set nextRegion
    if (unit.nextRegion == null ) {
      // submit the no-op
      submission+='<command unit="'+unit.id+'" wait="'+wait+'"/>';
    } else {
      var scanned = unit.effect(unit.nextRegion);
      var id_str = [];
      var result_str = [];
      for (var r_idx in scanned) {
        var reg = scanned[r_idx];
        var result = unit.doSensor(reg);
        id_str.push(reg.id);
        result_str.push(VALUE_DISPLAY[result]);
      }
      var wait = unit.doWait(unit.nextRegion);
      submission+='<command unit="'+unit.id+'" region="'+unit.nextRegion.id+'" scan="'+id_str.join(",")+'" result="'+result_str.join(",")+'" wait="'+wait+'"/>';
    }
  }
  
  submit(submission);
}

function q1(confidence) {
  var submission ='<confidence value="'+confidence+'"/>';
  for (idx in roleUnits[TARGET_ROLE]) {
    var unit = roleUnits[TARGET_ROLE][idx];
    if (unit.nextRegion != null) {
      submission+='<target unit="'+unit.id+'" region="'+unit.nextRegion.id+'"/>';
      guess.push(unit.nextRegion.id);
    }
  }
  submit(submission);
  $("#q1").html('<h2>Waiting for team.</h2>');
}

function showAirstrike() {
  $("#q1").fadeOut();
  
  var targetCtr = 0;
  for (idx in regions) {
    var region = regions[idx];
    if (region.value == VALUE_TARGET) {
      var unit = roleUnits[TARGET_ROLE][targetCtr++]
      if (typeof unit != "undefined") {
        // place the targets in the actual locations
        if (unit.nextRegion != null) {
          unitAvatarFactory.build(choiceAvatarId,unit.nextRegion.x, unit.nextRegion.y);
        }
        unit.setNextRegion(region);
      }
    }
  }
}

/**
 * to handle refresh, get all the previous moves
 * @param round
 */
function roundInitialized(round) {
  for (var participant in initialMovesOfRound) {
    for (var index = 0; index < initialMovesOfRound[participant]; index++) {
      fetchMove(participant, round, index, fetchResponse);
    }
  }
}

/**
 * if someone drops out durning the instructions, submit a ready for them
 */
function playerDisconnect(playerNum) {
//alert('playerDisconnect '+playerNum);

  // see if I have the lowest live id
  for (var i = 1; i < myid; i++) {
    if (activePlayers[i]) {
      // someone lower than me is still active
      return;
    }
  }
  // get past the instructions; TODO: activate bot
  if (currentRound < ROUND_ZERO) {
    submitBot(playerNum, currentRound, '<ready />');
  }
}


function fetchResponse(val,participant,round,index) {
  var tagName = $(val).prop("tagName");
//  log("fetchReturn("+tagName+" r:"+round+") cr:"+currentRound);
  if (tagName == "COMMAND" || tagName == "CONFIDENCE"|| tagName=="READY") {
    // this contains 1 or more commands
    if (typeof commandHistory[round][participant] === "undefined") {
      commandHistory[round][participant] = val; // don't allow repeat moves
    }
    if (participant == myid && round == currentRound) {
      $('#go').html("Waiting for Team");
      submitted = true;
    }
    var done = true;
    for (var pid = 1; pid <= numPlayers; pid++) {
      if (typeof commandHistory[currentRound][pid] === "undefined") {
        done = false;
        break;
      }
    }
    
    if (done) {
      endRound();
    }
  } else if (tagName == "PLACE") {
    if (currentRound > ROUND_ZERO+numRounds) {
      // target choosing round
      if (!allowGroupTargetPlace) return; // don't show the unit placement
    } else {
      // normal round
      if (!realTimeUnitPlacement) return; // don't show the unit placement
    }
    var place = $(val);
    var unit = units[place.attr('unit')];
    if (isMyUnit(unit)) return;  // prevent feedback
    var region_id = place.attr('region');
    var region = null;
    if (region_id != "") {
      region = regions[region_id];
    }
    log("place:"+unit.id+" "+region);
    if (round == currentRound) {
      unit.setNextRegion(region);
    }
  }
}

/**
 * Wait until we got a command move from everyone in the round.
 * 
 * @param participant
 * @param index
 */
function newMove(participant, index, round) {
//  log("newMove("+participant+" i:"+index+" r:"+round+") cr:"+currentRound);
  fetchMove(participant, currentRound, index, fetchResponse);
}

function endRound() {
  if (currentRound < FIRST_ACTUAL_ROUND) {
    clearInstructions();
    setRound(FIRST_ACTUAL_ROUND);
    initRound();
    return;
  }

  if (currentRound > ROUND_ZERO+numRounds) {
    showCurrentBoard();
    showAirstrike();
    setRound(currentRound+1);
    return;
  }
  
  if (allowMapHistory) {
    addRoundTab(currentRound-ROUND_ZERO);
  }
  setRound(currentRound+1);
  if (globalMapScans) {
    updateBoardFromCommands(commandHistory[currentRound-1]);
  } else if (localMapScans) {
    updateBoardFromCommands([commandHistory[currentRound-1][myid]]);
  }
  if (globalSitRep) {
    addSituationReports(commandHistory[currentRound-1]);
  } else if (localSitRep) {
    addSituationReports([commandHistory[currentRound-1][myid]]);
  }
  initRound();
  if (currentRound <= ROUND_ZERO+numRounds) {
    updateUnitFromCommands(commandHistory[currentRound-1]);
  }
}


function addRoundTab(round) {
  $('#currentRound').before('<span round="'+round+'" class="roundTab" onclick="showBoardFromRound('+round+');">'+round+'</span>')
}

function showBoardFromRound(round) {
  $(".roundTab").removeClass('selectedTab'); 
  $('.roundTab[round="'+round+'"]').addClass('selectedTab'); 
  round+=ROUND_ZERO;
  clearUnitsFromBoard();
  if (globalMapScans) {
    updateBoardFromCommands(commandHistory[round]);
  } else if (localMapScans) {
    updateBoardFromCommands([commandHistory[round][myid]]);
  }
  var moves = commandHistory[round];
  for (var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>'+move+'</foo>');
    qmove.find('command').each(function(index) {
      if ($(this).attr('region')) {
        var unit = units[$(this).attr('unit')];
        var region = regions[$(this).attr('region')];
        unit.setLocation(region);
      }
    });
  }
}

function showCurrentBoard() {
//  log("showCurrentBoard()");
  $(".roundTab").removeClass('selectedTab'); 
  $("#currentRound").addClass('selectedTab'); 
  if (currentRound > FIRST_ACTUAL_ROUND) {
    if (globalMapScans) {
      if (cumulativeMapScans) {
        var allScans = new Array();
        for (var round = FIRST_ACTUAL_ROUND; round < currentRound; round++) {
          allScans = allScans.concat(commandHistory[round]);
        }
        updateBoardFromCommands(allScans);
      } else {
        updateBoardFromCommands(commandHistory[currentRound-1]);
      }
    } else if (localMapScans) {
      if (cumulativeMapScans) {
        var allScans = new Array();
        for (var round = FIRST_ACTUAL_ROUND; round < currentRound; round++) {
          allScans.push(commandHistory[round][myid]);
        }
        updateBoardFromCommands(allScans);
      } else {
        updateBoardFromCommands([commandHistory[currentRound-1][myid]]);
      }
    }
  }
  clearUnitsFromBoard();
  for (var unit_idx in units) {
    var unit = units[unit_idx];
    if (unit.nextRegion != null) {
      unit.setLocation(unit.nextRegion);
    }
  }
}


function initRound() {
  log("initRound:"+currentRound);
  if (currentRound-ROUND_ZERO <= numRounds) {
    // normal round
    addBeginTurnSitRep(currentRound-ROUND_ZERO, numRounds);
    for (var unit_idx in units) {
      var unit = units[unit_idx];
      unit.initTurn();
    }
  } else {
    // answer round
    log("answerRound");
    // take all the units that stay on the board off
    for (var uid in units) {
      var unit = units[uid];
      unit.nextRegion = null;
      unit.currentRegion = null;
    }
    clearUnitsFromBoard();
    initializeAssets(roleUnits[TARGET_ROLE]);
    log("answerRound: done");
  }
  showCurrentBoard();
  $('#go').html("End Turn");
  submitted = false;
  setCountdown("timer",roundDuration);
}

function clearUnitsFromBoard() {
  log("clearUnitsFromBoard()");
  for (var unit_idx in units) {
    var unit = units[unit_idx];
    unit.clearLocation();
  }
}

function updateUnitFromCommands(moves) {
  for (var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>'+move+'</foo>');
    qmove.find('command').each(function(index) {
      var unit = units[$(this).attr('unit')];
      unit.setNextRegion(null);
      
      var wait = parseInt($(this).attr('wait'));
      unit.setWait(wait); 
      
      if ($(this).attr('region')) {
        var region = regions[$(this).attr('region')];
        unit.setCurrentRegion(region);
      }
    });
  }
}

/**
 * Draw the region status (x,?,0)
 * 
 * @param moves
 */
function updateBoardFromCommands(moves) {
  clearRegionStatus();
  for (var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>'+move+'</foo>');
//    alert(qmove.find('command').length);
    qmove.find('command').each(function(index) {
      if ($(this).attr('region')) {
        var scan = $(this).attr('scan').split(",");
        var unit = units[$(this).attr('unit')];
        var result = $(this).attr('result').split(",");
        for (var i = 0; i < scan.length; i++) {
          var region = regions[scan[i]];
          region.addStatus(result[i],unit.name);
        }
      }
    });
  }
}

function addMoveReports(moves) {

}

function addBeginTurnSitRep(round, numRounds) {
  log("addBeginTurnSitRep("+round+")");
  if (showNumberOfRounds) {
    $("#sitrep").append('<tr><th class="roundHeading">'+ROUND_NOUN+' '+round+' of '+numRounds+':</th></tr>');
  } else {
    $("#sitrep").append('<tr><th class="roundHeading">'+ROUND_NOUN+' '+round+':</th></tr>');
  }
}

function addSituationReports(moves) {
  for (var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>'+move+'</foo>');
//    alert(qmove.find('command').length);
    qmove.find('command').each(function(index) {
      var unit = units[$(this).attr('unit')];
      var no = [];
      var possible = [];
      var confirmed = [];
      var wait = parseInt($(this).attr('wait'));
      
      if ($(this).attr('region')) {
        var scan = $(this).attr('scan').split(",");
        var result = $(this).attr('result').split(",");
        for (var i = 0; i < scan.length; i++) {
          var region = regions[scan[i]];
          if (result[i] == VALUE_DISPLAY[VALUE_NOTHING]) {
            no.push(region.name);
          } else if (result[i] == VALUE_DISPLAY[VALUE_DECOY]) {
            possible.push(region.name);
          } else if (result[i] == VALUE_DISPLAY[VALUE_TARGET]) {
            confirmed.push(region.name);
          }
        }
      }
      reports = unit.buildSituationReport(no, possible, confirmed, wait);
      for (i in reports) {
        var report = reports[i];
        appendSitRep(unit.name,report);
      }
    });
  }
}

function appendSitRep(title,value) {
  $("#sitrep").append('<tr><th>&nbsp;&nbsp;'+title+'</th><td>'+value+'</td></tr>'); 
  sitRepScrollbar.slider("value",0);
}

var DEFAULT_CHAT = "<send communication here>";
function initChat() {
  if (playerChat) {
    $("#chatPanel").show();
    
    $("#chatInput").val(DEFAULT_CHAT);
    $("#chatInput").focusin(function() {
      if ($(this).val() == DEFAULT_CHAT) {
        $(this).val("");
      }
    });
    $("#chatInput").focusout(function() {
      if ($(this).val() == "") {
        $(this).val(DEFAULT_CHAT);
      }
    });
    
    $("#chatInput").keypress(function(e) {
      if (e.which == 13) {
        callSendChat();
        $("#chatInput").val("");
        return false;
      }
      return true;
    });
  }
}

function callSendChat() {
  if ($("#chatInput").val() == DEFAULT_CHAT) {
    return;
  }
  
  sendChat($("#chatInput").val());
  
  $("#chatInput").val(DEFAULT_CHAT);
}

function chatReceived(tid,val) {
  appendSitRep(roleName[getFirstRole(tid)], val);
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
  advanceCountdowns();
}

function countdownExpired(id) {
  submitMove(); // automatically bypasses if already submitted
}

var sitRepScrollbar = null;

function initScrollPane() {
  //scrollpane parts
  var scrollPane = $( ".scroll-pane" ),
  scrollContent = $( ".scroll-content" );
  
  function updateContent(event, ui) {
    if ( scrollContent.height() > scrollPane.height() ) {
      scrollContent.css( "margin-top", 
          Math.round( (100-ui.value) / 100 * ( scrollPane.height() - scrollContent.height())
      ) + "px" );
    } else {
      scrollContent.css( "margin-top", 0 );
    }
  }
  
  //build slider
  sitRepScrollbar = $( ".scroll-bar" ).slider({
    orientation: "vertical",
    range: "min",
    min: 0,
    max: 100,
    value: 100,
    slide: updateContent,
    change: updateContent
  });
//  //append icon to handle
//  var handleHelper = scrollbar.find( ".ui-slider-handle" )
//    .mousedown(function() {
//      scrollbar.height( handleHelper.height() );
//    })
//    .mouseup(function() {
//      scrollbar.height( "100%" );
//    })
//    .append( "<span class='ui-icon ui-icon-grip-dotted-vertical'></span>" )
//    .wrap( "<div class='ui-handle-helper-parent'></div>" ).parent();
//  //change overflow to hidden now that slider handles the scrolling
//  scrollPane.css( "overflow", "hidden" );
//    //size scrollbar and handle proportionally to scroll distance
//  function sizeScrollbar() {
//    var remainder = scrollContent.width() - scrollPane.width();
//    var proportion = remainder / scrollContent.width();
//    var handleSize = scrollPane.width() - ( proportion * scrollPane.width() );
//    scrollbar.find( ".ui-slider-handle" ).css({
//      height: handleSize,
//      "margin-top": -handleSize / 2
//    });
//    handleHelper.height( "" ).height( scrollbar.height() - handleSize );
//  }
  
//reset slider value based on scroll content position
//function resetValue() {
//var remainder = scrollPane.width() - scrollContent.width();
//var leftVal = scrollContent.css( "margin-left" ) === "auto" ? 0 :
//parseInt( scrollContent.css( "margin-left" ) );
//var percentage = Math.round( leftVal / remainder * 100 );
//scrollbar.slider( "value", percentage );
//}
////if the slider is 100% and window gets larger, reveal content
//function reflowContent() {
//var showing = scrollContent.width() + parseInt( scrollContent.css( "margin-left" ), 10 );
//var gap = scrollPane.width() - showing;
//if ( gap > 0 ) {
//scrollContent.css( "margin-left", parseInt( scrollContent.css( "margin-left" ), 10 ) + gap );
//}
//}
////change handle position on window resize
//$( window ).resize(function() {
//resetValue();
//sizeScrollbar();
//reflowContent();
//});
////init scrollbar size
//setTimeout( sizeScrollbar, 10 );//safari wants a timeout
}

