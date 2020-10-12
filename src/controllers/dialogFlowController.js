const fetch = require('node-fetch');
const base64 = require('base-64');
const { promises: fs} = require('fs');

const config = require('./../config/config.json');
const keys = require('./../config/keys.json');

exports.analyzeRequest = async (req, res) => {
    const fetchResponse = await fetch(config.endpoints.translateAPI, {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + base64.encode(`apikey:${keys.translateApiKey}`)
        },
        body: JSON.stringify({
            text: [req.body.queryResult.queryText],
            model_id: 'es-en'
        })
    });
    
    const json = await fetchResponse.json();

    const text = encodeURI(json.translations[0].translation);

    const uri = config.endpoints.sentimentsAPI.replace('MESSAGE', text);

    const fetchSentiments = await fetch(uri, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + base64.encode(`apikey:${keys.sentimentsApiKey}`)
        },
    });

    const jsonSentiments = await fetchSentiments.json();

    jsonSentiments.document_tone.tones.sort((a, b) => a.score - b.score);

    const sentiment = jsonSentiments.document_tone.tones[0];

    if (sentiment)
    {
        try {
            data = await fs.readFile(config.dbSentiments, 'utf8');
            obj = JSON.parse(data);

            if (obj[sentiment.tone_name] === null)
            {
                obj[sentiment.tone_name] = 0;
            }

            obj[sentiment.tone_name] += 1;
            obj.feedback.push(decodeURI(req.body.queryResult.queryText));
            j = JSON.stringify(obj);
            
            await fs.writeFile(config.dbSentiments, j, 'utf8');

        } catch (e) {
            res.status(500).send('An unexpected error occurred!');
        } 
    }  
    
    res.status(200).end();
};

exports.getData = async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*')
        let data = await fs.readFile(config.dbSentiments, 'utf8');
        res.status(200).send(data);
    } catch (e)
    {
        res.status(500).send('An unexpected error occurred!');
    }
};