function addTip(tip) {
  tips.addTip(tip);
}

function Tip(title,text,cssChanges,icon) {
  this.title = title;
  this.text = text;
  this.cssChanges = cssChanges;
  this.icon = icon;
}

/**
 * @param button_selector the selector (id) of the button
 * @param popup_selector the selector (id) of the popup_window
 * @returns
 * 
 * tip_list: list of tips
 * auto_popup: true if should popup every time a tip is added
 * auto_advance: true if should 
 */
function Tips(button_selector, popup_selector) {
  var me = this;
  tips = this;
  this.tip_list = [];
  this.button = $(button_selector);
  this.popup = $(popup_selector);
  this.auto_popup = true;
  this.auto_advance = false;
  this.auto_shake = true;

  // to shake the button
  var base_padding_left = this.button.css('padding-left');
  var base_padding_right = this.button.css('padding-right');
  var shakeAmt = 5;
  this.shake_center = {'padding-left': base_padding_left, 'padding-right': base_padding_right};
  this.shake_left1 = {'padding-left': '-='+shakeAmt+'px', 'padding-right': '+='+shakeAmt+'px'};
  this.shake_right2 = {'padding-left': '+='+(shakeAmt*2)+'px', 'padding-right': '-='+(shakeAmt*2)+'px'};
  this.shake_left2 = {'padding-left': '-='+(shakeAmt*2)+'px', 'padding-right': '+='+(shakeAmt*2)+'px'};
  
  this.showing = false;
  this.index = 0;
  
  this.addTip = function(tip) {
    this.tip_list.push(tip);    
    if (me.showing) {
      if (this.tip_list.length == 1) {
        me.setTip(0); // first tip if already popped up
      } else {
        $("#tips_index").html("Tip #"+(me.index+1)+" of "+this.tip_list.length);        
        $("#tips_next").addClass("tips_nav_active");
      }
    } else {
      me.setTip(this.tip_list.length-1);
      me.changeRed();
      if (me.auto_shake) {
        me.startShake();
      }
    }
  };
  
  this.hide = function() {
    if (!me.showing) return;
    me.showing = false;
    var buttonOff = me.button.position();
    var newCss = {
        "left":buttonOff.left+me.button.outerWidth(true)-me.button.outerWidth(false), // last 2 account for margin
        "top":buttonOff.top+me.button.outerHeight(true)-me.button.outerHeight(false), // last 2 account for margin
        "width":(me.button.outerWidth(false)-(me.popup.outerWidth()-me.popup.width()))+"px", // last 2 account for border
        "height":(me.button.outerHeight(false)-(me.popup.outerHeight()-me.popup.height()))+"px", // last 2 account for border
        "opacity":0.5
        };
    $("#tips_wrapper").hide();
    me.popup.animate(newCss,{"complete":function() {me.popup.fadeOut();}});
  };
  
  this.show = function() {
    if (me.showing) return;
    me.showing = true;
    me.stopShake();
    var newCss = {
        "top":"",
        "left":"",
        "width":"",
        "height":"",
        "opacity":1.0
        };
    me.popup.css(newCss);
    $("#tips_wrapper").show();
    me.popup.fadeIn();
    me.changeGreen();
  };
  
  this.setTip = function(index) {
    if (me.tip_list.length == 0) {
      return;
    }
    if (index >= me.tip_list.length-1) {
      index = me.tip_list.length-1;
      $("#tips_next").removeClass("tips_nav_active");
    } else {
      $("#tips_next").addClass("tips_nav_active");
    }
    if (index <= 0) {
      $("#tips_prev").removeClass("tips_nav_active");
      index = 0;
    } else {
      $("#tips_prev").addClass("tips_nav_active");
    }
    
    me.index = index;
    var t = me.tip_list[me.index];
    $("#tip_title").html(t.title);
    $("#tip_text").html(t.text);
    $("#tips_index").html("Tip #"+(me.index+1)+" of "+this.tip_list.length);

  };
  
  
  this.changeRed = function() {
    me.button.switchClass("btn-success","btn-danger");
  }
  
  this.changeGreen = function () {
//    me.button.switchClass("btn-danger","btn-success");    
    me.button.addClass("btn-success");    
    me.button.removeClass("btn-danger");    
  }
  
  this.shake = function() {
    me.changeRed();
    me.button.animate(me.shake_left1, {"queue":true, "duration":100});
    me.button.animate(me.shake_right2, {"queue":true, "duration":200});
    me.button.animate(me.shake_left2, {"queue":true, "duration":200});
    me.button.animate(me.shake_right2, {"queue":true, "duration":200});
    me.button.animate(me.shake_center, {"queue":true, "duration":100});
  };

  this.shakeTimer = null;
  this.startShake = function() {
    if (me.shakeTimer) return;
    me.shake();
    me.shakeTimer = setInterval(me.shake, 3000);
  };
  
  this.stopShake = function() {
    if (me.shakeTimer) {
      clearInterval(me.shakeTimer);
      me.shakeTimer = null;
      me.button.stop(true);
      me.button.css(me.shake_center);
    }
  }
  
  log("here");
  this.button.click(this.show);
  $('#tips_close').click(this.hide);
  $('#tips_prev').click(function() { me.setTip(me.index-1);} );
  $('#tips_next').click(function() { me.setTip(me.index+1);} );
};

var tips = null;
$(function() {
  tips = new Tips("#tips_button", "#tips_popup");
  testTips();
});


var tCounter = 2;
function testTips() {
  setTimeout(function() {
    addTip(new Tip("Test 1","This is my first tip."));    
  },3000);
  
  setInterval(function() {
    addTip(new Tip("Test "+tCounter,"This is my test tip "+tCounter));
    tCounter++;
  },10000);
}

// undo animation:
// css("background-color", "") 
// removeAttr( 'style' );