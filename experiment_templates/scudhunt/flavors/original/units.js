var SPACE_COMMAND = 1;

function initializeUnits() {
  num_unit_types = 1;
  num_roles = 4;
  
  for (var roleId = 1; roleId < num_roles+1; roleId++) {
    roleUnits[roleId] = new Array();
  }
  
  var satellite = new Unit(0, SPACE_COMMAND, "Recon Satellite", "Scan column", "Searches one entrie column.  High probability of confirming the absence of vehicles, but cnannot reliably distinguish between launchers and dummies.", getFile("satellite.png"), 0);
  satellite.showEffect = function(region) {
    for (idx in region.groups[COL]) {
      var unit = region.groups[COL][idx];
      unit.highlight(true);
    }
  };
  
  var aircraft = new Unit(1, SPACE_COMMAND, "Manned Aircraft", "Search from the Coast", "May fly only along the Gulf (Row E) outside Koronan airspace.  It searches the coastal grid squares with excellent reliability, and two rows inland (Rows C and D) with reduced reliablity.  Must rest at leat one turn between flights due to crew fatigue and maintenance requirements.", getFile("satellite.png"), 0);
  aircraft.showEffect = function(region) {
    for (idx in region.groups[ROW]) {
      var unit = region.groups[ROW][idx];
      unit.highlight(true);
    }
  };
  
  var avatarFile = getFile("satellite.png");
//  var avatarFile = getFile("original_avatars.png");
  unitAvatarFactory = new AvatarFactory(avatarFile, 128, num_unit_types, 1, 0, [0], 5, [], null);
  
}