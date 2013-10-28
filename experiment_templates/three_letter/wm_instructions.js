var currentInstruction = null;
var incomingInstruction = null;
var instructionCallback = null;
function fadeInstructions(initial, sentence, cb) {
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
  
  if (initial != null && initial.length > 0) {
    incomingInstruction.html('<p>'+initial+'</p><p>'+sentence+'</p>');    
  } else {
    incomingInstruction.html('<p>'+sentence+'</p>');    
  }
  
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

var instruction_text1 = 'Find the shortest path of English words that connects the two words.  In this case <b>bet</b> and <b>bad</b>.  Each word in the path may only change <i>1 letter at a time</i>.';
function initializeInstructions() {
  currentInstruction = $("#instruction_b");
  incomingInstruction = $("#instruction_a");
  
  hide_ellipsis = true;

  instructions = true;
//  $("#skip_instructions").show(); 
  try {
    if (awards[myid]["instructions"]["count"] > 0) {
      $("#skip_instructions").show();      
    }
  } catch(err) {
  }
  
  setInstructions('',instruction_text1);
  
  setPuzzle(3,3,"bet","bad");
  setSuggestions('Click a Suggestion:', ["xyz","pet","bed"]);

  $("#suggestions").addClass("large_suggestions");
  $("#instructions").show();
  $("#suggestions").show();
  
  $("#active_solution").switchClass("","instruction_solution");
  $("#active_solution .arrow").switchClass("","instruction_arrow");
}

function instructionsPushWord(word) {
//  alert(word); 
  if (word=="xyz") {
    setInstructions(
        instruction_text1,
        '<b>Xyz</b> is not a word.  Try again.');
  } else if (word=="pet") {
    setInstructions(        
        instruction_text1,
        '<b>Pet</b> is not the best choice.  Try again.');    
  } else if (word=="bed") {
    setInstructions('','Great!  <b>Bed</b> is the best choice because it is only 1 letter different from <b>bet</b> and <b>bad</b>.',
        function() {
      setTimeout(instructionsPart2,2000);
    });      
  }
}

/**
 * Return true to abort setting solution.
 */
function instructionsSetSolution(solution) {
  return false;
}

var showNoKeyboardButton = true;
function instructionsPart2() {
  showNoKeyboardButton = true;
  disableArrows = true;
  $("#suggestions").hide();
  $(".word_input_group").fadeIn();
  setTimeout(instructionsPart2a,1500);
  
  instructionsPushWord = function(word) {
    if (word=="bed") {
      showNoKeyboardButton = false;      
      instructionsPart3();
    } else {
      setInstructions('','You typed <b>'+word+'</b>  Try again to <i>type</i> <b>bed</b>.');
      setSolution([]);
    }
  }
}

function instructionsPart2a() {
  if (!instructions) return;
  $('#letter_0').focus();
  setInstructions('','This is the word selector.  You can <i>type</i> in a word and it will automatically accept if it is valid.  Try typing <b>bed</b>.',function() {
    if (showNoKeyboardButton) {
      $("#no_keyboard").fadeIn();      
    }
  });
}

function instructionsPart3() {
  instructionsPushWord = function(word) {
    if (word=="bed") {
      instructionsPart4();
    } else {
      setInstructions('','You chose <b>'+word+'</b>  Try again to choose <b>bed</b>.  Then click <span style="color:green;">Accept</span>.');
      setSolution([]);
    }
  }
  setSolution([]);
  disableArrows = false;
  $("#no_keyboard").stop();
  $("#no_keyboard").fadeOut();
  setInstructions('','You can also use the <span style="color:blue;">arrow buttons</span> above and below the letters.  They will only select valid words.  Use the arrows in the <i>3rd column</i> to select <b>bed</b>, then press <span style="color:green;">Accept</span>.');
}

/**
 * How to load part of a solution.
 */
function instructionsPart4() {
  hide_ellipsis = false;
  $("#active_solution .arrow").switchClass("instruction_arrow","");
  $("#active_solution").switchClass("instruction_solution","");
  $(".word_input_group").fadeOut();

  $("#best_title").html("Player 2");
  setSolution(['yet','jet','set','sat','sad']);
  $("#current_solution_title").show();
  instructionsSetSolution = function (solution) {
    if (solution.length > 1 && solution[solution.length-1] == 'sat') {
      instructionsPart5();
      return false;
    }

    var foo = "";
    if (solution.length > 1) {
      foo = 'You chose <b>'+solution[solution.length-1]+'</b>. ';
    }
    setInstructions(foo,'Choose <b>sat</b> to load it as your Current Solution.');
    return true;
  };
  setInstructions('After you find a solution, will be able to see your <i>best</i>, and in some cases <i>other Player\'s</i> solutions.  You can load a part of a solution by <b>clicking on that word</b>.',
          'Click <b>sat</b> to load it as your Current Solution.');
}

/**
 * How to reset solution.
 */
function instructionsPart5() {
  $("#current_solution_title").show();
  instructionsSetSolution = function (solution) {
    if (solution.length == 0) {
      setInstructions('Congratulations, you have completed the instructions!','Additional controls include <span style="color:green;">Undo</span> and <span style="color:green;">Redo</span> buttons.  You will have to complete the puzzle in a <i>fixed timeframe</i>.  Click <span style="color:green;">Play a Game</span> to try a puzzle.');
      $("#play_a_game").fadeIn();
      return false;
    }

    var foo = "";
    if (solution.length > 0) {
      foo = 'You chose <b>'+solution[solution.length-1]+'</b>.';
    }
    setInstructions(foo,'Choose <b>bet</b> to <i>reset</i> your Current Solution.');
    return true;
  };
  setInstructions('','You can <i>reset</i> your current solution by clicking the first word.  Click <b>bet</b> to reset your Current Solution.');
}

function instructionsComplete() {
  $("#skip_instructions").hide();
  writeAward("instructions",0);
  doneInstructions(true);
}

function doneInstructions(doSubmit) {
  if (!instructions) return;
  $("#play_a_game").html("Waiting for Team");
  $("#skip_instructions").html("Waiting for Team");
  if (doSubmit) submit('<ready />');
}

/**
 * called from newMove()
 */
function clearInstructions() {
  $("#play_a_game").hide();
  hide_ellipsis = false;
  $("#best_title").html("Best");
  bestSolution = null;
  $('#bestGroup').hide();
  
  $("#timer").show();
  $('#current_solution_title').show();
  disableArrows = false;
  $("#active_solution .arrow").switchClass("instruction_arrow","");
  $("#active_solution").switchClass("instruction_solution","");
  
  instructions = false;
  $("#instructions").hide();
  $("#skip_instructions").hide();
  $("#no_keyboard").hide();
  $("#suggestions").removeClass("large_suggestions");
  setRound(1);

  $("#undo").show();
  $("#redo").show();
  $("#suggestions").show();
  $(".word_input_group").show();
  setTimeout(setFirstPuzzle, 1);
}

function setFirstPuzzle() {
  
//  setPuzzle(3,3,"bet","bad");
  
  setRandomPuzzle(1);
}


