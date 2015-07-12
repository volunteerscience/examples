/**
 * communication features
 */
var playerChat = true; // players can chat
var allyUnitPlacement = true; // can see ally's unit placement if it remains on map, and in history
var realTimeUnitPlacement = true; // can see ally's unit placement as they do it -- in other words, for the current turn
var localSitRep = true; // situation reports show your local reports (overridden if global is true)
var globalSitRep = true; // situation reports show everyone's reports
var localMapScans = true; // show your assets' scans on the map
var globalMapScans = false; // show everyone's assets' scans on the map (overrides local)
var cumulativeMapScans = true; // if true, current round shows culmination of all scans so far, not just yesterday
var allowMapHistory = true; // allow players to view previous states of the board
var showNumberOfRounds = true;  // do we tell the players how many rounds they have?
var showNumberOfTargets = true;  // do we tell the players how many targets they have?
var allowGroupTargetPlace = false; // true if the group decides where the targets go
var highestRankingOfficerChoose = true; // true if the highest ranking player gets to choose who controls what

var skipAllInstructions = true;
var skipInstructionsAfter = 0; // anything after this is automagically skipped (gets rid of the tutorial)

var roundDuration = 90;
var numRows = 5;
var numCols = 5;
var mid_series_delay = 30;

var MAP_WIDTH = 440;
var MAP_HEIGHT = 440;

var use1Ptips = true; // single player tips
var useTutorial = true;
var usePractice = true;
var useActual = true;

// these are reset after tutorial, practice
var MID_SERIES_DIFF = 50; // 150,250 are mid-round
var TUTORIAL_ROUND = 100;
var PRACTICE_ROUND = 200;
var ACTUAL_ROUND = 500;
var allSeries = [ TUTORIAL_ROUND, PRACTICE_ROUND, ACTUAL_ROUND ];

var ROUND_ZERO = 500;
var FIRST_ACTUAL_ROUND = 501;

var REGION_BACKGROUND_COLOR = "#48B028"; //"#7DAF27" // "#44aa44"; // "#c7d4e7";
var REGION_SELECTION_COLOR = "#99E0FF"; //"#b7e4d7";
var REGION_FAIL_COLOR = "#f7d4e7";
var REGION_WATER_COLOR = "#c7d4e7";

var STRIKE_EXPLOSION_COLOR = "#FF4444";

var ASSET_BACKGROUND_COLOR = REGION_WATER_COLOR;
var ASSET_SELECTION_COLOR = "#b7e4d7";
var ASSET_HOVER_COLOR = REGION_FAIL_COLOR;
var ASSET_PLACED_COLOR = "#a7b4e7";
var ASSET_WAIT_COLOR = "#dddddd";
var ASSET_ARROW_COLOR = "#FF0000";

var paper = null;
var selectedUnit = null;
var selectedMarker = null; // "marker_x", "marker_q", "marker_z", "marker_c"
var markerCursorMap = {
  "marker_x" : 'cursor_x',
  "marker_q" : 'cursor_q',
  "marker_z" : 'cursor_z',
  "marker_c" : 'cursor_c'
};

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
var ENEMY_NOUN = "our enemy";
var ALLY_NOUN = "our ally";
var numRounds = 5;
var numTargets = 4;
var choiceAvatarId = 1; // what to render as the user's choice

var roleToPlayer = new Array();
var roleName = new Array();

var difficulty = 0;
var DIF_EASY = 10;
var DIF_MEDIUM = 20;
var DIF_HARD = 30;

var stickyMarker = true;
var userMarkerCtr = 1;
var userMarkers = {} // round => [[region,symbol,note],...]

var ranks = [ "2nd Lieutenant", "1st Lieutenant", "Captain", "Major",
    "Lt Colonel", "Colonel", "Brigadier Gen", "Major Gen", "Lt Gen", "General",
    "GOA" ];
var rank = -1;

function getRank() {
  if (ranks[5] in awards[myid]) {
    // TODO score based rank
    return 5;
  } else {
    for (var i = 4; i >= 0; i--) {
      if (ranks[i] in awards[myid]) {
        return i;
      }
    }
  }
  return -1;
}

function setRoundDuration(d) {
  if (d.toLowerCase().indexOf("random") >= 0) {
    Math.seedrandom(seed);
    var coin = Math.floor(Math.random() * 2);
    if (coin == 0) {
      roundDuration = 20;
    } else {
      roundDuration = 90;
    }
  } else {
    roundDuration = parseInt(d);
  }
}

function setDifficulty(d) {
  if (typeof d == "string") {
    if (d.toLowerCase().indexOf("hard") >= 0) {
      difficulty = DIF_HARD;
    } else if (d.toLowerCase().indexOf("medium") >= 0) {
      difficulty = DIF_MEDIUM;
    } else if (d.toLowerCase().indexOf("random") >= 0) {
      Math.seedrandom(seed);
      difficulty = Math.floor(Math.random() * 3) * 10 + 10;
    } else {
      difficulty = DIF_EASY;
    }
  } else {
    difficulty = d;
  }

  if (difficulty <= DIF_EASY) {
    allyUnitPlacement = true;
  } else {
    allyUnitPlacement = false;
  }
  realTimeUnitPlacement = allyUnitPlacement;

  if (difficulty < DIF_HARD) {
    globalSitRep = true;
  } else {
    globalSitRep = false;
  }

  if (numPlayers < 2) {
    skipAllInstructions = false;
    playerChat = false;
  }
}

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
var VALUE_DISPLAY = [ '0', '?', '!' ];
var VALUE_COLOR = [ '#AAFF88 ', '#FFFF44', '#CC4444' ];// ['#44CC44','#FFFF44','#CC4444'];

var popupDelay = null;
function hidePopup(delay) {
  popup.txt.hide();
  popup.hide();
  clearInterval(popupDelay);
  popupDelay = null;
}

