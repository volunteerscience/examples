var deck1 = new Array();
var deck2 = new Array();
var deck3 = new Array();
var deck4 = new Array();
var results = new Array();
var resultsIndex = 0;

deck1[0] = [22,45,66,1,75,15,33];
deck1[1] = [15,27,33,44,39];
deck1[2] = [15,16,17,18,19,20,21];

deck2[0] = [23,69,34,60,75];
deck2[1] = [22,45,66,42,26,58,70];
deck2[2] = [48,14,3,4,49,70,72];
deck2[3] = [51,62,19,75,18];
deck2[4] = [75,8,60,41,68,14,51];
deck2[5] = [53,72,17,33,38,36,26];
deck2[6] = [5,31,36,16,34];
deck2[7] = [74,65,54,2,35,37,66];
deck2[8] = [62,75,19,18,51];
deck2[9] = [63,52,40,12,43];
deck2[10] = [46,58,32,3,68,23,63];
deck2[11] = [72,36,26,17,38,53,33];
deck2[12] = [58,10,27,13,73,66,12];
deck2[13] = [5,11,30,8,69];
deck2[14] = [24,66,16,75,13];
deck2[15] = [52,34,47,75,35,63,20];
deck2[16] = [23,3,68,32,63,46,58];
deck2[17] = [36,75,32,41,35];
deck2[18] = [12,43,63,52,40];
deck2[19] = [4,48,64,6,31];
deck2[20] = [51,7,28,57,66];
deck2[21] = [29,72,18,27,54,23,17];
deck2[22] = [41,51,68,60,8,14,75];
deck2[23] = [13,18,29,66,2];
deck2[24] = [51,7,57,66,28];
deck2[25] = [72,23,17,27,54,29,18];
deck2[26] = [48,70,72,4,3,49,14];
deck2[27] = [11,5,69,8,30];
deck2[28] = [75,35,36,41,32];
deck2[29] = [52,61,23,13,26,33,28];
deck2[30] = [26,22,42,70,58,45,66];
deck2[31] = [48,6,31,4,64];
deck2[32] = [23,34,75,60,69];
deck2[33] = [66,29,18,13,2];
deck2[34] = [24,75,13,66,16];
deck2[35] = [73,27,66,58,10,13,12];
deck2[36] = [34,52,75,63,35,47,20];
deck2[37] = [37,65,66,35,2,74,54];
deck2[38] = [52,28,23,26,33,13,61];
deck2[39] = [34,5,36,31,16];

deck3[0] = [18,5,54,24,70,25,38];
deck3[1] = [15,53,17,46,59];
deck3[2] = [24,57,58,9,70,2,54];
deck3[3] = [52,1,6,71,8,25,62];
deck3[4] = [74,32,36,75,65,62,15];
deck3[5] = [29,32,42,68,38,40,33];
deck3[6] = [70,48,72,56,27];
deck3[7] = [14,36,66,28,51,2,30];
deck3[8] = [71,67,62,58,7,20,11];
deck3[9] = [71,73,25,16,49];
deck3[10] = [54,9,2,70,24,58,57];
deck3[11] = [41,14,56,4,35];
deck3[12] = [9,13,43,5,36];
deck3[13] = [75,74,32,62,36,65,15];
deck3[14] = [11,23,33,18,72];
deck3[15] = [14,4,35,56,41];
deck3[16] = [54,38,70,18,25,24,5];
deck3[17] = [63,13,24,11,69,23,34];
deck3[18] = [32,33,68,42,38,29,40];
deck3[19] = [70,27,75,59,23];
deck3[20] = [8,6,25,62,52,1,71];
deck3[21] = [5,9,13,43,36];
deck3[22] = [72,18,11,33,23];
deck3[23] = [56,27,70,48,72];
deck3[24] = [37,46,50,5,55,52,54];
deck3[25] = [11,33,44,14,5];
deck3[26] = [62,7,67,11,20,58,71];
deck3[27] = [46,31,14,27,45];
deck3[28] = [50,55,5,52,46,37,54];
deck3[29] = [59,27,70,75,23];
deck3[30] = [39,75,12,59,64,36,17];
deck3[31] = [19,42,31,9,54];
deck3[32] = [27,45,14,46,31];
deck3[33] = [24,23,11,69,13,34,63];
deck3[34] = [53,46,15,59,17];
deck3[35] = [64,59,39,75,12,36,17];
deck3[36] = [73,25,16,71,49];
deck3[37] = [14,11,44,5,33];
deck3[38] = [19,42,9,54,31];
deck3[39] = [28,51,14,30,36,66,2];
deck4[0] = [9,22,3,17,4,13,50];
deck4[1] = [45,22,60,53,39];
deck4[2] = [73,17,7,2,67];
deck4[3] = [21,50,46,1,5,14,33];
deck4[4] = [74,59,23,70,58];
deck4[5] = [29,59,34,31,37];
deck4[6] = [25,72,44,39,55,17,7];
deck4[7] = [46,14,50,1,5,33,21];
deck4[8] = [54,38,24,21,67];
deck4[9] = [57,30,74,6,21,4,33];
deck4[10] = [58,74,70,23,59];
deck4[11] = [29,31,59,34,37];
deck4[12] = [73,56,71,37,16];
deck4[13] = [39,17,72,55,7,44,25];
deck4[14] = [15,39,55,64,32,49,45];
deck4[15] = [60,53,45,22,39];
deck4[16] = [33,9,24,58,63,71,1];
deck4[17] = [65,1,68,26,24,15,47];
deck4[18] = [74,58,66,75,47];
deck4[19] = [37,56,71,73,16];
deck4[20] = [20,27,46,62,3];
deck4[21] = [24,65,68,1,15,47,26];
deck4[22] = [52,22,41,2,44];
deck4[23] = [38,42,67,19,11];
deck4[24] = [64,45,39,55,49,15,32];
deck4[25] = [73,67,17,2,7];
deck4[26] = [18,27,31,53,60,13,30];
deck4[27] = [24,9,63,33,1,58,71];
deck4[28] = [50,22,13,9,4,17,3];
deck4[29] = [58,75,66,47,74];
deck4[30] = [23,15,8,20,60,25,29];
deck4[31] = [38,67,21,54,24];
deck4[32] = [30,57,4,21,6,33,74];
deck4[33] = [26,31,37,69,8,48,61];
deck4[34] = [29,20,23,25,15,60,8];
deck4[35] = [2,22,41,52,44];
deck4[36] = [42,19,11,38,67];
deck4[37] = [8,37,26,69,48,31,61];
deck4[38] = [18,30,53,13,31,27,60];
deck4[39] = [27,20,62,3,46];

