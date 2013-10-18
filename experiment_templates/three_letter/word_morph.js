var showDifficulty = true;

var numLetters = 3;
var difficulty = 0;
var bestLength = 0;
var firstWord = null;
var lastWord = null;
var legalWords;
var suggestions = [];
var puzzles = null;
var curWord = null;
var curSolution = [];
var bestSolution = null;
var lastSolution = null;
var undoIndex = -2;
var undoList = [];
var curWordSuggestions = [];
var letterSuggestion = null;
var fullAlphabetArrow = false; // false means use suggestions for up/down arrows, true means use full alphabet
var instructions = false;
var disableArrows = false;
var hide_ellipsis = false;
var expired = false;
var maxDifficulty = 3;
var isMobile = false;

function initialize() {
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
  }
  
  chooseDifficulty();
  log("maxDifficulty:"+maxDifficulty);
  $('body').prepend("<style> .arrow { background-image: url('"+FILE_PATH+files['transition.png']+"'); } </style>");
  
  loadWords();  
}

/**
 * Set maxDifficulty based on the highest level everyone has
 * @returns
 */
function chooseDifficulty() {
  for (var lvl = 1; lvl < 10; lvl++) {
    try {
      for (var i = 1; i <= numPlayers; i++) {
        if (awards[i]["Level "+lvl]["count"] > 0) {
          // continue  
        } else {
          return;
        }
      }
      maxDifficulty = lvl+3; // 1=>4; 2=>5 etc
    } catch (err) {
      return; // no award
    }
  }
}

function doneLoading() {
  initializeWordInput();
  initializeInstructions();
  initializeGame();
}

