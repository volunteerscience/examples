var currentInstruction = null;
var incomingInstruction = null;
var instructionCallback = null;
function fadeInstructions(sentence, cb) {
  // call the previous callback immeadiately
  if (instructionCallback != null) {
    if (typeof(instructionCallback) == "function") {
      instructionCallback();
      instructionCallback = null;
    }
  }
  instructionCallback = cb;
  
  currentInstruction.stop(false, true); // complete the current animation
  incomingInstruction.stop(false, true);
  currentInstruction.show();
  incomingInstruction.hide();
  
  incomingInstruction.html(sentence);    
  
  currentInstruction.fadeOut(500);
  incomingInstruction.fadeIn(2000);

  var temp = incomingInstruction;
  incomingInstruction = currentInstruction;
  currentInstruction = temp;

  if (typeof(cb) == "function") {
    setTimeout(cb,2000);
    instructionCallback = null;
  }
}

function setInstructions(sentence, cb) {
  return fadeInstructions(sentence, cb);
}

function initializeInstructions() {
  currentInstruction = $("#instruction_b");
  incomingInstruction = $("#instruction_a");
}

function blink(elt, rate, times) {
  elt.blinkCt = 0;
  elt.blinkInterval = setInterval(function() {
    log("blink:"+elt.blinkCt);
    if (elt.blinkCt % 2 == 0) {
//      elt.css("background-color","red");
      elt.css("border-radius","3px");
      elt.css("border","solid 2px red");
    } else {
//      elt.css("background-color","");
      elt.css("border","none");
    }
    elt.blinkCt++;
    if (elt.blinkCt >= times*2) {
      clearInterval(elt.blinkInterval);
    }
  }, rate/2);
}

var inInstructions = true;
function runAllInstructions() {
  inInstructions = true;
  initializeInstructions();
  commandHistory[1] = new Array();
  setRound(1);
  runInstructions(story);
//  doneInstructions();
}

var section = 0;
var curInstructions = null;
function runInstructions(instructionArray) {
  curInstructions=instructionArray;
  curStory = -1;
  runInstruction();
}

var curStory = 0;
var storyTimer = null;
function runInstruction() {
  if (storyTimer != null) {
    clearInterval(storyTimer);
    storyTimer = null;
  }
  if (!inInstructions) return;
  curStory++;
  if (curStory >= curInstructions.length) {
    doneSection();
    return;
  }
  
  var setTimer = updateInstruction(section,curStory);
  var storyLine = curInstructions[curStory];
  setInstructions(storyLine); 
  if (setTimer[0]) {
    storyTimer = setInterval(runInstruction, 1500+storyLine.length*55);  // hack to make it timeout based on length of info
  }
  if (setTimer[1]) {
    $('#inext').fadeIn();
  } else {
    $('#inext').fadeOut();
  }
}

function interactiveInstructionsNext() {
  runInstruction();
}

function interactiveInstructionsBack() {
  curStory-=2;
  if (curStory < 0) {
    if (section > 0) {
      section--;
      initializeSection();
      curStory = curInstructions.length-2;
    } else {
      curStory = 0;
    }
  }
  runInstruction();
}

function skipInstructions() {
  if (section <= LAST_STORY_SECTION) {
    section = LAST_STORY_SECTION+1; // skip story
  } else if (section <= LAST_GENERAL_SECTION) {
    section = LAST_GENERAL_SECTION+1; // skip general
  } else if (section < NEW_RULE_SECTION) {
    section = NEW_RULE_SECTION; // skip specific
  }
  initializeSection();
}

function doneSection() {
  section++;
  initializeSection();
}


var S_STORY = 0;
var S_MAP = 1;
var S_SPY = 2;
var S_SAT = 3;
var S_AIR = 4;
var S_END_TURN = 5;

// helpers for skip instructions button
var LAST_STORY_SECTION = S_STORY;
var LAST_GENERAL_SECTION = S_END_TURN; // TODO: update me
var NEW_RULE_SECTION = 20; // TODO: set me



function initializeSection() {
  log("initializeSection:"+section);
  switch(section) {
  case S_STORY: 
    $("#userBoard").fadeOut();
    $("#iskip").attr('value',"Skip Story");
    runInstructions(story);
    break;
  case S_MAP: 
    $("#playerControls").fadeOut();
    $("#userBoard").fadeIn();
    $("#iskip").attr('value',"Skip General Instructions");
    runInstructions(mapRules);
    break;
  case S_SPY: 
    $("#playerControls").fadeIn();
    initializeAssets([instructionAssets[0]]);
    runInstructions(placeSpyRules);
    break;
  case S_SAT: 
    initializeAssets([instructionAssets[0],instructionAssets[1]]);
    runInstructions(placeSatelliteRules);
    break;
  case S_AIR: 
    $("#go").fadeOut();
    initializeAssets(instructionAssets);
    runInstructions(placeAirRules);
    break;
  case S_END_TURN: 
    $("#go").fadeIn();
    // TODO: render a bunch of assets
    runInstructions(endTurnRules);
    break;
    
    
  default:
    doneInstructions();
    break;
  }
}

/**
 * Chance to modify the view based on each line
 * 
 * Return array: 
 *   0: true to auto-advance (with a timer), false if the user must do something to proceed
 *   1: true to show next, false to hide it
 * @param section
 * @param line
 */
