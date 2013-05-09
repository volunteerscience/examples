The TSP solver was written by Ceyhun.  Jeff added code to generate maps random maps, 
and use the solver to test if the solutions are unique enough by looking at 
the distance of the 2nd best solution compared to the first.

How to use:
TSPMapGen produces .js code to stdout that fills in the map array.  Stored as part maps.js.  Modify the loop in main() to build the maps you want.

Needs a ton of memory:
java TSPMapGen -Xmx1024m

