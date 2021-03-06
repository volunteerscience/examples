import codecs
import re

# Read Open Multi WN's .tab file
def readWNfile(wnfile, option="ss"):
  reader = codecs.open(wnfile, "r", "utf8").readlines()
  k = -1;
  wn = {}
  for l in reader:
    if l[0] == "#": continue
    if option=="ss":
      k = l.split("\t")[0] #ss as key
      v = l.split("\t")[2][:-1] #word
    elif option=="wordlist":
      k = l.rstrip()
      v = k
    else:
      v = l.split("\t")[0] #ss as value
      k = l.split("\t")[2][:-1] #word as key
    try:
      temp = wn[k]
      wn[k] = temp + ";" + v
    except KeyError:
      wn[k] = v  
  return wn

#princetonWN = readWNfile('wn-data-eng.tab', 'word')
princetonWN = readWNfile('words.txt', 'wordlist')

lower_only = re.compile(r"[a-z]{3}")

for word in princetonWN:
  if len(word) != 3:
    continue

#   if not lower_only.match(word):
#     print "upper %s" % word
#     continue  
#   
#   if not ('a' in word or 'e' in word or 'i' in word or 'o' in word or 'u' in word or 'y' in word):
#     print "no-vowel %s" % word
#     continue
  
  print word