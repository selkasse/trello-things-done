const express = require('express');
const cors = require('cors');

const app = express();

// * your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors({ origin: 'https://trello.com' }));

// * http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// * http://expressjs.com/en/starter/basic-routing.html
app.get("*", function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

// * listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
