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

var showScore = true; // changed to true/false
var showMap = true; // changed to true/false
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
var botType = 0; // 0 is deviant/progressive 1 is ditto
var showScoreWhenNotMap = false;

var deviantPlan = {};

function initialize() {
  cityRad = parseInt(variables['cityRad']);
  numCities = parseInt(variables['num_cities']);
  
  for (var i = 1; i <= 5; i++) {
    try {
      deviantPlan[i] = JSON.parse(variables['bot'+i]);
    } catch (err) {}
  }
  
  
  
  
  loadMaps(numCities);
  chooseTestMapIndex();
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
  showTeamModulo = parseInt(variables['showTeamModulo']);
  if (showTeamModulo == -1) {  
    var info = Math.floor(Math.random()*3);
    switch (info) {
      case 0:
        showTeamModulo = 0;
        break;
      case 1:
        showTeamModulo = 1;
        break;
      default:
        showTeamModulo = 3;
        break;
    }
  }
  
  var best = Math.floor(Math.random()*2);
  best = 1; // delme
//  alert('best:'+best);
  switch (best) {
    case 0:
      showBest = false;
      break;
    case 1:
      showBest = true;
      break;
  }
  
  if (showBest) {
    $("#prev_solution").attr("value","Load Best Solution");
    $("#ii_prev_solution").attr("value","Load Best Solution");
  }
  
  if (numPlayers < 2) { // delme
    forceBots = 2;
  }
  
//  botType = Math.floor(Math.random()*2);
//  botType = 0; // delme

  try {
    showScore = parseInt(variables['showScore']);
    if (isNaN(showScore)) {
      throw "showScore not valid" // throw error
    }
    if (showScore < 0) {
      showScore = Math.floor(Math.random*2); // 0 or 1
    }      
    switch(showScore) {
    case 0:
      showScore = false;
      break;
    default:
      showScore = true;
      break;
    } 
  } catch (err) {
//    alert(err);
    try {
      showScore = variables['showScore'].toLowerCase() == 'true';
    } catch (err2) {
      showScore = true;
//      alert(err2);
    }
  }
  
  try {
    showMap = parseInt(variables['showMap']);
    if (isNaN(showMap)) {
      throw "showMap not valid" // throw error
    }
    if (showMap < 0) {
      showMap = Math.floor(Math.random*2); // 0 or 1
    }      
    switch(showMap) {
    case 0:
      showMap = false;
      break;
    default:
      showMap = true;
      break;
    } 
  } catch (err) {
//    alert(err);
    try {
      showMap = variables['showMap'].toLowerCase() == 'true';
    } catch (err2) {
      showMap = true;
//      alert(err2);
    }
  }
  

  
  $(".gameid").append(botType);
  
  if (showBest) {
    $(".gameid").append("B");
  } else {
    $(".gameid").append("L");  
  }
  $(".gameid").append(showTeamModulo);
//  alert(showTeamModulo+" "+showBest);

}

var testMapIndex = 0;

function chooseTestMapIndex() {
  // try from the experiment specified preferredMaps
  var preferredMaps = [];
  try {
    preferredMaps = variables['preferred_maps_'+numCities].split(',');
  } catch (err) {
  }
  if (pickTestMapIndex(preferredMaps)) {
    return;
  }
  
  // try any of the maps
  for (var i = 0; i < map.length; i++) {
    preferredMaps[i] = i; 
  }
  if (pickTestMapIndex(preferredMaps)) {
    return;
  }

  // pick a random map
  testMapIndex = pickRandomMap();
}

function pickTestMapIndex(preferredMaps) {
  for (var i in preferredMaps) {
    var awardString = "map_"+numCities+"_"+preferredMaps[i];
    var fail = false;
    for (var tid in awards) {
      if (awardString in awards[tid]) {
        fail = true;
      }
    }
    if (!fail) {
      testMapIndex = preferredMaps[i];
      return true;
    }
  }
  return false;  
}

/**
 * Set up the game board and the smaller windows for "team solutions"
 */
