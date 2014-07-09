var hands = []; // 0 => dealer
var total_players = 4;
var showHandValue = true; 
var chips = []; // playerNum => money
var initialChips = 100;
var betSize = [];

var DOA = true; // Double on any (false means only on 10,11)

function Card(v,s) {
  this.value = v; // 1-13
  this.suit = s; // doesn't matter
  
  this.render = function(element) {
    playing_card(element,this.value,this.suit);
  };
  
  this.playing_card_bp = function() {
    return playing_card_bp(this.value,this.suit); 
  };
  
  this.toString = function() {
    var ret = null;
    switch (this.value) {
    case 1:
      ret = "A";
      break;
    case 10:
      ret = "T";
      break;
    case 11:
      ret = "J";
      break;
    case 12:
      ret = "Q";
      break;
    case 13:
      ret = "K";
      break;
    default:
      ret = this.value.toString();
      break;
    }
    
    switch(this.suit) {
    case 0:
      ret+="c";
      break;
    case 1:
      ret+="d";
      break;
    case 2:
      ret+="h";
      break;
    case 3:
      ret+="s";
      break;    
    }
    return ret;
  };
}

function Hand(playerNum, afterHand) {
  this.handNum = hands[playerNum].length; // increments after splits etc
  hands[playerNum].push(this);
  this.playerId = playerNum;
  this.cards = [];
  this.chips = 0;
  this.complete = false; // set true when user completes their move

  // add to board
  if (playerNum == 0) {
    // dealer
    this.element = $("#hand_0_0");
  } else {
    // player
    this.element = $('<div id="hand_'+playerNum+'_'+this.handNum+'" class="hand" style="float: left;">');
    if (typeof afterHand === 'undefined') {
      $("#hands_"+playerNum).append(this.element);          
    } else {
//      $('#hand_'+playerNum+'_'+afterHand.handNum).after(this.element);                
      afterHand.element.after(this.element);                
    }
  }

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
      card = deck.nextCard();
      updateShoe();
    }

    this.cards.push(card);
  };
  
  this.render = function() {
    var s = "";
    for (var i = 0; i < this.cards.length; i++) {
      s+='<div id="h_'+this.playerId+'_'+this.hand_num+'_'+i+'" class="playing_card" style="background-position:'+this.cards[i].playing_card_bp()+'; float: left;"></div>';
    }
    if (this.playerId == 0 && this.cards.length == 1 && doneDealing) {
      s+='<div class="playing_card" style="float: left;"></div>'; // dealer's down card
    }
    
    if (showHandValue) {
      s+= '<div class="handValue">'+this.renderValue()+'</div>';      
    }
    if (this.playerId > 0) {
      // player; not-dealer
      s+= '<div class="chips">$'+this.chips+'</div>';      
    }
    
    this.element.html(s);
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
    if (this.cards.length != 2) return false;
    return this.cards[0].value == this.cards[1].value;
  };

  this.canDouble = function() {
    return this.cards.length == 2;
  };
  
  this.setComplete = function() {
    this.complete = true;    
    this.element.removeClass("activeHand");
    activateNextHand(this.playerId);
  };
  
  this.setActive = function() {
    this.element.addClass("activeHand");    
  };
}

function InfiniteDeck() {
  this.nextCard = function() {
    var val = Math.floor(Math.random()*13)+1;
    var suit = Math.floor(Math.random()*4);
    return new Card(val,suit);    
  };

  this.needShuffle = function() {
    return false;
  };
  
  this.shuffle = function() {}; // never needs shuffle
  
  this.shoeSize = function() {
    return 999;
  };
  
  this.maxShoeSize = function() {
    return this.shoeSize();
  };
}

function Decks(numDecks) { // 1 deck 2 decks etc; we don't hold them shuffled, we draw a random card each time from the sorted shoe
  this.numDecks = numDecks;
  this.remaining = [];
  this.nextCard = function() {
    var index = Math.floor(Math.random()*this.remaining.length);
    var card = this.remaining.splice(index, 1)[0]; // remove a random card
    log(index+" "+card+" "+this.remaining.length);
    return card;
  };
  
  this.needShuffle = function() {
    return this.remaining.length < 20*numDecks
  };
  
  this.shuffle = function() {
    this.remaining = [];
    for (var deck = 0; deck < this.numDecks; deck++) {
      for (var suit = 0; suit < 4; suit++) {
        for (var val = 1; val <= 13; val++) {
          this.remaining.push(new Card(val,suit));
        }
      }
    }
  };

  this.shoeSize = function() {
    return this.remaining.length;
  };

  this.maxShoeSize = function() {
    return this.numDecks * 52;
  };

  this.shuffle();
}

