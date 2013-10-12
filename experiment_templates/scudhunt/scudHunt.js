/**
 * 
 */
var useChat = true;

var MAP_WIDTH = 420;
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
var story = null; // array of strings
var rules = null; // array of strings
var ROUND_NOUN = "Round"; // what you call a Round: Day, Hour, Turn... etc
var ROUND_NOUN_PLURAL = "Rounds"; 
var TARGET_NOUN = "Target"; 
var TARGET_NOUN_PLURAL = "Targets";

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

function Region(id,name, x,y, x1,y1, polygon) {
  var me = this;
  this.id = id;
  this.name = name;
  
  this.x = x;
  this.y = y;
  this.polygon = polygon;
  this.status = paper.text(x1+1,y1+5,"").attr({'text-anchor': 'start'}); //.attr("fill", "#e0e000");
  
  this.groups = new Array(); // the groups I belong to -- ROW, COL, etc
  this.value = VALUE_NOTHING;
  
  polygon.attr('fill',REGION_BACKGROUND_COLOR);
  this.onClick = function() {
    if (selectedUnit != null) {
      if (selectedUnit.effect(me).length == 0) {
        alert(selectedUnit.cantMoveAlert(me));
        return;
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
    region.status.attr({text: ''});
  }
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
        if (roleToPlayer[unitMe.ownerId] == myid) {
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
    selectedUnit = this;
    this.avatar.img.toFront();
    $('.asset[asset="'+this.id+'"]').css('background-color',ASSET_SELECTION_COLOR);
    if (this.nextRegion != null) {
      clearRegionHighlights();
      this.showEffect(this.nextRegion);
    }
  };
  
  this.clearLocation = function() {
    this.avatar.setLocation(-200, -200);    
  }
  
  this.setLocation = function(region) {
    this.avatar.currentlyOn = region;
    this.avatar.setLocation(region.x, region.y);
  }
  
  this.setNextRegion = function(region) {
    this.nextRegion = region;
    if (region == null) {
      this.clearLocation();
      this.setStatus("");
    } else {
      this.setLocation(region);
      this.setStatus(region.name);
    }
    showCurrentBoard();
  };
  
  this.setCurrentRegion = function(region) {
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
 * @returns {Number}
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
  initializeUnits();
  
  assignPlayersRoundRobin();
  
//  alert(roleUnits[1][0].name);
  initializeGameBoard();
}

function initializeGameBoard() {
  paper = Raphael("canvas", MAP_WIDTH, MAP_HEIGHT);
  paper.clear();
  buildSquareMap(5, 5, 4, 0);
  initializeAvatars();
  initializeAssets();
  setRound(FIRST_ACTUAL_ROUND);
  initChat();
  initRound();
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

function initializeAssets() {
  var myUnits = getUnits(myid);
  var assetWrapper = $('#assets');
  for (idx in myUnits) {
    var unit = myUnits[idx];
    var assetDiv = assetWrapper.append('<div class="asset" asset="'+unit.id+'" title="'+unit.long_description+'"><img src="'+unit.icon+'"/><div class="status"></div><p class="heading">'+unit.name+'</p><p>'+unit.short_description+'</p></div>');
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

function submitMove() {
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
      submission+='<command unit="'+unit.id+'" wait="'+wait+'"/>'
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
      submission+='<command unit="'+unit.id+'" region="'+unit.nextRegion.id+'" scan="'+id_str.join(",")+'" result="'+result_str.join(",")+'" wait="'+wait+'"/>'
    }
  }
  
//simulateEndOfTurn(submission); 
  submit(submission);
}

/**
 * Wait until we got a command move from everyone in the round.
 * 
 * @param participant
 * @param index
 */
function newMove(participant, index) {
  fetchMove(participant, currentRound, index, function(val) {
    commandHistory[currentRound][participant] = val;
//    alert(commandHistory[currentRound].length+" "+val);
    
    var done = true;
    for (var pid = 1; pid <= numPlayers; pid++) {
      if (typeof commandHistory[currentRound][pid] === "undefined") {
        done = false;
      }
    }
    
    if (done) {
      endRound();
    }
  });
}

function endRound() {
  addRoundTab(currentRound-ROUND_ZERO);
  setRound(currentRound+1);
  updateBoardFromCommands(commandHistory[currentRound-1]);
  addSituationReports(commandHistory[currentRound-1]);
  initRound();
  updateUnitFromCommands(commandHistory[currentRound-1]);
}


/**
 * Used by instructions.
 */
function simulateEndOfTurn(submission) {
  // TODO: move this to something that saves up the moves
  commandHistory[currentRound][myid] = submission;
  addRoundTab(currentRound-ROUND_ZERO);
  setRound(currentRound+1);
  
  updateBoardFromCommands([submission]);
  addSituationReports([submission]);
  initRound();
  updateUnitFromCommands([submission]);
//  alert(submission);
}

function addRoundTab(round) {
  $('#currentRound').before('<span round="'+round+'" class="roundTab" onclick="showBoardFromRound('+round+');">'+round+'</span>')
}

function showBoardFromRound(round) {
  $(".roundTab").removeClass('selectedTab'); 
  $('.roundTab[round="'+round+'"]').addClass('selectedTab'); 
  round+=ROUND_ZERO;
  clearUnitsFromBoard();
  updateBoardFromCommands(commandHistory[round]);
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
  $(".roundTab").removeClass('selectedTab'); 
  $("#currentRound").addClass('selectedTab'); 
  if (currentRound > FIRST_ACTUAL_ROUND) {
    updateBoardFromCommands(commandHistory[currentRound-1]); // show the last round's moves
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
  commandHistory[currentRound] = new Array();
  addBeginTurnSitRep(currentRound-ROUND_ZERO, 5);
  for (var unit_idx in units) {
    var unit = units[unit_idx];
    unit.initTurn();
  }
}

function clearUnitsFromBoard() {
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
        var result = $(this).attr('result').split(",");
        for (var i = 0; i < scan.length; i++) {
          var region = regions[scan[i]];
          region.status.attr({text: region.status.attr('text')+' '+result[i]});
        }
      }
    });
  }
}

function addMoveReports(moves) {

}

function addBeginTurnSitRep(round, numRounds) {
  $("#sitrep").append('<tr><th class="roundHeading">'+ROUND_NOUN+' '+round+' of '+numRounds+':</th></tr>');
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
}

var DEFAULT_CHAT = "<send communication here>";
function initChat() {
  if (useChat) {
    $("#chatPanel").show();
    $("#chatInput").val(DEFAULT_CHAT);
    $("#chatInput").focusin(function() {
//      alert("focusin:"+($(this).val() == DEFAULT_CHAT));
      if ($(this).val() == DEFAULT_CHAT) {
        $(this).val("");
      }
    });
    
    $("#chatInput").focusout(function() {
      if ($(this).val() == "") {
        $(this).val(DEFAULT_CHAT);
      }
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



