var SPACE_COMMAND = 1;
var AIR_COMMAND = 2;
var SPY_MASTER = 3;
var SPEC_OPS = 4;

/**
 * May be called twice (again after instructions)
 */
function initializeUnits() {
  num_unit_types = 5;
  num_roles = 4;
  choiceAvatarId = 8; // explosion
  
  ROUND_NOUN = "Day";
  ROUND_NOUN_PLURAL = "Days";
  TARGET_NOUN = "SCUD";
  TARGET_NOUN_PLURAL = "SCUDs";

  
  for (var roleId = 0; roleId <= num_roles; roleId++) { // roles + target
    roleUnits[roleId] = new Array();
  }
  
  roleName[SPACE_COMMAND] = "Space Command";
  roleName[AIR_COMMAND] = "Air Command";
  roleName[SPY_MASTER] = "Spy Master";
  roleName[SPEC_OPS] = "Special Ops";
  
  
  story = [
    "The rogue state of Korona has acquired mobile ballistic missiles and weapons of mass destruction.",
    "Korona is threatening a U.S. ally, Kartuna, located (off-map) across the narrow Gulf of Sabani.",
    "Your team mission is to locate the missile launchers, using various ground, space, air, and intelligence assets.",
    "The elite fanatical Koronan Revolutionary Guard Special Artillery Regiment (KRGSAR), with a number of mobile missile launchers, "+
      "has deployed from its depot to a secret hide site.",
    "This deployment is supported by deception operations that may confuse our sensors.",
    "Your team of 4 joint operations commanders must identify the locations of 4 mobile SCUD missile launchers in the next 5 days.",
    "The fate of hundreds of thousands of Kartunans depend on your success."
  ];        
  
  rules = [
    "Korona is divided into 25 squares identified by columns numbered from 1 to 5 and rows lettered from A to E.  "+
      "Row E is the coastline of the Gulf of Sabani.",
    "Each of targets is randomly placed in a different grid square.",
    "Each day you will coordiante with your team to control one or more intelligence, surveillance, or reconnaissance assets.",
    "Each asset has different reliablity and risk of failure.",
    "After each day, if your asset survives, it will indicate one of 3 basic search results for each affected square:",
    "0 - nothing significant to report",
    "? - vehicles detected (may be launchers, deception operations, or routine civilian traffic)",
    "X - launchers detected",
    "Reported search results may be true or erroneous, depending on the number and type of assets assigned to search a given grid square.",
    "After 5 days, you must designate the most probably locations of each mobile missile launcher."
  ];
  
  var satellite = new Unit(0, SPACE_COMMAND, "Recon Satellite", "Scan column", 
      "Searches one entrie column.  High probability of confirming the absence of vehicles, "+
      "but cnannot reliably distinguish between launchers and dummies.", 
      getFile("satellite.png"), 0, 
      [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
  satellite.effect = function(region) {
    return region.groups[COL];
  };
  
  if (true) { // delme
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
      getFile("headphones.png"), 3, [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
  
  var humint = new Unit(4, SPY_MASTER, "Spy", "Deploy anywhere; Walk from there", 
      "We can deploy our spy to search any region with excellent reliablity.  "+
      "The agent has limited mobility; after initial placement on any square, " +
      "he may only remain in the same square or move to an adjacent grid square." +
      "Each turn the agent is on the board, there is a chance he will be caught and executed."+
      "He cannot be replaced.", 
      getFile("spy.png"), 4, [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
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
      getFile("spec_ops.png"), 5, [[0.95,0.2,0.1],[0.1,0.8,0.1],[0.1,0.2,0.95]]);
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
      getFile("seals.png"), 6, [[0.95,0.2,0.1],[0.1,0.8,0.1],[0.1,0.2,0.95]]);
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
  
  
  } // delme
  
  for (var i = 0; i < numTargets; i++) {
    var scud = new Unit(7+i, TARGET_ROLE, "SCUD", "Hidden Target", 
        "Based on your operations over the previous days, place each the SCUD in the most likely location.", 
        getFile("scud.png"), 7, null);
  }

  
  
  var avatarFile = getFile("sprites.png");
//  var avatarFile = getFile("original_avatars.png");
  unitAvatarFactory = new AvatarFactory(avatarFile, 128, num_unit_types+5, 1, 0, [0], 5, [], null);
}