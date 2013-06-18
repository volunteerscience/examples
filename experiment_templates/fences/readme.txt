raphael-2.1.0-mod.min.js is raphael-2.1.0, but this is removed:

4196:
-                        if (o.paper._vbSize) {
-                            value *= o.paper._vbSize;
-                        } 
https://github.com/ehouais/raphael/commit/81eb1e68e72b0c2ff0efcc3f0f21442908b59f49

This causes stroke width's to not scale upon zooming.  Then it's minimized.
http://closure-compiler.appspot.com/home

