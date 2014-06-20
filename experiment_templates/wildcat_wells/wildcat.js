var FIRST_ACTUAL_ROUND = 101;

var max_score = 1000;
var scale = 900;
var num_rounds = 15;
var total_players = 16; // TODO: get from variable
var network = [];
// we don't want player 1 to always be network[1] because when there are mostly bots, the player will always be in the same spot.  So, we use a radix to shift the location
var playerRadix = 0; // converts between playerId and networkId.
var myNetworkId = 1;
var myNetwork = []; // in playerId, not networkId
var network_types = ["a","b","c","d","e","f","g","h"]; // load from variable
var network_type = "a"; // load from above
var min_distance2 = 0; //25; // square of: can't put in a new well closer than this
var showTeamModulo = -1;
var map_num = 1;
var num_maps = 50;
var showScoreWhenNotMap = true;

var click_color = "#000000";
var round_seconds = 30;
var total_score = 0;


function initializeGame() {
  try {
    total_players = parseInt(variables['total_players']);
  } catch (err) {
    alert(err);
  }
  
  try {
    network_types = variables['network_types'].split(",");
  } catch (err) {
    alert(err);
  }

  try {
    num_maps = parseInt(variables['num_maps']);
  } catch (err) {
    alert(err);
  }
  
  try {
    showTeamModulo = parseInt(variables['showTeamModulo']);
  } catch (err) {
    alert(err);
  }
  if (showTeamModulo < 0) {    
    Math.seedrandom(seed);
    var info = Math.floor(Math.random()*3);
    switch (info) {
      case 0:
        showTeamModulo = 0;
        break;
      case 1:
  //    case 2:
        showTeamModulo = 1;
        break;
      default:
        showTeamModulo = 3;
        break;
    }
  }
  
  
  initializeNetwork();
  initializeHistory();
  initializeGameBoard();
  setInterval(advanceCountdowns, 100);
  
  initializeInstructions();
  // delme, for testing color
//  for (var i = 1; i <= num_rounds; i++) {
//    setBar(myid,i,Math.floor(max_score*i/num_rounds), i*10, i*10);
//  }
}

function initializeInstructions() {
  $('#instructions').modal('show');
  
//  $('#close_instructions').click(function() {
//    $(quit_dialog).modal('hide');
//  });
}

function initializeGameBoard() {
//  alert(getFile("ground.jpg"));
  
  initializeMap(MAP_W, MAP_H, 0);
  buildMap((seed % num_maps)+1);
  $("#canvas").css("background-image","url('"+getFile("ground.jpg")+"')");
  paper = Raphael("canvas", MAP_W*P, MAP_H*P);
//  paper.circle(256,256,256);
  
  $('#canvas').bind('click', mapClick);  
  $('#drill').bind('click', drill);  
  $('#x_coord').bind("keyup change",updateUserClick);
  $('#y_coord').bind("keyup change",updateUserClick);
}

/**
 * this is the network graph... who's wells you can see
 */ 
