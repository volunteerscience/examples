import re
import random

colors = []
def load_colors(fname):
  color_re = re.compile(r'^(#\S{6})\s+(\S.+)\s*$')
  for line in open(fname, 'r'):
    if line.startswith("#"):
      mo = color_re.match(line.strip())
      if mo:
        colors.append([mo.group(1),mo.group(2)])

nouns = []
def load_nouns(fname):
  noun_re = re.compile(r'^(\S.+)\s*$')
  for line in open(fname, 'r'):
    if not line.startswith(" "):
      mo = noun_re.match(line.strip())
      if mo:
        nouns.append(mo.group(1))

def build_rounds(num):
  for i in range(num):
    c = colors[random.randrange(len(colors))]
    n = nouns[random.randrange(len(nouns))]
    comma = ","
    if i == num-1:
      comma = ""
    print '["%s","%s","%s"]%s' % (n,c[0],c[1],comma)
    
  
      
load_colors('colors.txt')
load_nouns('fruits_and_veggies.txt')
print "var rounds = ["
build_rounds(150)
print "]"