var H = 1; // hit
var D = 2; // double down
var S = 4; // stand
var P = 8; // surrender
var R = 16; // surrender
var BJ = 32; // blackjack
var HP = H+P; // split if can double after
var HR = H+R; // surrender if possible, else hit
  
function Strategy() {
  this.table = 
[
[], // 0 
[], // 1 -- a,0
[], // 2 -- a,a
[], // 3 -- a,2
[], // 4 -- 2,2
[[0, 0, H, H, H, H, H, H, H, H, H, H]], // 5  - 2,3
[], // 6 -- must be 3,3
[[0, 0, H, H, H, H, H, H, H, H, H, H]], // 7 
[[0, 0, H, H, H, H, H, H, H, H, H, H]], // 8 
[[0, 0, H, D, D, D, D, H, H, H, H, H]], // 9 
[[0, 0, D, D, D, D, D, D, D, D, H, H]], // 10 
[[0, 0, D, D, D, D, D, D, D, D, D, H]], // 11 
[[0, 0, H, H, S, S, S, H, H, H, H, H]], // 12 
[[0, 0, S, S, S, S, S, H, H, H, H, H]], // 13 
[[0, 0, S, S, S, S, S, H, H, H, H, H]], // 14 
[[0, 0, S, S, S, S, S, H, H, H,HR, H]], // 15 
[[0, 0, S, S, S, S, S, H, H,HR,HR,HR]], // 16 
[[0, 0, S, S, S, S, S, S, S, S, S, S]], // 17 
[[0, 0, S, S, S, S, S, S, S, S, S, S]], // 18 
[[0, 0, S, S, S, S, S, S, S, S, S, S]], // 19 
[[0, 0, S, S, S, S, S, S, S, S, S, S]], // 20
[[0, 0,BJ,BJ,BJ,BJ,BJ,BJ,BJ,BJ,BJ,BJ]], // 21
[[0, 0, H, H, H, D, D, H, H, H, H, H]], // A,2 22
[[0, 0, H, H, H, D, D, H, H, H, H, H]], // A,3 23
[[0, 0, H, H, D, D, D, H, H, H, H, H]], // A,4 24
[[0, 0, H, H, D, D, D, H, H, H, H, H]], // A,5 25
[[0, 0, H, D, D, D, D, H, H, H, H, H]], // A,6 26
[[0, 0, S, D, D, D, D, S, S, H, H, H]], // A,7 27
[[0, 0, S, S, S, S, S, S, S, S, S, S]], // A,8 28
[[0, 0, S, S, S, S, S, S, S, S, S, S]], // A,9 29
[[0, 0,HP,HP, P, P, P, P, H, H, H, H]], // 2,2 30
[[0, 0,HP,HP, P, P, P, P, H, H, H, H]], // 3,3 31
[[0, 0, H, H, H,HP,HP, H, H, H, H, H]], // 4,4 32 
[[0, 0, D, D, D, D, D, D, D, D, H, H]], // 5,5 33 
[[0, 0,HP, P, P, P, P, H, H, H, H, H]], // 6,6 34 
[[0, 0, P, P, P, P, P, P, H, H, H, H]], // 7,7 35 
[[0, 0, P, P, P, P, P, P, P, P, P, P]], // 8,8 36 
[[0, 0, P, P, P, P, P, S, P, P, S, S]], // 9,9 37 
[[0, 0, S, S, S, S, S, S, S, S, S, S]], // T,T 38 
[[0, 0, P, P, P, P, P, P, P, P, P, P]], // A,A 39 
];

  choice = function(h) {
    var dealer = hand[0][0].value;
    if (dealer > 10) {
      dealer = 10;
    }
    if (dealer == 1) {
      dealer = 11;
    }
    
    var you = h.value();
    if (you[0] == 21) {
      // blackjack returns automatic
      return BJ;
    } else if (h.canSplit()) {
      // 2,2 => 30 ... T,T => 38; A,A => 39
      if (you[0] == 1) { // A,A
        you = 39;
      } else {
        you = you[0]/2 + 28;        
      }
    } else if (you[1]) { // soft
      // 13 => 22 ... 20 => 29
      you = you[0]+9;
    } else {
      you = you[0]; // default
    } 
    
    var ret = this.table[you][dealer];    
    if (ret == D && !h.canDouble()) {
      // can't double after hitting
      return H;
    }
    
    if (ret == HP) {
      return P; // we allow double after split
    }
    
    if (ret == HR) {
      return H; // we don't allow surrender
    }
    return ret;
  }
}

