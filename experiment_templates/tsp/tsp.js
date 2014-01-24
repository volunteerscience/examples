/**
 * Maps with a unique best solution are generated offline with a java program into a file called maps.js
 * 
 * We use Raphael JS (google it) for the graphics.
 * 
 * There is a main "paper" for the big map, and 0 or more small ones for the "team solutions"
 * 
 * A team solution is a small rendering of a previous solution, 
 * such as your best one so far, or a bot or another player's/
 * 
 * There are 2 kinds of bots:
 *   1) Bots for if a player drops out
 *   2) Forcebot is a bot for if we want to add fake players from the beginning.
 *   
 * Note: under the hood the distances are measured with much higher precision, but these numbers are ugly to the players, 
 * so we divide it by a variable called: "antiscale"  
 *   
 */
var BUTTON = 1;
var CLICK = 2;
var COMPLETE = 3;
var TIMEOUT_ONLY = 4;

var showScore = false;
var submitType = TIMEOUT_ONLY;

var FIRST_ACTUAL_ROUND = 101;

var numRounds = 6;
var numCities = 27;
var cities = new Array();
var width = 570;
var height = 460;
var cityRad = 10;
var lastCity = null;
var paths = new Array();
var score = 0;
var cityOrder = new Array();
var optimal_id = -1;
var distScale = 100;
var antiscale = 410;
var showOptimal = false;
var showMe = true; 
var showBest = false;
var showTeamModulo = 3; // 1 for always, 3 for every 3rd rnd, 0 for never

var initCityColor = "#0f0";
var curCityColor = "#77f"; //"#00f";
var usedCityColor = "#f00";
var lineColor = '#1b2429'; // '#3b4449';
var smallLineColor = '#4b4449'; // '#6b6469';
var fieldColor = "#0e76bc";
var greenButtonColor = "green";

var forceBots = 0; // number of bots _not_ due to dropouts
var botType = 0;

function initialize() {
  initializeGameType();
  interactiveInstructions1();
}

/**
 * this function sets up the different kinds of additional information the player can see.
 * Ex: other player's solutions, player's best, or previous solution, etc.
 * 
 * Also, set's up the bot behavior.
 */
function initializeGameType() {
  Math.seedrandom(seed);
  
  var info = Math.floor(Math.random()*3);
  switch (info) {
    case 0:
      showTeamModulo = -1;
      break;
    case 1:
      showTeamModulo = 3;
      break;
    case 2:
      showTeamModulo = 1;
      break;
  }
//  showTeamModulo = 1;  // delme
  
  var best = Math.floor(Math.random()*2);
//  best = 1; // delme
//  alert('best:'+best);
  switch (best) {
    case 0:
      showBest = false;
      break;
    case 1:
      showBest = true;
      break;
  }
  
  if (numPlayers < 2) { // delme
    forceBots = 1;
  }
  
  botType = Math.floor(Math.random()*2);

  $(".gameid").append(botType);
  
  if (showBest) {
    $(".gameid").append("B");
  } else {
    $(".gameid").append("L");  
  }
  if (showTeamModulo < 1) {
    $(".gameid").append("0");
  } else {
    $(".gameid").append(showTeamModulo);
  }
//  alert(showTeamModulo+" "+showBest);

}

/**
 * Set up the game board and the smaller windows for "team solutions"
 */