function initializeGame() {  
  $("#undo").click(function(){
    undo();
  });
  $("#redo").click(function(){
    redo();
  });
  
  $("#accept").click(function(){
    acceptWordInput();
  });
  
  $("#reset").click(function(){
    setCurWord(curWord);
  });
  
  startAnimation();
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

function undo() {
//  alert("undo:"+undoIndex+" "+undoList.length+" "+undoList[0]+" "+undoList[1]);
  if ($("#undo").attr("disabled") == "disabled") {
    alert("cant undo");
    return;
  }
  undoIndex--;
  setSolution(undoList[undoIndex]);  
}

function redo() {
  if ($("#redo").attr("disabled") == "disabled") {
    alert("cant redo");
    return;
  }
  if (undoIndex < undoList.length) {
    undoIndex++;
    setSolution(undoList[undoIndex]);
  }
}

// Takes 2 words and returns true if 2/3 letters match
function link(w1,w2) {
//  if (w1 == w2) {
//    alert(w1);
//    return false;    
//  }
  if (w1[0] == w2[0]) {
    if (w1[1] == w2[1]) return true;
    if (w1[2] == w2[2]) return true;
  }
  if ((w1[1] == w2[1]) && (w1[2] == w2[2])) return true;
  return false;
}

// fetch word list, then build graph
function loadWords() {
  $.get(FILE_PATH+files['valid_3.txt'], function(data) {
    legalWords = data.split('\n');
    
    for(var i = 0; i < legalWords.length; i++) {
      suggestions[legalWords[i]] = [];
    }
    
    for(var i = 0; i < legalWords.length; i++) {
      for(var j = i+1; j < legalWords.length; j++) {
        if (link(legalWords[i], legalWords[j])) {
          suggestions[legalWords[i]].push(legalWords[j]);
          suggestions[legalWords[j]].push(legalWords[i]);
        }
      }
    }
    
    loadPuzzles();
//    alert(suggestions["fit"]);
  });
}

function loadPuzzles() {
  $.get(FILE_PATH+files['puzzles_3.txt'], function(data) {
    puzzles = data.split('\n');
    doneLoading();
  });  
}

/**
 * i = round (usually 1)
 * Use max difficulty
 */
function setRandomPuzzle(i) {
  Math.seedrandom(seed^(i+1));
  var index = Math.floor(Math.random()*puzzles.length);
  while (getPuzzleByIndex(index)[0] > maxDifficulty) {
    index = Math.floor(Math.random()*puzzles.length);
  }
  setPuzzleByIndex(index);  
}

/**
 * return difficulty; bestLength; first-word; last-word;
 */
function getPuzzleByIndex(index) {
  return puzzles[index].split(";");
}

function setPuzzleByIndex(index) {
  var foo = getPuzzleByIndex(index);
  setPuzzle(foo[0], foo[1], foo[2], foo[3]);
}

function setPuzzle(diff, best, first, last) {
  log("setPuzzle("+diff+")");
  expired = false;
  difficulty = diff;
  bestLength = best;
  firstWord = first;
  lastWord = last;
  
  curWord = firstWord;
  undoList = [[]];
  undoIndex = 0;
  initializeSolutions();
  setCurWord(curWord);
  if (showDifficulty && !instructions) {
    $("#num_remaining").html("<p>Best solution chain is "+difficulty+" words long.</p>");
    $("#num_remaining").fadeIn();
  } else {
    $("#num_remaining").fadeOut();
  }
  $("#bestGroup").fadeOut();
  if (!instructions) {
    submit("<puzzle>"+first+","+last+"</puzzle>");    
    setCountdown("timer",90);
  }
//  undoIndex = -1;
}

function countdownExpired(id) {
  enablePlayAgain();
  expired = true;
  alert("You ran out of time.  You may continue to try to solve the puzzle, but it won't count as a win.");
}


function initializeSolutions() {
//  setSolution($("#active_solution"),["foo","bar","baz"]);
  setSolution([]);
}

function addLetterInput(i) {
  $('#word_input').append('<div class="letter"><div id="up_'+i+'" class="upArrow"></div><input id="letter_'+i+'" class="letter_input" type="text" value="a"/><div id="down_'+i+'" class="downArrow"></div></div>');
}

function initializeWordInput() {
  for (var i = 0; i < numLetters; i++) {
    addLetterInput(i);    
  }
  $('.upArrow').css("background-image","url('"+FILE_PATH+files['arrow.png']+"')");
  $('.downArrow').css("background-image","url('"+FILE_PATH+files['arrow.png']+"')");
  if (!isMobile) {
    $('.letter_input').focus(function(){
      this.select();
    });
  }
  
  /**
   * This is what happens when they type in a letter input box
   * 
   * Esc => reset
   * Enter => accept
   * (blank) => reset letter and go back (delete, backspace etc)
   * (non-letter) => reset letter and re-focus
   * (upper case) => use lower case
   * (more than 1 letter) => use first letter
   * 
   * (letter) => go to next letter field or accept if last field
   * 
   */
  $('.letter_input').keyup(function(event){
    if (event.key == "Esc") { // reset word
      setCurWord(curWord);
      return;
    } else if (event.key == "Enter") { // accept word
      acceptWordInput();
      return;
    }
    
    var index = +$(this).attr('id')[7]; // letter_
    
//    alert($(this).parents('.letter').next().find('.letter_input').val());
    var myVal = $(this).val();
    if (myVal.length == 0) { // if they did something other than enter a letter, reset and go to the previous letter
      var prevLetterInput = $(this).parents('.letter').prev().find('.letter_input');
      if (prevLetterInput.length == 1) {
        $(this).val(curWord[index]);
        if (!isMobile) {
          prevLetterInput.focus();
        }
        return;
      } else {
        setCurWord(curWord);
        return;
      }      
    }
    
    // take the first letter and make it lower case
    myVal = myVal.toLowerCase()[0];
    
    // make sure it's a letter
    var code = myVal.charCodeAt(0);
    if (code > 'z'.charCodeAt(0) || code < 'a'.charCodeAt(0)) { // not a letter
      // reset letter and refocus
      $(this).val(curWord[index]); 
      if (!isMobile) {
        $(this).focus();
      }
      return;
    } else {
      $(this).val(myVal);      
    }
    
    // ok we set a valid letter, go to next field or accept
    var nextLetterInput = $(this).parents('.letter').next().find('.letter_input');
    if (nextLetterInput.length == 1) {
      if (!isMobile) {
        nextLetterInput.focus();
      }
    } else {
      acceptWordInput();
    }
  });
  
  $('.upArrow').click(function() {
    if (disableArrows) return;
    if ($(this).hasClass('upArrow-disabled')) return;
    
    var index = +$(this).attr('id')[3]; // up_
    var val = $('#letter_'+index).val().toLowerCase()[0];
    var code = val.charCodeAt(0);
    code--;
    if (fullAlphabetArrow) {
      if (code < 'a'.charCodeAt(0)) {
        code = 'z'.charCodeAt(0);
      }
    } else {
      while (typeof(letterSuggestion[index][String.fromCharCode(code)]) == 'undefined') {
        code--;
        if (code < 'a'.charCodeAt(0)) {
          code = 'z'.charCodeAt(0);
        }
      }
    }
    val = String.fromCharCode(code);
    $('#letter_'+index).val(val);
    
    setupRestOfButtons(index, val);
  });
  
  $('.downArrow').click(function() {
    if (disableArrows) return;
    if ($(this).hasClass('downArrow-disabled')) return;

    var index = +$(this).attr('id')[5]; // down_
    var val = $('#letter_'+index).val().toLowerCase()[0];
    var code = val.charCodeAt(0);
    code++;
    if (fullAlphabetArrow) {
      if (code > 'z'.charCodeAt(0)) {
        code = 'a'.charCodeAt(0);
      }
    } else {
      while (typeof(letterSuggestion[index][String.fromCharCode(code)]) == 'undefined') {
        code++;
        if (code > 'z'.charCodeAt(0)) {
          code = 'a'.charCodeAt(0);
        }
      }
    }
    val = String.fromCharCode(code);
    $('#letter_'+index).val(val);
    
    setupRestOfButtons(index, val);
  });
  
  
}

function setupRestOfButtons(index, val) {
  if (curWord[index] == val) {
    $('.upArrow').removeClass('upArrow-disabled');
    $('.downArrow').removeClass('downArrow-disabled');
    
    // disable arrows with no options
    for (var i = 0; i < numLetters; i++) {
      if (Object.keys(letterSuggestion[i]).length == 1) {
        $('#up_'+i).addClass('upArrow-disabled');
        $('#down_'+i).addClass('downArrow-disabled');
      }
    }
  } else {
    $('.upArrow').addClass('upArrow-disabled');
    $('.downArrow').addClass('downArrow-disabled');
    $('#up_'+index).removeClass('upArrow-disabled');
    $('#down_'+index).removeClass('downArrow-disabled');
  }  
}

function acceptWordInput() {
  var newWord = "";
  $('.letter_input').each(function() {
    newWord+=$(this).val().toLowerCase()[0];
  });
  
  // make sure it's valid
  var fail = true;
  for (var i in curWordSuggestions) {
    if (curWordSuggestions[i] == newWord) {
      fail = false;
      break;
    }
  }
  
  if (fail) {
    if (instructions) {
      pushWord(newWord);
    }
    setSolution(curSolution);    
  } else {
    pushWord(newWord);
  }
//  for (var i = 0; i < numLetters; i++) {
//
//  }
//  alert(newWord);
}


function initializeWordClick(solution) {
  solution.children(".word").click(function() {
    var myWord = $(this).html();
    if (myWord == lastWord) return;
    if (link(myWord,lastWord)) return; // can't just click a complete solution
    var words = $(this).parent().children(".word");
    var newWords = [];
    for (var i in words) {
      var word = $(words[i]).html();
      if (i > 0) {
        newWords.push(word);
      }
      if (word == myWord) {
        break;
      }
    }
    setSolution(newWords);
//    alert($(this).html());
//    alert($(this).prev().html());
  });
}

function pushWord(myWord) {
  if (instructions) {
    instructionsPushWord(myWord);
    return;
  }
  
  curSolution.push(myWord);
  setSolution(curSolution);  
}

function initializeNextWordClick(sugg_elt) {
  sugg_elt.children(".word").click(function() {
    var myWord = $(this).html();
    pushWord(myWord);
  });
}
function setCurWord(word) {
  curWord = word;
  for (var i = 0; i < numLetters; i++) {
    $('#letter_'+i).val(word[i]);
  }

  giveSuggestions(word);
  if (!isMobile) {
    $('#letter_0').focus();
  }
}

function giveSuggestions(word) {
  var words = suggestions[word];
  curWordSuggestions = words;
  setSuggestions("Suggestions:",words);
}  
  
function setSuggestions(title, words) {  
  var sugg_elt = $('#suggestions');
  
  letterSuggestion = [];
  for (var i = 0; i < numLetters; i++) {
    letterSuggestion[i] = new Object();  // each digit uses an Object as a hash table
    letterSuggestion[i][curWord[i]] = true; // make sure to use the current word's letter as valid
  }
  var elts = "<div><b>"+title+"</b></div> ";
  for (var i in words) {
    for (var j = 0; j < numLetters; j++) {
      letterSuggestion[j][words[i][j]] = true; // set a value for the key of the valid letter
    }
    elts+='<div class="word">'+words[i]+'</div> ';
  }

  // set up the arrows
  $('.upArrow').removeClass('upArrow-disabled');
  $('.downArrow').removeClass('downArrow-disabled');

  // disable arrows with no options
  for (var i = 0; i < numLetters; i++) {
    if (Object.keys(letterSuggestion[i]).length == 1) {
      $('#up_'+i).addClass('upArrow-disabled');
      $('#down_'+i).addClass('downArrow-disabled');
    }
  }

  
//  elts+='<span class="stretch"></span>';
  sugg_elt.html(elts);
  initializeNextWordClick(sugg_elt);
}

function arrays_equal(a,b) { 
  return !(a<b || b<a); 
}

var won = false;
function setBestSolution(b) {
  if (b.length == bestLength-2) {
    if (!instructions) {
      $("#num_remaining").html("<p><b>Congratulations!</b>  You found the shortest solution!</p>");
      $("#num_remaining").fadeIn();
    }
    if (!expired && !won) {
      stopCountdown("timer");
      enablePlayAgain();
      won = true;
      try {
        if (typeof awards[myid]["Level "+(difficulty-2)] == "undefined") {
          writeAward("Level "+(difficulty-2));
        }
      } catch(err) {
      }
      writeAward("Win");
      try {
        if (typeof awards[myid]["Gimmie Five!"] == "undefined" &&
            awards[myid]["Win"]["count"] >= 4) {
            writeAward("Gimmie Five!");
        }
      } catch(err) {
      }
    }
  } else {
    if (!instructions) {
      if (showDifficulty) {
        $("#num_remaining").html("<p>There is still a shorter solution that is "+difficulty+" words long.</p>"); 
      } else {
        $("#num_remaining").html("<p>There is still a shorter solution.</p>");          
      }
      $("#num_remaining").fadeIn();
    }
  }
  bestSolution = b;
  drawSolution($("#best"), bestSolution);
  $("#bestGroup").show();
}

function newMove(player,moveNum) {
  if (player != myid && moveNum >= initialMovesOfRound[player]) { // only get new moves from other players
    fetchMove(player, currentRound, moveNum, function(data) {
      var theMove = $(data);
      if (theMove.is('solution')) { // the move is a solution
        var player_solution = theMove.text().split(",");
        // get/create the solution
        var theSolution = $('#solution_'+player);
        if (theSolution.length == 0) {
          $("#solution_group").prepend('<h2>'+getName(player)+'</h2><div id="solution_'+player+'" class="solution"></div>')
          theSolution = $('#solution_'+player);
        }
        drawSolution(theSolution, player_solution);
      }
    });
  }
}


function setSolution(words) {
  if (instructions) {
    if (instructionsSetSolution(words)) return;
  }
  
  if (words.length > 20) {
    alert("Solution is too long.");
    return;
  }
//  alert("setSolution:"+words);
  
  curSolution = words.slice(0);
  
  if (curSolution.length > 0) {
//    alert("submit:"+curSolution+" "+words);
//    submit(curSolution);    
    submit("<solution>"+curSolution.join(",")+"</solution>");    
  }
  
  if (words.length == 0) {
    setCurWord(firstWord);
  } else {
    var lastSolWord = words[words.length-1];
    
    // check for reusing word
    for (var i = 0; i < words.length-1; i++) {
      if (words[i] == lastSolWord) {
        var segment = [];
        for (var j = 0; j <= i; j++) {
          segment[j] = words[i];
          setSolution(segment);
          return;
        }
      }
    }
    
    setCurWord(lastSolWord);    
  }
  
  if (drawSolution($("#active_solution"),curSolution)) {
    if (bestSolution == null) {
      setBestSolution(curSolution);
    } else {
      if (curSolution.length < bestSolution.length) {
        setBestSolution(curSolution);
        $("#lastGroup").hide();        
      } else {
        lastSolution = curSolution;
        drawSolution($("#last"), lastSolution);
        $("#lastGroup").show();        
      }
    }
    
    setSolution([]);
  } else {
    // undo/redo:
    var wordsCopy = words.slice(0);

    if (arrays_equal(undoList[undoIndex],wordsCopy)) {
      // undo/redo... do nothing
    } else {
      undoIndex++;
      undoList.length = undoIndex;
      undoList.push(wordsCopy);
    }
    
    if (undoIndex > 0) {
      $('#undo').removeAttr("disabled");    
    } else {
      $('#undo').attr("disabled", "disabled");        
    }
//
    if (undoIndex == undoList.length-1) {
      $('#redo').attr("disabled", "disabled");
    } else {
      $('#redo').removeAttr("disabled");    
    }
  }
}

/**
 * return true if success
 */
function drawSolution(solution, words) {
  var complete = false;
  var filler = '<div class="blank">___</div> <div class="ellipsis">...</div> <div class="arrow"></div> ';
  if (hide_ellipsis) {
    filler = '<div class="blank">___</div> <div class="arrow"></div> ';
  }
  
  if (words.length > 0) {
    var lastSolWord = words[words.length-1];
    if (link(lastSolWord,lastWord)) {
      complete = true;
      filler = "";
    }
  }
  
  var answer = "";
  for (var i in words) {
    var classStr = "word";
    if (complete && i == words.length-1) {
      // if it's a complete solution then the next to last word is also lastWord
      classStr = "word lastWord";
    }
    answer+='<div class="'+classStr+'">'+words[i]+'</div> <div class="arrow"></div> ';
  }
  
  solution.html('<div class="word">'+firstWord+'</div> <div class="arrow"></div> '+
      answer+filler+      
      '<div class="word lastWord">'+lastWord+'</div> <span class="stretch"></span>');  
  initializeWordClick(solution);


  return complete;
}
