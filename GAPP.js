const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');



app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());


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
        const rawData = fs.readFileSync('ldp_hb.json', 'utf8');
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

        // Process the received heartbeat data as needed
        console.log(receivedData);

        saveDataToFile('car_hb.json', receivedData);

        // You can save the data to a file or perform other operations

        res.status(200).json({ message: 'Heartbeat data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing heartbeat data' });
    }
});

app.get('/car/hb', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync('car_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

// Route to handle car data from FastAPI
app.post('/api/forward/car/data', (req, res) => {
    try {
        const receivedData = req.body;

        // Process the received car data as needed
        console.log(receivedData);

        // You can save the data to a file or perform other operations
        saveDataToFile('car_data.json', receivedData);

        res.status(200).json({ message: 'Car data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing car data' });
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
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data to file:', error);
    }
}

app.get('/cdp/hb', async (req, res) => {
    try {
        // Render the HTML template and include JSON data
        const rawData = fs.readFileSync('cdp_hb.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        res.json({ data: decodedData });

        console.log(decodedData);
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

// old -------------------



// Route to send JSON data
app.get('/api/data', (req, res) => {
    try {
        const rawData = fs.readFileSync('data.json', 'utf8');
        const rawData2 = fs.readFileSync('dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);
        print("HEEEEEEEJ")

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
        const rawData = fs.readFileSync('data.json', 'utf8');
        const rawData2 = fs.readFileSync('dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);
        print("HEEEEEEEJ")
        // Render the HTML template and include JSON data
        res.render('index', { data: decodedData });
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

app.get('/api/get/data', async (req, res) => {
    try {
        const rawData = fs.readFileSync('data.json', 'utf8');
        const rawData2 = fs.readFileSync('dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);
        print("HEEEEEEEJ")
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
            fs.writeFileSync('data.json', JSON.stringify(receivedData, null, 2));
        }
        else {
            fs.writeFileSync('dataLocation.json', JSON.stringify(receivedData, null, 2));
        }
        
        console.log(receivedData);

        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});