var hands = []; // 0 => dealer
var total_players = 4;

function Card(v,s) {
  this.value = v; // 1-13
  this.suit = s; // doesn't matter
  
  this.render = function(element) {
    playing_card(element,this.value,this.suit);
  }
  
  this.playing_card_bp = function() {
    return playing_card_bp(this.value,this.suit); 
  }
}

function Hand(playerId) {
  this.handNum = 0; // increments after splits etc
  this.playerId = playerId;
  this.cards = [];
  
  this.value = function() {
    var aces = 0;
    var sum = 0;
    for (var idx in this.cards) {
      var c = this.cards[idx];
      if (c.value == 1) {
        sum += 11;
        aces++;
      } else if (c.value > 10) {
        sum += 10;
      } else {
        sum += c.value;
      }
    }
    
    while (sum > 21 && aces > 0) {
      sum-=10;
      aces--;
    }
    return [sum,aces>0]; // value, soft?
  };
  
  this.addCard = function(card) {
    if (typeof card === 'undefined') {
      card = randCard();
    }

    this.cards.push(card);
  };
  
  this.render = function(element) {
    var s = "";
    for (var i = 0; i < this.cards.length; i++) {
      s+='<div id="h_'+this.playerId+'_'+this.hand_num+'_'+i+'" class="playing_card" style="background-position:'+this.cards[i].playing_card_bp()+'; float: left;"></div>';
    }
    if (this.playerId == 0 && this.cards.length == 1 && doneDealing) {
      s+='<div class="playing_card" style="float: left;"></div>'; // dealer's down card
    }
    
    s+= '<div class="handValue">'+this.renderValue()+'</div>';
    
    if (typeof element === 'undefined') {
      element = $("#hand_"+this.playerId+"_"+this.handNum);
    } else {
      if (typeof(element) == "string") {
        element = $("#"+element);
      }
    }
    element.html(s);
  };
  
  this.renderValue = function(val) {
    if (typeof val === 'undefined') {
      val = this.value();
    }
    
    if (val[0] == 21) {
      return "Blackjack!";
    }
    
    if (val[0] > 21) {
      return "Bust";
    }
    
    var s = "";
    if (val[1] == true) {
      s+="Soft ";
    }
    s+=val[0];
    return s;
  };
  
  this.canSplit = function() {
    return false;
  }
}

function randCard() {
  var val = Math.floor(Math.random()*13)+1;
  var suit = Math.floor(Math.random()*4);
  return new Card(val,suit);
}

var doneDealing = true; // start false, finish true
function newRound() {
  hands=[];
  for (var i = 0; i <= total_players; i++) {
    var h = new Hand(i);
    h.addCard();
    if (i > 0) {
      h.addCard();          
    }
    hands.push(h);
    h.render();
  }
  
  // TODO: animate deal
  nextPlayerDeal = 1;
  
}

function dealStep() {
  
}

function initializeBoard() {
  for (var i = 1; i <= total_players; i++) {
    $("#players").append('<div id="player_'+i+'" class="player">Player '+i+'<br/><div id="hand_'+i+'_0" class="hand" style="float: left;"></div></div>');    
  }
  $('#hit').click(function() {
    hit(myid);    
  });
  
  $('#deal').click(newRound);
}

function hit(playerId) {
  var h = hands[playerId];
  h.addCard();
  h.render();  
}

function initialize() {
  initializeBoard();
  newRound();
}