function initializeGame() {
  $("#interactiveInstructions1").hide();  
  
  width = 570;
  height = 460;

  distScale = parseInt(variables['scale']);
  antiScale = parseInt(variables['antiscale']);
  numRounds = parseInt(variables['num_rounds']);
  
  if (!showScore) {
    $('#score').hide();
    $('#otherScore').hide();  
  }

  if (submitType != BUTTON) {
//    $('#submitButton').hide();
  }

  $('#waiting').hide();
  $('#game').show();

  optimal_id = numPlayers+forceBots+1;

  paper = Raphael("canvas", width+cityRad*2, height+cityRad*2);

  initializeRound(FIRST_ACTUAL_ROUND);
  
  // reverse order because we're using append
  if (showOptimal) {
    addSolution(optimal_id,"Optimal");
  }
  if (showTeamModulo > 0) {
    for (var i = numPlayers; i >= 1; i--) {
      if (myid != i) {
        addSolution(i,getName(i));
      }
    }
    for (var i = forceBots; i >= 1; i--) {
//      addSolution(i+numPlayers,"Bot "+i);
      addSolution(i+numPlayers,"Player "+(numPlayers+i));
    }
  }
  if (showMe || showBest) {
    var myName = "Me";
    if (showBest) {
      myName = "My Best";
    }
    addSolution(myid, myName);
  }
}

/**
 * Maps are generated with a program and stored in maps.js.  This function picks a random one.
 */
function getMapIndex(round) {
  Math.seedrandom(seed);

  var mapSeed = seed+round;
  var numMaps = map.length;
  
  var mapIndex = Math.floor(Math.random()*numMaps);
  
  return mapIndex;
}

/**
 * Indirection in case we want different maps on different rounds.
 */
function buildMap(round) {
  var mapIndex = getMapIndex(round);
  return buildMapFromIndex(mapIndex);
}
  
/**
 * Select a map
 */
function buildMapFromIndex(mapIndex) {
  return buildMapFromArray(map[mapIndex][0]);
}

/** 
 * generates a list of cities from the array.
 */
function buildMapFromArray(myMap) {
  var num = myMap.length;
//  alert(num+" "+myMap+" "+myMap[0][1]);
  
  var ret = new Array();
  for (var i = 0; i < num; i++) {
    var city = new Object();
    city.index = i;
    city.x = cityRad+myMap[i][0];
    city.y = cityRad+myMap[i][1];
    ret.push(city);
  }
  return ret;
}

/**
 * Adds all the click behavior to the city.
 */
function addInteractiveCity(city) {
//    alert('addICity():'+city.x);
    city.circle = paper.circle(city.x,city.y,cityRad);
    city.circle.attr("fill", initCityColor);
    city.circle.attr("stroke", "#000");

    city.circle.click(function() {
      if (submitted) return;
      
      // detect undo
      var clobber = null; // set the last city to this index, 0 means undo all
      for (idx in cityOrder) {
        if (clobber != null) {
          cities[cityOrder[idx]].circle.attr("fill",initCityColor);
        } else if (cityOrder[idx] == city.index) {
          clobber = parseInt(idx);
//          alert(clobber+" "+cityOrder.length);
          if (clobber == 0 && cityOrder.length == numCities) {
            // user clicked original city after map is complete
            return;
//            clobber = null;
          } else {          
            if (clobber == numCities-1) return;
            lastCity = cities[cityOrder[idx]];
            lastCity.circle.attr("fill",curCityColor);
          }
        }
      }

      // this does the undo
      if (clobber != null) {
        while(cityOrder.length > (clobber+1)) {
          cityOrder.pop();
        }

        while(paths.length > clobber) {
          paths.pop().line.remove();
        }

        if (cityOrder.length > 1) {
          var firstCity = cities[cityOrder[0]];
          firstCity.circle.attr("fill",usedCityColor);
        }

        // recalculate score
        score = 0;
        var last = null;
        for (idx in cityOrder) {
          cit = cities[cityOrder[idx]];
          if (last != null) {
            var dx = (cit.x-last.x);
            var dy = (cit.y-last.y);
            var dist = Math.sqrt(dx*dx+dy*dy);
            score+=dist;
          }
          last = cit;
        }
        $('#score').html('Score: '+Math.floor(score));
        undoComplete();

        return;        
      }

      city.circle.attr("fill",curCityColor);
      if (lastCity != null) {
        lastCity.circle.attr("fill",usedCityColor);
        var dx = (city.x-lastCity.x);
        var dy = (city.y-lastCity.y);
        var dist = Math.sqrt(dx*dx+dy*dy);
        score+=dist;
        $('#score').html('Score: '+Math.floor(score));
        var path = new Object();
        path.line = paper.path("M "+lastCity.x+" "+lastCity.y+" l "+dx+" "+dy);
//        alert(lastCity.x+" "+lastCity.y+" l "+dx+" "+dy);
        path.line.attr({stroke: lineColor,
            'stroke-width': 10});            
        path.line.toBack();
        background.toBack();
        paths.push(path);
      }

      lastCity = city;
      cityOrder.push(city.index);

      // draw last line
      if (cityOrder.length == numCities) {
        var firstCity = cities[cityOrder[0]];
//        firstCity.circle.attr("fill",curCityColor);
        lastCity.circle.attr("fill",usedCityColor);
        var dx = (firstCity.x-lastCity.x);
        var dy = (firstCity.y-lastCity.y);
        var dist = Math.sqrt(dx*dx+dy*dy);
        score+=dist;
        $('#score').html('Score: '+Math.floor(score));

        path = new Object();
        path.line = paper.path("M "+lastCity.x+" "+lastCity.y+" l "+dx+" "+dy);
        path.line.attr({stroke: smallLineColor,
            'stroke-width': 4});
        path.line.toBack();
        background.toBack();
        paths.push(path);
        
        pathComplete();
      }

    });
}

