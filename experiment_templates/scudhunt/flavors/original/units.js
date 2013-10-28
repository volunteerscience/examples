var SPACE_COMMAND = 1;
var AIR_COMMAND = 2;
var SPY_MASTER = 3;
var SPEC_OPS = 4;

/**
 * May be called twice (again after instructions)
 */
function initializeUnits(minPlayers) {
  num_unit_types = 5;
  num_roles = 4;
  choiceAvatarId = 8; // explosion
  
  ROUND_NOUN = "Day";
  ROUND_NOUN_PLURAL = "Days";
  TARGET_NOUN = "Scud";
  TARGET_NOUN_PLURAL = "Scuds";

  roleName[SPACE_COMMAND] = "Space Command";
  roleName[AIR_COMMAND] = "Air Command";
  roleName[SPY_MASTER] = "Spy Master";
  roleName[SPEC_OPS] = "Special Ops";
  
  var actualNumPlayers = Math.max(numPlayers, minPlayers);
  
  story = [
    "<p>The rogue state of Korona has acquired mobile ballistic missiles and weapons of mass destruction.</p>",
    "<p>Korona is threatening our ally, Kartuna, located across the narrow Gulf of Sabani.</p>",
    "<p>Your mission is to locate the missile launchers, using various ground, space, air, and intelligence assets.</p>",
    "<p>The elite fanatical Koronan Revolutionary Guard Special Artillery Regiment (KRGSAR), with a number of mobile missile launchers, "+
      "has deployed from its depot to a secret hide site.</p>",
    "<p>This deployment is supported by deception operations that may confuse our sensors.</p>",
    "<p>"+(actualNumPlayers == 1 ? "You " : ("Your team of "+numPlayers+" joint operations commanders"))+" must identify the locations of "+
      (showNumberOfTargets ? numTargets : "one or more")+" mobile "+TARGET_NOUN+" missile launchers"+(showNumberOfRounds ? " in the next "+numRounds+" days" : "")+".</p>",
    "<p>The fate of hundreds of thousands of Kartunans depend on your success.</p>"
  ];        
  
  var bottomRow = String.fromCharCode('A'.charCodeAt(0)+numRows-1);
  
  mapRules = [
    "<p>The Koronian deployment zone is divided into "+(numRows*numCols)+" squares identified by columns numbered from 1 to "+numCols+" and rows lettered from A to "+bottomRow+".</p>"+
      "<p>Row "+bottomRow+" is the coastline of the Gulf of Sabani.</p>",
    "<p>Each of the "+TARGET_NOUN_PLURAL+" is hidden in a different grid square.</p>"
  ];
  
  placeSpyRules = [
    "<p>Each day you will coordiante with your team to control one or more intelligence, surveillance, or reconnaissance assets.</p>"+
      "<p>Here is your first asset.</p>",
    "<p>You place an asset by <i>selecting</i> the asset, then <i>clicking a region</i> on the game board.</p>"+
      "<p><i>Place the Spy anywhere on the game board.</i></p>",
    "<p>Now that you've placed the Spy you can see its <i>status</i> on the right.</p>"
  ];
  
  placeSatelliteRules = [
    '<p>Some assets can scan multiple regions.</p>'+          
    '<p>The Satellite can scan an entire column.</p>',
    '<p>When you choose the target region, you will see the entire column <span style="color:#20C050;">highlight green</span>.</p>'+
    "<p><i>Place the Satellite anywhere on the game board.</i></p>"
  ];
                                    
  placeAirRules = [
    '<p>Some assets have restricted movement.</p>'+          
      '<p>The Manned Aircraft <i>cannot fly in rows <span style="color:red;">A</span> nor <span style="color:red;">B</span></i>.</p>'+
      '<p><i>Try placing the Manned Aircraft in a <span style="color:red;">restricted region</span>.</i></p>',
    '<p>Note that the <span style="color:red;">region turns red</span> to indicate that the unit can\'t be placed there.</p>'+
      '<p><i>Now place the Manned Aircraft into a <span style="color:#20C050;">valid</span> region.</i></p>',
  ];
                                    
  endTurnRules = [
    '<p>When you have placed your units, click <span style="color:green;"><b>End Turn</b></span> at below the game board.</p>'+
      '<p><i>Click click <span style="color:green;"><b>End Turn</b></span> now.</i></p>',
    "<p>After each day your asset will indicate one of 3 search results for each affected square:</p><ul>"+
      '<li><span style="color:'+VALUE_COLOR[0]+'; font-style:bold;">0</span> - nothing significant to report</li>'+
      '<li><span style="color:#B4B415; font-style:bold;">?</span> - vehicles detected (may be launchers, deception operations, or routine civilian traffic)</li>'+
      '<li><span style="color:'+VALUE_COLOR[2]+'; font-style:bold;">X</span> - launchers detected</li></ul>'+
      '<p>Click <span style="color:green;">Next</span> to continue.</p>',
    '<p>Each asset has different reliablity and risk of failure.</p>'+
      '<p><i>Click or Mouse-Over</i> a scan indicator ('+
      '<span style="color:'+VALUE_COLOR[0]+'; font-style:bold;">0</span>,'+
      '<span style="color:#B4B415; font-style:bold;">?</span>,'+
      '<span style="color:'+VALUE_COLOR[2]+'; font-style:bold;">X</span>'+
        ') to see which unit placed it.</p>',
    '<p>Some units remain on the board after their turn.</p>'+
      '<p>The spy may only move one square after the inital placement.</p>'+
      '<p><i>Move your Spy</i> to a valid square to continue.</p>',
    '<p>Some units are removed from the board after each turn.</p>'+
      '<p>Your Satellite is ready to be placed anywhere.</p>'+
      '<p><i>Place your Satellite</i> to continue.</p>',
    '<p>Some units can become disabled at the end of the turn.</p>'+
      '<p>Your Manned Aircraft is Resting.</p>'+
      '<p>Click <span style="color:green;">Next</span> to continue.</p>'
  ];
                
  clockHistoryRules = [
    '<p>The tabs above the map allow you to review the results of previous rounds.</p>'+
      '<p>Click <i>1</i>&nbsp; to see the results of round 1.</p>',
    '<p>If you place a unit while viewing a previous round, the map will switch to <i>Current"</i>.</p>'+                       
      '<p>Now Click <i>Current</i> to see the Current game state.</p>',
    '<p>Your team has a limited amount of time each '+ROUND_NOUN+' to select your moves.</p>'+
      '<p>When the clock reaches zero, your current actions will automatically be submitted.</p>'   
  ];
  
  
  endRules = [  
    '<p>After '+(showNumberOfRounds ? (''+numRounds) : 'a few')+' '+ROUND_NOUN_PLURAL+', you must designate the most probable locations of each mobile missile launcher.</p>'+
      '<p>Place all of the '+TARGET_NOUN_PLURAL+' to continue.</p>',
    '<p>Very good.  You now know the basic rules of the game.</p>'+
      '<p>Next, we will review the units that you control.</p>'
  ];

  
  
  for (var roleId = 0; roleId <= num_roles; roleId++) { // roles + target
    roleUnits[roleId] = new Array();
  }
  
  var satellite = new Unit(0, SPACE_COMMAND, "Recon Satellite", "Scan column", 
      "Searches one entrie column.  High probability of confirming the absence of vehicles, "+
      "but cnannot reliably distinguish between launchers and dummies.", 
      getFile("satellite.png"), 0, 
      [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
  satellite.effect = function(region) {
    return region.groups[COL];
  };
  
  var mannedAircraft = new Unit(1, AIR_COMMAND, "Manned Aircraft", "Search from the Coast", 
      "May fly only along the Gulf (Row E) outside Koronan airspace.  "+
      "It searches the coastal grid squares with excellent reliability, "+
      "and two rows inland (Rows C and D) with reduced reliablity.  "+
      "Must rest at leat one turn between flights due to crew fatigue and maintenance requirements.", 
      getFile("SR-71.png"), 1, 
      [ 
        [],
        [],
        [[0.4,0.2,0.4],[0.3,0.2,0.5],[0.8,0.1,0.1]],
        [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]],
        [[0.9,0.05,0.05],[0.05,0.9,0.05],[0.05,0.05,0.9]],
      ]);
  mannedAircraft.effect = function(region) {
    if (region.row <= 1 ) return []; // can't scan top 2 rows
    return region.groups[ROW];
  };
  mannedAircraft.doWait = function(region) {
    return 1;
  };
  mannedAircraft.doSensor = function(region) {
    return getReport(region.value, mannedAircraft.reportTable[region.row]);
  };
  mannedAircraft.waitString = "Resting";
  
  var uav = new Unit(2, AIR_COMMAND, "UAV", "Scan Row", 
      "May enter Koronan airspace to search any row.  It has good search reliability.  "+
      "For each grid square it enters, there is a chance that it will crash or be shot down, "+
      "which aborts any further search on that turn.  "+
      "There is a variable probability that a lost UAV will be replaced the next day.", 
      getFile("uav.png"), 2, [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
  uav.effect = function(region) {
    return region.groups[ROW];
  };
  uav.doWait = function(region) {
    if (Math.random() < 0.3) { // 30% chance of death
      var days = Math.floor(Math.random()*4); 
//      alert("Your UAV has been shot down and will return in "+days+" days.");
      return days  // wait up to 4 days
    }
    return 0;
  };
  
  var sigint = new Unit(3, SPY_MASTER, "SigInt", "Scan Square", 
      "Signals Intelligence can examine a region for increased communications chatter, " +
      "but cannot reliably distinguish launcher from deception operations.", 
      getFile("headphones.png"), 3, [[0.6,0.35,0.05],[0.2,0.6,0.2],[0.1,0.3,0.6]]);
  
  var humint = new Unit(4, SPY_MASTER, "Spy", "Deploy anywhere; Walk from there", 
      "We can deploy our spy to search any region with excellent reliablity.  "+
      "The agent has limited mobility; after initial placement on any square, " +
      "he may only remain in the same square or move to an adjacent grid square." +
      "Each turn the agent is on the board, there is a chance he will be caught and executed."+
      "He cannot be replaced.", 
      getFile("spy.png"), 4, [[0.90,0.05,0.05],[0.2,0.6,0.2],[0.1,0.4,0.5]]);
  humint.effect = function(region) {
    if (humint.currentRegion == null) {
      return [region];
    }
    
    // only current, cardinal, or ordinal
    if (region == humint.currentRegion) {
      return [region];
    }    
    if (humint.currentRegion.groups[CARDINAL_NEIGHBORS].indexOf(region) != -1) {
      return [region];
    }
    if (humint.currentRegion.groups[ORDINAL_NEIGHBORS].indexOf(region) != -1) {
      return [region];
    }
    return [];
  };
  humint.remainsOnBoard = true;
  
  humint.doWait = function(region) {
    if (Math.random() < 0.3) { // 30% chance of death
//      alert("Your spy had been caught!");
      return -1;  
    }
    return 0;
  };

  specOps = new Unit(5, SPEC_OPS, "Spec Ops", "Deply anywhere; Walk from there",
      "May be inserted to search any grid square with excellent reliability.  "+
      "Can reliably distinguish between deception and launchers.  "+
      "Each turn that the Spec Ops team is in play, there is a chance the team "+
      "will be compromised and forced to perform an emergency extraction.  "+
      "If extracted, the team will be unavailable for 1 or more days to rest and refit.", 
      getFile("spec_ops.png"), 5, [[0.5,0.3,0.2],[0.1,0.8,0.1],[0.05,0.15,0.8]]);
  specOps.effect = function(region) {
    if (specOps.currentRegion == null) {
      return [region];
    }
    
    // only current, cardinal, or ordinal
    if (region == specOps.currentRegion) {
      return [region];
    }    
    if (specOps.currentRegion.groups[CARDINAL_NEIGHBORS].indexOf(region) != -1) {
      return [region];
    }
    if (specOps.currentRegion.groups[ORDINAL_NEIGHBORS].indexOf(region) != -1) {
      return [region];
    }
    return [];
  };
  specOps.remainsOnBoard = true;
  specOps.waitString = "Extracted";  
  specOps.doWait = function(region) {
    if (Math.random() < 0.3) { // 30% chance of death
//      alert("Your spy had been caught!");
      var days = Math.floor(Math.random()*4); 
      return days;  
    }
    return 0;
  };

  seals = new Unit(6, SPEC_OPS, "Navy SEALS", "Deploy on Cost; Walk from there",
      "May only be inserted on the coast (row E).  Searchs grid square with excellent reliability.  "+
      "Can reliably distinguish between deception and launchers.  "+
      "Each turn that the Navy SEALS team is in play, there is a chance the team "+
      "will be compromised and forced to perform an emergency extraction.  "+
      "If extracted, the team will be unavailable for 1 or more days to rest and refit.", 
      getFile("seals.png"), 6, [[0.6,0.3,0.1],[0.1,0.8,0.1],[0.05,0.15,0.8]]);
  seals.effect = function(region) {
    if (seals.currentRegion == null) {
      if (region.row <= 3 ) return []; // can't start in top 4 rows
      return [region];
    }
    
    // only current, cardinal, or ordinal
    if (region == seals.currentRegion) {
      return [region];
    }    
    if (seals.currentRegion.groups[CARDINAL_NEIGHBORS].indexOf(region) != -1) {
      return [region];
    }
    if (seals.currentRegion.groups[ORDINAL_NEIGHBORS].indexOf(region) != -1) {
      return [region];
    }
    return [];
  };
  seals.remainsOnBoard = true;
  seals.waitString = "Extracted";  
  seals.cantMoveAlert = function(region) {
    return "You must deploy the "+seals.name+" from the coast (row E).";
  };

  seals.doWait = function(region) {
    if (Math.random() < 0.2) { // 20% chance of death
//      alert("Your spy had been caught!");
      var days = Math.floor(Math.random()*4); 
      return days;  
    }
    return 0;
  };
  
  for (var i = 0; i < numTargets; i++) {
    var scud = new Unit(7+i, TARGET_ROLE, "SCUD", "Hidden Target", 
        "Based on your operations over the previous days, place each the SCUD in the most likely location.", 
        getFile("scud.png"), 7, null);
  }

  
  
  var avatarFile = getFile("sprites.png");
//  var avatarFile = getFile("original_avatars.png");
  unitAvatarFactory = new AvatarFactory(avatarFile, 128, num_unit_types+5, 1, 0, [0], 5, [], null);
  
  instructionAssets.push(humint);
  instructionAssets.push(satellite);
  instructionAssets.push(mannedAircraft);
  
}