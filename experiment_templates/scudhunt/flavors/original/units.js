var SPACE_COMMAND = 1;

function initializeUnits() {
  num_unit_types = 1;
  num_roles = 4;
  
  for (var roleId = 1; roleId < num_roles+1; roleId++) {
    roleUnits[roleId] = new Array();
  }
  
  new Unit(0, SPACE_COMMAND, "Spy Satellite", "satellite.png", 0);
  
  var avatarFile = getFile("satellite.png");
//  var avatarFile = getFile("original_avatars.png");
  unitAvatarFactory = new AvatarFactory(avatarFile, 128, num_unit_types, 1, 0, [0], 5, [], null);
  
}