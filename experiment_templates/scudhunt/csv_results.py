import xml.etree.ElementTree as ET

# parse the file
tree = ET.parse('scud_hunt_results_all.xml')
# tree = ET.parse('scud_hunt_results.xml')
root = tree.getroot()

game_start_d = {} #test.id => last_ready

part_d = {} # [uid] => Part
class Part:
  def __init__(self, uid):
    self.uid = uid
    self.age = 3
    
  def __str__(self):
    return 'Part %s %s' % (self.uid,self.age)
    
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
    self.mark_clear = []
    self.mark_possible = []
    self.mark_confirm = []
    self.attack_time = 0
    
  def __str__(self):
    return 'Game %s %s' % (self.id,self.pid)
  
  def hits(self):
    if hasattr(self,'target_list'):
      return len(set(self.target_list) & set(self.attack_choices))
    return 'n/a'
  
  def assetList(self):
    return sorted(self.assets.keys())
    
  def otherAssets(self):
    ret = []
    for g in game_d[self.id].values():
#       print "%s %s %s %s %s %s %s" % (self.id, self.pid, self.assetList(), g.id, g.pid, g.assetList(), g.assets)
      if g != self:
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
  round_duration = 5*60
  if 'round_duration' in test.attrib:
    round_duration = int(test.attrib['round_duration'])
  
  for subject in test.findall('subject'):
    part = getPart(subject.attrib['uid'])
    part.pid = int(subject.attrib['id'])
    part.age = int(subject.attrib['age_bin']) 
    part.sex = 0 if subject.attrib['gender'] == 'male' else 1
    
    game = getGame(test_id,part.pid)
    game.part_uid = part.uid
    game.difficulty=difficulty
    game.round_duration=round_duration
  
  last_ready = 0
  for submit in test.findall('submit'):
    pid = int(submit.attrib['subject'])
    game = getGame(test_id,pid)
    round_num = int(submit.attrib['round'])
    time = int(submit.attrib['time'])
    
    round = None
    if round_num > 100 and round_num < 106:
      round = getRound(test_id,pid,round_num)
      round.part_uid = game.part_uid

    
    for game_tag in submit.findall('game'):
      game.target_list = sorted([int(x) for x in game_tag.attrib['targets'].split(',')])
    
    for ready_tag in submit.findall('ready'):
      last_ready = max( last_ready, time )

    for mark_tag in submit.findall('mark'):
      region = int(mark_tag.attrib['region'])
      letter = mark_tag.attrib['letter']
      if letter == "0":
        game.mark_clear.append(region)
      if letter == "?":
        game.mark_possible.append(region)
      if letter == "X":
        game.mark_confirm.append(region)

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
            round.mark_clear.append(scan[i])
          if scan_result[i] == '?':
            asset.mark_possible.append(scan[i])
            round.mark_possible.append(scan[i])
          if scan_result[i] == 'X':
            asset.mark_confirm.append(scan[i])
            round.mark_confirm.append(scan[i])
            
    for confidence_tag in submit.findall('confidence'):
      game.confidence = int(confidence_tag.attrib['value'])

    for target_tag in submit.findall('target'):
      game.attack_choices.append(int(target_tag.attrib['region']))
      game.attack_time = time

  game_start_d[test_id] = last_ready
    
# <submit subject="1" round="106" time="451"><confidence value="3"/><target unit="7" region="6"/><target unit="8" region="8"/><target unit="9" region="9"/><target unit="10" region="24"/></submit>


# ************** print tables *************
print "Participant Table"
print "Participant,Age,Sex,FBInfo"
for p in part_d.itervalues():
  print "%s,%s,%s,%s" % (p.uid,(p.age*6),p.sex,"N/A")
  
print ""  
print ""  
print "Single-Player Game Level"
# print "Participant,GameNum,PlayerNum,Difficulty,RoundDuration,Hits,Confidence,Rank,Assets,AI_Assets,TotalTime,TargetLocations,Choices,TargetClear,TargetPossible,TargetConfirm"
print "Participant,GameNum,PlayerNum,Difficulty,RoundDuration,Hits,Confidence,Assets,AI_Assets,TotalTime,TargetLocations,Choices,TargetClear,TargetPossible,TargetConfirm"
for game_id in sorted(game_d):
  g_table = game_d[game_id]
  for g in g_table.itervalues():
    if g.part_uid != 'bot': # hasattr(g, 'part_uid'):
      print "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s" % (
        g.part_uid, g.id, g.pid, g.difficulty, g.round_duration, g.hits(), g.confidence, 
        ';'.join(map(str, g.assetList())), ';'.join(map(str, g.otherAssets())), g.totalTime(), 
        ';'.join(map(str, g.target_list)),';'.join(map(str, sorted(g.attack_choices))),
        ';'.join(map(str, g.mark_clear)),';'.join(map(str, g.mark_possible)),';'.join(map(str, g.mark_confirm)),
        )

print ""  
print ""  
print "Single-player Round Table"
print "Participant,GameNum,PlayerNum,Round,AssetType,TargetClear,TargetPossible,TargetConfirm"
# for g_table in round_d.itervalues():
for game_id in sorted(round_d):
  g_table = round_d[game_id]
  
#   for p_table in g_table.itervalues():
  for p_id in sorted(g_table):
    p_table = g_table[p_id]
    
    
#     for r_table in p_table.itervalues():
    for round in range(101,106):
      if round in p_table:
        r = p_table[round]
        if r.part_uid != 'bot': # hasattr(g, 'part_uid'):
          print "%s,%s,%s,%s,%s,%s,%s" % (
            r.part_uid, r.id, r.pid, (r.round_num-100), 
            ';'.join(map(str, r.mark_clear)),';'.join(map(str, r.mark_possible)),';'.join(map(str, r.mark_confirm)),
            )
  
# import sys
# sys.exit(0)

print ""  
print ""  
print "Single-player Assets in Each Round"
print "Participant,GameNum,PlayerNum,Round,AssetType,TargetClear,TargetPossible,TargetConfirm"
# for g_table in asset_d.itervalues():
for game_id in sorted(asset_d):
  g_table = asset_d[game_id]

  for r in range(101,106):
    for p_id in sorted(g_table):
      p_table = g_table[p_id]
#     for r in range(101,106):
      r_table = {}
      if r in p_table:
        r_table = p_table[r]
        
#       for a in r_table.itervalues():
      for a_id in sorted(r_table):
          a = r_table[a_id]
#         if a.part_uid != 'bot': # hasattr(g, 'part_uid'):
          print "%s,%s,%s,%s,%s,%s,%s,%s" % (
            a.part_uid, a.id, a.pid, (a.round_num-100), a.asset_num,
            ';'.join(map(str, a.mark_clear)),';'.join(map(str, a.mark_possible)),';'.join(map(str, a.mark_confirm)),
            )
  
  
  
  
  
  