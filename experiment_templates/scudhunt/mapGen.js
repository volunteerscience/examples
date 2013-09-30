
var ROW = 0;
var COL = 1;
var ALT_COL = 2;



var regions = new Array();
var regionGroup = new Array();
var REGION_WIDTH = 20;

function buildSquareMap(num_rows, num_cols) {
  var X_OFF = 20;
  var Y_OFF = 20;
  var R_WIDTH =  (MAP_WIDTH -X_OFF)/num_cols;
  var R_HEIGHT = (MAP_HEIGHT-Y_OFF)/num_rows;
  REGION_WIDTH = R_WIDTH;
  // build labels
  regionGroup[COL] = new Array();
  regionGroup[ROW] = new Array();
  
  for (var x = 0; x < num_cols; x++) {
    paper.text(X_OFF+x*R_WIDTH+R_WIDTH/2,Y_OFF/2,String.fromCharCode('1'.charCodeAt(0)+x));
    regionGroup[COL][x] = new Array();
  }
  for (var y = 0; y < num_rows; y++) {
    paper.text(X_OFF/2,Y_OFF+y*R_HEIGHT+R_HEIGHT/2,String.fromCharCode('A'.charCodeAt(0)+y));    
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
      s+=(X_OFF+x*R_WIDTH)+    ","+(Y_OFF+y*R_WIDTH)+" L ";
      s+=(X_OFF+x*R_WIDTH)+    ","+(Y_OFF+(y+1)*R_WIDTH)+" L ";
      s+=(X_OFF+(x+1)*R_WIDTH)+","+(Y_OFF+(y+1)*R_WIDTH)+" L ";
      s+=(X_OFF+(x+1)*R_WIDTH)+","+(Y_OFF+y*R_WIDTH)+" L ";
      s+= "Z";
      var polygon = paper.path(s); 
      var region = new Region(
          id++, row_name+col_name,
          X_OFF+x*R_WIDTH+R_WIDTH/2, Y_OFF+y*R_HEIGHT+R_HEIGHT/2, polygon
          );
      regions.push(region);
      regionGroup[COL][x].push(region);
      regionGroup[ROW][y].push(region);
      region.groups[COL] = regionGroup[COL][x];
      region.groups[ROW] = regionGroup[ROW][y];  
    }
  }
}