var deckNames = ["Training Session","Tactical Session",/*"Strategic Session",*/"Operational Session"];
var decks = [deck1,deck2,/*deck3,*/deck4];
    
    
var deckCount = 0;
var handCount = 0;
var handSize = 0;
var startTime = 0;
var endTime = 0;
var elapsedTime = 0;
var resultString;

// 
var description = [[
  ["A","Reliable","No doubt of authenticity, trustworthiness, or competency; has a history of complete reliability"],
  ["B","Usually Reliable","Minor doubt about authenticity, trustworthiness, or competency; has a history of valid information most of the time"],
  ["C","Fairly Reliable","Doubt of authenticity, trustworthiness, or competency but has provided valid information in the past"],
  ["D","Not Usually Reliable","Significant Doubt about authenticity, trustworthiness, or competency but has provided valid information in the past"],
  ["E","Unreliable","Lacking in authenticity, trustworthiness, and competency; history of invalid information"]
],[
  ["1","Confirmed","Confirmed by other independent source; logical in itself; Consistent with other information on the subject"],
  ["2","Probably True","Not Confirmed; logical in itself; consistent with other information on the subject"],
  ["3","Possibly True","Not Confirmed; reasonably logical in itself; agrees with some other information on the subject"],
  ["4","Doubtfully True","Not Confirmed; possible but not logical; no other information on the subject"],
  ["5","Improbable","Not Confirmed; not logical in itself; contradicted by other information on the subject"]
],[
  ["Recent","",""],  
  ["Somewhat Recent","",""],  
  ["Old","",""]     
]]


function newSession(){
  handCount = 0;
  
  switch(deckCount){
    case 0:
    case 1:
    case 2:
    case 3:
      submit(deckNames[deckCount]);
      results[resultsIndex++] = deckNames[deckCount];
      document.getElementById('session').setAttribute("disabled","true");
      document.getElementById('scores').removeAttribute("disabled");
      dealHand();
      break;
    default:
      document.getElementById('session').setAttribute("disabled","true");
      document.getElementById('scores').setAttribute("disabled", "true");
      beginResults();
      break;
  }
}

function printResults(){
  resultString ="";
  for(var i = 0; i < results.length; i++)
    resultString += results[i] + "\n";
}

function beginTest(){
  submit('Demographics : '+$("#locale").val()+' "'+$("#occupation").val()+'" '+$("#age").val()+' '+$("#gender").val()+' '+$("#education").val()+' '+$("#military").val()); 
  document.getElementById('testContainer').removeAttribute("hidden");
  document.getElementById('submissionContainer').setAttribute("hidden",true);  
}

