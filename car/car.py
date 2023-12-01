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
gpsd.connect(host = "127.0.0.1")

connection = mavutil.mavlink_connection('tcp:127.0.0.1:5760',source_system=1,source_component=139)

connection.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                                              mavutil.mavlink.MAV_AUTOPILOT_INVALID, 0, 0, 0)




while True:
  msg = connection.recv_match(blocking=True)
  print("MSG:",msg.get_type())
  if msg.get_type() == "BAD_DATA":
     print(msg.data)
  pos = gpsd.get_current()
  print(pos)


  
