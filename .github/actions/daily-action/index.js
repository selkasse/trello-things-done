/*
    //* This file utilizes GitHub actions to send a request to our Netlify lambda function
    //* It is named index.js because that is what they named the file in the GitHub documentation
    //* https://help.github.com/en/actions/building-actions/creating-a-javascript-action
*/
const axios = require('axios');
// const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');



// const { TRELLO_MEMBER } = process.env;
const setup = () => {
    const app = express();

    // * your manifest must have appropriate CORS headers, you could also use '*'
    app.use(cors({ origin: 'https://netlify.com' }));

    // * http://expressjs.com/en/starter/static-files.html
    app.use(express.static('dist'));

    // * http://expressjs.com/en/starter/basic-routing.html
    app.get('*', function (request, response) {
        response.sendFile(`${__dirname}/index.js`);
    });

    // * listen for requests :)
    const listener = app.listen(8000, function () {
        console.log(`Your app is listening on port ${listener.address().port}`);
    });
}
const callNetlify = async () => {

    try {
        await axios.post(
            'http://youthful-elion-cdcea9.netlify.app/.netlify/functions/makeDailyBoards'
        ).then(res => console.log(res)).catch(e => console.log(e))
      
    } catch (e) {
        console.log(e);
    }
};

setup();
callNetlify();

