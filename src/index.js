const express = require('express');
const bodyParser = require('body-parser');

const dialogFlowController = require('./controllers/dialogFlowController');
const config = require('./config/config.json');

const app = express();
const PORT = config.port;

app.use(bodyParser.json());

app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });

app.get('/data', dialogFlowController.getData);

app.post('/hook', dialogFlowController.analyzeRequest);
