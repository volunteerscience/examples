
var ROW = 0;
var COL = 1;
var CARDINAL_NEIGHBORS = 2;
var ORDINAL_NEIGHBORS = 3;
var ALT_COL = 4; // used for hex


var regions = new Array();
var regionGroup = new Array();
var REGION_WIDTH = 20;
var targetRegions = "";

function buildSquareMap(num_rows, num_cols) {
  var X_OFF = 20;
  var Y_OFF = 20;
  var R_WIDTH =  (MAP_WIDTH - 2*X_OFF)/num_cols; // border on left and right
  var R_HEIGHT = (MAP_HEIGHT- 2*Y_OFF)/num_rows; // border north an south
  log("R_WIDTH:"+R_WIDTH+" R_HEIGHT:"+R_HEIGHT);
  REGION_WIDTH = R_WIDTH;
  // build labels
  regionGroup[COL] = new Array();
  regionGroup[ROW] = new Array();
  
  for (var x = 0; x < num_cols; x++) {
    var chromeBug = paper.text(X_OFF+x*R_WIDTH+R_WIDTH/2,2+Y_OFF/2,String.fromCharCode('1'.charCodeAt(0)+x));
    try {
      if (chromeBug.node.childNodes[0].attributes[0].name == "dy") {
        chromeBug.node.childNodes[0].attributes[0].value = 0;        
      }
    } catch (err) {}
    regionGroup[COL][x] = new Array();
  }
  for (var y = 0; y < num_rows; y++) {
    var chromeBug = paper.text(X_OFF/2,Y_OFF+y*R_HEIGHT+R_HEIGHT/2,String.fromCharCode('A'.charCodeAt(0)+y));    
    // raphael has a bug in chrome such that if rendered offscreen, it adds a an extra tspan with a dy, that effectively doubles the dy: set it to zero.
    try {
      if (chromeBug.node.childNodes[0].attributes[0].name == "dy") {
        chromeBug.node.childNodes[0].attributes[0].value = 0;        
      }
    } catch (err) {}
//    paper.text(X_OFF/2,Y_OFF+y*R_HEIGHT+R_HEIGHT/2,String.fromCharCode('A'.charCodeAt(0)+y)).attr({fill: "#ff7000", "font-size" : "16px", "font-family" : "Verdana", "font-weight" : "bold"});    
    regionGroup[ROW][y] = new Array();
  }
    
  
    

  // build regions
  var id = 0;
  for (var y = 0; y < num_rows; y++) {
    for (var x = 0; x < num_cols; x++) {
      var col_name = String.fromCharCode('1'.charCodeAt(0)+x);
      var row_name = String.fromCharCode('A'.charCodeAt(0)+y);
      
      // draw a square
      var s = "M ";
      s+=(X_OFF+x*R_WIDTH)+    ","+(Y_OFF+y*R_HEIGHT)+" L ";
      s+=(X_OFF+x*R_WIDTH)+    ","+(Y_OFF+(y+1)*R_HEIGHT)+" L ";
      s+=(X_OFF+(x+1)*R_WIDTH)+","+(Y_OFF+(y+1)*R_HEIGHT)+" L ";
      s+=(X_OFF+(x+1)*R_WIDTH)+","+(Y_OFF+y*R_HEIGHT)+" L ";
      s+= "Z";
      var polygon = paper.path(s); 
      var region = new Region(
          id++, row_name+col_name,
          X_OFF+x*R_WIDTH+R_WIDTH/2, Y_OFF+y*R_HEIGHT+R_HEIGHT/2, 
          X_OFF+x*R_WIDTH, Y_OFF+y*R_HEIGHT,
          polygon
          );
      regions.push(region);
      regionGroup[COL][x].push(region);
      regionGroup[ROW][y].push(region);
      region.groups[COL] = regionGroup[COL][x];
      region.groups[ROW] = regionGroup[ROW][y];  
      region.col = x;
      region.row = y;
      
      // build the Cardinal, Ordinal neighbors
      region.groups[CARDINAL_NEIGHBORS] = new Array();
      region.groups[ORDINAL_NEIGHBORS] = new Array();
      if (y > 0) {
        var n = regions[region.id-num_cols];
        region.groups[CARDINAL_NEIGHBORS].push(n); // north
        n.groups[CARDINAL_NEIGHBORS].push(region); // south

        if (x > 0) {
          var nw = regions[region.id-num_cols-1];
          region.groups[CARDINAL_NEIGHBORS].push(nw); // north-west
          nw.groups[CARDINAL_NEIGHBORS].push(region); // south-east
        }
        
        if (x < num_cols-1) {
          var ne = regions[region.id-num_cols+1];
          region.groups[CARDINAL_NEIGHBORS].push(ne); // north-east
          ne.groups[CARDINAL_NEIGHBORS].push(region); // south-west
        }
      }
      if (x > 0) {
        var w = regions[region.id-1];
        region.groups[CARDINAL_NEIGHBORS].push(w); // west
        w.groups[CARDINAL_NEIGHBORS].push(region); // east
      }
    }
  }
  
  // original sea
//  var water = paper.rect(20,MAP_HEIGHT-20,MAP_WIDTH-40,20,0).attr({'fill':REGION_WATER_COLOR, 'stroke':REGION_WATER_COLOR});

  
  //  sea across just the regions
  var seaW = MAP_WIDTH/2-20;
  var seaH = 25;
  var water1 = paper.image(getFile("sea.jpg"),          20, MAP_HEIGHT-seaH+5, seaW, seaH);
  var water2 = paper.image(getFile("sea.jpg"), MAP_WIDTH/2, MAP_HEIGHT-seaH+5, seaW, seaH);

  // sea across the full bottom: (todo, round corners)
//  var seaW = MAP_WIDTH/2;
//  var seaH = 25;
//  var water1 = paper.image(getFile("sea.jpg"),          0, MAP_HEIGHT-seaH+5, seaW, seaH);
//  var water2 = paper.image(getFile("sea.jpg"), MAP_WIDTH/2, MAP_HEIGHT-seaH+5, seaW, seaH);

}

function assignTargets(rseed, num_targets, num_decoys) {
  targetRegions = "";
  Math.seedrandom(rseed);
  var assigned = new Array();

  for (var regionId = 0; regionId < regions.length; regionId++) {
    regions[regionId].value = VALUE_NOTHING;
  }
    
  for (var i = 0; i < num_targets; i++) {
    // pick unique regionId
    var regionId = Math.floor(Math.random()*regions.length);
    while (typeof assigned[regionId] != "undefined") {
      regionId = Math.floor(Math.random()*regions.length);
    }
    
    regions[regionId].value = VALUE_TARGET;
    if (i > 0) {
      targetRegions+=",";
    }
    targetRegions+=regionId;
    
    assigned[regionId] = true;
  }
  
  if (num_decoys > 0) {
    targetRegions+=";";
    
    for (var i = 0; i < num_decoys; i++) {
      // pick unique regionId
      var regionId = Math.floor(Math.random()*regions.length);
      while (typeof assigned[regionId] != "undefined") {
        regionId = Math.floor(Math.random()*regions.length);
      }
      
      regions[regionId].value = VALUE_DECOY;
      if (i > 0) {
        targetRegions+=",";
      }
      targetRegions+=regionId;
      
      assigned[regionId] = true;
    }
  }  
}
