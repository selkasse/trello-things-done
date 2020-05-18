/*
    //* This file utilizes GitHub actions to send a request to our Netlify lambda function
    //* It is named index.js because that is what they named the file in the GitHub documentation
    //* https://help.github.com/en/actions/building-actions/creating-a-javascript-action
*/
const axios = require('axios');
const fetch = require('node-fetch');


// const { TRELLO_MEMBER } = process.env;
const callNetlify = async () => {

    try {
        await axios.post(
            'https://youthful-elion-cdcea9.netlify.app/.netlify/functions/makeDailyBoards'
        ).then(res => console.log(res)).catch(e => console.log(e))
      
    } catch (e) {
        console.log(e);
    }
};

callNetlify();

