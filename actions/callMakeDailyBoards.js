const axios = require('axios');

const { TRELLO_MEMBER } = process.env;

const callNetlify = async () => {
    try {
        const scheduleResponse = await axios.post('/.netlify/functions/makeDailyBoards', { memberID: TRELLO_MEMBER });
        console.log(scheduleResponse);
    } catch (e) {
        console.log(e);
    }
};

callNetlify();
