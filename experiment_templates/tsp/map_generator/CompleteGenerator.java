/**
 * This class is simply a complete graph random
 * generator. Mainly used as a helper class to
 * create matrices of varying size, and maximum costs.
 *
 * @author   Robert Clark
 */
public class CompleteGenerator {

	public static void main(String[] args) {
		if(args.length == 3) {
			int size = Integer.parseInt(args[0]);
			int max_len = Integer.parseInt(args[1]);
			String outputName = args[2];
			
			Graph theGraph = new Graph(size);
			theGraph.randomize(max_len);
			theGraph.printMatrix();
			try {
				theGraph.saveMatrix(args[2]);
			} catch(Exception e) {
				System.out.println("Unable to save matrix");
			}
		} else {
			System.out.println("Usage: java CompleteGenerator size max_length output");
		}

	}
}
