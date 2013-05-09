/* 
 * Ceyhun Karbeyaz
 * 11/17/2012
 * Implemented by making use of http://www.youtube.com/watch?v=aQB_Y9D5pdw
 */

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Random;


public class TSPMapGen {
	
	ArrayList<ArrayList<Integer>> combinations;
	
	//O(n*2^n)
	public int[] calcTSP(int[][] C)
	{	
	  int n = C.length;
		int[][] G = new int[n][((int)1<<n)-1]; // Integer.toBinaryString((int)Math.pow(2.0, (double)n)-1) = 1111 for n = 4
		int[] optimalPath = new int[n+1];
		
		optimalPath[0]=1;
		optimalPath[n]=1;
		
		//|S|=0
		for(int i=1; i<n; i++)
			G[i][0]=C[i][0];
		
		//|S|=1
		for(int i=1; i<n; i++)
		{
			for(int j=1; j<n; j++)
			{
				if(i==j)
					continue;
				String tmp=Integer.toBinaryString((int)1<<j);
				for(int z=tmp.length(); z<n; z++)
					tmp="0"+tmp;
				int value = Integer.parseInt(tmp, 2);
				G[i][value]=C[i][j]+G[j][0];
			}
		}
		
		//|S|=2 and beyond
		for(int i=2; i<=n-1; i++)
		{
			this.combinations = new ArrayList<ArrayList<Integer>>();
			ArrayList<Integer> sortedInts = new ArrayList<Integer>();
			for(int j=1; j<n; j++)
				sortedInts.add(j);
			subsets(sortedInts, n-1, i);

			for(int j=1; j<n; j++)
			{
				for(int k=0; k<this.combinations.size(); k++)
				{
					if(!this.combinations.get(k).contains(j) || i==n-1)
					{
						int min=Integer.MAX_VALUE;
						int secondArg=0;
						for(int m=0; m<this.combinations.get(k).size(); m++)
						{
							secondArg+=1<<this.combinations.get(k).get(m);
							int secondArg2=0;
							for(int t=0; t<this.combinations.get(k).size(); t++)
							{
								if(this.combinations.get(k).get(m)!=this.combinations.get(k).get(t))
									secondArg2+=1<<this.combinations.get(k).get(t);
							}
							String tmp=Integer.toBinaryString(secondArg2);
							for(int z=tmp.length(); z<n; z++)
								tmp="0"+tmp;
							if(i==n-1)
							{
								if(C[0][this.combinations.get(k).get(m)]+G[this.combinations.get(k).get(m)][Integer.parseInt(tmp, 2)]<min)
								{
									min=C[0][this.combinations.get(k).get(m)]+G[this.combinations.get(k).get(m)][Integer.parseInt(tmp, 2)];	
									optimalPath[n-i]=this.combinations.get(k).get(m)+1;
								}
							}
							else
							{
								if(C[j][this.combinations.get(k).get(m)]+G[this.combinations.get(k).get(m)][Integer.parseInt(tmp, 2)]<min)
									min=C[j][this.combinations.get(k).get(m)]+G[this.combinations.get(k).get(m)][Integer.parseInt(tmp, 2)];
							}
						}
						String tmp=Integer.toBinaryString(secondArg);
						for(int z=tmp.length(); z<n; z++)
							tmp="0"+tmp;
						if(i==n-1)
							G[0][Integer.parseInt(tmp, 2)]=min;
						else
							G[j][Integer.parseInt(tmp, 2)]=min;
					}
				}
			}
		}
		
		for(int y=2; y<=n-1; y++)
		{
			int secondArg=0;
			for(int i=2; i<=n; i++)
			{
				boolean fnd=false;
				for(int f=0; f<y; f++)
					if(i==optimalPath[f])
						fnd=true;
				if(!fnd)
					secondArg+=1<<(i-1);
			}
			String tmp=Integer.toBinaryString(secondArg);
			for(int z=tmp.length(); z<n; z++)
				tmp="0"+tmp;
			int minVal=Integer.MAX_VALUE;
			int minIndex=-1;
			for(int i=n; i>0; i--)
			{
				String newtmp=tmp;
				if(newtmp.charAt(i-1)=='1')
				{
					char[] c = newtmp.toCharArray();
					c[i-1]='0';
					String newstr = new String(c);
					if(C[optimalPath[y-1]-1][n-i]+G[n-i][Integer.parseInt(newstr, 2)]<minVal)
					{
						minVal=C[optimalPath[y-1]-1][n-i]+G[n-i][Integer.parseInt(newstr, 2)];
						minIndex=n-i+1;
					}
				}
			}
			optimalPath[y]=minIndex;
		}
		
//		for(int i=0; i<G.length; i++)
//		{
//			for(int j=0; j<G[i].length; j++)
//				System.out.print(G[i][j]+"\t");
//			System.out.println();
//		}
		
//		System.out.print("Found Optimal Cost: "+G[0][G[0].length-1]+"\nPath: ");
		
		optimalPath[optimalPath.length-1] = G[0][G[0].length-1];
    System.out.print("[");
		for(int i=0; i<optimalPath.length-1; i++) {
			System.out.print(optimalPath[i]-1);
		  if (i < (optimalPath.length-2)) {
		    System.out.print(",");
		  }
		}
		System.out.print("],");

    System.out.print("["+G[0][G[0].length-1]+"]");

		return optimalPath;
	}
	