function showPopup(x, y, txt, delay) {
  if (delay > 0) {
    if (popupDelay != null) {
      clearInterval(popupDelay);
      popupDelay = null;
    }
    popupDelay = setInterval(function() {
      showPopup(x, y, txt, 0);
    }, delay);
    return;
  }

  if (inInstructions) {
    instructionShowPopup(txt);
  }

  // log("showPopup("+x+","+y+")");
  popup.txt.transform('T' + x + ',' + y);
  popup.txt.attr({
    text : txt
  });
  var boundsOrig = popup.txt.getBBox();
  var bounds = {
    x : boundsOrig.x - 5,
    y : boundsOrig.y - 3,
    width : boundsOrig.width + 10,
    height : boundsOrig.height + 6
  };

  var newX = x;
  var newY = y;
  if (bounds.x < 20) {
    newX = x + (20 - bounds.x);
  } else if (bounds.x + bounds.width > MAP_WIDTH - 20) {
    newX = x - (bounds.x + bounds.width - (MAP_WIDTH - 20));
  }

  if (bounds.y < 20) {
    newY = y + (20 - bounds.y);
  } else if (bounds.y > MAP_HEIGHT - 20) {
    newY = y - (bounds.y - (MAP_HEIGHT - 20));
  }

  if (newX != x || newY != y) {
    showPopup(newX, newY, txt, 0);
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

function Region(id, name, x, y, x1, y1, polygon) {
  var me = this;
  this.id = id;
  this.name = name;

  this.x = x;
  this.y = y;
  this.polygon = polygon;
  this.polygon.attr({
    "opacity" : 0.7
  });
  this.status = []; // text element on the region: 0,?,X
  this.addStatus = function(letter, unitName, removeId) {
    // tX, tY are where the letter goes, based on how many there are already
    var xOff = 10+Math.floor(this.status.length/(STATI_PER_ROW*STATI_PER_COL))*10; // if we fill up the whole square, start putting more in between the letters
    var tX = x1 + xOff +// left side
      20*(this.status.length % STATI_PER_ROW); // this makes the text word wrap
    var tY = 10+y1 + // top
      20* (Math.floor(this.status.length/STATI_PER_ROW) % STATI_PER_COL);

    // add a new txt element
    var txt = paper.text(tX, tY, letter).attr({
      'text-anchor' : 'middle',
      'font-size' : '20px',
      'cursor' : 'inherit',
      'font-weight' : 'bold',
      'fill' : VALUE_COLOR[VALUE_DISPLAY.indexOf(letter)]
    });

    // this is the popup behavior to determine which unit claimed the status
    txt.click(function() {
      if (selectedUnit == null && selectedMarker == null) {
        var dY = -30;
        if (me.row == 0) {
          dY = 30;
        }
        showPopup(tX, tY + dY, unitName, 0);
      } else {
        if (selectedMarker == "marker_c") {
          if (removeId) {
            for ( var round in userMarkers) {
              var list = userMarkers[round];
              for ( var idx in list) {
                var item = list[idx];
                if (item[3] == removeId) {
                  submit('<unmark idx="' + removeId + '"/>');
                  list.splice(idx, 1);
                  txt.remove();
                  if (!stickyMarker) {
                    deselectAllMarkers();
                  }
                  hidePopup(0);
                  return;
                }
              }
            }
            userMarkers[currentRound]
                .push([ me.id, letter, note, userMarkerCtr ]);
          } else {
            deselectAllMarkers();
            alert("You can only remove markers that you added.");
            hidePopup(0);
          }
        } else {
          me.onClick();
        }
      }
    });
    txt.mouseover(function() {
      if (selectedUnit == null) {
        var dY = -30;
        if (me.row == 0) {
          dY = 30;
        }
        showPopup(tX, tY + dY, unitName, 700);
      } else {
        me.mouseOver();
      }
    });
    txt.mouseout(function() {
      if (selectedUnit == null && selectedMarker == null) {
        hidePopup(0);
      }
    });

    this.status.push(txt);
  }

  this.groups = new Array(); // the groups I belong to -- ROW, COL, etc
  this.value = VALUE_NOTHING;

  polygon.attr('fill', REGION_BACKGROUND_COLOR);
  this.onClick = function() {
    if (selectedMarker != null) {

      var letter = null;
      if (selectedMarker == "marker_z") {
        letter = VALUE_DISPLAY[VALUE_NOTHING];
      } else if (selectedMarker == "marker_q") {
        letter = VALUE_DISPLAY[VALUE_DECOY];
      } else if (selectedMarker == "marker_x") {
        letter = VALUE_DISPLAY[VALUE_TARGET];
      } else if (selectedMarker == "marker_c") {
        // this happens if there's an avatar on the region so the marker wasn't clicked
        // TODO: detect which letter from mouse position
      }

      if (letter == null) {
        alert("Click a marker to remove it.");
        return;
      }

      if (!(currentRound in userMarkers)) {
        userMarkers[currentRound] = [];
      }
      var note = "your mark";
      submit('<mark region="'+me.id+'" letter="'+letter+'" note="'+note+'" idx="'+userMarkerCtr+'"/>');
      userMarkers[currentRound].push([me.id,letter,note,userMarkerCtr]);
      me.addStatus(letter, note, userMarkerCtr);
      userMarkerCtr++;
      if (!stickyMarker) {
        deselectAllMarkers();
      }
      return;
    }

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
        submit('<place unit="' + selectedUnit.id + '" region="' + me.id + '"/>');
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
      selectedUnit.showArrow(me);
    }
  };

  this.mouseOut = function() {
    if (selectedUnit != null) {
      clearRegionHighlights();
      if (selectedUnit.nextRegion != null) {
        selectedUnit.showEffect(selectedUnit.nextRegion);
        selectedUnit.showArrow(selectedUnit.nextRegion);
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
    for ( var s in region.status) {
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
function Unit(id, ownerId, name, short_description, long_description, label, icon, avatarId, reportTable) {
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
  this.label = label;
  this.arrow = null; // arrow span of effect range
  this.listeners = [];

  roleUnits[ownerId].push(this);

  this.currentRegion = null; // which region I'm at
  this.nextRegion = null; // which region I'll go to next

  this.addListener = function(l) {
    unitMe.listeners.push(l);
  }

  this.removeListener = function(l) {
    unitMe.listeners.splice(unitMe.listeners.indexOf(l), 1);
  }

  this.buildAvatar = function(avatarFactory) {
    this.avatar = avatarFactory.build(avatarId,-100,-100); // build avatar off screen
    if (this.label) {
      this.avatar.text = this.label;
    }
    this.avatar.origMouseDown = this.avatar.onMouseDown;
    this.avatar.onMouseDown = function(e) {
      if (selectedUnit == null && selectedMarker == null) {
        if (isMyUnit(unitMe) || unitMe.ownerId == TARGET_ROLE) {
          unitMe.select();
          return;
        }
      }
      // passthrough
      unitMe.avatar.origMouseDown(e);
    }

    // unbind the original
    this.avatar.img.unmousedown(this.avatar.origMouseDown);
    this.avatar.img.mousedown(this.avatar.onMouseDown);
  };

  this.select = function() {
    deselectAllUnits();
    deselectAllMarkers();
    if (currentRound == FIRST_ACTUAL_ROUND + numRounds) {
      if (this.ownerId != TARGET_ROLE) return; // on target selection round, only targets may be moved
    } else if (currentRound > FIRST_ACTUAL_ROUND + numRounds) {
      return; // no units may be moved
    }
    if (submitted) return;
    selectedUnit = this;
    this.avatar.img.toFront();
    $('.asset[asset="' + this.id + '"]').css('background-color',
        ASSET_SELECTION_COLOR);
    if (this.nextRegion != null) {
      clearRegionHighlights();
      this.showEffect(this.nextRegion);
    }
  };

  this.clearLocation = function() {
    // log(this.id+" clearLocation");
    this.avatar.currentlyOn = null;
    this.avatar.setLocation(-200, -200);
    if (unitMe.arrow) {
      unitMe.arrow.remove();
      unitMe.arrow = null;
    }
  }

  this.setLocation = function(region) {
    if (region == null) {
      // log(this.id+" null");
      this.clearLocation();
      return;
    }
    if (allyUnitPlacement || isMyUnit(unitMe) || this.ownerId == TARGET_ROLE) {
      // log(this.id+" "+region.id);
      this.avatar.currentlyOn = region;
      this.avatar.setLocation(region.x, region.y);

      unitMe.showArrow(region);
    }
  }

  this.setNextRegion = function(region) {
    // log(this.id+".setNextRegion("+region+")");

    for ( var lidx in unitMe.listeners) {
      var l = unitMe.listeners[lidx];
      try {
        l.setNextRegion(unitMe, region);
      } catch (err) {
      }
    }

    if (inInstructions) {
      if (instructionSetNextRegion(this, region)) {
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
    log(this.id + ".setCurrentRegion(" + region + ")");
    this.currentRegion = region;
    if (this.remainsOnBoard) {
      if (this.wait == 0) {
        this.setNextRegion(region);
        if (region != null) {
          $('.asset[asset="'+this.id+'"]').css('background-color',ASSET_PLACED_COLOR); // enable button
        }

        // tips
        if (use1Ptips && isMyUnit(unitMe)) {
          var myGlow = null;
          unitMe.addListener()
          addUniqueTip(
              6,
              "Move on Battlefield",
              "<p>Some of your units remain on the battlefiled after a turn.  You can move them by clicking on the unit and moving it to an adjancent region..</p>",
              function(active) {
                if (myGlow) {
                  myGlow.remove();
                  myGlow = null;
                }

                if (active) {
                  myGlow = unitMe.avatar.currentlyOn.polygon.glow({
                    "color" : "#FF0000"
                  });
                  myGlow.toFront();
                }
              }, unitMe.icon, true);
          var listener = new Object();
          listener.setNextRegion = function(unitMe, region) {
            tips.completeTip(tips.getTipByUid(6).index);
            unitMe.removeListener(listener);
            addTip(
                "Continue Playing",
                '<p>Keep looking for '+TARGET_NOUN_PLURAL+' by deploying assets and clicking <span style="background-color:#7DAF27; color:#FFFFFF; padding:2px;">End Turn</span> when done.</p>',
                "#playerControls", null, 431);            
          }
          unitMe.addListener(listener);
//        } else {
//          var myGlow = null;
//          addUniqueTip(
//              3,
//              "Ally's Asset",
//              "<p>Your ally has placed an asset on the board.  You do not control this asset, however you can see its location.</p>",
//              function(active) {
//                if (myGlow) {
//                  myGlow.remove();
//                  myGlow = null;
//                }
//
//                if (active) {
//                  myGlow = unitMe.avatar.currentlyOn.polygon.glow({
//                    "color" : "#FF0000"
//                  });
//                  myGlow.toFront();
//                }
//              }, unitMe.icon);
        }
      }
    }
  }

  this.setStatus = function(status) {
    $('.asset[asset="' + this.id + '"] .status').html(status);
  }

  // override me if unit affects more regions than self, return row, col, etc
  this.effect = function(region) {
    return [ region ];
  };

  this.showEffect = function(region) {
    var regions = this.effect(region);

    // highlight
    // for (idx in regions) {
    // var r = regions[idx];
    // r.highlight(true);
    // }

    if (regions.length == 0) {
      region.markInvalid();
    } else {
      region.highlight(true);
    }
  };

  this.showArrow = function(region) {
    var regions = this.effect(region);

    // highlight and arrows
    var minX = 50000;
    var maxX = 0;
    var minY = 50000;
    var maxY = 0;
    for (idx in regions) {
      var r = regions[idx];
      minX = Math.min(minX, r.x);
      maxX = Math.max(maxX, r.x);
      minY = Math.min(minY, r.y);
      maxY = Math.max(maxY, r.y);
    }

    if (regions.length > 1) {
      // draw arrows
      var path = "M" + minX + "," + minY + "L" + maxX + "," + maxY;
      // var path = "M"+maxX+","+maxY+"L"+minX+","+minY;
      if (unitMe.arrow) {
        unitMe.arrow.attr({
          "path" : path
        });
      } else {
        unitMe.arrow = paper.path(path);
        unitMe.arrow.attr({
          "arrow-end" : "diamond-wide-long",
          "arrow-start" : "diamond-wide-long",
          "stroke" : ASSET_ARROW_COLOR,
          "stroke-width" : 3
        });
        unitMe.arrow.toBack();
      }
    } else {
      if (unitMe.arrow) {
        unitMe.arrow.remove();
        unitMe.arrow = null;
      }
    }
  }

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

    if (isMyUnit(unitMe)) {
      if (this.wait == 0) {
        // enable button
        if (unitMe.nextRegion == null) {
          $('.asset[asset="' + this.id + '"]').css('background-color',
              ASSET_BACKGROUND_COLOR); // enable button
        } else {
          $('.asset[asset="' + this.id + '"]').css('background-color',
              ASSET_PLACED_COLOR); // enable button
        }
      } else {
        // disable button
        $('.asset[asset="' + this.id + '"]').css('background-color',
            ASSET_WAIT_COLOR); // disable button
        
        if (use1Ptips) {
          addTip(
            "Disabled Asset",
            "<p>The gray button indicates that this asset has become disabled.</p>"
                + "<p>You can see that its status is "
                + unitMe.waitString
                + ".</p>"
                + "<p>Some assets can recover, others remain disabled thoughout the engagemnt.</p>",
            '.asset[asset="' + this.id + '"]', unitMe.icon, 7, true);
        }
      }
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
      ret.push("No target at " + no.join(","));
      madeMove = true;
    }
    if (possible.length > 0) {
      ret.push("Possible target at " + possible.join(","));
      madeMove = true;
    }
    if (confirmed.length > 0) {
      ret.push("Target confirmed at " + confirmed.join(","));
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
      }
      if (wait < 0) {
        return this.waitString;
      }
      if (wait > 0) {
        if (wait == 1) {
          return "Will be ready next turn.";
        } else {
          return "Will be ready in " + wait + " turns.";
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
    return "You can't move the " + this.name + " to this region.";
  };
}

/**
 * return the report from the table
 * 
 * @param actual
 * @param table
 * @returns 0, 1, or 2
 */
function getReport(actual, table) {
  var possibilities = table[actual];
  var roll = Math.random();

  var totalChance = 0;
  for (var ret = 0; ret <= 2; ret++) {
    totalChance += table[actual][ret];
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
      if (unit.nextRegion == null) {
        $(this).css('background-color', ASSET_BACKGROUND_COLOR);
      } else {
        $(this).css('background-color', ASSET_PLACED_COLOR);
      }
    } else {
      $(this).css('background-color', ASSET_WAIT_COLOR);
    }
  });
  selectedUnit = null;
  clearRegionHighlights();
}

function deselectAllMarkers() {
  selectedMarker = null;
  $('.marker_btn').each(function() {
    $(this).css('background-color', ASSET_BACKGROUND_COLOR);
  });
  for ( var m in markerCursorMap) {
    $('.test-wrapper').removeClass(markerCursorMap[m]);
  }
}

function assignPlayersRoundRobin() {
  Math.seedrandom(seed);
  first_player = 1 + Math.floor(Math.random() * numPlayersAndBots);

  roleToPlayer = new Array();
  var pid = first_player;
  for (var r = 0; r < num_roles; r++) {
    var idx = 1 + r;
    // alert(idx+" => "+pid);
    roleToPlayer[idx] = pid;

    pid++;
    if (pid > numPlayersAndBots) {
      pid = 1;
    }
  }
}

var numBots = 0;
var numPlayersAndBots = 1;
function initialize() {
  useTutorial = variables['useTutorial'].indexOf("rue") == 1;
  usePractice = variables['usePractice'].indexOf("rue") == 1;
  useActual = variables['useActual'].indexOf("rue") == 1;

  if (!useActual) {
    allSeries.splice(2, 1);
    $("#series_actual").hide();
  }

  if (!usePractice) {
    allSeries.splice(1, 1);
    $("#series_practice").hide();
  }

  if (!useTutorial) {
    allSeries.splice(0, 1);
    $("#series_tutorial").hide();
  }

  allow_skip_story = variables['allow_skip_story'].indexOf("rue") == 1;
  skipInstructionsAfter = S_STORY;
  rank = getRank();
  setDifficulty(variables['difficulty']);
  setRoundDuration(variables['round_duration']);

  for ( var s in allSeries) {
    var series = allSeries[s];
    for (var r = 0 + series; r <= series + 1 + numRounds; r++) { // also the
                                                                  // submission
                                                                  // round
      commandHistory[r] = new Array();
    }
    commandHistory[series + MID_SERIES_DIFF] = new Array(); // for mid-series
                                                            // readies
  }

  numBots = Math.max(0, parseInt(variables['min_players']) - numPlayers);
  numPlayersAndBots = numPlayers + numBots;
  initializeUnits(numPlayersAndBots);

  assignPlayersRoundRobin();

  // alert(roleUnits[1][0].name);
  initializeGameBoard();

  initializeMarkerButtons();

  runAllInstructions();
}

function initializeTutorial() {
  // end of instructions
  clearInstructions();

  if (!useTutorial) {
    initializePractice();
    return;
  }

  ROUND_ZERO = 100;
  FIRST_ACTUAL_ROUND = 101;

  tips.alwaysPopUp = true;
  $("#series_tutorial").addClass("series_current");
  resetGame();

}

function disableTips() {
  tips.disabled = true;
  tips.hide();
  $("#tips_button").hide();
}

function initializePractice() {
  if (useTutorial) {
    disableTips();    
  } else {
    use1Ptips = false;
  }

  if (!usePractice) {
    initializeActual();
    return;
  }

  ROUND_ZERO = 200;
  FIRST_ACTUAL_ROUND = 201;
  tips.alwaysPopUp = true;
  $("#series_practice").addClass("series_current");

  resetGame();
}

function initializeActual() {
  disableTips();
  if (!useActual) {
    experimentComplete();
    return;
  }

  ROUND_ZERO = 500;
  FIRST_ACTUAL_ROUND = 501;
  tips.alwaysPopUp = false;
  $("#series_actual").addClass("series_current");

  resetGame();
}

function recordTargets() {
  // only do this on the user with the lowest id
  for (var i = 1; i < myid; i++) {
    if (activePlayers[i]) {
      // someone lower than me is still active
      return false;
    }
  }
  submit('<game targets="' + targetRegions + '"/>');
}

function resetGame() {
  assignTargets(seed + currentRound, numTargets, 0);
  recordTargets();

  for ( var unit_idx in units) {
    var unit = units[unit_idx];
    unit.currentRegion = null;
    unit.setNextRegion(null);
    unit.wait = 0;
  }

  for ( var e in explosionAvatars) {
    explosionAvatars[e].remove();
  }
  explosionAvatars = [];

  clearRegionStatus();
  initializeHistory();
  initializeMyAssets();
  $("#sitRep").html("");
  $("#chat").html("");

  setRound(FIRST_ACTUAL_ROUND);
  initRound();
}

function initializeGameBoard() {
  if (paper == null) {
    paper = Raphael("canvas", MAP_WIDTH, MAP_HEIGHT);
  }
  paper.clear();
  popup = paper.rect(0, 0, 50, 30, 5).attr({
    'fill' : '#CCCCCC',
    'opacity' : 0.5
  });
  popup.hide();
  popup.txt = paper.text(0, 0, "").attr({
    'text-anchor' : 'middle',
    'font-size' : '20px',
    'font-weight' : 'bold',
    'fill' : '#222222'
  });
  popup.txt.hide();

  buildSquareMap(numRows, numCols);

  initializeHistory();
  initializeAvatars();
  initChat();
  initScrollPanes();
  startAnimation();
}

function initializeHistory() {
  $('#roundHistory')
      .html(
          '<span id="currentRound" class="roundTab selectedTab" onclick="showCurrentBoard();">Current</span>');
}

function initializeAvatars() {
  unitAvatarFactory.SCALE = REGION_WIDTH / unitAvatarFactory.width; // 0.6;
  unitAvatarFactory.setPaper(paper);
  var factory = new AvatarFactory()
  for ( var units_idx in roleUnits) {
    var units = roleUnits[units_idx];
    for ( var unit_idx in units) {
      var unit = units[unit_idx];
      unit.buildAvatar(unitAvatarFactory);
    }
  }
}

/**
 * called from resetGame()
 */
function initializeMyAssets() {
  var myUnits = getUnits(myid);
  initializeAssets(myUnits);
}

/**
 * called at beginning of game, and on last round
 * 
 * @param myUnits
 */
function initializeAssets(myUnits) {
  var assetWrapper = $('#assets');
  assetWrapper.html("");
  for (idx in myUnits) {
    var unit = myUnits[idx];
    var assetDiv = assetWrapper.append('<div class="asset" asset="' + unit.id
        + '" title="' + unit.long_description + '"><img src="' + unit.icon
        + '"/>' + '<div class="status">'
        + (unit.nextRegion == null ? "" : unit.nextRegion.name) + '</div>'
        + '<p class="heading">' + unit.name + '</p><p>'
        + unit.short_description + '</p><div class="asset_info">?</div></div>');
  }

  $('.asset_info').click(
      function() {
        var unitId = $(this).parent().attr('asset');
        var unit = units[unitId];
        addTipPopup(1000 + unit.id, unit.name, unit.long_description,
            '.asset[asset="' + unit.id + '"]', unit.icon);
        setTimeout(deselectAllUnits, 500);
      });

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
      $(this).css('background-color', ASSET_WAIT_COLOR);
      return;
    }

    if (selectedUnit != null && $(this).attr('asset') == selectedUnit.id) {
      $(this).css('background-color', ASSET_SELECTION_COLOR);
    } else {
      $(this).css('background-color', ASSET_HOVER_COLOR);
    }
  }, function() {
    var unitId = $(this).attr('asset');
    var unit = units[unitId];
    if (unit.wait != 0) {
      $(this).css('background-color', ASSET_WAIT_COLOR);
      return;
    }

    if (selectedUnit != null && $(this).attr('asset') == selectedUnit.id) {
      $(this).css('background-color', ASSET_SELECTION_COLOR);
    } else {
      if (unit.nextRegion == null) {
        $(this).css('background-color', ASSET_BACKGROUND_COLOR);
      } else {
        $(this).css('background-color', ASSET_PLACED_COLOR);
      }
    }
  });
}

function initializeMarkerButtons() {
  $('.marker_btn').click(function() {
    var oldSelectedMarker = selectedMarker;
    deselectAllUnits();
    deselectAllMarkers();

    var markerId = $(this).attr('id');
    if (oldSelectedMarker == markerId) {
      return; // clicking again deselects
    }
    selectedMarker = markerId;

    $('.test-wrapper').addClass(markerCursorMap[markerId]);

    $(this).css('background-color', ASSET_SELECTION_COLOR);
  });

  $('.marker_btn').hover(function() {
    var markerId = $(this).attr('id');
    if (selectedMarker != null && selectedMarker == markerId) {
      $(this).css('background-color', ASSET_SELECTION_COLOR);
    } else {
      $(this).css('background-color', ASSET_HOVER_COLOR);
    }
  }, function() {
    var markerId = $(this).attr('id');
    if (selectedMarker != null && selectedMarker == markerId) {
      $(this).css('background-color', ASSET_SELECTION_COLOR);
    } else {
      $(this).css('background-color', ASSET_BACKGROUND_COLOR);
    }
  });
}

function isMidSeries() {
  return (currentRound == TUTORIAL_ROUND + MID_SERIES_DIFF)
      || (currentRound == PRACTICE_ROUND + MID_SERIES_DIFF);
}

/**
 * maps round => role => list of commands
 */
var commandHistory = new Array();
var submitted = false;
var guess = new Array();
function submitMove() {
  tips.hide();
  try { tips.completeTip(tips.getTipByUid(2).index); } catch (err) {} // End Turn Tip
  try { tips.completeTip(tips.getTipByUid(431).index); } catch (err) {} // End Turn Tip
  if (inInstructions) {
    instructionSubmitMove();
    return;
  }

  if (isMidSeries()) {
    submitReady();
    return;
  }
  
  if (submitted) return;
  submitted = true;
  if (currentRound - ACTUAL_ROUND > numRounds) {
    $('#go').fadeOut();
    $("#playerControls").fadeOut();
    $("#q1").fadeIn();
    return;
  }

  $('#go').html("Waiting for Team");

  Math.seedrandom(seed * myid * (currentRound + 7));
  var submission = "";
  var myUnits = getUnits(myid);

  for (idx in myUnits) {
    var unit = myUnits[idx];
    var wait = unit.wait;
    if (unit.nextRegion == null) {
      if (unit.wait > 0) {
        wait = unit.wait - 1;
      }
      if (unit.remainsOnBoard && unit.currentRegion != null && unit.wait == 0) {
        unit.nextRegion = unit.currentRegion;
      }
    }

    // NOTE: previous block can set nextRegion
    if (unit.nextRegion == null) {
      // submit the no-op
      submission += '<command unit="' + unit.id + '" wait="' + wait + '"/>';
    } else {
      var scanned = unit.effect(unit.nextRegion);
      var id_str = [];
      var result_str = [];
      for ( var r_idx in scanned) {
        var reg = scanned[r_idx];
        var result = unit.doSensor(reg);
        id_str.push(reg.id);
        result_str.push(VALUE_DISPLAY[result]);
      }
      var wait = unit.doWait(unit.nextRegion);
      submission += '<command unit="' + unit.id + '" region="'
          + unit.nextRegion.id + '" scan="' + id_str.join(",") + '" result="'
          + result_str.join(",") + '" wait="' + wait + '"/>';
    }
  }

  submit(submission);

  if (shouldRunBots()) {
    runBots();
  }
}

// who handles bots
function shouldRunBots() {
  for (var i = 1; i < myid; i++) {
    if (activePlayers[i]) {
      // someone lower than me is still active
      return false;
    }
  }
  return true;
}

function q1(confidence) {
  var submission = '<confidence value="' + confidence + '"/>';
  for (idx in roleUnits[TARGET_ROLE]) {
    var unit = roleUnits[TARGET_ROLE][idx];
    if (unit.nextRegion != null) {
      submission += '<target unit="' + unit.id + '" region="'
          + unit.nextRegion.id + '"/>';
      guess.push(unit.nextRegion.id);
    }
  }
  submit(submission);
  if (shouldRunBots()) {
    for (var i = 1; i <= numPlayersAndBots; i++) {
      if (!activePlayers[i]) {
        submitBot(i, currentRound, '<confidence value="-1"/>');
      }
    }
  }
  $("#q1").html('<h2>Waiting for team.</h2>');
}

var explosionAvatars = [];

function showAirstrike() {
  stopCountdown("timer");
  $("#q1").fadeOut();

  var numHits = 0;
  var hitLoc = null;
  var missFireLoc = null;
  var attackLocations = {};
  for ( var unitIdx in roleUnits[TARGET_ROLE]) {
    var unit = roleUnits[TARGET_ROLE][unitIdx];
    if (unit.nextRegion) {
      attackLocations[unit.nextRegion.id] = true;
      if (unit.nextRegion != null) {
        if (unit.nextRegion.value == VALUE_TARGET) {
          hitLoc = unit.nextRegion;
          numHits++;
        } else {
          missFireLoc = unit.nextRegion;
        }
      }
    }
  }

  var numMisses = numTargets - numHits;
  var score = 0;

  if (currentRound < PRACTICE_ROUND && !("Rookie" in awards[myid])) {
    writeAward("Rookie"); // passed tutorial
  }

  // payment function
  if (IS_AMT && !IS_AMT_PREVIEW) {
    // tutorial
    if (currentRound > PRACTICE_ROUND && useTutorial && usePractice) {
      if (numHits >= 1 ) {
        assignQualification("Shadow Force Training");        
      }
      payAmt(true,0);
    }
    
    // actual
    if (currentRound > ACTUAL_ROUND && numHits >= 1) {
      var bonus = 0;
      if (numHits == 4) {
        bonus = 0.50;
      }
      payAmt(true,bonus);
    }
  }
  
  switch (difficulty) {
  case DIF_EASY:
    if (numHits >= 1 && !("2nd Lieutenant" in awards[myid])) {
      if (currentRound > ACTUAL_ROUND) {
        writeAward("2nd Lieutenant");
      }
    }
    if (numHits >= 3 && !("1st Lieutenant" in awards[myid])) {
      if (currentRound > ACTUAL_ROUND) {
        writeAward("1st Lieutenant");
      }
    }
    if (numHits == numTargets) {
      score = 1000;
      if (!("Captain" in awards[myid])) {
        if (currentRound > ACTUAL_ROUND) {
          writeAward("Captain");
        }
      }
    } else {
      score = numHits * 100;
    }
    break;
  case DIF_MEDIUM:
    if (numHits >= 3 && !("Major" in awards[myid])) {
      if (currentRound > ACTUAL_ROUND) {
        writeAward("Major");
      }
    }
    if (numHits == numTargets) {
      score = 2000;
      if (!("Lt Colonel" in awards[myid])) {
        if (currentRound > ACTUAL_ROUND) {
          writeAward("Lt Colonel");
        }
      }
    } else {
      score = numHits * 200;
    }
    break;
  case DIF_HARD:
    if (numHits >= 3 && !("Colonel" in awards[myid])) {
      if (currentRound > ACTUAL_ROUND) {
        writeAward("Colonel");
      }
    }
    if (numHits == numTargets) {
      score = 5000;
    } else {
      score = numHits * 300;
    }
    break;
  }

  if (numHits == 0) {
    if (currentRound > PRACTICE_ROUND) {
      alert("You missed every " + TARGET_NOUN + "!  " + ALLY_NOUN
          + " has taken severe casualties.  Try harder next time!");
    }
  } else {
    if (currentRound > ACTUAL_ROUND) {
      writeScore("score", score);
    }
    if (currentRound > PRACTICE_ROUND) {
      alert("Congratulations!  You destroyed " + numHits + " "
          + TARGET_NOUN_PLURAL + "!  You scored " + score + " points.");
    }
  }

  // draw the avatars on the map
  var targetCtr = 0;
  for (idx in regions) {
    var region = regions[idx];
    if (region.value == VALUE_TARGET) {
      if (!(region.id in attackLocations)) {
        missLoc = region;
      }

      var unit = roleUnits[TARGET_ROLE][targetCtr++];
      unit.avatar.text = null;
      if (typeof unit != "undefined") {
        // place the targets in the actual locations
        if (unit.nextRegion != null) {
          // this is the explosion
          var explosion = unitAvatarFactory.build(choiceAvatarId,
              unit.nextRegion.x, unit.nextRegion.y);
          if (unit.nextRegion.value == VALUE_TARGET) {
            explosion.text = "HIT";
          } else {
            explosion.text = "MISS";
          }
          explosion.text_loc = "center";
          explosion.text_color = STRIKE_EXPLOSION_COLOR;
          explosion.update();
          // explosion.text = "MISS";
          explosionAvatars.push(explosion);
        }
        // this is the truck
        unit.setNextRegion(region);
      }
    }
  }

  // tip about a hit
  if (numHits > 0) {
    var hitStr = "<p>We successfully disabled " + numHits + " "
        + TARGET_NOUN_PLURAL + ".</p>";
    if (numHits == 1) {
      hitStr = "<p>We successfully disabled 1 " + TARGET_NOUN + ".</p>";
    }
    var myGlow = null;
    if (use1Ptips) {
      addTip("Hit!!",
        "<p>Airstrikes were conducted based on your target designations.</p>"
            + hitStr + "<p>The explosion shows the locations you chose.</p>",
        function(active) {
          if (myGlow) {
            myGlow.remove();
            myGlow = null;
          }

          if (active) {
            myGlow = hitLoc.polygon.glow({
              "color" : "#FF0000"
            });
            myGlow.toFront();
          }
        }, getFile("explosion.png"), 11, true);
    }
  }

  // tip about a miss
  if (numMisses > 0) {
    var missStr = "<p>" + numMisses + " " + TARGET_NOUN_PLURAL
        + " survived!</p>";
    if (numMisses == 1) {
      missStr = "<p>1 " + TARGET_NOUN + " survived!</p>";
    }
    var missGlow = null;
    var missFireGlow = null;
    if (use1Ptips) {
      addTip("Miss!!", missStr
          + "<p>The explosion shows the locations you chose.  Any missile launchers w/o an explosion survived.</p>", function(
          active) {
        if (missGlow) {
          missGlow.remove();
          missGlow = null;
        }
        if (missFireGlow) {
          missFireGlow.remove();
          missFireGlow = null;
        }
  
        if (active) {
          if (missLoc) {
            missGlow = missLoc.polygon.glow({
              "color" : "#FF0000"
            });
            missGlow.toFront();
          }
          if (missFireLoc) {
            missFireGlow = missFireLoc.polygon.glow({
              "color" : "#FF0000"
            });
            missFireGlow.toFront();
          }
        }
      }, getFile("scud.png"), 12, true);
    }
  }

  if (currentRound > allSeries[allSeries.length - 1]) {
    experimentComplete();
  } else {
    $("#timer").show();
    setCountdown("timer", mid_series_delay, "...Next Round Starting...");
    $('#go').html("Ready");
  }
}

/**
 * to handle refresh, get all the previous moves
 * 
 * @param round
 */
function roundInitialized(round) {
  for ( var participant in initialMovesOfRound) {
    for (var index = 0; index < initialMovesOfRound[participant]; index++) {
      fetchMove(participant, round, index, fetchResponse);
    }
  }
}

/**
 * if someone drops out durning the instructions, submit a ready for them
 */
function playerDisconnect(playerNum) {
  // alert('playerDisconnect '+playerNum);

  // see if I have the lowest live id
  if (!shouldRunBots()) return;
  
  // get past the instructions; TODO: activate bot
  if (currentRound < ROUND_ZERO || isMidSeries()) {
    submitReady();
  } else {
    runBots();
  }
}

function submitReady() {
  submit('<ready />');
  if (shouldRunBots()) {
    for (var i = 1; i <= numPlayersAndBots; i++) {
      if (!activePlayers[i]) {
        submitBot(i, currentRound, '<ready />');
      }
    }
  }
}

function fetchResponse(val, participant, round, index) {
  var tagName = $(val).prop("tagName");
  log("fetchResponse(" + tagName + " r:" + round + " part:" + participant
      + ") cr:" + currentRound);
  if (tagName == "COMMAND" || tagName == "CONFIDENCE" || tagName == "READY") {
    // this contains 1 or more commands
    if (typeof commandHistory[round][participant] === "undefined") {
      commandHistory[round][participant] = val; // don't allow repeat moves
    }
    if (participant == myid && round == currentRound) {
      $('#go').html("Waiting for Team");
      submitted = true;
    }
    var done = true;
    for (var pid = 1; pid <= numPlayersAndBots; pid++) {
      if (typeof commandHistory[currentRound][pid] === "undefined") {
        done = false;
        break;
      }
    }

    if (done) {
      endRound();
    }
  } else if (tagName == "PLACE") {
    if (currentRound > ROUND_ZERO + numRounds) {
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
    log("place:" + unit.id + " " + region);
    if (round == currentRound) {
      unit.setNextRegion(region);
    }
  } else if (tagName == "MARK") {
    if (participant == myid) {
      if (!(round in userMarkers)) {
        userMarkers[round] = [];
      }
      // '<mark region="'+me.id+'" letter="'+letter+'" note="'+note+'"
      // idx="'+userMarkerCtr+'"/>'
      var mark = $(val);
      var letter = mark.attr('letter');
      var note = mark.attr('note');
      var removeId = mark.attr('idx');
      var region = mark.attr('region');
      if (userMarkerCtr <= removeId) {
        userMarkerCtr = removeId + 1;
      }
      for ( var round in userMarkers) {
        var list = userMarkers[round];
        for ( var idx in list) {
          var item = list[idx];
          if (item[3] == removeId) {
            return;
          }
        }
      }
      userMarkers[round].push([ region, letter, note, removeId ]);
    } else {
      // ally mark
    }
  } else if (tagName == "UNMARK") {
    var unmark = $(val);
    var removeId = unmark.attr('idx');

    for ( var round in userMarkers) {
      var list = userMarkers[round];
      for ( var idx in list) {
        var item = list[idx];
        if (item[3] == removeId) {
          list.splice(idx, 1);
          return;
        }
      }
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
  // log("newMove("+participant+" i:"+index+" r:"+round+") cr:"+currentRound);
  fetchMove(participant, currentRound, index, fetchResponse);
}

/**
 * A series is a game (several rounds), but it may be tutorial, practice or
 * actual
 */
function initializeSeries() {
  log("initializeSeries():" + currentRound);
  $("#series_indicators").fadeIn();
  $(".series").removeClass("series_current");
  enableChat();

  if (currentRound < TUTORIAL_ROUND) {
    initializeTutorial();
    return;
  }
  if (currentRound < PRACTICE_ROUND) {
    initializePractice();
    return;
  }
  if (currentRound < ACTUAL_ROUND) {
    initializeActual();
    return;
  }

}

function completeSeries() {
  if (isMidSeries()) {
    initializeSeries();
    return;
  }
  experimentComplete();
}

function endRound() {
  if (currentRound < FIRST_ACTUAL_ROUND || isMidSeries()) {
    initializeSeries();
    return;
  }

  if (currentRound == ROUND_ZERO + numRounds + 1) {
    // end of last round
    showCurrentBoard();
    setRound(ROUND_ZERO + MID_SERIES_DIFF); // isMidSeries will return true
    showAirstrike();
    return;
  }

  // end of normal round
  if (allowMapHistory) {
    addRoundTab(currentRound - ROUND_ZERO);
  }
  setRound(currentRound + 1);
  if (globalSitRep) {
    addSituationReports(commandHistory[currentRound - 1]);
  } else if (localSitRep) {
    addSituationReports([ commandHistory[currentRound - 1][myid] ]);
  }
  initRound();
  if (currentRound <= ROUND_ZERO + numRounds) {
    updateUnitFromCommands(commandHistory[currentRound - 1]);
  }
}

function addRoundTab(round) {
  $('#currentRound').before(
      '<span round="' + round
          + '" class="roundTab" onclick="showBoardFromRound(' + round + ');">'
          + round + '</span>')
}

function showBoardFromRound(round) {
  try {  
    tips.completeTip(tips.getTipByUid(8).index); 
    if (use1Ptips) {
      addTip("Current Round",
        "<p>Click back on the <b>Current</b> round to see the current state of the board.</p>", 
        "#currentRound", null, 432);
    }
  } catch (err) {} // Round History Tip
  $(".roundTab").removeClass('selectedTab');
  $('.roundTab[round="' + round + '"]').addClass('selectedTab');
  round += ROUND_ZERO;
  clearUnitsFromBoard();
  if (globalMapScans) {
    updateBoardFromCommands(commandHistory[round], round);
  } else if (localMapScans) {
    updateBoardFromCommands([ commandHistory[round][myid] ], round);
  }
  var moves = commandHistory[round];
  for ( var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>' + move + '</foo>');
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
  // log("showCurrentBoard()");
  try {  tips.completeTip(tips.getTipByUid(432).index); } catch (err) {} // Clear current Round History Tip

  $(".roundTab").removeClass('selectedTab');
  $("#currentRound").addClass('selectedTab');
  if (currentRound > FIRST_ACTUAL_ROUND) {
    if (globalMapScans) {
      if (cumulativeMapScans) {
        var allScans = new Array();
        for (var round = FIRST_ACTUAL_ROUND; round < currentRound; round++) {
          allScans = allScans.concat(commandHistory[round]);
        }
        updateBoardFromCommands(allScans, -1);
      } else {
        updateBoardFromCommands(commandHistory[currentRound-1], -1); // or currentRound-1?
      }
    } else if (localMapScans) {
      if (cumulativeMapScans) {
        var allScans = new Array();
        for (var round = FIRST_ACTUAL_ROUND; round < currentRound; round++) {
          allScans.push(commandHistory[round][myid]);
        }
        updateBoardFromCommands(allScans, -1);
      } else {
        updateBoardFromCommands([ commandHistory[currentRound - 1][myid] ], -1);
      }
    }
  }
  clearUnitsFromBoard();
  for ( var unit_idx in units) {
    var unit = units[unit_idx];
    if (unit.nextRegion != null) {
      unit.setLocation(unit.nextRegion);
    }
  }
}

var cancelEndTurnTip = null;
var cancelDeployAssetTip = null;

function initRound() {
  // log("initRound:"+currentRound);
  if (currentRound - ROUND_ZERO <= numRounds) {
    // normal round
    if (use1Ptips) {
      if (currentRound == TUTORIAL_ROUND + 1) {
      // if (! (ranks[0] in awards[myid])) {
      // roundDuration = 360;
      // setCountdown("timer",360);
        addTip(
          "How To Play",
          '<p>Shadow Force is a complex game of deploying military assets to hunt down enemies.</p>'
              + '<p>We will teach you to play by providing "Tips" along the way.</p>'
              +
              /*
               * '<p>When the "Help" button above turns orange, click it for
               * advice.</p>'+
               */
              '<p>You can navigate between the tips with the blue panel below.</p>',
          "#tips_button", units[4].icon, 7777, true);
        // tips.setTip(tips.index);
        tips.show();
        // }
  
        firstUnit = getUnits(myid)[0];
        addTip("Deploy Assets",
            "<p>Deploy one or more of your assets to help search for a "
                + TARGET_NOUN + ".</p>" + "<p>Click the " + firstUnit.name
                + ", then click a region in the battlefield.</p>"
                + "<p>Note: Some units have restricted deployment zones.</p>", [
                "#playerControls", "#canvas" ], firstUnit.icon, 1);
  
        var listener = new Object();
        listener.setNextRegion = function(unitMe, region) {
          tips.completeTip(tips.getTipByUid(1).index);
          firstUnit.removeListener(this);
          log("removed first unit listener: " + firstUnit.listeners.length);
  
          if (currentRound < PRACTICE_ROUND) {
  
            spy = units[4];
            addTip(
                "Deploy Assets",
                "<p><b>Good Job!</b></p>"
                    + "<p>You can add more assets to the map to search more areas.</p>"
                    + "<p>Try deploying the " + spy.name + ".</p>", [
                    "#playerControls", "#canvas" ], spy.icon, 331);
            listener.setNextRegion = function(unitMe, region) {
              tips.completeTip(tips.getTipByUid(331).index);
              spy.removeListener(this);
  
              addTip(
                  "End Turn",
                  '<p><b>Great!</b> You can continue deploying assets.</p>'
                      + '<p>When you have finished deploying your assets, press <span style="background-color:#7DAF27; color:#FFFFFF; padding:2px;">End Turn</span>.</p>',
                  "#go", null, 2);
            }
            spy.addListener(listener);
  
            spy.origDoWait = spy.doWait;
            log("spy: override wait");
            spy.doWait = function() { // first time, don't die
              log("spy: don't die");
              spy.doWait = function() { // 2nd time, die
                log("die spy");
                spy.doWait = spy.origDoWait;
                return -1;
              }
              return 0;
            }
          }
        }
        log("add first unit listener");
        firstUnit.addListener(listener);
      }
      if (currentRound - ROUND_ZERO == 4) {
        addTip("Round History",
            "<p>You can click on these tabs to see the history of your game.</p>"
                + "<p>Click one now to continue.</p>", "#roundHistory", null, 8);
      }
    }

    addBeginTurnSitRep(currentRound - ROUND_ZERO, numRounds);
    for ( var unit_idx in units) {
      var unit = units[unit_idx];
      unit.initTurn();
    }
  } else {
    // answer round
    disableChat();

    // log("answerRound");
    // take all the units that stay on the board off
    for ( var uid in units) {
      var unit = units[uid];
      unit.nextRegion = null;
      unit.currentRegion = null;
    }
    clearUnitsFromBoard();
    initializeAssets(roleUnits[TARGET_ROLE]);

    $("#playerAssetsTitle").html("Target Locations");

    if (use1Ptips) {
      addTip(
        "Identify the Target Locations",
        "<p>Use the information you gained throughout the campaign to determine the most probable location of each "
            + TARGET_NOUN
            + ".</p>"
            + "<p>Indicate your choice by placing each target indicator on the battlefield map.</p>",
        [ "#playerControls", "#canvas" ], roleUnits[TARGET_ROLE][0].icon, 10,
        true);
    }
    // log("answerRound: done");
  }
  showCurrentBoard();
  $('#go').html("End Turn");
  submitted = false;
  if (currentRound < PRACTICE_ROUND) {
    $("#timer").hide();
  } else {
    $("#timer").show();
    setCountdown("timer", roundDuration);        
  }
}

function clearUnitsFromBoard() {
  // log("clearUnitsFromBoard()");
  for ( var unit_idx in units) {
    var unit = units[unit_idx];
    unit.clearLocation();
  }
}

function updateUnitFromCommands(moves) {
  for ( var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>' + move + '</foo>');
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
 * @param userMarkersRound
 *          -1 = all rounds
 */
function updateBoardFromCommands(moves, userMarkersRound) {
  clearRegionStatus();
  for ( var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>' + move + '</foo>');
    // alert(qmove.find('command').length);
    qmove.find('command').each(function(index) {
      if ($(this).attr('region')) {
        var scan = $(this).attr('scan').split(",");
        var unit = units[$(this).attr('unit')];
        var result = $(this).attr('result').split(",");
        for (var i = 0; i < scan.length; i++) {
          var region = regions[scan[i]];
          region.addStatus(result[i], unit.name);
        }
      }
    });
  }

  if (userMarkersRound == -1) {
    for (var round = FIRST_ACTUAL_ROUND; round < FIRST_ACTUAL_ROUND + numRounds; round++) {
      displayUserMarkers(round);
    }
  } else {
    displayUserMarkers(userMarkersRound);
  }
}

function displayUserMarkers(round) {
  if (!(round in userMarkers))
    return;
  var markers = userMarkers[round];
  for ( var m in markers) {
    var mark = markers[m];
    var region = regions[mark[0]];
    region.addStatus(mark[1], mark[2], mark[3]);
  }
}

function addBeginTurnSitRep(round, numRounds) {
  // log("addBeginTurnSitRep("+round+")");
  if (showNumberOfRounds) {
    $("#sitRep").append('<tr><th class="roundHeading">'+ROUND_NOUN+' '+round+' of '+numRounds+':</th></tr>');
  } else {
    $("#sitRep").append('<tr><th class="roundHeading">'+ROUND_NOUN+' '+round+':</th></tr>');
  }
}

function addSituationReports(moves) {
  for ( var m in moves) {
    var move = moves[m];
    var qmove = $('<foo>' + move + '</foo>');
    // alert(qmove.find('command').length);
    qmove
        .find('command')
        .each(
            function(index) {
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
              reports = unit
                  .buildSituationReport(no, possible, confirmed, wait);
              if (isMyUnit(unit)) {
                if (use1Ptips) {
                  addTip(
                    "Situation Report",
                    "<p>Your assets have delivered information about "
                        + TARGET_NOUN
                        + " locations.</p>"
                        + "<p><i>Each asset has a chance of being incorrect about their assessment.</i></p>"
                        + "<p>Some assets are more accurate than others.</p>"
                        + "<p>Your assets automatically mark the battlefield map with:</p><ul>"
                        + '<li><span style="color:'
                        + VALUE_COLOR[0]
                        + '; font-style:bold;">0</span> - nothing significant to report</li>'
                        + '<li><span style="color:#B4B415; font-style:bold;">?</span> - vehicles detected (may be launchers, deception operations, or routine civilian traffic)</li>'
                        + '<li><span style="color:'
                        + VALUE_COLOR[2]
                        + '; font-style:bold;">!</span> - launchers detected</li></ul>',
                    function(active) {
                      if (active) {
                        $(".sr_me").css("background-color", "#FF0000");
                        $("#sitRep_wrapper").addClass(defaultAttrs);
                      } else {
                        $(".sr_me").css("background-color", "");
                        $("#sitRep_wrapper").removeClass(defaultAttrs);
                      }
                    }, unit.icon, 4, true);
                }
              } else {
                delayAddTip(
                    400,
                    5,
                    "Ally Situation Report",
                    "<p>Your allies have delivered information about the locations of "
                        + TARGET_NOUN_PLURAL
                        + ".</p>"
                        + "<p>Use a marker to jot relevant information on the battlefield map from your allied units.</p>"
                        + "<p>Click the marker, then click a square in the map to set the marker.</p>",
                        + "<p>Make sure to check the situation reports at the beginning of every turn.</p>",
                    function(active) {
                      if (active) {
                        $(".sr_team").css("background-color", "#FF0000");
                        $("#marker_panel").addClass(defaultAttrs);
                        $("#sitRep_wrapper").addClass(defaultAttrs);
                      } else {
                        $(".sr_team").css("background-color", "");
                        $("#marker_panel").removeClass(defaultAttrs);
                        $("#sitRep_wrapper").removeClass(defaultAttrs);
                      }
                    }, unit.icon, true);
              }
              for (i in reports) {
                var report = reports[i];
                appendSitRep(unit.name, report, isMyUnit(unit));
              }
            });
  }
}

function appendSitRep(title, value, mine) {
  var srClass = "sr_team";
  if (mine) {
    srClass = "sr_me";
  }
  
  $("#sitRep").append('<tr class='+srClass+'><th>&nbsp;&nbsp;'+title+'&nbsp;</th><td>'+value+'</td></tr>'); 
  sitRepScrollbar.slider("value",0);
}

var cancelChatTip = null;
var DEFAULT_CHAT = "<type chat here>";
function initChat() {
  if (playerChat) {
    cancelChatTip = delayAddTip(15000, 9, "Chat",
        "<p>You should use the chat panel to coordinate wiht your allies.</p>",
        "#chatPanel");

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
      if (cancelChatTip) {
        cancelChatTip();
        cancelChatTip = null;
      }
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
  if (cancelChatTip) {
    cancelChatTip();
    cancelChatTip = null;
  }
  try { tips.completeTip(tips.getTipByUid(9).index); } catch (err) {} // Chat Tip
  
  if ($("#chatInput").val() == DEFAULT_CHAT) {
    return;
  }

  sendChat($("#chatInput").val());

  $("#chatInput").val(DEFAULT_CHAT);
}

function chatReceived(tid, val) {
  // appendSitRep(roleName[getFirstRole(tid)], val);
  title = roleName[getFirstRole(tid)];
  value = val;
  $("#chat").append(
      '<tr><th>&nbsp;&nbsp;' + title + '&nbsp;</th><td>' + value + '</td></tr>');
  chatScrollbar.slider("value", 0);
  
  if (tid != myid) {    
    addUniqueTip(
        433,
        "Ally Chat",
        "<p>Your ally has sent you a chat.  When chats contain information about the locations of "
            + TARGET_NOUN_PLURAL
            + ",</p>"
            + '<p>you should manually place a marker (<span style="color:'+VALUE_COLOR[0]
            +'; font-style:bold;">0</span>,<span style="color:#B4B415; font-style:bold;">?</span>,<span style="color:'
            + VALUE_COLOR[2]
            + '; font-style:bold;">!</span>) to jot relevant information on the battlefield map from your allied units.</p>'
            + "<p>Toggle the marker button, then click squares in the map to set the marker.</p>"
            + "<p>Untoggle the marker button when complete.</p>",
        function(active) {
          if (active) {
            $(".sr_team").css("background-color", "#FF0000");
            $("#marker_panel").addClass(defaultAttrs);
            $("#chatPanel").addClass(defaultAttrs);
          } else {
            $(".sr_team").css("background-color", "");
            $("#marker_panel").removeClass(defaultAttrs);
            $("#chatPanel").removeClass(defaultAttrs);
          }
        }, null, true);
  }
}

function disableChat() {
  $('#sendChat').attr("disabled", "disabled");
  $('#sendChat').attr("title", "Chat is disabled in this round.");
  $('#sendChat').css("cursor", "not-allowed");
  $('#sendChat').attr("onclick", "");

  $('#chatInput').prop("disabled", true);
  $("#chatInput").val("<chat disabled>");
}

function enableChat() {
  $('#sendChat').attr("disabled", null);
  $('#sendChat').attr("title", null);
  $('#sendChat').css("cursor", "default");
  $('#sendChat').attr("onclick", "callSendChat();");

  $('#chatInput').prop("disabled", false);
  $("#chatInput").val(DEFAULT_CHAT);
}

var animTimer = null;
function startAnimation() {
  if (animTimer != null)
    return;
  animTimer = setInterval(doAnimation, 50); // 20FPS
}
function stopAnimation() {
  if (animTimer == null)
    return;
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
var chatScrollbar = null;

function initScrollPanes() {
  sitRepScrollbar = initScrollPane("sitRep");
  if (playerChat) {
    chatScrollbar = initScrollPane("chat");
  }
}

function initScrollPane(name) {
  // scrollpane parts
  var scrollPane = $("#" + name + "_wrapper"), scrollContent = $("#" + name);

  function updateContent(event, ui) {
    if (scrollContent.height() > scrollPane.height()) {
      scrollContent.css("margin-top", Math.round((100 - ui.value) / 100
          * (scrollPane.height() - scrollContent.height()))
          + "px");
    } else {
      scrollContent.css("margin-top", 0);
    }
  }

  // build slider
  return $("#" + name + "ScrollBar").slider({
    orientation : "vertical",
    range : "min",
    min : 0,
    max : 100,
    value : 100,
    slide : updateContent,
    change : updateContent
  });
}
