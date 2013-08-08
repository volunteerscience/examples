import networkx as nx
import random
from collections import defaultdict

with open('valid.txt') as f:
  valid = f.read().splitlines()

with open('vulgar.txt') as f:
  vulgar = f.read().splitlines()

# print len(valid)

def link(w1,w2):
  '''
  Takes 2 words and returns True if 2/3 letters match
  '''
  if w1 == w2:
    return False
  
  if w1[0] == w2[0]:
    if w1[1] == w2[1]:
      return True
    if w1[2] == w2[2]:
      return True
    
  if w1[1] == w2[1]:
    if w1[2] == w2[2]:
      return True
    
  return False


# Build the graph
G=nx.Graph()
# for i,w in enumerate(valid):
#   print "%s %s %s" % (i,w,n) 

for w1 in valid:
  for w2 in valid:
    if link(w1,w2):
#       print "%s %s" % (w1,w2)
      G.add_edge(w1, w2) # reverse edge will be added on 2nd pass

# print "Nodes: %s" % len(G.nodes())
# print "Edges: %s" % len(G.edges())

# dictionary: length => list of problems
solutions = defaultdict(list)

for i in range(0,10000):
  w1 = random.choice(valid)
  w2 = random.choice(valid)
  while (w2 == w1):
    w2 = random.choice(valid)
    
  try:
    path = nx.shortest_path(G, w1, w2)

    # reject vulgar solutions
    fail = False
    for v in vulgar:
      if v in path:
#         print "vulgar: %s %s" % (v,path)
        fail = True
    if fail:
      continue

    
    # solutions of the same length
    my_solutions = solutions[len(path)]

    # reject duplicates:
    for solution in my_solutions:
      if solution[0] == w1 and solution[-1] == w2:
#         print "duplicate: %s %s" % (w1,w2)
        fail = True
    if fail:
      continue
    
    
    my_solutions.append(path)
    
    
  except Exception,e:
#     print "error with path: %s => %s ; %s" % (w1, w2, e)
    pass

for i in range(3,20):
  for s in solutions[i]:
    print "%s;%s" % (i, ",".join(s))
