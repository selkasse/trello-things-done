const express = require('express');
const cors = require('cors');

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