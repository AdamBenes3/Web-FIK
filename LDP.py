import paho.mqtt.client as mqtt
import json
import time
import requests
import datetime
from sondehub.amateur import Uploader
import threading
import logging


nodejs_server_url = 'http://localhost:3000/api/post/data'  # Replace with the URL of your Node.js server

# Load configuration from config.json
with open('./config.json', 'r') as config_file:
    config = json.load(config_file)

server_address = 'eu1.cloud.thethings.network'
username = config['username']
password = config['password']


topic = '#'  # You can change this to the specific topic you want to subscribe to




express_base_url = "http://localhost:3000/api/forward"


def heartbeat_loop():
    while True:
        send_heartbeat()
        time.sleep(10)  # Send heartbeat every 10 seconds

def send_data_to_express(endpoint: str, data: dict):
    url = f"{express_base_url}{endpoint}"
    response = requests.post(url, json=data)
    return response

def send_heartbeat():
    heartbeat_data = {'timestamp': time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())}

    json_data = json.dumps(heartbeat_data, indent=2)

    date = datetime.datetime.now()
    cdp_heartbeat_data = {"ldp_heartbeat_value": str(date)}
    response = send_data_to_express("/ldp/hb", cdp_heartbeat_data)

    #print('Heartbeat data sent to Node.js server')

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print('Connected to TTN MQTT broker')
        client.subscribe(topic)
        
        # Start the heartbeat loop in a separate thread
        heartbeat_thread = threading.Thread(target=heartbeat_loop, daemon=True)
        heartbeat_thread.start()
    else:
        print(f'Connection error: {rc}')

def on_message(client, userdata, message):
    topic = message.topic
    message_payload = message.payload.decode('utf-8')
    print(f"Received message on topic: {topic}, Message: {message_payload}")

    received_data = {
        'topic': topic,
        'message': message_payload,
        'timestamp': time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    }

    if received_data["topic"].endswith("up"):
        try:
            # Parse the message payload into a dictionary
            payload_dict = json.loads(message_payload)

            # Extract required information
            balloon_id = payload_dict["end_device_ids"]["device_id"]
            latitude = payload_dict["uplink_message"]["decoded_payload"]["lat"]
            longitude = payload_dict["uplink_message"]["decoded_payload"]["lon"]
            altitude = payload_dict["uplink_message"]["decoded_payload"].get("alt_m")

            logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.DEBUG)

            uploader = Uploader("SlimonTest", uploader_position=[50.073, 14.418, 400])
            uploader.add_telemetry(
                balloon_id,  # Your payload callsign
                datetime.datetime.utcnow(),
                latitude,  # Latitude
                longitude,  # Longitude
                altitude  # Altitude
            )
            uploader.close()

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")

    json_data = json.dumps(received_data, indent=2)

    headers = {'Content-Type': 'application/json'}
    response = requests.post(nodejs_server_url, data=json_data, headers=headers)

    if response.status_code == 200:
        print('Data sent to Node.js server')
    else:
        print(f'Failed to send data. Status code: {response.status_code}, Response: {response.text}')


client = mqtt.Client()
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message

client.connect(server_address, 1883, 60)
client.loop_forever()
