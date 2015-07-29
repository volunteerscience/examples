first_actual_round=501
last_actual_round=506
# print "imported scud hunt csv_results"

def build_csv(exp, tests, part_data=True, section_data=False, summary=False, variables=[], matrices=[], awards=[], scores=[]):
  from soclab.lazer.views import xml_data
  xml_string = xml_data(exp, tests, part_data=part_data, summary=summary, variables=variables, matrices=matrices, awards=awards, scores=scores).getvalue()
  return build_csv_from_xml(xml_string)

def build_csv_from_xml(xml_string):
  from cStringIO import StringIO
  ret = StringIO()
  
  import xml.etree.ElementTree as ET

  root = ET.fromstring(xml_string)
  repeat_subjects = {}
  
  # *********** create tables ***********
  for test in root.findall('test'):
    test_id = int(test.attrib['id'])
    subject_id = None
    for subject in test.findall('subject'):
      subject_id = subject.attrib['uid']
    if subject_id in repeat_subjects:
      continue
    for submit in test.findall('submit'):
      repeat_subjects[subject_id] = True  
      ret.write("test,%s,%s\n" % (test_id,subject_id))
      ret.write(submit.text)
      ret.write("\n")
      break
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

  
  
  