function initializeNetwork() {
  Math.seedrandom(seed);
  playerRadix = Math.floor(Math.random()*total_players);
  myNetworkId = getNetworkId(myid);
  network_type = network_types[Math.floor(Math.random()*network_types.length)];
  $(".gameid").append(network_type+" "+showTeamModulo);
    
//  var s = "playerRadix:"+playerRadix+"\n";
//  for (var i = 1; i < total_players; i++) {
//    var nid = getNetworkId(i);
//    s+= i + " => "+ nid + " => " + getPlayerId(nid) + "\n";
//  } 
//  alert(s);
  
  switch(total_players) {
  case 1:
  case 2:
  case 3:
  case 4:
    // fully connected
    for (var i = 1; i <= total_players; i++) {
      network[i] = [];
      for (var j = 1; j <= total_players; j++) {
        if (i != j) {
          network[i].push(j);
        }
      }
    }
    break;
  case 16:
    switch(network_type.toLowerCase()) {
    case 'a':
      network[1] =  [ 2, 3, 4];
      network[2] =  [ 1, 3, 4];
      network[3] =  [ 1, 2, 5];
      network[4] =  [ 1, 2, 5];
      network[5] =  [ 3, 4, 6];
      network[6] =  [ 5, 7, 8];
      network[7] =  [ 6, 8, 9];
      network[8] =  [ 6, 7, 9];
      network[9] =  [ 7, 8,10];
      network[10] = [ 9,11,12];
      network[11] = [10,12,16];
      network[12] = [10,11,13];
      network[13] = [12,14,15];
      network[14] = [13,15,16];
      network[15] = [13,14,16];
      network[16] = [11,14,15];
      break;
    case 'b':
      network[1] =  [ 2, 3, 4];
      network[2] =  [ 1, 3, 4];
      network[3] =  [ 1, 2, 5];
      network[4] =  [ 1, 2, 5];
      network[5] =  [ 3, 4, 6];
      network[6] =  [ 5, 7, 8];
      network[7] =  [ 6, 8, 9];
      network[8] =  [ 6, 7,10];
      network[9] =  [ 7,10,11];
      network[10] = [ 8, 9,11];
      network[11] = [ 9,10,12];
      network[12] = [11,13,16];
      network[13] = [12,14,15];
      network[14] = [13,15,16];
      network[15] = [13,14,16];
      network[16] = [12,14,15];      
      break;
    case 'c':
      network[1] =  [ 2, 3, 4];
      network[2] =  [ 1, 3, 4];
      network[3] =  [ 1, 2, 5];
      network[4] =  [ 1, 2, 5];
      network[5] =  [ 3, 4, 6];
      network[6] =  [ 5,11,16];
      network[7] =  [ 8, 9,10];
      network[8] =  [ 7, 9,10];
      network[9] =  [ 7, 8,11];
      network[10] = [ 7, 8,11];
      network[11] = [ 6, 9,10];
      network[12] = [13,14,15];
      network[13] = [12,14,15];
      network[14] = [12,13,16];
      network[15] = [12,13,16];
      network[16] = [ 6,14,15];      
      break;
    case 'd':
      network[1] =  [ 2, 3,16];
      network[2] =  [ 1, 3, 4];
      network[3] =  [ 1, 2, 4];
      network[4] =  [ 2, 3, 5];
      network[5] =  [ 4, 6, 7];
      network[6] =  [ 5, 7, 8];
      network[7] =  [ 5, 6, 8];
      network[8] =  [ 6, 7, 9];
      network[9] =  [ 8,10,11];
      network[10] = [ 9,11,12];
      network[11] = [ 9,10,12];
      network[12] = [10,11,13];
      network[13] = [12,14,15];
      network[14] = [13,15,16];
      network[15] = [13,14,16];
      network[16] = [14,15, 1];      
      break;
    case 'e':
      network[1] =  [ 2, 3, 6];
      network[2] =  [ 1, 5,10];
      network[3] =  [ 1, 4, 8];
      network[4] =  [ 3, 5, 7];
      network[5] =  [ 2, 4, 9];
      network[6] =  [ 1, 7,11];
      network[7] =  [ 4, 6,13];
      network[8] =  [ 3,12,16];
      network[9] =  [ 5,13,14];
      network[10] = [ 2,12,15];
      network[11] = [ 6,12,14];
      network[12] = [ 8,10,11];
      network[13] = [ 7, 9,15];
      network[14] = [ 9,11,16];
      network[15] = [10,13,16];
      network[16] = [ 8,14,15];      
      break;
    case 'f':
      network[1] =  [ 2, 3, 7];
      network[2] =  [ 1, 5, 6];
      network[3] =  [ 1, 4, 8];
      network[4] =  [ 3, 7, 9];
      network[5] =  [ 2, 8,10];
      network[6] =  [ 2, 9,10];
      network[7] =  [ 1, 4,11];
      network[8] =  [ 3, 5,11];
      network[9] =  [ 4, 6,12];
      network[10] = [ 5, 6,14];
      network[11] = [ 7, 8,13];
      network[12] = [ 9,13,16];
      network[13] = [11,12,15];
      network[14] = [10,15,16];
      network[15] = [13,14,16];
      network[16] = [12,14,15];      
      break;
    case 'g':
      network[1] =  [ 2, 3, 5];
      network[2] =  [ 1, 4, 8];
      network[3] =  [ 1, 6, 9];
      network[4] =  [ 2, 5,11];
      network[5] =  [ 1, 4,12];
      network[6] =  [ 3, 7,10];
      network[7] =  [ 6, 8, 9];
      network[8] =  [ 2, 7,15];
      network[9] =  [ 3, 7,13];
      network[10] = [ 6,11,14];
      network[11] = [ 4,10,13];
      network[12] = [ 5,14,15];
      network[13] = [ 9,11,16];
      network[14] = [10,12,16];
      network[15] = [ 8,12,16];
      network[16] = [13,14,15];      
      break;
    case 'h':
      network[1] =  [ 2, 3, 5];
      network[2] =  [ 1, 3, 4];
      network[3] =  [ 1, 2, 4];
      network[4] =  [ 2, 3, 7];
      network[5] =  [ 1, 6, 8];
      network[6] =  [ 5, 9,11];
      network[7] =  [ 4, 9,10];
      network[8] =  [ 5,10,12];
      network[9] =  [ 6, 7,12];
      network[10] = [ 7, 8,11];
      network[11] = [ 6,10,15];
      network[12] = [ 8, 9,13];
      network[13] = [12,14,16];
      network[14] = [13,15,16];
      network[15] = [11,14,16];
      network[16] = [13,14,15];      
      break;
    }
    break;
  default:
    alert("error: invalid number of players")
  }
}

