import requests
import datetime
import time

def send_heartbeat():
    # Replace the URL with the actual URL of your FastAPI app
    url = "http://localhost:8000/car/hb"

    # Heartbeat data
    heartbeat_data = {"car_heartbeat_value": str(datetime.datetime.now())}

    # Send POST request to the FastAPI app
    response = requests.post(url, json=heartbeat_data)

    if response.status_code == 200:
        print("Heartbeat sent successfully")
    else:
        print(f"Failed to send heartbeat. Status code: {response.status_code}, Response: {response.text}")

def send_data():
    # Replace the URL with the actual URL of your FastAPI app
    url = "http://localhost:8000/car/data"

    # Heartbeat data
    data = {"tmp": str(datetime.datetime.now())}

    # Send POST request to the FastAPI app
    response = requests.post(url, json=data)

    if response.status_code == 200:
        print("Data sent successfully")
    else:
        print(f"Failed to send data. Status code: {response.status_code}, Response: {response.text}")


if __name__ == "__main__":
    # Send a heartbeat every 5 seconds (adjust as needed)
    while True:
        send_heartbeat()
        send_data()
        time.sleep(5)
