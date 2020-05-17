/*
    //* This file utilizes GitHub actions to send a request to our Netlify lambda function
    //* It is named index.js because that is what they named the file in the GitHub documentation
    //* https://help.github.com/en/actions/building-actions/creating-a-javascript-action
*/
const axios = require('axios');
const core = require('@actions/core');
const github = require('@actions/github');

const { TRELLO_MEMBER } = process.env;

const callNetlify = async () => {
    try {
        const scheduleResponse = await axios.post(
            'https://youthful-elion-cdcea9.netlify.app/.netlify/functions/makeDailyBoards',
            { memberID: TRELLO_MEMBER }
        );
        console.log(scheduleResponse);
    } catch (e) {
        console.log(e);
    }
};

callNetlify();