	public void subsets(ArrayList<Integer> sortedInts, int n, int subsetsize) 
	{
		long combinations = 1 << n;
		for (int setNumber=0; setNumber<combinations; setNumber++) 
		{
			ArrayList<Integer> aResult = new ArrayList<Integer>();
			for (int digit=0; digit<n; digit++) 
				if ((setNumber & (1<<digit)) > 0) 
					aResult.add(sortedInts.get(digit));
			if(aResult.size()==subsetsize)
				this.combinations.add(aResult);
		}
	}

	static class City {
	  int x;
	  int y;
	  
	  public String toString() {
	    return "["+x+","+y+"]";
	  }
	}
	
	/**
	 * Cities are in a random integer location on a cartesian plane of width*height
	 * Scale multiplies the distance between the cities before rounding
	 * minDist is the closest 2 cities can be from each other
	 * 
	 * solution uniqueness is guaranteed by making sure the distance between every 2 cities is unique
	 */
	static int width = 570;
  static int height = 460;
  static int scale = 100;
  static int minDist = 20*scale;
	public static int[][] buildRandomMap(long seed, int numCities) {
    Random random = new Random(seed);
    HashSet<Integer> distances = new HashSet<Integer>();
    
	  ArrayList<City> cities = new ArrayList<City>(numCities);
	  
	  for (int i = 0; i < numCities; i++) {
	    City city = new City();
  	  city.x = random.nextInt(width);
      city.y = random.nextInt(height);
      cities.add(city);
	  }
	  
	  int[][] ret = new int[numCities][numCities];
    for (int i = 0; i < numCities; i++) {
      for (int j = i; j < numCities; j++) {
        City a = cities.get(i);
        City b = cities.get(j);
        int dist;
        if (a == b) {
          dist = 0;
        } else {
          double dx = a.x-b.x;
          double dy = a.y-b.y;
          dist = (int)(scale*Math.sqrt(dx*dx+dy*dy));
          if (dist < minDist) {
//            System.err.println("cities too close");
            return buildRandomMap(random.nextLong(), numCities);
          }
          if (distances.contains(dist)) {
//            System.err.println("dist already used");
            return buildRandomMap(random.nextLong(), numCities);
          }
          distances.add(dist);
        }
//        System.out.println(dx+" "+dy+" "+dist);
        ret[i][j] = dist;
        ret[j][i] = dist;
      }
    }
    
    
    System.out.print("[");
    for (int i = 0; i < numCities; i++) {
      System.out.print(cities.get(i));
      if (i < (numCities-1)) {
        System.out.print(",");
      }
    }
    System.out.print("],");
    return ret;
	}
	
	public static void printC(int[][] C) {
	  System.out.print("{");
	  for (int i = 0; i < C.length; i++) {
      System.out.print("{");
	    for (int j = 0; j < C[i].length; j++) {
	      System.out.print(C[i][j]);
	      if (j < C[i].length-1) {
	        System.out.print(",");
	      }
	    }
      System.out.print("}");
      if (i < C.length-1) {
        System.out.print(",");
      }
	  }
    System.out.print("}");

	  
	}
	