var gameRound = 0;
/**
 * Called before every round, clears the map etc.
 * @param round
 */
function initializeRound(round) {
  $("#midRoundPopup").hide();

//  alert('initRound:'+round);
  gameRound = 1+round-FIRST_ACTUAL_ROUND;
  $('#round').html('Round '+gameRound+' of '+numRounds);
  $('#submitButton').attr("value","Submit");

  if (gameRound > 1) {
    $("#prev_solution").attr("disabled", false);
  }

  submitted = false;
  setRound(round); 
  cities = buildMap(round);
  initializeMainMap(cities);
  setClockTimeout(new Date().getTime()+variables['round_duration']*1000);
  showTeamSolutions(round);
} 

/**
 * Clear the paper, and draw the main map, sans connections.
 * @param cities
 */
function initializeMainMap(cities) {
  numCities = cities.length;
  paths = new Array();
  cityOrder = new Array();
  if (typeof paper == "undefined") {
  } else {
    paper.clear();
    background = paper.rect(0, 0, width+cityRad*2, height+cityRad*2, 10).attr({fill: fieldColor, stroke: "none"});
  }
  
  for (var i in cities) {
    addInteractiveCity(cities[i]);
  }
  reset();
}

/**
 * Render all the team solutions for a particular round.
 * @param round
 */
function showTeamSolutions(round) {
  if (round > FIRST_ACTUAL_ROUND) {
    for (var i = 1; i <= numPlayers+forceBots; i++) {
      if (i != myid) {
        if ((showTeamModulo > 0) && ((gameRound) % showTeamModulo == 0)) {
          if (i <= numPlayers) {
            drawTeamSolution(i, round-1, 0, tPaper[i]);
          } else {
            drawForceBotSolution(i, round-1, 0, tPaper[i]);
          }
          $('#solution_'+i).show();
        } else {
          $('#solution_'+i).hide();
        }
      }
    }
    if (showMe || showBest) {
      drawTeamSolution(myid, round-1, 0, tPaper[myid]);
      $('#solution_'+myid).show();
    } else {
      $('#solution_'+myid).hide();    
    }
    
    if (showOptimal) {    
      doDrawTeamSolution(optimal_id, round-1, 0, tPaper[optimal_id], '<solution map="'+getMapIndex(round-1)+'" dist="'+map[getMapIndex(round-1)][2][0]+'">'+map[getMapIndex(round-1)][1]+'</solution>');
      $('#solution_'+optimal_id).show();
    } else {
      $('#solution_'+optimal_id).hide();    
    }
  }
}

