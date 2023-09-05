const express = require('express');
const app = express();
const port = 3000;

// Must be connected with TTN
//const ttnEndpoint = '';
//const apiKey = '';

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
