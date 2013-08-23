
var timers = new Object();

function setTimer(id,seconds) {
    
}

/**
 * Call this routinely
 */
function advanceTimers() {
  for (t in timers) {
    updateTimer(timers[t]);
  }
}



