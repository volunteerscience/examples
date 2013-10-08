
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

function setInstructions(initial, sentence, cb) {
  return fadeInstructions(initial, sentence, cb);
}

var interactiveInstructions = false;
var iiState = 0;
var demoMap = [[20,20],[20,160],[260,160],[260,20]];
function interactiveInstructions1() {
  interactiveInstructions = true;
  currentInstruction = $("#instruction_b");
  incomingInstruction = $("#instruction_a");
  $("#interactiveInstructions1").show();
  setInstructions('<p>A traveling salesperson needs to visit a series of cities.</p>'+
      '<p>Your job is to create an itinerary that <i>minimizes the total miles traveled</i> and <i>visit each city only once</i>.</p>'+
      '<p>Click <span style="color:'+greenButtonColor+'">Next</span> to continue.</p>');
  //   doneAllInstructions();
}

var demoPaper = null;

function interactiveInstructionsNext() {
//  You can undo moves by clicking on a previously travelled city, or start over by hitting reset. Once you're done, click Submit. You have 945 seconds to complete the itinerary.
// At the end of each round you will see your best solution and score and the other players' solution and scores from the previous round.
//  You will have 9 rounds to improve your score by suggesting alternative itineraries on the same map.
  switch(iiState) {
  case 0:
    width = 300;
    height = 184;
    paper = Raphael("interactiveMap", width+cityRad*2, height+cityRad*2);
    cities = buildMapFromArray(demoMap);
    initializeMainMap(cities);
    setInstructions('<p>The blue area below is your <span style="color:'+fieldColor+'">map</span>.</p>'+
        '<p>Each green circle is a <span style="color:'+greenButtonColor+'">City</span>.</p>'+
        '<p>Click on all '+cities.length+' cities below to generate a path.</p>');  
    $("#interactiveMap").fadeIn(1500);
    $("#iinext").fadeOut();
    iiState++;
    break;    
  case 1:
    setInstructions('<p>Great!  You can undo a path by clicking on a previous red <span style="color:'+usedCityColor+'">city</span> '+
        'in the path.  Do that now.</p>');  
    iiState++;
    break;    
  case 2:
    setInstructions('<p>This is the clock.  It shows how many seconds you have to complete this itinerary.</p>'+
        '<p>When the clock expires, you will be told the length of your path.</p>'+
        '<p>Each round has the same map.  -- You should try to improve your solution each round.</p>'+  
        '<p>Click <span style="color:'+greenButtonColor+'">Next</span> to continue.</p>');
    $("#iiclock").fadeIn(1500);
    $("#iinext").fadeIn();
    iiState++;
    break;    
  case 3:
    setInstructions('<p>This is the <span style="color:'+greenButtonColor+'">Reset</span> button.  Use it to clear your current solution.</p>'+
        '<p>Click it now.</p>');  
    $("#iireset").show();
    $("#iinext").fadeOut();
    iiState++;
    break;    
  case 4:
    setInstructions('<p>This button will <span style="color:'+greenButtonColor+'">Load your Previous Solution</span>.  '+
        '<p>It is disabled on the first round.</p>'+
        '<p>Click it now.</p>');  
    $("#ii_prev_solution").show();
    iiState++;
    break;    
  case 5:
    setInstructions('<p>This button lets you  <span style="color:'+greenButtonColor+'">Submit</span> your solution when you are ready.  '+
        '<p>Click it now.</p>');  
    $("#iisubmitButton").show();
    iiState++;
    break;    
    
  case 6:
    setInstructions("<p>In some cases you will be able to see <i>other player's solutions</i> or your <i>best</i> or <i>previous</i> solution.</p>"+
        '<p>These appear as a smaller map to the side of your main map.</p>'+
        '<p>Click <span style="color:'+greenButtonColor+'">Next</span> to continue.</p>');
    $('#interactiveMap').after('<div id="solution_99" class="teamSolution" style="display:none; margin:0;"><h4 class="gameLabel">Player 2</h4><div id="canvas_99"></div><div id="score_99" class="score">789</div></div>');
    width = 570;
    height = 460;
    demoPaper = Raphael("canvas_99", (width+cityRad*2)*tFac, (height+cityRad*2)*tFac);
    var myCities = buildMapFromArray(demoMap);
    doDrawTeamMap(demoPaper, myCities, [0,1,2,3]);
    $("#solution_99").fadeIn(1500);
    $("#iinext").fadeIn(1500);
    iiState++;
    break;    
  case 7:
    setInstructions('<p>Congratulations!</p><p>You are now qualified to generate travel itineraries.</p>'+  
      '<p>Click <span style="color:'+greenButtonColor+'">Next</span> to begin.</p>');
    iiState++;
    break;    
  case 8:
    doneInteractiveInstructions1();
    break;    
  }
}

function iireset() {
  reset();
  if (iiState == 4) {
    interactiveInstructionsNext();
  }
}

function iiLoadPrev() {
  if (iiState == 5) {
    interactiveInstructionsNext();
  }
}

function iiSubmit() {
  if (iiState == 6) {
    interactiveInstructionsNext();
  }
}

function doneInteractiveInstructions1() {
  try {
    paper.remove();
    paper = null;
  } catch (err) {}
  try {
    demoPaper.remove();
    demoPaper = null;
  } catch (err) {}
  $("#interactiveInstructions1").hide();  
  interactiveInstructions = false;
  doneAllInstructions();  
}

function pathComplete() {
  if (!interactiveInstructions) return;
  
  if (iiState == 1) {
    interactiveInstructionsNext();
  }
}

function undoComplete() {
  if (!interactiveInstructions) return;

  if (iiState == 2) {
    interactiveInstructionsNext();
  }
}