var tFac = 0.33;
var tPaper = new Array();
/**
 * Adds a new Raphael "paper" for team solutions.
 * @param idx
 * @param name
 */
function addSolution(idx, name) {
  //alert("addSolution("+idx+","+name+")");
  $('#canvas').after('<div id="solution_'+idx+'" class="teamSolution" style="display:none;"><h4 class="gameLabel">'+name+'</h4><div id="canvas_'+idx+'"></div><div id="score_'+idx+'" class="score">10,000</div></div>');
  tPaper[idx] = Raphael("canvas_"+idx, (width+cityRad*2)*tFac, (height+cityRad*2)*tFac);
}

/**
 * Reset button behavior.
 */
function reset() {
  if (submitted) return;
  for (idx in cities) {
    var city = cities[idx];
    city.circle.attr("fill", initCityColor);
  }

  for (idx in paths) {
    var path = paths[idx];
    path.line.remove();
  }
  paths = new Array();
  score = 0;
  lastCity = null;
  cityOrder = new Array();
  $('#score').html('Score: ');
}

/**
 * Incoming move from another player.  
 * @param participant
 * @param index
 */
function newMove(participant, index) {
  // don't do anything with this after the game is over
  var remainingRounds = FIRST_ACTUAL_ROUND+numRounds-currentRound;
  if (remainingRounds <= 0) return;
  
//  alert('newMove: '+currentRound+' '+participant+' '+index);
//  if ((numPlayers > 1) && (participant == myid)) return;
//  drawTeamSolution(participant, currentRound, index, tPaper[participant]);
  var done = true;
//  alert(Object.keys(moves));
  for (var i = 1; i <= numPlayers; i++) {
//    alert(i+" "+moves[i]);
    if (moves[i] < 1) {
      done = false;
      break;
    }
  }
  if (done) {
    if (currentRound < FIRST_ACTUAL_ROUND) {
      initializeGame();
    } else {
      startNextRound();      
    }
  }
}

/**
 * Forcebots 
 * @param part
 * @param round
 * @param index
 * @param paper2
 */
function drawForceBotSolution(part, round, index, paper2) {
  //alert("drawForceBotSolution");
//  doDrawTeamSolution(part, round, index, paper2, perfectBot());  

  switch(botType) {
  case 0:
    doDrawTeamSolution(part, round, index, paper2, progressiveBot(index));  
    break;
  case 1:
    // dittoBot
    fetchMove(myid, round, index, function(val) {
      doDrawTeamSolution(part, round, index, paper2, val);
    });
    break;
  }
}

/**
 * Fetch a move and render it.
 * @param part the player
 * @param round the round
 * @param index this should always be zero unless we allow users to submit more than one solution per round
 * @param paper2 where to render it
 */
function drawTeamSolution(part, round, index, paper2) {
//  alert('drawTeam:'+paper2);
  fetchMove(part, round, index, function(val) {
    doDrawTeamSolution(part, round, index, paper2, val);
  });
}

/**
 * Helper for clicking for old verisons of IE.  
 * 
 * this may be obsolete code, but it is used to load the prevSolution()
 * 
 * @param element
 * @param event
 * @returns
 */
function fireEvent(element,event) {
  if (document.createEventObject) {
    // dispatch for IE
    var evt = document.createEventObject();
    return element.fireEvent('on'+event,evt)
  } else {
    // dispatch for firefox + others
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true); // event type,bubbling,cancelable
    return !element.dispatchEvent(evt);
  }
}
    
/**
 * Load a previous solution by simulating clicking on each of the cities.
 */
function prevSolution() {
  fetchMove(myid, currentRound-1, 0, function(xmlVal) {    
    if (submitted) return;
    reset();
    var teamSolution = $(xmlVal);
    var val = teamSolution.html();
    var answer = val.split(",");
//    alert(answer);
    for (var idx in answer) {
      fireEvent(cities[answer[idx]].circle.node, 'click');
    }
  });
}