function getNetworkId(playerId) {
  return 1+( (playerId+playerRadix-1) % total_players);
}

function getPlayerId(networkId) {
  return 1+( (networkId-1-playerRadix+total_players) % total_players);  
}

function initializeHistory() {
  addHistoryPanel(myNetworkId, "Player "+myNetworkId+" (You)");
  for (var i = 0; i < Math.min(3,network[myNetworkId].length); i++) {
    var myBuddy = getPlayerId(network[myNetworkId][i]);
    myNetwork.push(myBuddy);
    addHistoryPanel(network[myNetworkId][i], "Player "+network[myNetworkId][i]);
  }
  
  submit(JSON.stringify({'networkType':network_type, 'myNetworkId':myNetworkId, 'myNeighbors':myNetwork}));
  initializeGameRound(1);
}

var panelCtr = 0;
function addHistoryPanel(networkId, name) {
  // it's networkId, not playerId
  
  // first 3 have the bottom dashed
  panelCtr++;
  var extraClass = " bottom_dashed";
  if (panelCtr == 4) {
    extraClass = "";
  }
  
  var s = '<div class="history_panel'+extraClass+'">'+
            '<div class="history_title">'+name+'</div><div class="history_middle">'+
            '<div class="left_text rotate">Score</div>'+
            '<table class="history_table">';
  for (var i = 1; i <= num_rounds; i++) {
//          s+='<col width="25px"/>';
  }
            s+='<tr>';
  for (var i = 1; i <= num_rounds; i++) {
      s+='<td class="history_bar" height="85%" width="1"><div id="bar_'+networkId+'_'+i+'" class="pre_round">?</div></td>';
  }
          s+= '</tr><tr>';
  for (var i = 1; i <= num_rounds; i++) {
            s+='<td class=""  height="15%" width="1">'+i+'</td>';
  }
        s+= '</tr></table>'+
            '</div><div class="history_foot">Round</div>'+
          '</div>';
//  alert(s);
  $("#history_wrapper").append(s);
}

function getScore(x,y) {
  return Math.min(max_score,Math.max(0,Math.floor(scale*map[x][y])));
}

