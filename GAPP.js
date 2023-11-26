const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');



app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());


const fss = require('fs');

async function isNewerTimestamp(receivedData) {
    // Assuming the timestamp is stored in the "tmp" field
    const receivedTimestampStr = receivedData["tmp"];

    if (receivedTimestampStr) {
        const receivedTimestamp = new Date(receivedTimestampStr);

        // Load existing data from car_data.json
        const carDataFilePath = "data/car_data.json";

        try {
            const existingDataStr = await fss.promises.readFile(carDataFilePath, 'utf8');
            const existingData = JSON.parse(existingDataStr);

            const existingTimestampStr = existingData["tmp"];

            if (existingTimestampStr) {
                const existingTimestamp = new Date(existingTimestampStr);

                // Compare timestamps
                console.log(receivedTimestamp, existingTimestamp);
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

// Route to handle heartbeat data from FastAPI
app.post('/api/forward/ldp/hb', (req, res) => {
    try {
        const receivedData = req.body;

        // Process the received heartbeat data as needed
        console.log(receivedData);

        saveDataToFile('ldp_hb.json', receivedData);

        // You can save the data to a file or perform other operations

        res.status(200).json({ message: 'Heartbeat data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing heartbeat data' });
    }
});

app.get('/ldp/hb', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + 'ldp_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});


// Route to handle heartbeat data from FastAPI
app.post('/api/forward/car/hb', (req, res) => {
    try {
        const receivedData = req.body;

        // get the car id
        const carId = receivedData["car_id"];

        // Process the received heartbeat data as needed
        // console.log(receivedData);

        if (carId == "car1") {
            saveDataToFile('car1_hb.json', receivedData);
        }
        else if (carId == "car2") {
            saveDataToFile('car2_hb.json', receivedData);
        }
        else if (carId == "car3") {
            saveDataToFile('car3_hb.json', receivedData);
        }
        else {
            console.log("Error: Invalid car id");
        }

        // You can save the data to a file or perform other operations

        res.status(200).json({ message: 'Heartbeat data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing heartbeat data' });
    }
});

app.get('/car/hb/1', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + 'car1_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});


app.get('/car/hb/2', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + 'car2_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});


app.get('/car/hb/3', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + 'car3_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

// Route to handle car data from FastAPI
app.post('/api/forward/car/data', (req, res) => {
    console.log("Received car data");
    try {
        
        console.log("Received car data");
        const receivedData = req.body;

        console.log(receivedData);
        // car id
        const carId = receivedData["car_id"];
        
        console.log(isNewerTimestamp(receivedData));
        
        if (carId == "car1") {
            console.log(isNewerTimestamp(receivedData));
            if (isNewerTimestamp(receivedData)) {
                saveDataToFile('car_data.json', receivedData);
                saveDataToFile('car1_data.json', receivedData);
            }
            else {
                saveDataToFile('car1_data.json', receivedData);
            }
        }
        else if (carId == "car2") {
            if (isNewerTimestamp(receivedData)) {
                saveDataToFile('car_data.json', receivedData);
                saveDataToFile('car2_data.json', receivedData);
            }
            else {
                saveDataToFile('car2_data.json', receivedData);
            }
        }
        else if (carId == "car3") {
            if (isNewerTimestamp(receivedData)) {
                saveDataToFile('car_data.json', receivedData);
                saveDataToFile('car3_data.json', receivedData);
            }
            else {
                saveDataToFile('car3_data.json', receivedData);
            }
        }
        else {
            console.log("Error: Invalid car id");
        }


        res.status(200).json({ message: 'Car data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing car data' });
    }
});

app.get('/car/data/1', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + 'car1_data.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});
app.get('/car/data/2', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + 'car2_data.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});
app.get('/car/data/3', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + 'car3_data.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

// Route to handle cdp heartbeat data from FastAPI
app.post('/api/forward/cdp/hb', (req, res) => {
    try {
        const receivedData = req.body;

        // Process the received cdp heartbeat data as needed
        console.log(receivedData);

        // Save the CDP heartbeat data to cdp_hb_data.json (overwrite the file)
        saveDataToFile('cdp_hb.json', receivedData);

        res.status(200).json({ message: 'CDP heartbeat data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing cdp heartbeat data' });
    }
});



// Helper function to save data to a file
function saveDataToFile(filename, data) {
    try {
        // Write the data to the file, overwriting the existing content
        console.log("Saved to file: " + filename);
        fs.writeFileSync("data/" + filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data to file:', error);
    }
}

app.get('/cdp/hb', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync("data/" + "cdp_hb.json", 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});



// Route to send JSON data
app.get('/TTNfik8b', (req, res) => {
    try {
        //console.log("data/" + 'fik8b.json');
        const rawData = fs.readFileSync("data/" + 'fik8b.json', 'utf8');
        const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);

        console.log(decodedData);
        // Send JSON data as a response
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).json({ error: 'Error loading data' });
    }
});

// Route to render HTML
app.get('/', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'fik8b.json', 'utf8');
        const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);
        // Render the HTML template and include JSON data
        res.render('index', { data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.get('/api/get/data', async (req, res) => {
    try {
        const rawData = fs.readFileSync("data/" + 'data.json', 'utf8');
        const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);
        // Render the HTML template and include JSON data
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

// Route to receive JSON data via POST request
app.post('/api/post/data', (req, res) => {
    try {
        // Assuming you're expecting JSON data in the request body
        const receivedData = req.body;
        // Write the received data to a file (e.g., dataReceived.json)
        if (receivedData.topic.endsWith("up")) {
            fs.writeFileSync("data/" + "data.json", JSON.stringify(receivedData, null, 2));
        }
        else {
            fs.writeFileSync("data/" + "dataLocation.json", JSON.stringify(receivedData, null, 2));
        }

        console.log(receivedData);

        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing data' });
    }
});


// Route to send JSON data
app.get('/TTNpx4', (req, res) => {
    try {
        //console.log("data/" + 'fik8b.json');
        const rawData = fs.readFileSync("data/" + 'px4.json', 'utf8');
        const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);

        console.log(decodedData);
        // Send JSON data as a response
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).json({ error: 'Error loading data' });
    }
});

// Route to send JSON data
app.get('/Car', (req, res) => {
    try {
        //console.log("data/" + 'fik8b.json');
        const rawData = fs.readFileSync("data/" + 'car_data.json', 'utf8');
        const rawData2 = fs.readFileSync("data/" + 'dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);

        console.log(decodedData);
        // Send JSON data as a response
        res.json({ data: decodedData });
    } catch (error) {
        res.status(500).json({ error: 'Error loading data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});