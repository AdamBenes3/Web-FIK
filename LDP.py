import paho.mqtt.client as mqtt
import json
import time
from pymongo import MongoClient
import requests

nodejs_server_url = 'http://localhost:3000/api/get/data'  # Replace with the URL of your Node.js server

# Load configuration from config.json
with open('./config.json', 'r') as config_file:
    config = json.load(config_file)

server_address = 'eu1.cloud.thethings.network'
username = config['username']
password = config['password']

# Replace with your TTN Application ID, Device ID, and the specific topic you want to subscribe to
application_id = 'balloons'
device_id = 'fik8b'
topic = '#'  # You can change this to the specific topic you want to subscribe to

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print('Connected to TTN MQTT broker')
        client.subscribe(topic)
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

    json_data = json.dumps(received_data, indent=2)

    global which_file
    if which_file:
        with open('data.json', 'w') as file:
            file.write(json_data)
        which_file = False
    else:
        with open('dataLocation.json', 'w') as file:
            file.write(json_data)
        which_file = True
    
    headers = {'Content-Type': 'application/json'}
    response = requests.post(nodejs_server_url, data=json_data, headers=headers)

    with open('dataHistory.json', 'a') as file:
        file.write(json_data + '\n')
    print('Data appended to dataHistory.json')

client = mqtt.Client()
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message

client.connect(server_address, 1883, 60)
client.loop_forever()
