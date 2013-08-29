(function ($) {
  // writes the string
  //
  // @param jQuery $target
  // @param String str
  // @param Numeric cursor
  // @param Numeric delay
  // @param Function cb
  // @return void
  function typeString($target, str, cursor, delay, cb) {
    $target.html(function (_, html) {
      return html + str[cursor];
    });

    if (cursor < str.length - 1) {
      setTimeout(function () {
        typeString($target, str, cursor + 1, delay, cb);
      }, delay);
    }
    else {
      cb();
    }
  }

  // clears the string
  //
  // @param jQuery $target
  // @param Numeric delay
  // @param Function cb
  // @return void
  function deleteString($target, delay, cb) {
    var length;

    $target.html(function (_, html) {
      length = html.length;
      return html.substr(0, length - 1);
    });

    if (length > 1) {
      setTimeout(function () {
        deleteString($target, delay, cb);
      }, delay);
    }
    else {
      cb();
    }
  }

  // jQuery hook
  $.fn.extend({
    teletype: function (opts) {
      var settings = $.extend({}, $.teletype.defaults, opts);

      return $(this).each(function () {
        (function loop($tar, idx) {
          // type
          typeString($tar, settings.text[idx], 0, settings.delay, settings.cb);

        }($(this), 0));
      });
    }
  });

  // plugin defaults  
  $.extend({
    teletype: {
      defaults: {
        delay: 100,
        pause: 5000,
        text: [],
        cb: function () {
//        // delete
//        setTimeout(function () {
//          deleteString($tar, settings.delay, function () {
//            loop($tar, (idx + 1) % settings.text.length);
//          });
//        }, settings.pause);
        }
      }
    }
  });
}(jQuery));

function setInstructions(initial, sentence, cb) {
  if (typeof(cb) != "function") {
    cb = function() {};
  }
  $('#instruction_text').html(initial);
  $('#instruction_text').teletype({
    text: [sentence],
    delay: 20,
    cb: cb
  });  
}


var instruction_text1 = 'Find the shortest path of English words that connects the two words.  Each word in the path may only change 1 letter at a time.';
function initializeInstructions() {
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
        ' "xyz" is not a word.  Try again.');
  } else if (word=="pet") {
    setInstructions(        
        instruction_text1,
        ' "pet" is not the best choice.  Try again.');    
  } else if (word=="bed") {
    setInstructions('','Great!  "bed" is the best choice because it is only 1 letter different from "bet" and "bad"',
        function() {
      setTimeout(instructionsPart2,1500);
    });      
  }
}

/**
 * Return true to abort setting solution.
 */
function instructionsSetSolution(solution) {
  return false;
}

function instructionsPart2() {
  disableArrows = true;
  $("#suggestions").hide();
  $(".word_input_group").fadeIn();
  setTimeout(instructionsPart2a,1500);
  
  instructionsPushWord = function(word) {
    if (word=="bed") {
      instructionsPart3();
    } else {
      setInstructions('','You typed "'+word+'"  Try again to type "bed"');
      setSolution([]);
    }
  }
}

function instructionsPart2a() {
  $('#letter_0').focus();
  setInstructions('','This is the word selector.  You can type in a word and it will automatically accept if it is valid.  Try typing "bed"',function() {
    $("#no_keyboard").fadeIn();
  });
}

function instructionsPart3() {
  instructionsPushWord = function(word) {
    if (word=="bed") {
      instructionsPart4();
    } else {
      setInstructions('','You chose "'+word+'"  Try again to choose "bed"');
      setSolution([]);
    }
  }
  setSolution([]);
  disableArrows = false;
  $("#no_keyboard").fadeOut();
  setInstructions('','Great!  You can also use the arrow buttons above and below the letters.  They will only select valid words.  Use the arrows in the 3rd column to select "bed", then press "accept"');
}

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
      setInstructions('','Congratulations, you have completed the instructions.  Additional controls include Undo and Redo buttons.  You will have to complete the puzzle in a fixed timeframe.  Click "Play a Game" to try a puzzle.');
      $("#play_a_game").fadeIn();
      return false;
    }

    var foo = "";
    if (solution.length > 1) {
      foo = 'You chose "'+solution[solution.length-1]+'." ';
    }
    setInstructions('',foo+'Choose "sat" to load it as your Current Solution.');
    return true;
  };
  setInstructions('','You will be able to see your best solution, and in some cases other player\'s solutions.  You can load a part of a solution by clicking on that word.  Here is an example of a poor solution.  Click "sat" to load it as your Current Solution.');
}

function instructionsComplete() {
  writeAward("instructions",0);
  doneInstructions();
}

function doneInstructions() {
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
  $("#suggestions").removeClass("large_suggestions");
  $("#suggestions").show();
  $(".word_input_group").show();
  setTimeout(setFirstPuzzle, 1000);
}

function setFirstPuzzle() {
  
//  setPuzzle(3,3,"bet","bad");
  
  setRandomPuzzle(1);
}


