import paho.mqtt.client as mqtt
import json
import time
import requests
import datetime
from sondehub.amateur import Uploader
import threading


with open('./config.json', 'r') as config_file:
    config = json.load(config_file)

server_address = 'eu1.cloud.thethings.network'
username = config['username']
password = config['password']

topic = '#'
balloons_dict = {}
express_base_url = "http://localhost:4000"
#express_base_url = "https://fik.crreat.eu"


def heartbeat_loop():
    while True:
        try:
            send_heartbeat()
        except:
            print("Error couldnt send data to GAPP")
        time.sleep(10)

def send_data_to_express(endpoint: str, data: dict):
    url = f"{express_base_url}{endpoint}"
    response = requests.post(url, json=data)
    return response

def send_heartbeat():
    date = datetime.datetime.utcnow()
    cdp_heartbeat_data = {"ldp_heartbeat_value": str(date)}
    response = send_data_to_express("/post/ldp/hb", cdp_heartbeat_data)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print('Connected to TTN MQTT broker')
        client.subscribe(topic)
        heartbeat_thread = threading.Thread(target=heartbeat_loop, daemon=True)
        heartbeat_thread.start()
    else:
        print(f'Connection error: {rc}')

def on_message(client, userdata, message):
    topic = message.topic
    message_payload = message.payload.decode('utf-8')
    received_data = {
        'topic': topic,
        'message': message_payload,
        'timestamp': time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    }
    if received_data["topic"].endswith("up"):
        try:
            payload_dict = json.loads(message_payload)
            
            balloon_id = payload_dict["end_device_ids"]["device_id"]
            latitude = payload_dict["uplink_message"]["decoded_payload"]["lat"]
            longitude = payload_dict["uplink_message"]["decoded_payload"]["lon"]
            altitude = payload_dict["uplink_message"]["decoded_payload"].get("alt_m")

            if (not balloon_id in balloons_dict):
                balloons_dict[balloon_id] = Uploader(balloon_id)
            
            balloons_dict[balloon_id].add_telemetry(
                    balloon_id + "Test",
                    datetime.datetime.utcnow(),
                    latitude,
                    longitude,
                    altitude + 1000
                )
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
    try:
        response = send_data_to_express("/post/data", received_data)
        if response.status_code == 200:
            print('Data sent to Node.js server')
        else:
            pass
            #print(f'Failed to send data. Status code: {response.status_code}, Response: {response.text}')
    except:
        print("Error couldnt send data to GAPP")
    

client = mqtt.Client()
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message
client.connect(server_address, 1883, 60)
try:
    client.loop_forever()
except KeyboardInterrupt as e:
    print("Ended with ctrl+c")
finally:
    for i in balloons_dict:
        print(i, ":", balloons_dict[i])
        balloons_dict[i].close()
