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
  
  labels = ["Country", "Occupation", "Age", "Gender", "Education", "Military"] 
  re_demographic = re.compile('Demographics\s:\s(\S+)\s"(\S*)"\s(\d*)\s(\w*)\s(\w*)\s(\w)')
  w.writerow(labels)
  
  
  import xml.etree.ElementTree as ET

  root = ET.fromstring(xml_string)
  repeat_subjects = {}
  
  # *********** create tables ***********
  for test in root.findall('test'):
    demographics = ["","","","","",""]
    test_id = int(test.attrib['id'])
    ret.write("Test: %s\n" % test_id)
#     subject_id = None
#     for subject in test.findall('subject'):
#       subject_id = subject.attrib['uid']
#     if subject_id in repeat_subjects:
#       continue
    for submit in test.findall('submit'):
      if submit.text.startswith("Demographics"):
        m = re_demographic.match(submit.text)
        for i in range(6):
          demographics[i] = m.group(i+1)
      
      ret.write("%s\n" % submit.text)
    ret.write("\n")
    
    w.writerow(demographics)

    


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

  
  
  