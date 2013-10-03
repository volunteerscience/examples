var SPACE_COMMAND = 1;

function initializeUnits() {
  num_unit_types = 5;
  num_roles = 4;
  
  for (var roleId = 1; roleId < num_roles+1; roleId++) {
    roleUnits[roleId] = new Array();
  }
  
  
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
  var mannedAircraft = new Unit(1, SPACE_COMMAND, "Manned Aircraft", "Search from the Coast", 
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
  
  var uav = new Unit(2, SPACE_COMMAND, "UAV", "Scan Row", 
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
      alert("Your UAV has been shot down.");
      return Math.floor(Math.random()*4);  // wait up to 4 days
    }
  };
  
  var sigint = new Unit(3, SPACE_COMMAND, "SigInt", "Scan Square", 
      "Signals Intelligence can examine a region for increased communications chatter, " +
      "but cannot reliably distinguish launcher from deception operations.", 
      getFile("headphones.png"), 3, [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
  
  var humint = new Unit(4, SPACE_COMMAND, "HumInt", "Scan Square", 
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
  humint.doWait = function(region) {
    if (Math.random() < 0.3) { // 30% chance of death
      alert("Your spy had been caught!");
      return -1;  
    }
  };

  
  
  
  
  
  
  } // delme
  
  
  
  
  var avatarFile = getFile("sprites.png");
//  var avatarFile = getFile("original_avatars.png");
  unitAvatarFactory = new AvatarFactory(avatarFile, 128, num_unit_types+5, 1, 0, [0], 5, [], null);
}