/**
 * Divide the distance by antiscale to make it prettier to humans.
 * 
 * @param score
 * @returns
 */
function getHumanReadableScore(score) {
  return Math.round(score/antiscale);
}

/**
 * Update my score... used for the award page at the end.
 */
var myBestScore = 1000000;
function updateScore(round, xmlVal) {
//   alert(round+" "+xmlVal);
   var teamSolution = $(xmlVal);
   var otherScore = teamSolution.attr('dist');
   var score = 10000001;
   if (otherScore == -1) {
     scoreTable[round] = '---';
   } else {
     score = Math.round((otherScore-map[getMapIndex(round)][2][0])/antiscale);
     scoreTable[round] = score;
   }
   
   return score;
//   alert(round+" "+scoreTable[round]);
}  
  
/**
 * Helper to draw the solution on the paper.
 */
// <solution map="2" dist="3">1,3,2,5,7,4,6</map>
function doDrawTeamSolution(part, round, index, paper2, xmlVal) {
   
   //alert("doDrawTeamSolution("+part+","+index+","+xmlVal+")");
   var teamSolution = $(xmlVal);
   var mapIndex = teamSolution.attr('map');   
   var otherScore = teamSolution.attr('dist');

   if (part == myid) {
     var score = updateScore(round, xmlVal);
     if (showBest && score >= myBestScore) {
//       alert("score:"+score+" myBestScore:"+myBestScore);
       return;
     }
     myBestScore = score;
   }
  
   paper2.clear();

//   alert(otherScore);
   if (otherScore == -1) {
     otherScore = variables['failScore'];
   } else {
     otherScore = Math.round(otherScore/antiscale);
   }
   $('#score_'+part).html(otherScore);

//   alert(otherScore);
   var val = teamSolution.html();
   var answer = val.split(",");
   
//   alert(answer);
   
//   alert('part:'+part+' answer:'+answer+" vtyp:"+(typeof val));
    var myCities = buildMapFromIndex(mapIndex);

    if (answer.length != myCities.length) {
//      alert("part:"+part+" answer:"+answer+" num:"+num);
      return;
    }
    
//    alert(myCities.length);
    doDrawTeamMap(paper2, myCities, answer);
}
    
/**
 * Draw just the map, don't update the score etc.
 */
function doDrawTeamMap(paper2, myCities, answer) {
  try {
    var num = myCities.length;
    paper2.rect(0, 0, (width+cityRad*2)*tFac, (height+cityRad*2)*tFac, 10*tFac).attr({fill: fieldColor, stroke: "none"});

//    alert('val:'+val+' answer:'+answer.length+" "+answer);

    for (var idx in myCities) {
      var city = myCities[idx];
      circle = paper2.circle(city.x*tFac,city.y*tFac,cityRad*tFac);
      circle.attr("fill", initCityColor);
      circle.attr("stroke", "#000");
    }

    var last = null;
    for (var idx in answer) {
      var city = myCities[answer[idx]];
      if (last != null) {
        var dx = city.x-last.x;
        var dy = city.y-last.y;
        line = paper2.path("M "+last.x*tFac+" "+last.y*tFac+" l "+dx*tFac+" "+dy*tFac);
        line.attr({stroke: lineColor,
            'stroke-width': 10*tFac});
      }
      last = city;
    }

    if (answer.length == num) {
      var first = myCities[answer[0]];
      var dx = first.x-last.x;
      var dy = first.y-last.y;

      line = paper2.path("M "+last.x*tFac+" "+last.y*tFac+" l "+dx*tFac+" "+dy*tFac);
      line.attr({stroke: smallLineColor,
            'stroke-width': 4*tFac});
      last = first;
    }
    
    for (var idx in answer) {
      var city = myCities[answer[idx]];
     try{
      if (city == last) {
        circle = paper2.circle(city.x*tFac,city.y*tFac,cityRad*tFac);
        circle.attr("fill", curCityColor);
        circle.attr("stroke", "#000");
      } else {
        circle = paper2.circle(city.x*tFac,city.y*tFac,cityRad*tFac);
        circle.attr("fill", usedCityColor);
        circle.attr("stroke", "#000");
      }
     } catch (err) {
       alert(err+" idx:"+idx+" city:"+city+" last:"+last+" myCities:"+Object.keys(myCities)+" answer:"+answer[idx]+" atyp:"+(typeof answer));
     }    
    }
  } catch (err) {
    alert(err);
  }
}

