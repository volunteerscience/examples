function initialize() {
  $("#write").click(writeUHT); 
  $("#read").click(readUHT); 
  $("#list").click(listUHT); 
}

function writeUHT() {
  var namespace = $("#namespace").val();
  if (namespace.length == 0) {
    namespace = null;
  }
  
  writeUserHT($("#key").val(), $("#value").val(), namespace);
}

function readUHT() {
  var namespace = $("#namespace").val();
  if (namespace.length == 0) {
    namespace = null;
  }
  
  var tid = $("#tid").val();
  if (tid.length == 0) {
    tid = null;
  }
  
  
  readUserHT(function(ret) {
	  $("#logg").append("<div>"+JSON.stringify(ret)+"</div>");
  }, $("#key").val(), namespace, tid);
}

function listUHT() {
  var key = $("#key").val();
  if (key.length == 0) {
    key = null;
  }
  
  var namespace = $("#namespace").val();
  if (namespace.length == 0) {
    namespace = null;
  }
  
  var tid = $("#tid").val();
  if (tid.length == 0) {
    tid = null;
  }
  
  
  fetchUserHT(function(ret) {
	  $("#logg").append("<div>"+JSON.stringify(ret)+"</div>");
  }, key, namespace, tid);
}

