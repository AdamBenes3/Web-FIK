import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import asyncio
from random import randint


def clip(value, min_value, max_value):
    return max(min_value, min(value, max_value))

token = os.environ.get("INFLUXDB_TOKEN")
# token = "1B7Tj4uLB11Hm0RUBqXAKC80c0zco3PFyFUO8ji37xl1IOiKuo3mHUk3khhoyZ7dA5_9mmmOUvhYrFHqB93L3Q=="
print("token", token)
org = "ODZ"
url = "http://localhost:8801"

write_client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)

print(write_client)


bucket="data"
write_api = write_client.write_api(write_options=SYNCHRONOUS)


lat = 50.087451
lon = 14.420671
alt = 200.0

temp = 0.0
humi = 0.0

value = 0

#for value in range(50):
while 1:
  value += 1

  lat += randint(-8, 10) / 10000.0
  lon += randint(-8, 10) / 10000.0
  alt += randint(0, 500) / 100.0


  temp = clip(temp+randint(-300, 300)/100.0, -20, 30)
  humi = clip(humi+randint(-10, 10)/10.0, 0, 100)


  coordinates = (
    Point("coordinates")
    .tag("over", "0")
    .tag("platformType", "1")
    .tag("platform", "FikX-LORA")
    .field("latitude", lat)
    .field("longitude", lon)
    .field("altitude", alt)
  )

  write_api.write(bucket=bucket, org="ODZ", record=coordinates)
  
  # Store scalar values asynchronously
  #async def write_scalar_values():
  #    async_write_api = write_client.write_api()
  over = str(randint(0,5))
  time.sleep(randint(1, 10)/10)
  temperature = (
    Point("environment")
    .tag("over", over)
    .tag("platformType", "1")
    .tag("platform", "FikX")
    .field("temperature", float(temp))
  )
  humidity = (
    Point("environment")
    .tag("over", over)
    .tag("platformType", "1")
    .tag("platform", "FikX")
    .field("humidity", float(humi))
  )

  write_api.write(bucket=bucket, org="ODZ", record=temperature)
  write_api.write(bucket=bucket, org="ODZ", record=humidity)

  time.sleep(randint(1, 20)/10)