/**
 * Initialize a bot.
 */
var iControlBots = false;
function playerDisconnect(playerNum) {
//  alert('playerDisconnect '+playerNum);

  // see if I have the lowest live id
  for (var i = 1; i < myid; i++) {
    if (activePlayers[i]) {
      // someone lower than me is still active
      return;
    }
  }
  iControlBots = true;
  
  if (submitted) {
    submitBotSolution(playerNum);
  }
}

/**
 * When someone drops out, we have to submit solutions for the player.
 * @param playerId
 */
function submitBotSolution(playerId) {
  if (currentRound < FIRST_ACTUAL_ROUND) {
//    alert('auto_submit');
    // survey questions, instructions etc
    submitBot(playerId, currentRound, 'auto_submit');  
  } else {
//    var botSolution = deviantBot(playerId, variables['bot_swaps']);

    // TODO: use botType
    var botSolution = progressiveBot(playerId);
    submitBot(playerId, currentRound, botSolution);  
  }
} 

/**
 * Behavior for a random bot, who just places random city order.
 * @param numSwaps
 * @returns
 */
function randomBot(numSwaps) {
  // this just generates 0,1,2... essentially a random order on the map
  var solution = new Array();
  for (var i = 0; i < numCities; i++) {
    solution[i] = i;    
  }  
  return XMLizeBotSolution(solution);
}

/**
 * Behavior for a perfect bot, who just places the optimal solution.
 * @returns
 */
function perfectBot() {
  // this is the optimal solution
  var optimal = map[getMapIndex(currentRound)][1];
  
  // copy it into the solution
  var solution = new Array();
  for (var i = 0; i < numCities; i++) {
    solution[i] = optimal[i];
  }
  return XMLizeBotSolution(solution);
}

/**
 * some distance from the from the optimal solution -- swap numSwaps amount of cities
 * 
 * @param playerId
 * @param numSwaps
 * @returns
 */
function deviantBot(playerId, numSwaps) {
    
  // this is the optimal solution
  var optimal = map[getMapIndex(currentRound)][1];
  
  // copy it into the solution
  var solution = new Array();
  for (var i = 0; i < numCities; i++) {
    solution[i] = optimal[i];
  }

  // swap some values    
  Math.seedrandom(playerId+currentRound*100);
  for (var i = 0; i < numSwaps; i++) {
    var swapMe = Math.floor(Math.random()*(numCities-1))
    var temp = solution[swapMe];
    solution[swapMe] = solution[swapMe+1];
    solution[swapMe+1]=temp;
  }
  return XMLizeBotSolution(solution);
}

/**
 * a variant on deviantbot who keeps getting better with every round
 * 
 * @param playerId
 * @returns
 */
function progressiveBot(playerId) {
  var remainingRounds = numRounds-gameRound;
  Math.seedrandom(playerId+currentRound*100);
  var additionalMistakes = Math.floor(Math.random()*3); // 3 = 0-2
//  alert("additionalMistakes:"+additionalMistakes);
  return deviantBot(playerId, remainingRounds+additionalMistakes);
}

/**
 * actually do the submission, solution is an array of city indexes
 * 
 * @param solution
 * @returns {String}
 */