var userClick = null;
function updateUserClick() {
  fail = false;
  var x = $("#x_coord").val();
  if (x.length > 0) {
    x = parseInt(x);
    if (isNaN(x) || x < 0 || x > MAP_W) {
      $("#x_coord").val("");
      fail = true;
    }     
  }
  var y = $("#y_coord").val();
  if (y.length > 0) {
    y = parseInt(y);
    if (isNaN(y) || y < 0 || y > MAP_H) {
      $("#y_coord").val("");
      fail = true;
    }     
  }

  if (fail) {
    if (userClick != null) {
      userClick.remove();
      userClick = null;
    }
  }
  
  if (userClick == null) {
    userClick = paper.rect(x-1,y-1,3,3);
    userClick.attr({fill: click_color, stroke: click_color});    
  } else {
    userClick.attr({x: x-1, y: y-1});
  }
}

var round = 1;
function mapClick(evt) {
  var offset = $(this).offset();
  var x = evt.pageX-offset.left;
  var y = evt.pageY-offset.top;
  $("#x_coord").val(x);
  $("#y_coord").val(y);
  updateUserClick();
}

function drill() {
  var x = $("#x_coord").val();
  var y = $("#y_coord").val();
  if (x.length == 0 || y.length == 0) {
    alert("Please click a new well site on the map.");
    return;
  }
  x = parseInt(x);
  y = parseInt(y);
  makeChoice(x,y);  
}

function setBar(networkId,round,value, x, y) {
  var bar = $("#bar_"+networkId+"_"+round)
  
  bar.removeClass('pre_round');
  if (value < 0) {
    bar.addClass('skip_round');
    bar.html("X");
    return;
  }
  
  var fraction = Math.min(1.0,Math.max(0,value/max_score)); // 0-1
  var height = Math.floor(100*fraction);
  $("#mapValue").html(height);

  var midpoint = 0.4; // where yellow is; lower for more red on the chart, higher for more blue on the chart
  var r = 255;
  var g = 0;
  var b = 0;
  if (fraction < midpoint) {
    // blue => yellow
    r = g = Math.floor(255.0 * fraction/midpoint);
    b = 255-r;
  } else {
    // yellow => red
    r = 255;
    g = 255 - Math.floor(255* (fraction-midpoint)/(1.0-midpoint) );
    //b = 0; // from above    
  }
  var color = "rgb("+r+","+g+","+b+")";
  bar.html("");
  bar.css("background-color",color);
  bar.css("height",height+"%");
  
  if (x >= 0) {
    var point = paper.rect(x-1,y-1,3,3);
    point.attr({fill: color, stroke: color});    
  }
}

