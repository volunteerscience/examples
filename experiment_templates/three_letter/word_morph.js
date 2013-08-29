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

function initialize() {
  $('body').prepend("<style> .arrow { background-image: url('"+FILE_PATH+files['transition.png']+"'); } </style>");
  
  Math.seedrandom(seed);
  loadWords();  
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
    setPuzzle(Math.floor(Math.random()*puzzles.length));
  });  
}

function setPuzzle(index) {
  var foo = puzzles[index].split(";");
  difficulty = foo[0];
  bestLength = foo[1];
  firstWord = foo[2];
  lastWord = foo[3];
  curWord = firstWord;
  undoList = [[]];
  undoIndex = 0;
  initializeSolutions();
  initializeWordInput();
  setCurWord(curWord);
  setCountdown("timer",90);
//  undoIndex = -1;
}

function countdownExpired(id) {
  alert("Time's Up!");
}


function initializeSolutions() {
//  setSolution($("#active_solution"),["foo","bar","baz"]);
  setSolution([]);
}

function addLetterInput(i) {
  $('#word_input').append('<div class="letter"><div id="up_'+i+'" class="upArrow"></div><input id="letter_'+i+'" class="letter_input" type="text" value="'+curWord[i]+'"/><div id="down_'+i+'" class="downArrow"></div></div>');
}

function initializeWordInput() {
  for (var i = 0; i < numLetters; i++) {
    addLetterInput(i);    
  }
  $('.upArrow').css("background-image","url('"+FILE_PATH+files['arrow.png']+"')");
  $('.downArrow').css("background-image","url('"+FILE_PATH+files['arrow.png']+"')");
  $('.letter_input').focus(function(){
    this.select();
  });
  
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
        prevLetterInput.focus();
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
      $(this).focus();
      return;
    } else {
      $(this).val(myVal);      
    }
    
    // ok we set a valid letter, go to next field or accept
    var nextLetterInput = $(this).parents('.letter').next().find('.letter_input');
    if (nextLetterInput.length == 1) {
      nextLetterInput.focus();
    } else {
      acceptWordInput();
    }
  });
  
  $('.upArrow').click(function() {
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
    setSolution(curSolution);    
  } else {
    curSolution.push(newWord);
    setSolution(curSolution);
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

function initializeNextWordClick(sugg_elt) {
  sugg_elt.children(".word").click(function() {
    var myWord = $(this).html();
    curSolution.push(myWord);
    setSolution(curSolution);
//    alert($(this).html());
//    alert($(this).prev().html());
  });
}
function setCurWord(word) {
  curWord = word;
  for (var i = 0; i < numLetters; i++) {
    $('#letter_'+i).val(word[i]);
  }

  giveSuggestions(word);
  $('#letter_0').focus();
}

function giveSuggestions(word) {
  var words = suggestions[word];
  curWordSuggestions = words;
  
  var sugg_elt = $('#suggestions');
  
  letterSuggestion = [];
  for (var i = 0; i < numLetters; i++) {
    letterSuggestion[i] = new Object();  // each digit uses an Object as a hash table
    letterSuggestion[i][curWord[i]] = true; // make sure to use the current word's letter as valid
  }
  var elts = "<div><b>Suggestions:</b></div> ";
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

function setSolution(words) {
  if (words.length > 20) {
    alert("Solution is too long.");
    return;
  }
//  alert("setSolution:"+words);
  
  curSolution = words.slice(0);    
  
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
      bestSolution = curSolution;
      drawSolution($("#best"), bestSolution);
      $("#bestGroup").show();
    } else {
      if (curSolution.length < bestSolution.length) {
        bestSolution = curSolution;
        drawSolution($("#best"), bestSolution);        
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
//    alert(undoIndex+" "+undoList.length);
    var wordsCopy = words.slice(0);
//    alert("check undoList["+undoIndex+"]:"+undoList[undoIndex]+" == "+wordsCopy);
    if (arrays_equal(undoList[undoIndex],wordsCopy)) {
      // undo/redo... do nothing
//      alert("undo/redo... do nothing");
    } else {
      undoIndex++;
      undoList.length = undoIndex;
      undoList.push(wordsCopy);
//      alert("add to undoList["+undoIndex+"]:"+undoList[undoIndex]);
//      undoList.[undoIndex] = wordsCopy;
    }
    
    
//    if (undoIndex == undoList.length-1) {
////      alert("add to undoList["+undoList.length+"]:"+words.slice(0));
//      undoIndex++;
////      undoList.push(words.slice(0));
//      undoList[undoIndex] = words.slice(0);
//    } else {
////      undoList.length = undoIndex;
////      undoIndex++;
////      undoList.push(words);      
//    }

//    alert(undoIndex+" "+undoList.length);
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