function XMLizeBotSolution(solution) {    
    solution = String(solution);
    var dist = getDist(solution.split(","));
    var solutionXML = '<solution bot="true" map="'+getMapIndex(currentRound)+'" dist="'+dist+'">'+solution+'</solution>';    
//    alert("solution:"+solution);
    return solutionXML;
}

var scoreTable = new Array();
/**
 * This is called when the timer runs out, or the user presses "submit"
 * 
 * Display the result in showMidRoundPopup(), which then delays for 3 seconds before calling doSubmit()
 *  
 */
function pushSolution() {

  if (submitted) return;
  submitted = true;

  if (iControlBots) {
    for (var i = 1; i <= numPlayers; i++) {
      if (!activePlayers[i]) { // for the inactive player
        submitBotSolution(i);
      }
    }
  }

  if (currentRound == 0) {
    doneAllInstructions();
    return;
  }

  $('#submitButton').attr("value","Waiting for other players");
  
  var dist = getDist(cityOrder);
  var millis = new Date().getTime() - clockStartTime;
  if (clockTimer != null) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
  showMidRoundPopup(dist, millis);
  
}

var doSubmitLock = true;
var midRoundClock = null;
/**
 * Display the score popup, then call doSubmit() to acutally submit the solution.
 * 
 * @param dist
 * @param millis
 */
function showMidRoundPopup(dist, millis) {
  doSubmitLock = false;
  var remainingRounds = FIRST_ACTUAL_ROUND+numRounds-currentRound-1;
  if (remainingRounds > 0 && dist > 0) {
    $("#midRoundText").html("Your distance was "+getHumanReadableScore(dist)+", can you make it shorter?");  
    $("#midRoundOk").attr("value","Proceed to next round...");
    $("#midRoundOk").unbind( "click" );
    $("#midRoundOk").bind( "click", function() { doSubmit(dist, millis); return false;});
    $("#midRoundPopup").fadeIn();
    midRoundClock = setInterval(function() {doSubmit(dist, millis)}, 3000);
  } else {
    doSubmit(dist, millis);
  }
}

/**
 * Submit the solution (after the mid round popup)
 * @param dist
 * @param millis
 */
function doSubmit(dist, millis) {
  if (doSubmitLock) return;
  doSubmitLock = true;
  $("#midRoundOk").attr("value","Waiting for Other Players");
  if (midRoundClock != null) {
    clearInterval(midRoundClock);
    midRoundClock = null;
  }
  var solutionXML = '<solution map="'+getMapIndex(currentRound)+'" dist="'+dist+'" millis="'+millis+'">'+cityOrder.join()+'</solution>';
//  alert(solutionXML);
  submit(solutionXML);  
}

/**
 * Calculate the "real" (not human readable) distance (aka score) from the city order.
 * @param cityOrder
 * @returns {Number}
 */
function getDist(cityOrder) {
  var dist = 0;
  
  try {
  
    if (cityOrder.length != cities.length) {
      dist = -1;
    } else {
  //    alert(getMapIndex(currentRound));
      var lastCity = cities[cityOrder[cityOrder.length-1]];
      for (var i = 0; i < cityOrder.length; i++) {
        var city = cities[cityOrder[i]];
        var dx = city.x-lastCity.x;
        var dy = city.y-lastCity.y;
        var delta = Math.round(distScale*Math.sqrt(dx*dx+dy*dy));
  //      alert(i+" "+delta);
        dist+=delta;
        lastCity = city;
      }
    }
  } catch (err) {
    return 200000;
  }
  return dist;
}

var clockTimer = null;
var timeout = 0;
var clockStartTime = 0;
/**
 * Reset the clock
 * @param tick
 */
function setClockTimeout(tick) {
  clockStartTime = new Date().getTime();
  timeout = tick;
  if (clockTimer != null) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
  clockTimer = setInterval(updateClock, 300);
}

var submitted = false;
/**
 * A clock tick.
 */
