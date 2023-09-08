const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

// Read the configuration from the JSON file
const configPath = './config.json';

let ttnEndpoint, apiKey;

try {
  const configData = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configData);
  ttnEndpoint = config.ttnEndpoint;
  apiKey = config.apiKey;
} catch (err) {
  console.error('Error reading configuration file:', err);
  process.exit(1); // Exit the application if there's an error reading the config file
}


// Fetch data from The Things Network
const fetchData = async () => {
    try {
        const response = await axios.get(ttnEndpoint, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Mock data
const mockData = {
    temperature: 25.5,
    height: 60,
    sensorName: "Example Sensor",
};


app.set('view engine', 'ejs'); // Set the view engine to EJS
app.set('views', 'views'); // Set the directory for EJS templates

app.get('/', async (req, res) => {
    try {
        //const rawData = await fetchData();
        //const decodedData = decodePayload(rawData);
        res.render('index', { data: mockData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