function initializeGame() {
  $("#interactiveInstructions1").hide();  
  
  chooseTestMapIndex();
//  alert(testMapIndex);
  
  width = 570;
  height = 460;

  distScale = parseInt(variables['scale']);
  antiscale = parseInt(variables['antiscale']);
  numRounds = parseInt(variables['num_rounds']);
  
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
  if (showTeamModulo > 0 || showScoreWhenNotMap) {
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
  return testMapIndex;
}

function pickRandomMap() {
  Math.seedrandom(seed);

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
  
  if (gameRound == 2) {
    writeAward("map_"+numCities+"_"+testMapIndex);
  }
  
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
            drawTeamSolution(i, round-1, 0, tPaper[i], false);
          } else {
            drawForceBotSolution(i, round-1, 0, tPaper[i], false);
          }
          $('#solution_'+i).show();
        } else {
          if (showScoreWhenNotMap) {
            if (i <= numPlayers) {
              drawTeamSolution(i, round-1, 0, tPaper[i], true);
            } else {
              drawForceBotSolution(i, round-1, 0, tPaper[i], true);
            }            
            $('#solution_'+i).show();
          } else {
            $('#solution_'+i).hide();
          }
        }
      }
    }
    if (showMe || showBest) {
      drawTeamSolution(myid, round-1, 0, tPaper[myid], false);
      $('#solution_'+myid).show();
    } else {
      $('#solution_'+myid).hide();    
    }
    
    if (showOptimal) {    // this is the programatic optimal solution, not another player's
      doDrawTeamSolution(optimal_id, round-1, 0, tPaper[optimal_id], '<solution map="'+getMapIndex(round-1)+'" dist="'+map[getMapIndex(round-1)][2][0]+'">'+map[getMapIndex(round-1)][1]+'</solution>',false);
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
  $('#canvas').after('<div id="solution_'+idx+'" class="teamSolution" style="display:none;"><h4 class="gameLabel">'+name+'</h4><div id="canvas_'+idx+'" class="teamCanvas"></div><div id="score_'+idx+'" class="score">10,000</div></div>');
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
  
//  log(remainingRounds+" cr:"+currentRound+" m:"+moves);
  var done = true;
//  alert(Object.keys(moves));
  for (var i = 1; i <= numPlayers; i++) {
//    alert(i+" "+moves[i]);
    if (!moves[i] || moves[i] < 1) {
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
function drawForceBotSolution(part, round, index, paper2, scoreOnly) {
  //alert("drawForceBotSolution");
//  doDrawTeamSolution(part, round, index, paper2, XMLizeBotSolution(perfectBot()));  

  switch(botType) {
  case 0:
    doDrawTeamSolution(part, round, index, paper2, XMLizeBotSolution(calculateBotSolution(part, round)), scoreOnly);  
    break;
  case 1:
    // dittoBot
    fetchMove(myid, round, index, function(val) {
      doDrawTeamSolution(part, round, index, paper2, val, scoreOnly);
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
function drawTeamSolution(part, round, index, paper2, scoreOnly) {
//  alert('drawTeam:'+paper2);
  fetchMove(part, round, index, function(val) {
    doDrawTeamSolution(part, round, index, paper2, val, scoreOnly);
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
//  if (document.createEventObject) {
//    // dispatch for IE
//    var evt = document.createEventObject();
//    return element.fireEvent('on'+event,evt);
//  } else {
    // dispatch for firefox + others
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true); // event type,bubbling,cancelable
    return !element.dispatchEvent(evt);
//  }
}
    
/**
 * Load a previous solution by simulating clicking on each of the cities.
 */
function prevSolution() {
  var show_round = currentRound-1; // last round
  if (showBest) {
    show_round = myBestSolutionRound; // best round
  }
  
  fetchMove(myid, show_round, 0, function(xmlVal) {    
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
  if (score > 0) {    
    return Math.round(score/antiscale);
  }
  return 10000;
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
function doDrawTeamSolution(part, round, index, paper2, xmlVal, scoreOnly) {
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
   if (scoreOnly || !showScore && part != myid) {  // never hide your own
     otherScore = "?"
   }
   $('#score_'+part).html(otherScore);
   if (scoreOnly || !showMap && part != myid) { // never hide your own
     var txt = paper2.text(100,80,"?");
     txt.attr("font-size","100");
     txt.attr("font-weight","bold");
     txt.attr("fill","#000000");
     return;
   }

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
//       alert(err+" idx:"+idx+" city:"+city+" last:"+last+" myCities:"+Object.keys(myCities)+" answer:"+answer[idx]+" atyp:"+(typeof answer));
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
    // TODO: use botType
    var botSolution = XMLizeBotSolution(calculateBotSolution(playerId, currentRound));
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
  return solution;
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
  return solution;
}

/**
 * some distance from the from the optimal solution -- swap numSwaps amount of cities
 * 
 * @param playerId
 * @param numSwaps
 * @returns
 */
function deviantBot(playerId, numSwaps, round) {
  // Note, setting the Math.seedrandom() will make consistent results
  
  // this is the optimal solution
  var optimal = map[getMapIndex(round)][1];
  
  // copy it into the solution
  var solution = new Array();
  for (var i = 0; i < numCities; i++) {
    solution[i] = optimal[i];
  }

//  alert("dbot:"+playerId+" r:"+round);
  // swap some values    
  Math.seedrandom(playerId+round*100);
  for (var i = 0; i < numSwaps; i++) {
    var swapMe = Math.floor(Math.random()*(numCities-1))
    var temp = solution[swapMe];
    solution[swapMe] = solution[swapMe+1];
    solution[swapMe+1]=temp;
  }
  return solution;
}

/**
 * a variant on deviantbot who keeps getting better with every round
 * 
 * @param playerId
 * @returns
 */
function progressiveBot(playerId, round) {
  var myGameRound = 1+round-FIRST_ACTUAL_ROUND;
  var remainingRounds = numRounds-myGameRound;
  Math.seedrandom(playerId+myGameRound*100);
  var additionalMistakes = Math.floor(Math.random()*3); // 3 = 0-2
//  alert("additionalMistakes:"+additionalMistakes);
  return deviantBot(playerId, remainingRounds+additionalMistakes, round);
}

function calculateBotSolution(playerId, round) {
  if (deviantPlan[playerId] instanceof Array) {
    var myGameRound = round-FIRST_ACTUAL_ROUND;
    var numSwaps = round+3; // something in case the input is garbage
    try {
      numSwaps = parseInt(deviantPlan[playerId][deviantPlan[playerId].length-1]); // repeat the last choice if needed
      numSwaps = parseInt(deviantPlan[playerId][myGameRound]);
    } catch (err) {}
    return deviantBot(playerId, numSwaps, round);
  }
  
  return progressiveBot(playerId,round);
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

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var myBestSolution = null;
var myBestSolutionRound = FIRST_ACTUAL_ROUND;
var myBestSolutionDist = 1000000;
var midRoundSurveyVal = null;
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

  var lastSolution = cityOrder.join();
  if (myBestSolution == null) {
    myBestSolution = lastSolution;
  }
  var lastBestSolution = myBestSolution; // best solution before this round

  if (myBestSolution == null || ((dist > 0) && (dist < myBestSolutionDist))) {
    myBestSolution = lastSolution;
    myBestSolutionRound = currentRound;
    if (dist > 0) {
      myBestSolutionDist = dist;          
    }
  }
  
  var remainingRounds = FIRST_ACTUAL_ROUND+numRounds-currentRound-1;
  if (remainingRounds > 0) {
    var auto_click_millis = 3000;
    $("#midRoundOk").unbind( "click" );
    $("#midRoundChoices").html("");


    if (false && numPlayers == 1) {
      auto_click_millis = 15000;
      $("#midRoundText").html("Your distance last round was "+getHumanReadableScore(dist)+".  Which of these is the best solution?");  
      
      var shuffleOrder = [0,1];
      var drawBot = false;
      if ((showTeamModulo > 0) && ((gameRound+1) % showTeamModulo == 0)) {  
        drawBot = true;
        shuffleOrder.push(2);
      }
      
      Math.seedrandom(seed*currentRound);
      shuffleOrder = shuffle(shuffleOrder);
//      alert(shuffleOrder);
      for (var i = 0; i < shuffleOrder.length; i++) {
        switch(shuffleOrder[i]) {
        case 0:
          addMidRoundSolution("last",lastSolution, dist, millis);
          break;
        case 1:
          addMidRoundSolution("best",lastBestSolution, dist, millis);
          break;
        case 2:
          switch(botType) {
          case 0:
            var pBotSol = calculateBotSolution(myid+1, currentRound).join();
    //        alert(pBotSol);
            addMidRoundSolution("bot",pBotSol, dist, millis);
            break;
          default:
            // dittoBot
            addMidRoundSolution("bot",lastSolution, dist, millis);
          }
          break;
        }
      }
      
      
      
      $("#midRoundOk").attr("value","They are all the same.");      
      $("#midRoundOk").bind( "click", function() { 
        midRoundSurveyVal = "same";
        doSubmit(dist, millis); 
        return false;
      });      
    } else {
      $("#midRoundText").html("Your distance was "+getHumanReadableScore(dist)+", can you make it shorter?");  
      $("#midRoundOk").attr("value","Proceed to next round...");
      $("#midRoundOk").bind( "click", function() { doSubmit(dist, millis); return false;});      
    }
    
    $("#midRoundPopup").fadeIn();
    midRoundClock = setInterval(function() {doSubmit(dist, millis)}, auto_click_millis);
  } else {
    doSubmit(dist, millis);
  }
}

function addMidRoundSolution(choiceName, city_order, dist, millis) {
  var canvas_id = "choice_"+choiceName;
  var wrapper_id = "wrapper_"+choiceName;
  $("#midRoundChoices").append('<div id="'+wrapper_id+'"><div id="'+canvas_id+'"></div></div>');
  $("#"+wrapper_id).click(function() {
    midRoundSurveyVal = choiceName;
    doSubmit(dist, millis);
//    alert(choiceName);
  });
  var paper = Raphael(canvas_id, (width+cityRad*2)*tFac, (height+cityRad*2)*tFac);
  doDrawTeamMap(paper,buildMap(currentRound),city_order.split(","));
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
  var solutionXML = '<solution map="'+getMapIndex(currentRound)+'" dist="'+dist+'" millis="'+millis+'"'+(midRoundSurveyVal==null ? '' : ' midRound="'+midRoundSurveyVal+'"')+'>'+cityOrder.join()+'</solution>';
  midRoundSurveyVal = null;
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
//  log("snr:"+currentRound);
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
  showOptimalPanel();
}

var numRoundsWithStar = 0;
function showOptimalPanel() {
//  #yourBest
//  #optimalSolution
  fetchMove(myid, currentRound-1, 0, function(val) {
    updateScore(currentRound-1, val); // get the final score
    var star = '<img src="'+FILE_PATH+files['small_gold_star.png']+'"/>';
    
    var totalStars = 0;
    var table = $('#result_table');
    var foundShortest = false;
    numRoundsWithStar = 0;
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
    
    writeScore("Points",totalStars*100);
    if (foundShortest) {
      writeAward("Shortest Path");
      writeScore("Shortest Path",1)
    }
    
    var map_id = getMapIndex(-1);
    
    var paper = Raphael("yourBest_canvas", (width+cityRad*2)*tFac, (height+cityRad*2)*tFac);
    doDrawTeamMap(paper,buildMapFromIndex(map_id),myBestSolution.split(","));
    var score = Math.round(myBestSolutionDist/antiscale);
    if (myBestSolutionDist == 1000000) {
      score = variables['failScore'];
    }
    $("#yourBest_score").html(score);

    paper = Raphael("optimalSolution_canvas", (width+cityRad*2)*tFac, (height+cityRad*2)*tFac);
    doDrawTeamMap(paper,buildMapFromIndex(map_id),map[map_id][1]);
    score = Math.round(map[map_id][2][0]/antiscale);
    $("#optimalSolution_score").html(score);
    
    $("#optimalSolutionPanel").show();
  });

  
//  showResults();  
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
  
  submit('<startup best="'+showBest+'" teamModulo="'+showTeamModulo+'" forceBots="'+forceBots+'" botType="'+botType+'" showScore="'+showScore+'" showMap="'+showMap+'"/>');
  
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
  $("#optimalSolutionPanel").hide();
        
  $('#results').show();
  experimentComplete();
//  enablePlayAgain();
  
  if (numRoundsWithStar >= 3) {
    writeAward("No Instruction Needed");
    payAMT(true,0.20);      
  } else {
    payAMT(true,0.0);      
  }
    
//    quit();
  
}
