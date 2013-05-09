/*
 * Graph.java
 *
 * Version:
 *     $Id$
 *
 * Revisions:
 *     $Log$
 */
import java.util.Random;
import java.util.Scanner;
import java.io.File;
import java.io.PrintStream;
import java.io.FileOutputStream;
import java.text.DecimalFormat;
/**
 * This is the graph glass for the traveling salesman problem
 *
 * @author   Robert Clark
 * @author   Danny Iland
 */
public class Graph {
	private long weights[][];
	private int graphSize;

	Graph() {
		graphSize = 0;
		weights = null;
	}

	Graph(int size) {
		graphSize = size;
		weights = new long[size][size];
	}
	
	/**
	 * This simply generates a randomized graph
	 * for testability, this will probably need
	 * to accept a seed at some point
	 **/
	public void randomize(int max) {
            Random rng = new Random();
            for(int x = 0; x < graphSize; x++) {
                for(int y = x; y < graphSize; y++) {
                    if(x == y) {
                        weights[x][y] = Long.MAX_VALUE;
                    } else {
                        // rnd.nextInt(max-1) generates a random int between 0 and n-1. 
                        // Adding one guarantees next will be positive.
                        long next = rng.nextInt(max-1) + 1;
                        weights[x][y] = next;
                        weights[y][x] = next;
                    }
                }
            }
	}

	public long[][] getMatrix() {
		return weights;
	}

	public void printMatrix () {
		System.out.println("Adjacency matrix of graph weights:\n");
		System.out.print("\t");
		for(int x = 0; x < graphSize; x++) 
			System.out.print(x + "\t");

		System.out.println("\n");
		for(int x = 0; x < graphSize; x++){
			System.out.print(x + "\t");
			for(int y = 0; y < graphSize; y++) {
				if(weights[x][y] == Long.MAX_VALUE) {
					System.out.print("Inf\t");
				}else{
					System.out.print(weights[x][y] + "\t");
				}
			}
			System.out.println("\n");
		}
	}

	public void saveMatrix(String filename) throws Exception {
		PrintStream output = new PrintStream(new FileOutputStream(filename));
		output.println(graphSize);
		for(int x = 0; x < graphSize; x++) {
			for(int y = 0; y < graphSize; y++) {
				output.print(weights[x][y] + " ");
			}
			output.println();
		}
	}

	public void loadMatrix(String filename) throws Exception {
		Scanner input = new Scanner(new File(filename));
		graphSize = input.nextInt();
		weights = new long[graphSize][graphSize];
		for(int x = 0; x < graphSize; x++) {
			for(int y = 0; y < graphSize; y++) {
				weights[x][y] = input.nextLong();
			}
		}
	}
}