function updateInstruction(section,curStory) {
  log("updateInstruction("+section+","+curStory+")");
  switch(section) {
  case S_SPY: 
    switch(curStory) {
    case 1:
      return [false,false];
    case 2:
      blink($('.asset[asset="'+instructionAssets[0].id+'"] .status'), 800, 5);
//      return [true,true];
      return [true,true];
    }
    break;
  case S_SAT: 
    switch(curStory) {
    case 1:
      return [false,false];
    }
    break;
  case S_AIR: 
    switch(curStory) {
    case 0:
    case 1:
      return [false,false];
    }
    break;
  case S_END_TURN:
    switch(curStory) {
    case 0: // click end turn
      return [false,false];
    case 1: // see scan results
      simulateScan();
      $("#go").fadeOut();
      return [false,true];
    case 2: // wait for popup
      hasShownPopup = false;
      return [false,false];
    case 3: // place spy
      simulateDeath();
      return [false,false];
    case 4: // place satellite
      return [false,false];
    case 5: // click next
      return [false,true];
    }
  }
  return [true,true];
}

/**
 * called when a unit was set
 * return true to cancel placement
 */
function instructionSetNextRegion(unit,region) {
  if (simulatingDeath) return; // simulateDeath calls this, which breaks things
  if (region == null) return;
  log("instructionSetNextRegion("+unit.name+","+region+")")
  switch(section) {
  case S_SPY: 
    if (unit == instructionAssets[0]) {
      if (curStory < 1) curStory = 1; // skip story 1 if needed
      runInstruction();
    }
    break;
  case S_SAT: 
    if (unit == instructionAssets[1]) {
      if (curStory < 1) curStory = 1; // skip story 1 if needed
      runInstruction();
    }
    break;
  case S_AIR: 
    if (unit == instructionAssets[2]) {
      switch(curStory) {
      case 0:
        alert("You placed the asset in a legal region.  Place it in a restricted region.");
        return true;
      case 1:
        runInstruction();
        break;
      }
    }
    break;
  case S_END_TURN: 
    switch(curStory) {
    case 3: // place spy
      if (unit == instructionAssets[0]) {
        runInstruction();
      }
      break;
    case 4: // place satellite
      if (unit == instructionAssets[1]) {
        runInstruction();
      }
      break;
    }
  }
  return false;
}

/**
 * 
 * @param unit
 * @param region
 * @returns true to suppress "cant move" alert
 */
function instructionCantMove(unit, region) {
  switch(section) {
    case S_AIR: 
      if (unit == instructionAssets[2] && curStory == 0) {
        runInstruction();
        return true;
      }
  }
  return false;
}

function instructionSubmitMove() {
  switch(section) {
  case S_END_TURN:
    if (curStory == 0) {
      runInstruction();
    }
  }
}

/**
 * Used by instructions.
 */
function simulateScan() {
  var submission = "";
  var result = 0;

  for (idx in instructionAssets) {
    var unit = instructionAssets[idx];
    var scanned = unit.effect(unit.nextRegion);
    var id_str = [];
    var result_str = [];
    for (var r_idx in scanned) {
      var reg = scanned[r_idx];
      id_str.push(reg.id);
      result_str.push(VALUE_DISPLAY[result]);
      result++;
      if (result > 2) result = 0;
    }
    var wait = 1;
    submission+='<command unit="'+unit.id+'" region="'+unit.nextRegion.id+'" scan="'+id_str.join(",")+'" result="'+result_str.join(",")+'" wait="'+wait+'"/>';
  }

  
//  addRoundTab(currentRound-ROUND_ZERO);
  
  updateBoardFromCommands([submission]);
}

var hasShownPopup = false;
function instructionShowPopup(txt) {
  if (section == S_END_TURN && curStory == 2) {
    $('#inext').fadeIn();
    if (hasShownPopup) return;
    hasShownPopup = true;
    currentInstruction.append('<p>Click <span style="color:green;">Next</span> to continue.</p>');
  }
}

var simulatingDeath = false;
function simulateDeath() {
  simulatingDeath = true;
  var submission = "";

  
//  instructionAssets[0].nextRegion = instructionAssets[0].currentRegion;
  instructionAssets[1].nextRegion = null;
  instructionAssets[2].nextRegion = null;
  instructionAssets[2].wait = 1;
  
  for (idx in instructionAssets) {
    var unit = instructionAssets[idx];
    submission+='<command unit="'+unit.id+'" region="'+(unit.nextRegion == null ? "" : unit.nextRegion.id)+'" scan="" result="" wait="'+unit.wait+'"/>';
  }

  updateUnitFromCommands([submission]);
  simulatingDeath = false;
}



/**
 * Submit ready on round 1 to begin (this fixes a refresh problem)
 */
function doneInstructions() {
  if (!inInstructions) return;
  $("#iskip").attr('value',"Waiting for Team");
  submit('<ready />');
}

/**
 * called from newMove()
 */
function clearInstructions() {
  $('#bottomPanel').hide();
  $('#instructions').hide();

  for (var unit_idx in units) {
    var unit = units[unit_idx];
    unit.currentRegion = null;
    unit.setNextRegion(null);
    unit.wait = 0;
  }
  clearRegionStatus();
  
  initializeMyAssets();

  inInstructions = false;
  $('#roundHistory').show();
  $('#timer').show();
  $('#go').show();
  $('#playerControls').show();
  $('#situationReport').show();
  $('#userBoard').show();
}
