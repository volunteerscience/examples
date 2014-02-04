// only call me on active player with lowest ID
function runBots() {
  for (var i = 1; i <= numPlayersAndBots; i++) {
    if (!activePlayers[i]) {
      runBot(i);
    }
  }
}

function runBot(playerNum) {
  var submission = "";
  var myUnits = getUnits(playerNum);

  for (idx in myUnits) {
    var unit = myUnits[idx];
    submission+=runBotUnit(unit);
  }
  
  submitBot(playerNum, currentRound, submission);
}

function runBotUnit(unit) {
  if (unit.wait == 0) {
    // set unit.nextRegion
    randomBot(unit);  
    
    if (unit.nextRegion != null) {
      var scanned = unit.effect(unit.nextRegion);
      var id_str = [];
      var result_str = [];
      for (var r_idx in scanned) {
        var reg = scanned[r_idx];
        var result = unit.doSensor(reg);
        id_str.push(reg.id);
        result_str.push(VALUE_DISPLAY[result]);
      }
      var wait = unit.doWait(unit.nextRegion);
      return '<command unit="'+unit.id+'" region="'+unit.nextRegion.id+'" scan="'+id_str.join(",")+'" result="'+result_str.join(",")+'" wait="'+wait+'"/>';
    }
  }
  
  // no-op
  if (unit.wait > 0) {
    unit.wait = unit.wait-1;
  }
  return '<command unit="'+unit.id+'" wait="'+unit.wait+'"/>';  
}

// try 5 times to pick a random region
function randomBot(unit) {
  for (var i = 0; i < 5; i++) {
    var region_id = Math.floor(Math.random()*(regions.length));
    var region = regions[region_id];
    if (unit.effect(region).length > 0) {
      unit.nextRegion = region;
      return;
    }
  }
}
