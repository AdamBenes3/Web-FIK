const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');



app.set('view engine', 'ejs');
app.set('views', 'views');

// Route to send JSON data
app.get('/api/data', (req, res) => {
    try {
        const rawData = fs.readFileSync('data.json', 'utf8');
        const rawData2 = fs.readFileSync('dataLocation.json', 'utf8');
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
        const rawData2 = fs.readFileSync('dataLocation.json', 'utf8');
        const decodedData = JSON.parse(rawData);
        const decodedData2 = JSON.parse(rawData2);
        // Render the HTML template and include JSON data
        res.render('index', { data: decodedData});
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
        // Render the HTML template and include JSON data
        res.json({ data: decodedData});
    } catch (error) {
        res.status(500).send('Error rendering the page');
    }
});

// Route to receive JSON data via POST request
app.post('/api/get/data', (req, res) => {
    try {
        // Assuming you're expecting JSON data in the request body
        const receivedData = req.body;
        console.log(receivedData);
        // Process the received data as needed

        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});