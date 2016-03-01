first_actual_round=501
last_actual_round=506
# print "imported scud hunt csv_results"

def build_csv(exp, tests, part_data=True, section_data=False, summary=False, variables=[], matrices=[], awards=[], scores=[]):
  from soclab.lazer.views import xml_data
  xml_string = xml_data(exp, tests, part_data=part_data, summary=summary, variables=variables, matrices=matrices, awards=awards, scores=scores).getvalue()
  return build_csv_from_xml(xml_string)

def build_csv_from_xml(xml_string):
  from cStringIO import StringIO
  import csv
  import re

  ret = StringIO()
  w = csv.writer(ret, delimiter=',', quoting=csv.QUOTE_MINIMAL)
  
  deck1 = [None]*3
  deck1[0] = [22,45,66,1,75,15,33]
  deck1[1] = [15,27,33,44,39]
  deck1[2] = [15,16,17,18,19,20,21]
  
  deck2 = [None]*40
  deck2[0] = [23,69,34,60,75]
  deck2[1] = [22,45,66,42,26,58,70]
  deck2[2] = [48,14,3,4,49,70,72]
  deck2[3] = [51,62,19,75,18]
  deck2[4] = [75,8,60,41,68,14,51]
  deck2[5] = [53,72,17,33,38,36,26]
  deck2[6] = [5,31,36,16,34]
  deck2[7] = [74,65,54,2,35,37,66]
  deck2[8] = [62,75,19,18,51]
  deck2[9] = [63,52,40,12,43]
  deck2[10] = [46,58,32,3,68,23,63]
  deck2[11] = [72,36,26,17,38,53,33]
  deck2[12] = [58,10,27,13,73,66,12]
  deck2[13] = [5,11,30,8,69]
  deck2[14] = [24,66,16,75,13]
  deck2[15] = [52,34,47,75,35,63,20]
  deck2[16] = [23,3,68,32,63,46,58]
  deck2[17] = [36,75,32,41,35]
  deck2[18] = [12,43,63,52,40]
  deck2[19] = [4,48,64,6,31]
  deck2[20] = [51,7,28,57,66]
  deck2[21] = [29,72,18,27,54,23,17]
  deck2[22] = [41,51,68,60,8,14,75]
  deck2[23] = [13,18,29,66,2]
  deck2[24] = [51,7,57,66,28]
  deck2[25] = [72,23,17,27,54,29,18]
  deck2[26] = [48,70,72,4,3,49,14]
  deck2[27] = [11,5,69,8,30]
  deck2[28] = [75,35,36,41,32]
  deck2[29] = [52,61,23,13,26,33,28]
  deck2[30] = [26,22,42,70,58,45,66]
  deck2[31] = [48,6,31,4,64]
  deck2[32] = [23,34,75,60,69]
  deck2[33] = [66,29,18,13,2]
  deck2[34] = [24,75,13,66,16]
  deck2[35] = [73,27,66,58,10,13,12]
  deck2[36] = [34,52,75,63,35,47,20]
  deck2[37] = [37,65,66,35,2,74,54]
  deck2[38] = [52,28,23,26,33,13,61]
  deck2[39] = [34,5,36,31,16]
  
  deck3 = [None]*40
  deck3[0] = [18,5,54,24,70,25,38]
  deck3[1] = [15,53,17,46,59]
  deck3[2] = [24,57,58,9,70,2,54]
  deck3[3] = [52,1,6,71,8,25,62]
  deck3[4] = [74,32,36,75,65,62,15]
  deck3[5] = [29,32,42,68,38,40,33]
  deck3[6] = [70,48,72,56,27]
  deck3[7] = [14,36,66,28,51,2,30]
  deck3[8] = [71,67,62,58,7,20,11]
  deck3[9] = [71,73,25,16,49]
  deck3[10] = [54,9,2,70,24,58,57]
  deck3[11] = [41,14,56,4,35]
  deck3[12] = [9,13,43,5,36]
  deck3[13] = [75,74,32,62,36,65,15]
  deck3[14] = [11,23,33,18,72]
  deck3[15] = [14,4,35,56,41]
  deck3[16] = [54,38,70,18,25,24,5]
  deck3[17] = [63,13,24,11,69,23,34]
  deck3[18] = [32,33,68,42,38,29,40]
  deck3[19] = [70,27,75,59,23]
  deck3[20] = [8,6,25,62,52,1,71]
  deck3[21] = [5,9,13,43,36]
  deck3[22] = [72,18,11,33,23]
  deck3[23] = [56,27,70,48,72]
  deck3[24] = [37,46,50,5,55,52,54]
  deck3[25] = [11,33,44,14,5]
  deck3[26] = [62,7,67,11,20,58,71]
  deck3[27] = [46,31,14,27,45]
  deck3[28] = [50,55,5,52,46,37,54]
  deck3[29] = [59,27,70,75,23]
  deck3[30] = [39,75,12,59,64,36,17]
  deck3[31] = [19,42,31,9,54]
  deck3[32] = [27,45,14,46,31]
  deck3[33] = [24,23,11,69,13,34,63]
  deck3[34] = [53,46,15,59,17]
  deck3[35] = [64,59,39,75,12,36,17]
  deck3[36] = [73,25,16,71,49]
  deck3[37] = [14,11,44,5,33]
  deck3[38] = [19,42,9,54,31]
  deck3[39] = [28,51,14,30,36,66,2]
  decks = [deck1,deck2,deck3]

  column = [None]*len(decks) # reverse index of original to ranked deck => original => column