var gameRound = 0;
var submissions = {}; // round => networkId => [x,y,val]; keep track of who submitted for bot behavior
function initializeGameRound(newGameRound) {
  if (userClick != null) {
    userClick.remove();
    userClick = null;
  }
  gameRound = newGameRound;
  setRound(gameRound+FIRST_ACTUAL_ROUND-1);
  submissions[currentRound] = {};
  $("#x_coord").val("");
  $("#y_coord").val("");

  var seconds = round_seconds;
  if (gameRound == 1) {
    seconds = 90;
  }
  setCountdown("timer",seconds);
  
  $("#round").html(gameRound);
  $("#score").html(numberWithCommas(total_score));
  $("#drill").val("Drill!");
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function countdownExpired(id) {
  var x = $("#x_coord").val();
  var y = $("#y_coord").val();
  
  if (x.length == 0 || y.length == 0 || !checkDistance(myid,x,y)) {
    x = -1;
    y = -1;
    // TODO: notify user
  }
  x = parseInt(x);
  y = parseInt(y);
  submitMyChoice(x,y);
  submitRemainingBots();
}

function completeRound() {
  // draw the bar/points
  
  // mine
  var neighbor = myNetworkId;
  var val = submissions[currentRound][neighbor];
  if (val[2] > 0) {
    total_score+=val[2];
  }
  setBar(neighbor,gameRound,val[2],val[0],val[1]);

  if ((showTeamModulo > 0) && ((gameRound) % showTeamModulo == 0)) {
    log("rendering neighbors gameRound:"+gameRound+" currentRound:"+currentRound);
    // fill in your neighbor's information
    for (var roundDif = -(showTeamModulo-1); roundDif <= 0; roundDif++) { // how many rounds back to render
      log("rendering round:"+(gameRound+roundDif));
      for (var i = 0; i < network[myNetworkId].length; i++) {
        neighbor = network[myNetworkId][i];
        val = submissions[currentRound+roundDif][neighbor];
        setBar(neighbor,gameRound+roundDif,val[2],val[0],val[1]);
      }
    }
  } else {
    // draw the bar, but not the point
    if (showScoreWhenNotMap) {      
      log("rendering neighbors barOnly gameRound:"+gameRound+" currentRound:"+currentRound);
      for (var i = 0; i < network[myNetworkId].length; i++) {
        neighbor = network[myNetworkId][i];
        val = submissions[currentRound][neighbor];
        setBar(neighbor,gameRound,val[2],-1,-1);
      }    
    }
  }
  
  if (gameRound < num_rounds) {
    initializeGameRound(gameRound+1);    
  } else {
    endGame();
  }
}

function endGame() {
  experimentComplete();
  alert("Congratulations!  You collected "+numberWithCommas(total_score)+" barrels of oil.");  
}

// player's choice, return false if too close
function makeChoice(x,y) {
  if (!checkDistance(myid,x,y)) {
    alert("Too close to an existing well!");
    return;
  }
  submitMyChoice(x,y);
  submitRemainingBots();
}

function playerDisconnect(playerId) {
  if (playerId < myid) {
    submitRemainingBots();
  }
}

/**
 * return false if illegal for this player
 * note that we only check against the player's network
 */
function checkDistance(playerId, x, y) {
//  if (gameRound == 1) return true; // first round
  
  var networkId = getNetworkId(playerId);
  for (var round = FIRST_ACTUAL_ROUND; round < currentRound; round++) {
    var sub = submissions[round][networkId]; // self
    if (sub[2] >= 0) { // there's a valid submission
      var dx = x-sub[0];
      var dy = y-sub[1];
      var d2 = dx*dx + dy*dy;
      if (d2 < min_distance2) {
        return false;
      }
    }
    
    for (var i = 0; i < network[myNetworkId].length; i++) {
      sub = submissions[round][network[networkId][i]]; // neighbor
      if (sub[2] >= 0) { // there's a valid submission
        var dx = x-sub[0];
        var dy = y-sub[1];
        var d2 = dx*dx + dy*dy;
        if (d2 < min_distance2) {
          return false;
        }
      }
    }
  }
  return true;
}

function submitMyChoice(x,y) {
  $("#drill").val("Waiting for other players.");
  stopCountdown("timer");
  submitChoice(myid,x,y);
}

function submitChoice(playerId,x,y) {
  var score = -1;
  try {
    score = getScore(x,y); 
  } catch (err) {
    x = -1;
    y = -1;
  }
  submitBot(playerId, currentRound, JSON.stringify([x,y,score]));
}

function submitRemainingBots() {
  // abort if I'm not the lowest active player
  for (var i = 1; i < myid; i++) {
    if (activePlayers[i]) return; 
  }
  log('submitRemainingBots');
  
  // submit anyone who needs it
  for (var i = 1; i <= total_players; i++) {
//    log(i+" in "+JSON.stringify(submissions[currentRound]));
    if (!(String.valueOf(i) in submissions[currentRound])) {
      if (i > numPlayers || !activePlayers[i]) { // bot from beginning || dropped player
        doBotBehavior(i);
      }
    }
  }
}

function doBotBehavior(playerId) {
  log('doBotBehavior:'+playerId);
  var x = Math.floor(Math.random()*MAP_W);
  var y = Math.floor(Math.random()*MAP_H);
  // TODO: loop with checkDistance()
  // TODO: copy behavior
  submitChoice(playerId,x,y);
}

function newMove(playerId, idx, round) {
//  if (round != currentRound) {
//    return;
//  }
  
  fetchMove(playerId, round, idx, function(val, participant, round, index) {
    submissions[round][getNetworkId(playerId)] = JSON.parse(val);
    
    for (var i = 1; i <= total_players; i++) {
      if (!(i in submissions[currentRound])) {
        return;
      }
    }
    completeRound();
  });
}