function exitTest(){
  beginResults();  
}

function editDemo(){
  document.getElementById('demographics').removeAttribute("hidden");
  document.getElementById('demoBtn').setAttribute("hidden",true);
}

function beginResults(){
  printResults();
  document.getElementById('submissionContainer').removeAttribute("hidden");
  document.getElementById('results').removeAttribute("hidden");
  document.getElementById('demographics').setAttribute("hidden",true);
  document.getElementById('testContainer').setAttribute("hidden",true);
  document.getElementById('resultsText').innerHTML =resultString;
  moveToResults ();    
}

function endSession(){

  results[resultsIndex++] = "\n";
  <!-- test code -->
  <!--beginResults();-->
  <!-- test code -->

  document.getElementById('counter').setAttribute("value","0");
  document.getElementById('session').removeAttribute("disabled");
  document.getElementById('session').setAttribute("value", "Begin " + deckNames[deckCount] );
  document.getElementById('scores').setAttribute("disabled", "true");
  document.getElementById('titleName').innerHTML = deckNames[deckCount];
  
  for (var i = 1; i <= 14; i++) {
    $('#div'+i).html("");
  }
}

function nextHand(){
  endTime = new Date();
  elapsedTime = Math.round((endTime.getTime() - startTime.getTime())/1000);
  <!-- console.log(elapsedTime); -->
  
  if (document.getElementById('div1').hasChildNodes() ||
    document.getElementById('div2').hasChildNodes() ||
    document.getElementById('div3').hasChildNodes() ||
    document.getElementById('div4').hasChildNodes() ||
    document.getElementById('div5').hasChildNodes() ||
    document.getElementById('div6').hasChildNodes() ||
    document.getElementById('div7').hasChildNodes()){
    window.alert("Please rank order all cards before proceeding.");
    }
    else{
      gatherRankedSequence();
      dealHand();
    }  
}

function resetHand(){
  handCount--;
  resultsIndex--;
  dealHand();  
}

function gatherRankedSequence(){
  var sequenceStr = "Ranked Card Set : ";
  sequenceStr += document.getElementById('div8').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div9').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div10').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div11').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div12').firstChild.getAttribute("id").substring(4) + " ";
  
  if(handSize == 7){
  sequenceStr += document.getElementById('div13').firstChild.getAttribute("id").substring(4) + " " +
                           document.getElementById('div14').firstChild.getAttribute("id").substring(4) + " ";
  }
  sequenceStr += "number of sec " + elapsedTime;
  submit(sequenceStr);
  results[resultsIndex++] = sequenceStr;
}    

function gatherOriginalSequence(){
  var sequenceStr = "Original Card Set : ";
  
  sequenceStr += document.getElementById('div1').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div2').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div3').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div4').firstChild.getAttribute("id").substring(4) + " " +
                 document.getElementById('div5').firstChild.getAttribute("id").substring(4);
  
  if(handSize == 7){
  sequenceStr += " " + document.getElementById('div6').firstChild.getAttribute("id").substring(4) + 
                 " " + document.getElementById('div7').firstChild.getAttribute("id").substring(4);
  }
  submit(sequenceStr);
  results[resultsIndex++] = sequenceStr;
}

function getCardValues(card) {
  var rel = Math.floor((card-1)/15);
  var ic = Math.floor(((card - rel*15)-1) / 3);
  var lat = (card-1) % 3;
  
  var ret = [rel, ic, lat];
  
  log("card:"+card+" ret:"+ret);
  
  return ret;
}

function getCard(card) {
//  return "<img id=\"card" + card + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + card + ".png\">";
  
  var vals = getCardValues(card);

  return '<div id="card'+card+'" draggable="true" ondragstart="drag(event)" class="card"><table>'+
          '<tr><th>Source Reliable</th><th>Information Content</th><th>Latency</th></tr><tr>'+
            '<td title="'+description[0][vals[0]][2]+'"><div class="card_val">'+description[0][vals[0]][0]+'</div><div class="card_val_desc">'+description[0][vals[0]][1]+'</div></td>'+
            '<td title="'+description[1][vals[1]][2]+'"><div class="card_val">'+description[1][vals[1]][0]+'</div><div class="card_val_desc">'+description[1][vals[1]][1]+'</div></td>'+
            '<td><div class="card_val">'+description[2][vals[2]][0]+'</div></td>'+
          '</tr></table></div>';
}