#   sorted_column = [None]*len(decks)
  # build up the headers
  dem_names = ["Test","Subject","Country", "Occupation", "Age", "Gender", "Education", "Military"] 
  deckNames = ["Training","Emergency","Planning"]
  # h1 says Training, Emergency, Planning
  # h2 has the more specific labels
  
  h1 = []
  h2 = dem_names[:]

  # properly space out the different sections in h1
  curCol = 0
  for i in range(len(h2)):
    h1.append("")
    curCol += 1
    
  for d in range(len(decks)):
    column[d] = {}
    h1.append(deckNames[d])
    for h in range(len(decks[d])):
      original = ' '.join(str(x) for x in decks[d][h])
      h2.append(original)
      for space in range(len(decks[d][h]) - 1):
        h2.append("")
      h2.append("Time") # time
      column[d][original] = curCol
      if h > 0:
        h1.append("")
      for space in range(len(decks[d][h])):
        h1.append("") 
      curCol += len(decks[d][h])+1
  
  w.writerow(h1)
  w.writerow(h2)

  # re
  re_demographic = re.compile('Demographics\s:\s(\S+)\s"(.*)"\s(\d*)\s(\w*)\s(\w*)\s(\w)') # Demographics : SY "Programmer" 36 m hs n
  re_original = re.compile('Original Card Set\s:\s(\d+(\s\d+)+)$') # Original Card Set : 22 45 66 1 75 15 33
  re_ranked = re.compile('Ranked Card Set\s:\s(\d+(\s\d+)+)\snumber of sec (\d+)$') # Ranked Card Set : 15 1 22 45 66 75 33 number of sec 15
  
  
  
  import xml.etree.ElementTree as ET

  root = ET.fromstring(xml_string)
  repeat_subjects = {}
  
  for test in root.findall('test'):
    row = [""]*len(h2) # fill in this data
    
    curDeck = 0 # training, emergency, planning
    curCol = len(dem_names)
    raLast = True # Ranked Last (flip flops with Original/Ranked);  This fixes a problem where Original gets submitted before previous Ranked
    
    test_id = int(test.attrib['id'])
    row[0] = test_id
#     ret.write("Test: %s\n" % test_id)
    subject_id = None
    for subject in test.findall('subject'):
      subject_id = subject.attrib['uid']
      row[1] = subject_id
#     if subject_id in repeat_subjects:
#       continue
    for submit in test.findall('submit'):
      if submit.text.startswith("Training"): 
        curDeck = 0
      if submit.text.startswith("Emergency"): 
        curDeck = 1
      if submit.text.startswith("Planning"): 
        curDeck = 2
        
      if submit.text.startswith("De"): # Demographics
        m = re_demographic.match(submit.text)
        for i in range(6):
          row[i+2] = m.group(i+1)

      if submit.text.startswith("Or"): # Original
        if raLast:
          raLast = False
          m = re_original.match(submit.text)
          k = m.group(1)
          try:
            curCol = column[curDeck][k]
          except:
            try:
              curDeck += 1
              curCol = column[curDeck][k]
            except:
              pass

      if submit.text.startswith("Ra"): # Ranked
        raLast = True
        m = re_ranked.match(submit.text)
        val = m.group(1)
        cards = val.split(" ")
        for idx, card in enumerate(cards):
          row[curCol+idx] = card   
#         row[curCol] = val
        timeCol = curCol + len(k.split(" "))
        row[timeCol] = m.groups()[-1]
        curCol += 2

    
    w.writerow(row)

    


  return ret

if __name__ == "__main__":
  # parse the file
#   tree = ET.parse('scud_hunt_results_all.xml')
#                 
  with open ("vs_results.xml", "r") as myfile:
    xml_string=myfile.read()
    print build_csv_from_xml(xml_string).getvalue()
#   build_csv_from_xml('scud_hunt_results.xml')
#   root = tree.getroot()

  
  
  