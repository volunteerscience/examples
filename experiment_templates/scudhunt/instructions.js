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

var inInstructions = true;
function runAllInstructions() {
  inInstructions = true;
  initializeInstructions();
  commandHistory[1] = new Array();
  setRound(1);
  runInstructions(story);
}

var section = 0;
var curInstructions = null;
function runInstructions(instructionArray) {
  curInstructions=instructionArray;
  curStory = 0;
  runInstruction();
}

var curStory = 0;
var storyTimer = null;
function runInstruction() {
  if (storyTimer != null) {
    clearInterval(storyTimer);
    storyTimer = null;
  }
  if (curStory >= curInstructions.length) {
    doneSection();
    return;
  }
  var storyLine = curInstructions[curStory++];
  setInstructions(storyLine); 
  storyTimer = setInterval(runInstruction, 1500+storyLine.length*55);  // hack to make it timeout based on length of info
}

function interactiveInstructionsNext() {
  runInstruction();
}

function interactiveInstructionsBack() {
  curStory-=2;
  if (curStory < 0) {
    if (section > 0) {
      section-=2;
      doneSection();
      curStory = curInstructions.length-1;
    } else {
      curStory = 0;
    }
  }
  runInstruction();
}

function skipInstructions() {
  switch(section) {
  case 1: // map rules
    section++; // skip asset rules
    break;
  }
  doneSection();
}

function doneSection() {
  log("doneSection:"+section);
  switch(section) {
  case -1: // back from 
    $("#userBoard").fadeOut();
    $("#iskip").attr('value',"Skip Story");
    runInstructions(story);
    break;
  case 0: // story
    $("#playerControls").fadeOut();
    $("#userBoard").fadeIn();
    $("#iskip").attr('value',"Skip General Instructions");
    runInstructions(mapRules);
    break;
  case 1: // map rules
    $("#playerControls").fadeIn();
    $("#userBoard").fadeIn();
    $("#iskip").attr('value',"Skip General Instructions");
    initializeAssets(instructionAssets);
    runInstructions(assetRules);
    break;
    
    
  default:
    doneInstructions();
    break;
  }
  section++;
}

/**
 * Submit ready on round 1 to begin (this fixes a refresh problem)
 */
function doneInstructions() {
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
  }
  
  initializeMyAssets();

  inInstructions = false;
  $('#roundHistory').show();
  $('#timer').show();
  $('#go').show();
  $('#playerControls').show();
  $('#situationReport').show();
  $('#userBoard').show();
}
