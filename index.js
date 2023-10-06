const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const mqtt = require('mqtt');
const config = require('./config.json');

const serverAddress = 'eu1.cloud.thethings.network:1883';
const username = config.username;
const password = config.password;

// Replace with your TTN Application ID, Device ID, and the specific topic you want to subscribe to
const applicationId = 'balloons';
const deviceId = 'fik8b';
const topic = `#`;

const client = mqtt.connect(`mqtt://${serverAddress}`, {
    username,
    password,
});

client.on('connect', () => {
    console.log('Connected to TTN MQTT broker');

    client.subscribe(topic, (error) => {
        if (!error) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error(`Subscription error: ${error}`);
        }
    });
});

var which_file = true;

client.on('message', (topic, message) => {
    console.log(`Received message on topic: ${topic}, Message: ${message.toString()}`);
    const receivedData = {
        topic,
        message: message.toString(),
        timestamp: new Date().toISOString(),
    };

    const jsonData = JSON.stringify(receivedData, null, 2);

    if (which_file) {
        fs.writeFileSync('data.json', jsonData);
        which_file = false;
    } else {
        fs.writeFileSync('data2.json', jsonData);
        which_file = true;
    }

    fs.appendFile('dataHistory.json', jsonData + '\n', (err) => {
        if (err) {
            console.error('Error appending data to dataHistory.json:', err);
        } else {
            console.log('Data appended to dataHistory.json');
        }
    });
});

client.on('error', (error) => {
    console.error(`MQTT connection error: ${error}`);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

// Route to send JSON data
app.get('/api/data', (req, res) => {
    try {
        const rawData = fs.readFileSync('data.json', 'utf8');
        const rawData2 = fs.readFileSync('data2.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);

        console.log(decodedData);
        // Send JSON data as a response
        res.json({ data: decodedData});
    } catch (error) {
        res.status(500).json({ error: 'Error loading data' });
    }
});

// Route to render HTML
app.get('/', async (req, res) => {
    try {
        const rawData = fs.readFileSync('data.json', 'utf8');
        const rawData2 = fs.readFileSync('data2.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);
        
        var daticka = {
            "topic": "v3/balloons@ttn/devices/fik8a/up",
            "message": "{\"end_device_ids\":{\"device_id\":\"fik8a\",\"application_ids\":{\"application_id\":\"balloons\"},\"dev_eui\":\"3C56A000A0000064\",\"dev_addr\":\"26011828\"},\"correlation_ids\":[\"gs:uplink:01HC2S1KTHVCEH508RK8V4QR98\"],\"received_at\":\"2023-10-06T15:17:38.464099702Z\",\"uplink_message\":{\"f_port\":1,\"f_cnt\":12247,\"frm_payload\":\"DwyHcTADnYMEAAIA9gi/AAE=\",\"decoded_payload\":{\"alt_m\":246,\"alt_okay\":1,\"course\":34.984375,\"course_okay\":1,\"lat\":50.11628341674805,\"latlon_age_s\":2,\"latlon_okay\":1,\"lon\":14.461121559143066,\"speed_mps\":0.0625,\"speed_okay\":0},\"rx_metadata\":[{\"gateway_ids\":{\"gateway_id\":\"crreat3\",\"eui\":\"58A0CBFFFE802F94\"},\"time\":\"2023-10-06T15:17:38.182800054Z\",\"timestamp\":1863533116,\"rssi\":-53,\"channel_rssi\":-53,\"snr\":11.25,\"location\":{\"latitude\":50.1163816927179,\"longitude\":14.4611111283302,\"altitude\":259,\"source\":\"SOURCE_REGISTRY\"},\"uplink_token\":\"ChUKEwoHY3JyZWF0MxIIWKDL//6AL5QQvITN+AYaCwiSyoCpBhCv+PF6IOD06pmeswE=\",\"received_at\":\"2023-10-06T15:17:38.184495382Z\"}],\"settings\":{\"data_rate\":{\"lora\":{\"bandwidth\":125000,\"spreading_factor\":10,\"coding_rate\":\"4/5\"}},\"frequency\":\"868100000\",\"timestamp\":1863533116,\"time\":\"2023-10-06T15:17:38.182800054Z\"},\"received_at\":\"2023-10-06T15:17:38.258632057Z\",\"consumed_airtime\":\"0.452608s\",\"locations\":{\"frm-payload\":{\"latitude\":50.11628341674805,\"longitude\":14.461121559143066,\"source\":\"SOURCE_GPS\"}},\"network_ids\":{\"net_id\":\"000013\",\"tenant_id\":\"ttn\",\"cluster_id\":\"eu1\",\"cluster_address\":\"eu1.cloud.thethings.network\"}}}",
            "timestamp": "2023-10-06T15:17:39.483Z"
        }
        

        // Render the HTML template and include JSON data
        res.render('index', { data: decodedData});
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
