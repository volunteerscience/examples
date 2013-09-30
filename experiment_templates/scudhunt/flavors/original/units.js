var SPACE_COMMAND = 1;

function initializeUnits() {
  num_unit_types = 1;
  num_roles = 4;
  
  for (var roleId = 1; roleId < num_roles+1; roleId++) {
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
  
  var mannedAircraft = new Unit(1, SPACE_COMMAND, "Manned Aircraft", "Search from the Coast", 
      "May fly only along the Gulf (Row E) outside Koronan airspace.  "+
      "It searches the coastal grid squares with excellent reliability, "+
      "and two rows inland (Rows C and D) with reduced reliablity.  "+
      "Must rest at leat one turn between flights due to crew fatigue and maintenance requirements.", 
      getFile("satellite.png"), 0, 
      [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
  mannedAircraft.effect = function(region) {
    if (region.id <= 9 ) return []; // can't scan top 2 rows
    return region.groups[ROW];
  };
  mannedAircraft.doWait = function(region) {
    return 1;
  };
  
  var uav = new Unit(2, SPACE_COMMAND, "UAV", "Scan Row", 
      "May enter Koronan airspace to search any row.  It has good search reliability.  "+
      "For each grid square it enters, there is a chance that it will crash or be shot down, "+
      "which aborts any further search on that turn.  "+
      "There is a variable probability that a lost UAV will be replaced the next day.", 
      getFile("satellite.png"), 0, [[0.7,0.2,0.1],[0.2,0.6,0.2],[0.1,0.2,0.7]]);
  uav.effect = function(region) {
    return region.groups[ROW];
  };
  mannedAircraft.doWait = function(region) {
    if (Math.random() < 0.3) { // 30% chance of death
      return Math.floor(Math.random()*4);  // wait up to 4 days
    }
  };
  
  var avatarFile = getFile("satellite.png");
//  var avatarFile = getFile("original_avatars.png");
  unitAvatarFactory = new AvatarFactory(avatarFile, 128, num_unit_types, 1, 0, [0], 5, [], null);
}