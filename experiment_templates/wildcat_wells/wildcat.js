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
var network_type = "a"; // load from variable
var min_distance2 = 25; // square of: can't put in a new well closer than this

function initializeGame() {
  initializeNetwork();
  initializeHistory();
  initializeGameBoard();
  
  // delme, for testing color
//  for (var i = 1; i <= num_rounds; i++) {
//    setBar(myid,i,Math.floor(max_score*i/num_rounds), i*10, i*10);
//  }
}

function initializeGameBoard() {
//  alert(getFile("ground.jpg"));
  
  initializeMap(MAP_W, MAP_H, 0);
  buildMap(seed);
  $("#canvas").css("background-image","url('"+getFile("ground.jpg")+"')");
  paper = Raphael("canvas", MAP_W*P, MAP_H*P);
//  paper.circle(256,256,256);
  
  $('#canvas').bind('click', mapClick);  
}

/**
 * this is the network graph... who's wells you can see
 */ 
function initializeNetwork() {
  Math.seedrandom(seed);
  playerRadix = Math.floor(Math.random()*total_players);
  myNetworkId = getNetworkId(myid);
    
//  var s = "playerRadix:"+playerRadix+"\n";
//  for (var i = 1; i < total_players; i++) {
//    var nid = getNetworkId(i);
//    s+= i + " => "+ nid + " => " + getPlayerId(nid) + "\n";
//  } 
//  alert(s);
  
  switch(total_players) {
  case 4:
    
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
  for (var i = 0; i <= 2; i++) {
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

var round = 1;
function mapClick(evt) {
  var offset = $(this).offset();
  var x = evt.clientX-offset.left;
  var y = evt.clientY-offset.top;
  makeChoice(x,y);
  
//  var score = getScore(x,y);
//  $("#mapValue").html(score);
//  setBar(myid, round++, score, x, y);
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
  
  var point = paper.rect(x-1,y-1,3,3);
  point.attr({fill: color, stroke: color});
}

var gameRound = 0;
var submissions = {}; // round => networkId => [x,y,val]; keep track of who submitted for bot behavior
function initializeGameRound(newGameRound) {
  gameRound = newGameRound;
  setRound(gameRound+FIRST_ACTUAL_ROUND-1);
  submissions[currentRound] = {};
}

function completeRound() {
  // draw the bar/points
  for (var i = 0; i < 4; i++) {
    var neighbor = myNetworkId;
    if (i < 3) {
      neighbor = network[myNetworkId][i];
    }
    var val = submissions[currentRound][neighbor];
    setBar(neighbor,gameRound,val[2],val[0],val[1]);
  }
  initializeGameRound(gameRound+1);
}

// player's choice, return false if too close
function makeChoice(x,y) {
  if (!checkDistance(myid,x,y)) {
    alert("Too close to an existing well!");
    return;
  }
  submitChoice(myid,x,y);
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
    for (var i = 0; i < 4; i++) {
      var sub = null;
      if (i < 3) {
        sub = submissions[round][network[networkId][i]]; // neighbor
      } else {
        sub = submissions[round][networkId]; // self
      }
      
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

function submitChoice(playerId,x,y) {
  var score = getScore(x,y); 
  submitBot(playerId, currentRound, JSON.stringify([x,y,score]));
}

function submitRemainingBots() {
  // abort if I'm not the lowest active player
  for (var i = 1; i < myid; i++) {
    if (activePlayers[i]) return; 
  }
  
  // submit anyone who needs it
  for (var i = 1; i <= total_players; i++) {
    if (!(i in submissions[currentRound])) {
      if (i > numPlayers || !activePlayers[i]) { // bot from beginning || dropped player
        doBotBehavior(i);
      }
    }
  }
}

function doBotBehavior(playerId) {
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

