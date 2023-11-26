import asyncio
import json
from fastapi import FastAPI, APIRouter, Depends, Request
from fastapi.responses import JSONResponse
import requests
import datetime
from sondehub.amateur import Uploader
import logging


app = FastAPI()
router = APIRouter()

express_base_url = "http://localhost:3000/api/forward"

car_dict = {}

uploader_data = Uploader("SlimonTest", uploader_position=[50.073, 14.418, 400])

@router.post("/car/hb")
async def forward_heartbeat(request: Request):
    data = await request.json()
    car_id = data.get("car_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    altitude = data.get("altitude")
    
    if (not car_id in car_dict):
        car_dict[car_id] = Uploader(car_id)
        print(car_dict)
        
        
    
    car_dict[car_id].add_telemetry(
            car_id + "Test",  # Your payload callsign
            datetime.datetime.utcnow(),
            latitude,  # Latitude
            longitude,  # Longitude
            altitude + 1000  # Altitude
        )
    
    # logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.DEBUG)
    #uploader = Uploader("SlimonTest", uploader_position=[50.073, 14.418, 400])
    #uploader.upload_station_position(
    #    car_id,
    #    [latitude, longitude, altitude], # [latitude, longitude, altitude]
    #    mobile=True
    #)
    #uploader.close()
    response = send_data_to_express("/car/hb", data)
    print(response.json())
    return {"message": "Heartbeat data received and forwarded successfully"}

@router.post("/car/data")
async def forward_data(request: Request):
    
    print("HIIIIIIIIIIIIIII")
    
    data = await request.json()
    
    balloon_id = data.get("balloon_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    altitude = data.get("altitude")
    
    # Compare the timestamp with the one in car_data.json
    if is_newer_timestamp(data):
        response = send_data_to_express("/car/data", data)
        print(response.json())
        print("Received data is newer than the existing data.")
        # logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.DEBUG)
        
        uploader_data.add_telemetry(
            balloon_id, # Your payload callsign
            datetime.datetime.utcnow(),
            latitude, # Latitude
            longitude, # Longitude
            altitude # Altitude
        )
        
        return {"message": "Data data received and forwarded successfully"}
    else:
        response = send_data_to_express("/car/data", data)
        print("Received data is not newer than the existing data.")
        # uploader.close()
        return {"message": "Data is not forwarded because it's not newer."}
    






def is_newer_timestamp(received_data: dict):
    # Assuming the timestamp is stored in the "tmp" field
    received_timestamp_str = received_data.get("tmp")
    
    if received_timestamp_str:
        received_timestamp = datetime.datetime.strptime(received_timestamp_str, "%Y-%m-%d %H:%M:%S.%f")
        
        # Load existing data from car_data.json
        car_data_file_path = "data/car_data.json"
        with open(car_data_file_path, "r") as file:
            existing_data = json.load(file)
            
        existing_timestamp_str = existing_data.get("tmp")
        
        if existing_timestamp_str:
            existing_timestamp = datetime.datetime.strptime(existing_timestamp_str, "%Y-%m-%d %H:%M:%S.%f")
            
            # Compare timestamps
            return received_timestamp > existing_timestamp
        else:
            return True
    return False

def send_data_to_express(endpoint: str, data: dict):
    try:
        url = f"{express_base_url}{endpoint}"
        response = requests.post(url, json=data)
        return response
    except:
        print("Error")
        return {"message": "Error"}

def send_hb_to_express(endpoint: str, data: dict):
    try:
        url = f"{express_base_url}{endpoint}"
        response = requests.post(url, json=data)
        return response
    except:
        print("Error")
        return {"message": "Error"}

def start_background_task():
    async def send_cdp_heartbeat():
        while True:
            date = datetime.datetime.now()
            cdp_heartbeat_data = {"cdp_heartbeat_value": str(date)}
            response = send_hb_to_express("/cdp/hb", cdp_heartbeat_data)
            #print(response.json())
            await asyncio.sleep(10)

    asyncio.create_task(send_cdp_heartbeat())


# Define a shutdown event handler
def on_shutdown():
    print("Shutting down...")
    uploader_data.close()
    for i in car_dict:
        print(i, ":", car_dict[i])
        car_dict[i].close()


try:
    # Include the router
    app.include_router(router)

    # Register the shutdown event handler
    app.add_event_handler("shutdown", on_shutdown)

    # Start the background task
    start_background_task()

    # If you are using uvicorn to run your FastAPI application, use the following line to run the server
    # uvicorn your_app_module:app --host 0.0.0.0 --port 8000 --reload

except KeyboardInterrupt as e:
    print("Ukončeno ctrl+c")
finally:
    pass