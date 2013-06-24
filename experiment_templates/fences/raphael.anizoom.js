// hack to make zoom fast!
Raphael.fn.setViewBox = function(x,y,w,h,fit) { // orig is line 4753
  this._viewBox = [x, y, w, h, !!fit];
  
  var vb = x + " " + y + " " + w + " " + h;
  var aspectRatio = fit ? "meet" : "xMinYMin";

  this.canvas.setAttribute("viewBox",vb);
  this.canvas.setAttribute("preserveAspectRatio",fit);
}

// http://stackoverflow.com/questions/7736690/raphael-paper-zoom-animation
Raphael.fn.animateViewBox = function(viewX, viewY, width, height, duration, callback) {

    duration = duration || 250;
    
    //current viewBox Data from where the animation should start
    var originals = {x: this._viewBox[0], y: this._viewBox[1], width: this._viewBox[2], height: this._viewBox[3]}, 
        differences = {
                x: viewX - originals.x,
                y: viewY - originals.y,
                width: width - originals.width,
                height: height - originals.height
        },
        delay = 13,
        stepsNum = Math.ceil(duration / delay),
        stepped = {
                x: differences.x / stepsNum,
                y: differences.y / stepsNum,
                width: differences.width / stepsNum,
                height: differences.height / stepsNum
        }, i,
        canvas = this;

    /**
     * Using a lambda to protect a variable with its own scope.
     * Otherwise, the variable would be incremented inside the loop, but its
     * final value would be read at run time in the future.
     */
    function timerFn(iterator) {
            return function() {
                    canvas.setViewBox(
                            originals.x + (stepped.x * iterator),
                            originals.y + (stepped.y * iterator),
                            originals.width + (stepped.width * iterator),
                            originals.height + (stepped.height * iterator),
                            true
                    );
                    // Run the callback as soon as possible, in sync with the last step
                    if(iterator == stepsNum && callback) {
                            callback(viewX, viewY, width, height);
                    }
            }
    }

    // Schedule each animation step in to the future
    // Todo: use some nice easing
    for(i = 1; i <= stepsNum; ++i) {
            setTimeout(timerFn(i), i * delay);
    }
} 