function updateShoe() {
  var percent = Math.floor(100.0*deck.shoeSize()/deck.maxShoeSize());
  $("#shoe").html(percent+"%");
}


var doneDealing = true; // start false, finish true
function newRound() {
  if (deck.needShuffle()) {
    deck.shuffle();
  }

  // clear board
  for (var i = 1; i <= total_players; i++) {
    $('#hands_'+i).html("");
  }

  // create all the hand objects, place bets
  hands=[];
  for (var i = 0; i <= total_players; i++) {
    hands[i] = [];
    var h = new Hand(i);
    if (i > 0) {
      chips[i] -= betSize[i];
      h.chips = betSize[i]; 
      updateChips(i);
    }
  }
  
  // deal first round of cards
  for (var i = 1; i <= total_players; i++) {
    var h = hands[i][0];
    h.addCard();
    h.render();
  }
  
  // deal second round of cards
  for (var i = 0; i <= total_players; i++) {
    var h = hands[i][0];
    h.addCard();
    h.render();
  }
  
  activatePlayer(1);
//  activateNextHand(1);
  // TODO: animate deal
  nextPlayerDeal = 1;
}

function dealStep() {
  
}

function updateChips(playerNum) {
  $('#player_'+playerNum+'_chips').html("$"+chips[playerNum]);
}

function initializeBoard() {  
  for (var i = 1; i <= total_players; i++) {
    betSize[i] = 5;
    chips[i] = 100;
    $("#players").append(
        '<div id="player_'+i+'" class="player">Player '+i+'<br/>'+
          '<div id="hands_'+i+'"></div>'+
          '<div id="player_'+i+'_chips" class="chips">$'+chips[i]+'</div>'+
        '</div>');    
  }
  $('#hit').click(function() {
    if (activePlayer != myid) {
      alert("Wait your turn!");
      return;
    }
    hit(myid);    
  });
  
  $('#stand').click(function() {
    if (activePlayer != myid) {
      alert("Wait your turn!");
      return;
    }
    stand(myid);    
  });
  
  $('#double').click(function() {
    if (activePlayer != myid) {
      alert("Wait your turn!");
      return;
    }
    double(myid);    
  });
  
  $('#split').click(function() {
    if (activePlayer != myid) {
      alert("Wait your turn!");
      return;
    }
    split(myid);    
  });
  
  
  $('#deal').click(newRound);
}

function activateNextHand(playerId) {
  var h = getActiveHand(playerId);
  if (h == null) {
    activatePlayer(playerId+1);
  } else {
    h.setActive();
  }
}

var activePlayer = 0;
function activatePlayer(playerId) {
  // disable buttons
  if (playerId == myid) {
    $(".player_button").css('background-color','');
  } else {
    $(".player_button").css('background-color','#dddddd');
  }
  
  if (playerId > total_players) {
    completeRound();
    return;
  }
  activePlayer = playerId;  
  activateNextHand(playerId);
}

function completeRound() {
  activePlayer = 0;
}

function getActiveHand(playerId) {
  for (var i = hands[playerId].length -1; i >= 0; i--) {
    if (!hands[playerId][i].complete) {
      return hands[playerId][i];
    }
  }
  return null;
}

function hit(playerId) {
  var h = getActiveHand(playerId);
  h.addCard();
  h.render();  
}

function stand(playerId) {
  var h = getActiveHand(playerId);
  h.setComplete();
}

function double(playerId) {  
  var h = getActiveHand(playerId);
  if (chips[playerId] < h.chips) {
    alert("You're out of chips!");
    return;    
  }
  chips[playerId] -= h.chips;
  h.chips*=2;
  updateChips(playerId);
  
  h.addCard();
  h.render();
  h.setComplete();
}

function split(playerId) {
  var h = getActiveHand(playerId);  
  if (!h.canSplit()) {
    alert("You can only split a pair.");
    return;
  }
  
  if (chips[playerId] < h.chips) {
    alert("You're out of chips!");
    return;    
  }
  
  h.element.removeClass("activeHand");
  chips[playerId] -= h.chips;
  updateChips(playerId);

  var h2 = new Hand(playerId,h);
  h2.chips = h.chips;
  var card = h.cards.pop();

  h2.addCard(card);
  h.render();  
  h2.render();  
  
  h.addCard();
  h.render();  

  h2.addCard();
  h2.render(); 
  
  activateNextHand(playerId);
}


function initialize() {
  this.deck = new Decks(6);
  initializeBoard();
  newRound();
}



