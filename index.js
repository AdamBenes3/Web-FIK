const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const mqtt = require('mqtt');
const config = require('./config.json'); // Assuming config.json is in the same directory

const serverAddress = 'eu1.cloud.thethings.network:1883';
const username = config.username;
const password = config.password;

// Replace with your TTN Application ID, Device ID, and the specific topic you want to subscribe to
const applicationId = 'balloons';
const deviceId = 'fik8b';
const topic = `#`;

// Create an MQTT client instance
const client = mqtt.connect(`mqtt://${serverAddress}`, {
    username,
    password,
});

// Handle MQTT connection events
client.on('connect', () => {
    console.log('Connected to TTN MQTT broker');

    // Subscribe to the specified topic
    client.subscribe(topic, (error) => {
        if (!error) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error(`Subscription error: ${error}`);
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`Received message on topic: ${topic}, Message: ${message.toString()}`);
    // Handle the received message
    const receivedData = {
        topic,
        message: message.toString(),
        timestamp: new Date().toISOString(),
    };

    // Convert the data to JSON format
    const jsonData = JSON.stringify(receivedData, null, 2);

    // Write the data to the data.json file, overwriting its contents
    fs.writeFileSync('data.json', jsonData);

    // Append the data to a dataHistory.json file
    fs.appendFile('dataHistory.json', jsonData + '\n', (err) => {
        if (err) {
            console.error('Error appending data to dataHistory.json:', err);
        } else {
            console.log('Data appended to dataHistory.json');
        }
    });
});

// Handle MQTT connection errors
client.on('error', (error) => {
    console.error(`MQTT connection error: ${error}`);
});



app.set('view engine', 'ejs'); // Set the view engine to EJS
app.set('views', 'views'); // Set the directory for EJS templates

app.get('/', async (req, res) => {
    try {

        // Read data from the data.json file
        const rawData = fs.readFileSync('data.json', 'utf8');
        const decodedData = JSON.parse(rawData);

        //const decodedData = decodePayload(mockData);
        res.render('index', { data: decodedData });
        //res.render('index', { data: mockData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
