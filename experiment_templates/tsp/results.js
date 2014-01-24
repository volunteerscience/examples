function initializeVisualization() {
  $("#startDate").datetimepicker();
  $("#endDate").datetimepicker();

//  alert("bar"); 
  
//  paper = Raphael("canvas", width+cityRad*2, height+cityRad*2);
  
  $('#update').click(function(event) {
    updateSummary();
    event.preventDefault();
  });
  
  updateSummary();
}

function updateSummary() {
  amt = $( "input:radio[name=amt]:checked" ).val();
  args = {"format":"json","type":"summary","amt":amt};
  if ($('#startDate').val()) {
    args['start'] = $('#startDate').val();
  }
  if ($('#endDate').val()) {
    args['end'] = $('#endDate').val();
  }
  
  getDataHelper(function(data) {
//    $("#results").html(JSON.stringify(data));    
    tests = data["tests"];
    str = "";
    for (idx in tests) {
      test = tests[idx];
      str+='<div id="'+test['id']+'" class="testLink">Test:'+test['id']+' Date:'+test['date']+'</div><br/>';
    }
    $("#results").html(str);
    $(".testLink").click(function() {
      toggleData($(this));
    });
  }, args);  
}

function toggleData(div) {
  id = div.attr('id');
  nxt = div.next();
  if (nxt.hasClass('contents')) {
    nxt.remove();
  } else {
    addContents(id);
  }
}

function addContents(id) {
  args = {"format":"json","type":"detail","ids":id};
  getDataHelper(function(data) {
    var contents = $("#"+id).after('<div class="contents"></div>').next();
    var tests = data['tests'];
    var test = tests[0];
    var submissions = test['submissions'];
    var str="";
    var map_id = 0;
    var score = 0;
    var canvas_id = "";
    for (idx in submissions) {
      var sub = submissions[idx];
      try {        
        var val = sub['val'];
        var startup = val['startup'];
        if (startup) {
          contents.append('<div>Conditions:'+JSON.stringify(startup)+'</div><br/>');
        }
//        var best = startup['best'];
//        var modulo = startup['teamModulo'];
//        var forceBots = startup['forceBots'];
//        var forceBots = startup['botType'];
      } catch (err) {}
      
      try {        
        // not all are solutions
        var round = sub['round']-100;
        var val = sub['val'];
        var solution = val['solution'];
        map_id = solution["map"];
        var dist = solution["dist"];
        var city_order = solution["#text"];
        canvas_id = id+"_"+idx;
        score = Math.round(dist/410);
        contents.append('<div><div id="'+canvas_id+'"></div><p>'+round+': '+score+'</p></div>');
        var paper = Raphael(canvas_id, (width+cityRad*2)*tFac, (height+cityRad*2)*tFac);
        doDrawTeamMap(paper,buildMapFromIndex(map_id),city_order.split(","));
      } catch (err) {}
    }
    canvas_id = id+"_opt";
    score = Math.round(map[map_id][2][0]/410);
    contents.append('<div><div id="'+canvas_id+'"></div><p>Opt:'+score+'</p></div>');
    var paper = Raphael(canvas_id, (width+cityRad*2)*tFac, (height+cityRad*2)*tFac);
    doDrawTeamMap(paper,buildMapFromIndex(map_id),map[map_id][1]);

    
//    str = JSON.stringify(data);
  }, args); 
}