function updateClock() {
  var delta = timeout - new Date().getTime();
  if (delta < 0) delta = 0;
  var seconds = Math.floor(delta/1000);
  $("#clock").html(seconds);
  $("#instruction_clock").html(seconds);
  if (delta == 0) {
    // time is up
    pushSolution();

    var done = true;
//    alert('moves:'+moves);
    for (i in moves) {
      if (moves[i] < 1) {
        done = false;
      }
    }
    if (done) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  }
}

/**
 * Initialize the round or survey question.
 */
function startNextRound() {
//  alert("snr:"+currentRound);
  var remainingRounds = FIRST_ACTUAL_ROUND+numRounds-currentRound-1;
//  alert(remainingRounds);
//  if (currentRound < (FIRST_ACTUAL_ROUND+numRounds-1)) {
  if (remainingRounds > 0) {
    initializeRound(currentRound+1);
  } else {
    hideGame(); // must do this the first time
    $('#q1').show(); // 1st survey question
//    showResults(); // called in q1
  }
}

// called when done with survey question
function q1(val) {
  submit(val);
  $("#q1").hide();
  showResults();
}

/**
 * Wait to start the first round.
 */
function doneAllInstructions() {
  submitted=true;
  if (iControlBots) {
    for (var i = 1; i <= numPlayers; i++) {
      if (!activePlayers[i]) { // for the inactive player
        submitBotSolution(i);
      }
    }
  }
  
  submit('<startup best="'+showBest+'" teamModulo="'+showTeamModulo+'" forceBots="'+forceBots+'" botType="'+botType+'"/>');
  
  $("#waiting").show();
}

var hidingGame = false;
function hideGame() {
  if (hidingGame) return;
  hidingGame = true;
  setRound(currentRound+1);
  $('#game').hide();
}
  
/**
 * Score screen at the end
 */
function showResults() {
  var star = '<img src="'+FILE_PATH+files['small_gold_star.png']+'"/>';
  fetchMove(myid, currentRound-1, 0, function(val) {
    updateScore(currentRound-1, val); // get the final score
    
    var totalStars = 0;
    var table = $('#result_table');
    var foundShortest = false;
    var numRoundsWithStar = 0;
    for (var rnd = 1; rnd <= numRounds; rnd++) {
      var note = "";
      var roundScore = scoreTable[rnd+FIRST_ACTUAL_ROUND-1];
      var stars = 0;
      if (roundScore == 0) {
        if (rnd == 1) {
          writeAward("First Try");
        }
        stars = 10;
        foundShortest = true;
      } else {
        stars = 5-Math.floor(roundScore/variables['close_score']);
      }
      if (!isNaN(stars) && stars > 0) {
        numRoundsWithStar++;
        totalStars+=stars;
        for (var i = 0; i < stars; i++) {
          note+=star;
        }
      }
      table.append('<tr><td>'+rnd+'</td><td>'+scoreTable[rnd+FIRST_ACTUAL_ROUND-1]+'</td><td>'+note+'</td></tr>');
    }
    
    var foo = '<tr class="blank_row" style="border-top:thick solid black"></tr><tr><td>Total</td><td colspan="2">';
    for (var i = 0; i < totalStars; i++) {
        foo+=star;
    }
    foo+='</td></tr><tr class="blank_row"></tr>';
    table.append(foo);    
//    table.append('<tr class="blank_row" style="border-top:thick solid black"></tr><tr><td>Total</td><td colspan="2">'+star+' x '+totalStars+'</td></tr><tr class="blank_row"></tr>');
    
    
    $('#results').show();
    enablePlayAgain();
    writeScore("Points",totalStars*100);
    if (foundShortest) {
      writeAward("Shortest Path");
      writeScore("Shortest Path",1)
    }
    
    if (numRoundsWithStar >= 3) {
      payAMT(true,1.00);      
    } else {
      payAMT(true,0.0);      
    }
    
//    quit();
  });
  
}
