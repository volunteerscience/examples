/**
 * Add something like this to the html:
  <div id="tips_button" class="btn-success btn-small" style="margin-left: 100px; margin-top: 7px; float:left; display: none;">Help</div>

  <div id="tips_popup" style="display:none;">
    <div id="tips_wrapper">
      <div id="tips_index" class="tips_top">Tip</div>
      <div id="tip_title" class="tips_top">No Tips Yet</div>
      <div id="tips_close" class="tips_nav">X</div>
      <div id="tip_image"></div>
      <div id="tip_text"></div>
      <div id="tips_bottom">
        <span id="tips_prev" class="tips_nav">Previous Tip</span>
        <p id="tips_nav_bar"></p>
        <span id="tips_next" class="tips_nav">Next Tip</span>
      </div>
    </div>
  </div>

 * 
 * 
 * cssChanges highlights the selected elements when the tip is showing, it has many options:
 * 
 * 1) string(selector) -- will apply the class "tips_blink" to the listed selector
 * 2) array of selector -- will apply the class "tips_blank" to all selectors
 * 3) map: string(selector) -> string(class) will apply each class to each selector
 * 4) map: string(selector) -> map{ string(css) -> string(css_attr) will apply each css_attr to each css in each selector
 * 5) function(active) -- will call with true when activated and false when deactivated
 * 
 * @param title
 * @param text
 * @param cssChanges
 * @param icon
 * @param uid
 */

var animate_tip_hide = false;

function addTip(title, text, cssChanges, icon, uid, okButton) {
  if (arguments.length == 1) {
    return tips.addTip(arguments[0]);
  }

  return tips.addTip(new Tip(title, text, cssChanges, icon, uid, okButton));
}

function addUniqueTip(uid, title, text, cssChanges, icon, okButton) {
  return addTip(title, text, cssChanges, icon, uid, okButton);
}

function addTipPopup(uid, title, text, cssChanges, icon) {
  tips.setTip(addUniqueTip(uid, title, text, cssChanges, icon));
  tips.show();
}

function delayAddTip(delay, uid, title, text, cssChanges, icon, okButton) {
  var timeout = setTimeout(function() {
    addTip(title, text, cssChanges, icon, uid, okButton);    
  }, delay);
  
  // return cancellable
  return function() {
    clearTimeout(timeout);
  };
}

var tip_default_required = true;