	public static void main(String[] args) {
//		TSPDynamic t = new TSPDynamic();
		
		//int[][] C = {{0, 20, 6}, {5, 0, 20}, {19, 17, 0}};
		//int[][] C = {{0, 20, 7}, {18, 0, 16}, {14, 26, 0}};
		//int[][] C = {{0, 10, 15, 20}, {5, 0, 9, 10}, {6, 13, 0, 12}, {8, 8, 9, 0}};
		//int[][] C = {{0, 7, 19, 12}, {26, 0, 10, 8}, {6, 8, 0, 26}, {7, 25, 5, 0}};
		//int[][] C = {{0, 8, 6, 6}, {16, 0, 13, 5}, {15, 3, 0, 6}, {14, 10, 24, 0}};
		//int[][] C = {{0, 26, 18, 4, 17}, {4, 0, 20, 16, 7}, {23, 3, 0, 2, 20}, {9, 16, 14, 0, 26}, {15, 6, 2, 22, 0}}; //39
		//int[][] C = {{0, 7, 24, 23, 25}, {25, 0, 10, 5, 26}, {6, 25, 0, 10, 14}, {16, 13, 13, 0, 14}, {21, 19, 6, 15, 0}}; //38
		//int[][] C = {{0, 13, 24, 19, 15, 2}, {14, 0, 25, 12, 5, 18}, {26, 3, 0, 18, 6, 26}, {17, 13, 16, 0, 24, 15}, {11, 5, 15, 2, 0, 7}, {2, 23, 24, 24, 6, 0}}; //43
		//int[][] C = {{0, 2, 11, 6, 5, 20, 3}, {13, 0, 5, 2, 22, 11, 5}, {23, 22, 0, 3, 11, 25, 22}, {18, 2, 17, 0, 17, 10, 14}, {12, 26, 23, 7, 0, 23, 14}, {23, 23, 5, 16, 3, 0, 11}, {11, 7, 3, 11, 15, 2, 0}};
//		int[][] C = {{15, 3, 11, 26, 4, 4, 16, 9, 24}, {22, 11, 13, 14, 2, 10, 21, 4, 5}, {20, 25, 15, 10, 17, 21, 7, 15, 21}, {12, 20, 8, 21, 9, 19, 21, 10, 7}, {25, 8, 20, 21, 10, 26, 17, 3, 6}, {10, 4, 21, 2, 20, 11, 19, 3, 4}, {20, 26, 7, 16, 26, 21, 17, 15, 9}, {8, 20, 7, 4, 10, 2, 5, 22, 25}, {13, 12, 21, 12, 26, 3, 24, 11, 15}}; //48
//    int[][] C = {{15, 3,  11, 26, 4,  4,  16, 9,  24}, 
//                 {22, 11, 13, 14, 2,  10, 21, 4,  5}, 
//                 {20, 25, 15, 10, 17, 21, 7,  15, 21}, 
//                 {12, 20, 8,  21, 9,  19, 21, 10, 7}, 
//                 {25, 8,  20, 21, 10, 26, 17, 3,  6}, 
//                 {10, 4,  21, 2,  20, 11, 19, 3,  4}, 
//                 {20, 26, 7,  16, 26, 21, 17, 15, 9}, 
//                 {8,  20, 7,  4,  10, 2,  5,  22, 25}, 
//                 {13, 12, 21, 12, 26, 3,  24, 11, 15}}; //48
		
		
//		int[][] C = {{0,359,1972,2362,3853},{359,0,2322,2662,3717},{1972,2322,0,1848,5316},{2362,2662,1848,0,4130},{3853,3717,5316,4130,0}};
//    t.calcTSP(C);
//		
//    if (true) return;
    
    long startTime = System.currentTimeMillis();
    
    System.out.println("var map = new Array();");
		for (int i = 0; i < 100; i++) {
		  int numCities = 5; // the first few are only 5 long for practice
		  if (i >= 5) {
		    numCities = 14+i/15;  // add a few more cities for the later ones
		    
		    if (numCities < 15) numCities = 15;
		  }
//		  System.out.println(i+" "+numCities);
		  numCities = 15;
		  
		  System.out.print("map["+i+"] = [");
  		int[][] C = buildRandomMap(i,numCities);
      TSPMapGen t = new TSPMapGen();
  		t.calcTSP(C);
  		
//      TSPDynamic t2 = new TSPDynamic();
//      t2.calcTSP(C, C.length);
  		
      System.out.println("];");
//      printC(C);
//      System.out.println();
      
		}
//    System.out.println(System.currentTimeMillis()-startTime);
	}

}
