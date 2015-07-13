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
  
  game_start_d = {} #test.id => last_ready
  
  part_d = {} # [uid] => Part
  class Part:
    def __init__(self, uid):
      self.uid = uid
      self.age = -1
      
    def __str__(self):
      return 'Part %s %s' % (self.uid,self.age)

    def getAge(self):
      if self.age > 0:
        return self.age*6
      return "-1"
    
  def getPart(uid):
    if not uid in part_d:
      part_d[uid] = Part(uid)
    return part_d[uid]
  
  
  
  game_d = {} #[test.id][part.pid] => Game
  class Game:
    def __init__(self, id, part_pid):
      self.id = id
      self.pid = part_pid
      self.attack_choices = []
      self.assets = {}
      self.confidence = -1
      self.part_uid = "bot"
      self.difficulty = -1
      self.round_duration = -1
      self.attack_time = 0
      self.rank_before = -1
      self.rank_after = -1
      
    def __str__(self):
      return 'Game %s %s' % (self.id,self.pid)
    
    def hits(self):
      if hasattr(self,'target_list'):
        return len(set(self.target_list) & set(self.attack_choices))
      return 'n/a'

    def print_target_list(self):
      if hasattr(self,'target_list'):
        return ';'.join(map(str, self.target_list))
      return 'n/a'
    
    
    def assetList(self):
      return sorted(self.assets.keys())
      
    def aiAssets(self):
      ret = []
      for g in game_d[self.id].values():
  #       print "%s %s %s %s %s %s %s" % (self.id, self.pid, self.assetList(), g.id, g.pid, g.assetList(), g.assets)
        if g != self and g.part_uid == 'bot':
          ret.extend(g.assetList())
      return sorted(ret)
      
    def totalTime(self):
      try:
        return g.attack_time-game_start_d[self.id]
      except:
        return 0
      
  def getGame(id,part_pid):
    if not id in game_d:
      game_d[id] = {}
    if not part_pid in game_d[id]:
      game_d[id][part_pid] = Game(id,part_pid)
    return game_d[id][part_pid]
  
  round_d = {} #[test.id][part.pid][round] => Round
  class Round:
    def __init__(self, id, part_pid,round_num):
      self.id = id
      self.pid = part_pid
      self.round_num = round_num
      self.mark_clear = []
      self.mark_possible = []
      self.mark_confirm = []
      self.time = 0
      
    def getRoundDuration(self):
      if self.round_num == first_actual_round:
        return self.time-game_start_d[self.id]
      return self.time-getRound(self.id,self.pid,self.round_num-1).time
  
  def getRound(id,part_pid,round_num):
    if not id in round_d:
      round_d[id] = {}
    if not part_pid in round_d[id]:
      round_d[id][part_pid] = {}
    if not round_num in round_d[id][part_pid]:
      round_d[id][part_pid][round_num] = Round(id,part_pid,round_num)
    return round_d[id][part_pid][round_num]
  
  asset_d = {} #[test.id][part.pid][round] => Round
  class Asset:
    def __init__(self, id, part_pid,round_num,asset_num):
      self.id = id
      self.pid = part_pid
      self.round_num = round_num
      self.asset_num = asset_num
      self.mark_clear = []
      self.mark_possible = []
      self.mark_confirm = []
  
  def getAsset(id,part_pid,round_num,asset_num):
    if not id in asset_d:
      asset_d[id] = {}
    if not part_pid in asset_d[id]:
      asset_d[id][part_pid] = {}
    if not round_num in asset_d[id][part_pid]:
      asset_d[id][part_pid][round_num] = {}
    if not asset_num in asset_d[id][part_pid]:
      asset_d[id][part_pid][round_num][asset_num] = Asset(id,part_pid,round_num,asset_num)
    return asset_d[id][part_pid][round_num][asset_num]
  
      
  
  difficulty_table = {"easy":10,"medium":20,"hard":30}  
  
    
  # *********** create tables ***********
  for test in root.findall('test'):
    test_id = int(test.attrib['id'])
    
    difficulty = -1 
    if 'difficulty' in test.attrib:
      difficulty = test.attrib['difficulty']
      if difficulty in difficulty_table:
        difficulty = difficulty_table[difficulty]
    round_duration = -1
    if 'round_duration' in test.attrib:
      try:
        round_duration = int(test.attrib['round_duration'])
      except: 
        pass
    
    for subject in test.findall('subject'):
      uid = subject.attrib['uid']
      if uid != "0":
        part = getPart(subject.attrib['uid'])
        part.pid = int(subject.attrib['id'])
        
        try:
          part.age = int(subject.attrib['age_bin']) 
        except:
          part.age = -1
          
        try:
          part.sex = 0 if subject.attrib['gender'] == 'male' else 1
        except:
          part.sex = -1
        
        game = getGame(test_id,part.pid)
        game.part_uid = part.uid
        game.difficulty=difficulty
        game.round_duration=round_duration
        
        # ranks
  #       1 = 2LT
  #       2 = 1LT
  #       3 = CPT
  #       4 = MAJ
  #       5 = LTC
  #       6 = COL
  #       7 = BG
  #       8 = MG
  #       9 = GEN
  #       10 = GA
        game.rank_before = 0
        if "ach_2nd_Lieutenant" in subject.attrib:
          game.rank_before = 1
        if "ach_1st_Lieutenant" in subject.attrib:
          game.rank_before = 2
        if "ach_Captain" in subject.attrib:
          game.rank_before = 3
        if "ach_Major" in subject.attrib:
          game.rank_before = 4
        if "ach_Lt_Colonel" in subject.attrib:
          game.rank_before = 5
        if "ach_Colonel" in subject.attrib:
          game.rank_before = 6
        
        
        for achievement in subject.findall('achievement'):
          ach_name = achievement.attrib['name']
          if ach_name == '2nd Lieutenant':
            game.rank_after = max(1, game.rank_after)
          if ach_name == '1st Lieutenant':
            game.rank_after = max(2, game.rank_after)
          if ach_name == 'Captain':
            game.rank_after = max(3, game.rank_after)
          if ach_name == 'Major':
            game.rank_after = max(4, game.rank_after)
          if ach_name == 'Lt Colonel':
            game.rank_after = max(5, game.rank_after)
          if ach_name == 'Colonel':
            game.rank_after = max(6, game.rank_after)
            
        game.rank_after = max(game.rank_before, game.rank_after)
    
    last_ready = 0
    for submit in test.findall('submit'):
      pid = int(submit.attrib['subject'])
      game = getGame(test_id,pid)
      round_num = int(submit.attrib['round'])
      time = int(submit.attrib['time'])
      
      round = None
      if round_num >= first_actual_round:
        round = getRound(test_id,pid,round_num)
        round.part_uid = game.part_uid
  
        for mark_tag in submit.findall('mark'):
          region = int(mark_tag.attrib['region'])
          letter = mark_tag.attrib['letter']
          if letter == "0":
            round.mark_clear.append(region)
          if letter == "?":
            round.mark_possible.append(region)
          if letter == "X":
            round.mark_confirm.append(region)

      
      for game_tag in submit.findall('game'):
        # game targets is only set by subject 1, but we need to put it in all the tables
        target_list = sorted([int(x) for x in game_tag.attrib['targets'].split(',')])
        
        for temp_pid in game_d[test_id]:
          g = getGame(test_id,temp_pid)
          g.target_list = target_list
      
      for ready_tag in submit.findall('ready'):
        last_ready = max( last_ready, time )
        try:
          game.difficulty=ready_tag.attrib['difficulty']
        except:
          pass
        try:
          game.round_duration=int(ready_tag.attrib['round_duration'])
        except:
          pass
    
      for command_tag in submit.findall('command'):
        unit=int(command_tag.attrib['unit'])
        game.assets[int(command_tag.attrib['unit'])] = True
        asset=getAsset(test_id,pid,round_num,unit)
        asset.part_uid = game.part_uid
        if 'scan' in command_tag.attrib:
  #         scan="1,6,11,16,21" result="0,0,?,0,X"
          scan = command_tag.attrib['scan'].split(',')
          scan_result = command_tag.attrib['result'].split(',')
          for i in range(len(scan_result)):
            if scan_result[i] == '0':
              asset.mark_clear.append(scan[i])
            if scan_result[i] == '?':
              asset.mark_possible.append(scan[i])
            if scan_result[i] == 'X':
              asset.mark_confirm.append(scan[i])
        try:
          round.time = time
        except:
          pass    
      for confidence_tag in submit.findall('confidence'):
        game.confidence = int(confidence_tag.attrib['value'])
  
      for target_tag in submit.findall('target'):
        game.attack_choices.append(int(target_tag.attrib['region']))
        game.attack_time = time
        round.time = time
  
    game_start_d[test_id] = last_ready
      
  # <submit subject="1" round="106" time="451"><confidence value="3"/><target unit="7" region="6"/><target unit="8" region="8"/><target unit="9" region="9"/><target unit="10" region="24"/></submit>
  
  
  # ************** print tables *************
  ret.write("Participant Table\n")
  ret.write("Participant,Age,Sex,FBInfo\n")
  for p in part_d.itervalues():
    ret.write("%s,%s,%s,%s\n" % (p.uid,p.getAge(),p.sex,"N/A"))
    
  ret.write("\n\n")  
  ret.write("Player Game Level\n")
  ret.write("Participant,GameNum,PlayerNum,Difficulty,MaxRoundDuration,Hits,Confidence,Rank Before,Rank After,Assets,AI_Assets,TotalTime,TargetLocations,Choices\n")
  for game_id in sorted(game_d):
    g_table = game_d[game_id]
    for g in g_table.itervalues():
      if g.part_uid != 'bot': # hasattr(g, 'part_uid'):
        ret.write("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n" % (
          g.part_uid, g.id, g.pid, g.difficulty, g.round_duration, g.hits(), g.confidence, g.rank_before, g.rank_after,
          ';'.join(map(str, g.assetList())), ';'.join(map(str, g.aiAssets())), g.totalTime(), 
          g.print_target_list(),';'.join(map(str, sorted(g.attack_choices)))
          ))
  
  ret.write("\n\n")  
  ret.write("Player Round Table\n")
  ret.write("Participant,GameNum,PlayerNum,Round,RoundDuration,MarkClear,MarkPossible,MarkConfirm\n")
  for game_id in sorted(round_d):
    g_table = round_d[game_id]
    
    for p_id in sorted(g_table):
      p_table = g_table[p_id]
      
      for round in range(first_actual_round,last_actual_round+1):
        if round in p_table:
          r = p_table[round]
          if r.part_uid != 'bot': # hasattr(g, 'part_uid'):
            ret.write("%s,%s,%s,%s,%s,%s,%s,%s\n" % (
              r.part_uid, r.id, r.pid, (r.round_num-first_actual_round+1),r.getRoundDuration(), 
              ';'.join(map(str, r.mark_clear)),';'.join(map(str, r.mark_possible)),';'.join(map(str, r.mark_confirm)),
              ))
    
  # import sys
  # sys.exit(0)
  
  ret.write("\n\n")  
  ret.write("Player Assets in Each Round\n")
  ret.write("Participant,GameNum,PlayerNum,Round,AssetType,ReportClear,ReportPossible,ReportConfirm\n")
  for game_id in sorted(asset_d):
    g_table = asset_d[game_id]
  
    for r in range(first_actual_round,last_actual_round+1):
      for p_id in sorted(g_table):
        p_table = g_table[p_id]
        r_table = {}
        if r in p_table:
          r_table = p_table[r]
          
        for a_id in sorted(r_table):
            a = r_table[a_id]
            ret.write("%s,%s,%s,%s,%s,%s,%s,%s\n" % (
              a.part_uid, a.id, a.pid, (a.round_num-first_actual_round-1), a.asset_num,
              ';'.join(map(str, a.mark_clear)),';'.join(map(str, a.mark_possible)),';'.join(map(str, a.mark_confirm)),
              ))
  return ret

if __name__ == "__main__":
  # parse the file
#   tree = ET.parse('scud_hunt_results_all.xml')
#                 
  with open ("scud_hunt_results_a.xml", "r") as myfile:
    xml_string=myfile.read()
    print build_csv_from_xml(xml_string).getvalue()
#   build_csv_from_xml('scud_hunt_results.xml')
#   root = tree.getroot()

  
  
  