##nainstalovat s rozbitím systému
#sudo apt install python3-pip
#sudo apt install libxml2-dev libxslt-dev python3-serial
#pip3 install pymavlink --break-system-packages
#
##povolit seriovku
#sudo raspi-config
# 
##spustit
##MAVLINK20=1 python3 mavlink.py 

from pymavlink.dialects.v20 import common as mavlink2
from pymavlink import mavutil
import time
import gpsd
import subprocess
import sys
import datetime
import requests

carID="car2"
cdpAddres="https://public.crreat.eu"
#cdpAddres="http://127.0.0.1:8000"
hbEndPoint="/post/car/hb"
dataEndPoint="/post/car/data"


try:
  gpsd.connect(host = "127.0.0.1")
except:
  print("GPS ERROR")
  sys.exit()

#proc=subprocess.Popen(["./mavlink-routerd", "-c", "TF-GCS.conf"])
#time.sleep(5)
#subprocess.Popen(["./QGroundControl.AppImage"])

#connection = mavutil.mavlink_connection('tcp:127.0.0.1:5760',source_system=1,source_component=139)
connection = mavutil.mavlink_connection('udpin:127.0.0.1:14445',source_system=1,source_component=139)
connection.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                                              mavutil.mavlink.MAV_AUTOPILOT_INVALID, 0, 0, 0)

messages={
  "GPS_RAW_INT":["lat","lon","alt","eph","epv","vel","cog","satellites_visible","v_acc"],
	"ATTITUDE":["roll","pitch","yaw","rollspeed","pitchspeed","yawspeed"],
  "ALTITUDE":["altitude_amsl","altitude_local"],
  "VFR_HUD":["groundspeed","alt","climb"],
  "HYGROMETER_SENSOR":["id","temperature","humidity"],
  "TUNNEL":["payload_length","payload"]
}

state={}
for k,v in messages.items():
  state[k]={}
  state[k+"_updated"]=""
  for m in v:
    state[k][m]=""

state["latitude"]=""
state["longitude"]=""
state["altitude"]=""
state["tmp"]=""
state["car_id"]=carID
state["balloon_id"]="fik_SiK"
sended=True

lastHB=datetime.datetime(1990,1,1,0,0,0)
lastData=datetime.datetime(1990,1,1,0,0,0)

while True:
  msg = connection.recv_match(blocking=True,timeout=5)
  if msg:
    #update data and send to server
    print("MSG:", msg.get_type(), msg)
    if msg.get_type() in messages:
      k = msg.get_type()
      members=vars(msg)
      changetime=str(datetime.datetime.utcnow())
      for m in messages[msg.get_type()]:
        state[k][m]=members[m]
      state[k+"_updated"]=changetime
      sended=False

    if msg.get_type()=="GPS_RAW_INT":
      #print(msg)
      #print(type(msg))
      #print(msg.lat)
      state["tmp"]=str(datetime.datetime.utcnow())
      state["latitude"]=float(msg.lat)/10000000.0
      state["longitude"]=float(msg.lon)/10000000.0
      state["altitude"]=float(msg.alt)/1000.0
      print(state["tmp"]," ",state["latitude"]," ",state["longitude"]," ",state["altitude"])
      sended=False

  if (datetime.datetime.utcnow()-lastHB).total_seconds()>15:     
    #send hardbeat
    print("Sending HB to CDP")
    carPos = gpsd.get_current()
    hbMsg={}
    hbMsg['car_id']=carID
    hbMsg['car_heartbeat_value']=str(datetime.datetime.utcnow())
    hbMsg['latitude']=carPos.lat
    hbMsg['longitude']=carPos.lon
    hbMsg['altitude']=carPos.alt
    try:
      response = requests.post(f"{cdpAddres}{hbEndPoint}", json=hbMsg)
      print(response)
      lastHB=datetime.datetime.utcnow()
    except Exception as e:
      print("Error couldnt send HB to CDP",e)

  if sended==False and (datetime.datetime.utcnow()-lastData).total_seconds()>5:
    #try send     
    try:
      print("Sending Data to CDP")
      print(state)
      response = requests.post(f"{cdpAddres}{dataEndPoint}", json=state)
      print(response)

      #sended
      lastData=datetime.datetime.utcnow()
      sended=True

    except Exception as e:
      print("Error couldnt send Data to CDP",e)
