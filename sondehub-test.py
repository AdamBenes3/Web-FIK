from sondehub.amateur import Uploader
import datetime

uploader_data = Uploader("CesilkoTest", uploader_position=[50.073, 14.418, 400])

uploader_data.add_telemetry(
    "cesilko-test-probe",
    datetime.datetime.now(datetime.UTC),
    50.005,
    14.07,
    250
)
