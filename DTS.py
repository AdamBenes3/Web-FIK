import requests
import json

# Base URL for the API
base_url = "https://api.v2.sondehub.org"

# Example headers for the PUT request
headers = {
    "User-Agent": "autorx-1.4.1-beta5",  # Replace with your software version
    "Content-Type": "application/json",
}

# Example payload for the PUT request (you should replace this with your telemetry data)
payload = {
    "telemetry_field1": "value1",
    "telemetry_field2": "value2",
}

# Example query parameters for the GET request
params = {
    "duration": "30m",
    "payload_callsign": "your_callsign",
    "datetime": "2021-02-02T11:27:38.634Z",  # Replace with your desired datetime
}

# Make a PUT request to upload telemetry data
put_url = f"{base_url}/amateur/telemetry"
response_put = requests.put(put_url, headers=headers, data=json.dumps(payload))

if response_put.status_code == 200:
    print("Telemetry data uploaded successfully.")
else:
    print(f"Failed to upload telemetry data. Status code: {response_put.status_code}")

# Make a GET request to retrieve telemetry data
get_url = f"{base_url}/amateur/telemetry"
response_get = requests.get(get_url, params=params)

if response_get.status_code == 200:
    telemetry_data = response_get.json()
    print("Telemetry data received:", telemetry_data)
else:
    print(f"Failed to retrieve telemetry data. Status code: {response_get.status_code}")