//var defaultAttrs = {"border":"2px dashed #FF0000"};
//var defaultAttrs = {"animation":"blink .5s step-end infinite alternate"};
var defaultAttrs = "tips_blink";
function Tip(title,text,cssChanges,icon,uid,okButton) {
  var me = this;
  this.title = title;
  this.text = text;
  this.cssChanges = cssChanges;
  this.icon = icon;
  this.viewed = false;
  this.required = tip_default_required;
  this.completed = false;
  this.okButton = false;
  if (okButton != null) {
    this.okButton = okButton;
  }
  
  if (uid) {
    this.uid = uid;    
  } else {
    this.uid = -1;
  }
  
//  alert(typeof (me.cssChanges));
  if (typeof me.cssChanges == "string") {
    me.cssChanges = [ me.cssChanges];
  } 
  
  if (me.cssChanges instanceof Array) {
    var newCssChanges = {}; 
    for (var idx in me.cssChanges) {
      newCssChanges[me.cssChanges[idx]] = defaultAttrs;
    }
    me.cssChanges = newCssChanges;
  }

  
  this.activate = function() {
    me.viewed = true;
    try {
      
      if (me.cssChanges) {
        if (typeof me.cssChanges == "function") {
          me.cssChanges(true);
        } else {        
          for (var selector in me.cssChanges) {
            var jqSelector = $(selector);
            var attrs = me.cssChanges[selector];
            if (typeof attrs == "string") {
              jqSelector.addClass(attrs);
            } else {
              for (var attr in attrs) {
                var val = attrs[attr];
                jqSelector.css(attr,val);
              }
            }
          }
        }
      }
      
    } catch (err) { 
      //alert(err); 
    }
  }
  
  this.deactivate = function() {
    try {

      if (me.cssChanges) {
        if (typeof me.cssChanges == "function") {
          me.cssChanges(false);
        } else {        
          for (var selector in me.cssChanges) {
            var jqSelector = $(selector);
            var attrs = me.cssChanges[selector];
            if (typeof attrs == "string") {
              jqSelector.removeClass(attrs);
            } else {
              for (var attr in attrs) {
                jqSelector.css(attr,"");
              }
            }
          }
        }
      }
      
    } catch (err) { 
      //alert(err); 
    }
  }
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
  this.navBar = $("#tips_nav_bar");
  this.auto_popup = true;
  this.auto_advance = false;
  this.disabled = false;

  // to shake the button
  this.auto_shake = false;
  var base_padding_left = this.button.css('padding-left');
  var base_padding_right = this.button.css('padding-right');
  var shakeAmt = 5;
  this.shake_center = {'padding-left': base_padding_left, 'padding-right': base_padding_right};
  this.shake_left1 = {'padding-left': '-='+shakeAmt+'px', 'padding-right': '+='+shakeAmt+'px'};
  this.shake_right2 = {'padding-left': '+='+(shakeAmt*2)+'px', 'padding-right': '-='+(shakeAmt*2)+'px'};
  this.shake_left2 = {'padding-left': '-='+(shakeAmt*2)+'px', 'padding-right': '+='+(shakeAmt*2)+'px'};
  
  this.showing = false;
  this.index = 0;
  this.alwaysPopUp = false;
  
  this.addTip = function(tip) {
    if (me.disabled) return;
    // toss out duplicates
    if (tip.uid > 0) {
      for (var idx in me.tip_list) {
        var t = me.tip_list[idx];
        if (t.uid > 0) {
          if (t.uid == tip.uid) return t.index;
        }
      }
    }
    
    tip.index = this.tip_list.length;
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
    me.updateNav();
    if (tips.alwaysPopUp) {
      tips.show();
    }
    return tip.index;
  };
  
  this.hide = function() {
    if (!me.showing) return;
    me.showing = false;
    var buttonOff = me.button.position();
    var newCss = {
        "left":buttonOff.left+me.button.outerWidth(true)-me.button.outerWidth(false), // last 2 account for margin
        "top":buttonOff.top+me.button.outerHeight(true)-me.button.outerHeight(false), // last 2 account for margin
//        "width":(me.button.outerWidth(false)-(me.popup.outerWidth()-me.popup.width()))+"px", // last 2 account for border
//        "height":(me.button.outerHeight(false)-(me.popup.outerHeight()-me.popup.height()))+"px", // last 2 account for border
        "width":(me.button.outerWidth(false))+"px", // last 2 account for border
        "height":(me.button.outerHeight(false))+"px", // last 2 account for border
        "opacity":0.5
        };
    $("#tips_wrapper").hide();
    if (animate_tip_hide) {
      me.popup.animate(newCss,{"complete":function() {me.popup.fadeOut();}});      
    } else {
      me.popup.hide();      
    }
    if (me.tip_list.length > 0) {
      var t = me.tip_list[me.index];
      if (animate_tip_hide) {
        setTimeout(t.deactivate,2000)
      } else {
        log("deactivate");
        t.deactivate();
      }
    }    
    
    // set to the last unviewed tip
    for (var idx in me.tip_list) {
      var t = me.tip_list[idx];
      if (!t.viewed) {
        log("setting unviewed tip:"+t.index);
        me.setTip(t.index);
      }
    }
    me.changeGreen();
  };
  
  this.show = function() {
    if (me.disabled) return;

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
    if (me.tip_list.length > 0) {
      var t = me.tip_list[me.index];
      t.activate();
    }
    me.popup.fadeIn();
    me.changeGreen();
    me.updateNav();
  };
  
  this.setTip = function(index) {
    index = parseInt(index); // force an int
    
    if (me.tip_list.length == 0) {
      return;
    }
    
    if (index != me.index) {
      me.tip_list[me.index].deactivate();
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
    
    if (t.okButton) {
      $("#tip_ok").show();
    } else {
      $("#tip_ok").hide();      
    }
    $("#tip_title").html(t.title);
    $("#tip_text").html(t.text);
    $("#tips_index").html("Tip #"+(me.index+1)+" of "+this.tip_list.length);
    if (t.icon) {
      $("#tip_image").html('<img src="'+t.icon+'"/>');    
    } else {
      $("#tip_image").html('');
    }
    
    if (me.showing) {
      t.activate();
      me.updateNav();
    }
  };
  
  
  this.changeRed = function() {
    me.button.switchClass("btn-success","btn-warning");
  };
  
  this.changeGreen = function () {
//    me.button.switchClass("btn-warning","btn-success");    
    me.button.addClass("btn-success");    
    me.button.removeClass("btn-warning");    
  };
  
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
  };

  this.navItemClicked = function() {
    var idx = parseInt($(this).attr('idx'));
    me.setTip(idx);
  };
  
  this.updateNav = function() {
    var s = "";
    var numUnviewed = 0;
    for (var idx in me.tip_list) {
      var t = me.tip_list[idx];
      var d_idx = parseInt(idx)+1;
      if (idx == me.index) {
        s+='<span idx="'+idx+'" class="tip_nav_item tip_nav_current"> '+d_idx+' </span>';
        if (!me.showing && !t.viewed) {
          numUnviewed++;          
        }
      } else {
        if (t.viewed) {
          s+='<span idx="'+idx+'" class="tip_nav_item"> '+d_idx+' </span>';          
        } else {
          s+='<span idx="'+idx+'" class="tip_nav_item tip_nav_unviewed"> '+d_idx+' </span>';          
          numUnviewed++;
        }
      }
    }
    me.navBar.html(s);
    $(".tip_nav_item").click(me.navItemClicked);
  
    if (numUnviewed == 0) {
      me.button.html('Help');
      me.button.attr('title','Help');      
    } else {
      me.button.html('Help <span id="tips_button_unviewed">'+numUnviewed+'</span>');
      me.button.attr('title','Help: '+numUnviewed+' not yet viewed');
    }
  };

  this.button.click(function() {
    if (me.showing) {
//      me.hide();
      me.setTip(me.index+1);
    } else {
      me.show();      
    }
  });
  $('#tips_close').click(this.hide);
  $('#tips_prev').click(function() { me.setTip(me.index-1);} );
  $('#tips_next').click(function() { me.setTip(me.index+1);} );
  $('#tip_ok').click(function() { me.tipOk(); } );

  this.tipOk = function() {
    me.completeTip(me.index);
  }
  
  this.completeTip = function(index) {
    me.tip_list[index].completed = true;
    for (var idx in me.tip_list) {
      if (!me.tip_list[idx].completed) {
        me.setTip(idx);
        return;
      }
    }
    me.hide();
  }

  this.getTipByUid = function(uid) {
    for (var tidx in me.tip_list) {
      if (me.tip_list[tidx].uid == uid) {
        return me.tip_list[tidx];
      }
    }
    return null;
  }
  
  this.lastTip = function() {
    return me.tip_list[me.tip_list.length-1];
  }
};


var tips = null;
$(function() {
  tips = new Tips("#tips_button", "#tips_popup");
//  testTips();
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