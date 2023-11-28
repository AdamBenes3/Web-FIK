const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.json());


function appendToJsonFile(filePath, newData) {
    try {
      const existingData = fs.readFileSync("data/" + filePath, 'utf-8');
      let jsonData = JSON.parse(existingData);
      jsonData.history.push(newData);
      const updatedJsonData = JSON.stringify(jsonData, null, 2);
      fs.writeFileSync("data/" + filePath, updatedJsonData);
      console.log('Data appended successfully.');
    } catch (error) {
      console.error('Error appending data:', error.message);
    }
  }


function saveDataToFile(filename, data) {
    try {
        console.log("Saved to file: " + filename);
        fs.writeFileSync("data/" + filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data to file:', error);
    }
}

async function isNewerTimestamp(receivedData) {
    const receivedTimestampStr = receivedData["tmp"];
    if (receivedTimestampStr) {
        const receivedTimestamp = new Date(receivedTimestampStr);
        const carDataFilePath = "data/car_data.json";
        try {
            const existingDataStr = fs.readFileSync(carDataFilePath, 'utf8');
            const existingData = JSON.parse(existingDataStr);
            console.log("existingData: " + existingData);
            const existingTimestampStr = existingData["tmp"];
            if (existingTimestampStr) {
                const existingTimestamp = new Date(existingTimestampStr);
                return receivedTimestamp > existingTimestamp;
            } else {
                return true;
            }
        } catch (error) {
            console.error('Error reading file:', error);
            return false;
        }
    }
    return false;
}

app.post('/post/ldp/hb', (req, res) => {
    try {
        const receivedData = req.body;
        saveDataToFile('ldp_hb.json', receivedData);
        res.status(200).json({ message: 'Heartbeat data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing heartbeat data' });
    }
});

app.get('/get/ldp/hb', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'ldp_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.post('/post/car/hb', (req, res) => {
    try {
        const receivedData = req.body;
        const carId = receivedData["car_id"];
        switch (carId) {
            case "car1":
                saveDataToFile('car1_hb.json', receivedData);
                break;

            case "car2":
                saveDataToFile('car2_hb.json', receivedData);
                break;

            case "car3":
                saveDataToFile('car3_hb.json', receivedData);
                break;

            default:
                console.log("Error: Invalid car id");
        }
        res.status(200).json({ message: 'Heartbeat data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing heartbeat data' });
    }
});

app.get('/get/car/hb/1', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'car1_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});


app.get('/get/car/hb/2', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'car2_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});


app.get('/get/car/hb/3', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'car3_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.post('/post/car/data', async (req, res) => {
    console.log("Received car data");
    try {
        const receivedData = req.body;
        appendToJsonFile("ALLDATA.json", receivedData);
        const carId = receivedData["car_id"];
        const isNewer = await isNewerTimestamp(receivedData);
        console.log("isNewer:", isNewer);

        switch (carId) {
            case "car1":
                if (isNewer) {
                    saveDataToFile('car_data.json', receivedData);
                }
                saveDataToFile('car1_data.json', receivedData);
                break;

            case "car2":
                if (isNewer) {
                    saveDataToFile('car_data.json', receivedData);
                }
                saveDataToFile('car2_data.json', receivedData);
                break;

            case "car3":
                if (isNewer) {
                    saveDataToFile('car_data.json', receivedData);
                }
                saveDataToFile('car3_data.json', receivedData);
                break;

            default:
                console.log("Error: Invalid car id");
        }

        res.status(200).json({ message: 'Car data received successfully' });
    } catch (error) {
        console.error('Error processing car data:', error);
        res.status(500).json({ error: 'Error processing car data' });
    }
});

app.get('/get/car/data/1', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'car1_data.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.get('/get/car/data/2', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'car2_data.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.get('/get/car/data/3', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'car3_data.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.post('/post/cdp/hb', (req, res) => {
    try {
        const receivedData = req.body;
        saveDataToFile('cdp_hb.json', receivedData);
        res.status(200).json({ message: 'CDP heartbeat data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing cdp heartbeat data' });
    }
});

app.get('/get/cdp/hb', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + "cdp_hb.json", 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.post('/post/data', (req, res) => {
    try {
        const receivedData = req.body;
        appendToJsonFile("ALLDATA.json", receivedData);
        if (receivedData.topic.endsWith("up")) {
            receivedData.message
            const deviceID = JSON.parse(receivedData.message).end_device_ids.device_id;
            if (deviceID == 'fik8b') {
                saveDataToFile("fik8b.json", receivedData);
            }
            if (deviceID == 'px4') {
                saveDataToFile("px4.json", receivedData);
            }
        }
        else if (receivedData.topic.endsWith("solved")) {
            receivedData.message
            const deviceID = JSON.parse(receivedData.message).end_device_ids.device_id;
            if (deviceID == 'fik8b') {
                saveDataToFile("fik8bLocation.json", receivedData);
            }
            if (deviceID == 'px4') {
                saveDataToFile("px4Location.json", receivedData);
            }
        }
        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing data' });
    }
});

app.get('/get/fik8b', (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'fik8b.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        // const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        // const decodedData2 = JSON.parse(rawData2);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).json({ error: 'Error loading data' });
    }
});

app.get('/get/px4', (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'px4.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        // const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        // const decodedData2 = JSON.parse(rawData2);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).json({ error: 'Error loading data' });
    }
});

app.get('/get/car/data', (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'car_data.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        // const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        // const decodedData2 = JSON.parse(rawData2);
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).json({ error: 'Error loading data' });
    }
});

app.get('/', async (req, res) => {
    try {
        res.render('index');
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});