function dealHand(){

  if(handCount >= decks[deckCount].length) {
    deckCount++;          
    endSession();
  }
  else{

    var hand;
    switch(deckCount){
      case 0:
        hand = deck1[handCount];
        break;
      case 1:
        hand = deck2[handCount];
        break;
      case 2:
        hand = deck3[handCount];
        break;
      case 3:
        hand = deck4[handCount];
        break;
      default:
        break;
    }
    handSize = hand.length;
    
    for (var i = 1; i <= 7; i++) {
      if (i <= handSize) {
        $('#div'+i).html(getCard(hand[i-1]));
        
        $('#div'+i).removeAttr("hidden");
        $('#label'+i).removeAttr("hidden");
        $('#div'+(i+7)).removeAttr("hidden");
      } else {
        $('#div'+i).attr("hidden","true");
        $('#label'+i).attr("hidden","true");
        $('#div'+(i+7)).attr("hidden","true");
      }
      $('#div'+(i+7)).html("");
    }
    
    $('.card').bind('selectstart', function(){this.dragDrop(); return false;});    
    
    if(handSize == 7){
//      document.getElementById('div1').innerHTML = "<img id=\"card" + hand[0] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[0] + ".png\">";
//      document.getElementById('div2').innerHTML = "<img id=\"card" + hand[1] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[1] + ".png\">";
//      document.getElementById('div3').innerHTML = "<img id=\"card" + hand[2] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[2] + ".png\">";
//      document.getElementById('div4').innerHTML = "<img id=\"card" + hand[3] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[3] + ".png\">";
//      document.getElementById('div5').innerHTML = "<img id=\"card" + hand[4] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[4] + ".png\">";
//      document.getElementById('div6').innerHTML = "<img id=\"card" + hand[5] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[5] + ".png\">";
//      document.getElementById('div7').innerHTML = "<img id=\"card" + hand[6] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[6] + ".png\">";
//      document.getElementById('div6').removeAttribute("hidden");
//      document.getElementById('div7').removeAttribute("hidden");
      document.getElementById('label5').innerHTML = "5th Lowest";
//      document.getElementById('label6').removeAttribute("hidden");
//      document.getElementById('label7').removeAttribute("hidden");
//      document.getElementById('div8').innerHTML = "";
//      document.getElementById('div9').innerHTML = "";
//      document.getElementById('div10').innerHTML = "";
//      document.getElementById('div11').innerHTML = "";
//      document.getElementById('div12').innerHTML = "";
//      document.getElementById('div13').innerHTML = "";
//      document.getElementById('div14').innerHTML = "";
//      document.getElementById('div13').removeAttribute("hidden");
//      document.getElementById('div14').removeAttribute("hidden");
    }
    else{
//      document.getElementById('div1').innerHTML = "<img id=\"card" + hand[0] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[0] + ".png\">";
//      document.getElementById('div2').innerHTML = "<img id=\"card" + hand[1] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[1] + ".png\">";
//      document.getElementById('div3').innerHTML = "<img id=\"card" + hand[2] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[2] + ".png\">";
//      document.getElementById('div4').innerHTML = "<img id=\"card" + hand[3] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[3] + ".png\">";
//      document.getElementById('div5').innerHTML = "<img id=\"card" + hand[4] + "\" draggable=\"true\" ondragstart=\"drag(event)\" src=\"images/card" + hand[4] + ".png\">";
//      document.getElementById('div6').innerHTML = "";
//      document.getElementById('div7').innerHTML = "";
//      document.getElementById('div6').setAttribute("hidden","true");
//      document.getElementById('div7').setAttribute("hidden","true");
      document.getElementById('label5').innerHTML = "Lowest VoI";
//      document.getElementById('label6').setAttribute("hidden","true");
//      document.getElementById('label7').setAttribute("hidden","true");
//      document.getElementById('div8').innerHTML = "";
//      document.getElementById('div9').innerHTML = "";
//      document.getElementById('div10').innerHTML = "";
//      document.getElementById('div11').innerHTML = "";
//      document.getElementById('div12').innerHTML = "";
//      document.getElementById('div13').setAttribute("hidden","true");
//      document.getElementById('div14').setAttribute("hidden","true");      
    }
    gatherOriginalSequence();
    handCount++;
    document.getElementById('counter').setAttribute("value",handCount);
    startTime = new Date();
  }
}

function initialize() {
}

function allowDrop(ev) {
  if ($(ev.target).hasClass("candrop")) {  // prevent double-drop
    ev.preventDefault();
  }
}

function drag(ev) {
  ev.dataTransfer.setData("Text",ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data=ev.dataTransfer.getData("Text");
  
  if(!$(ev.target).hasClass("card")){
    ev.target.appendChild(document.getElementById(data));
  }  
}

function moveToResults (){window.location.hash="RESULTS";}
    
function help() {
  $('#helpCard').fadeIn();
}

function closeHelpCard() {
  $('#helpCard').fadeOut();  
}



       


