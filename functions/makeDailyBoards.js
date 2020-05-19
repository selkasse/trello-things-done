const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');

exports.handler = function(event, context, callback) {
    const { BOARDS_URL, LISTS_URL, CARDS_URL, TRELLO_KEY, TRELLO_TOKEN, TRELLO_MEMBER } = process.env;
    // const { memberID } = JSON.parse(event.body);

    const createList = async (id, listName) => {
        // * pos=17000 is so that the list is placed between 'To Do' and 'Doing'
        // * if you query the lists on a board, you will see they have positions in the thousands
        const URL = `${BOARDS_URL}/${id}/lists?name=${listName}&pos=17000&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;
        axios.post(URL).catch(function(e) {
            console.log(e);
        });
    };

    // * get all lists from a board
    const getLists = async board => {
        const URL = `${BOARDS_URL}/${board.id}/lists?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;

        try {
            const lists = await axios.get(URL);
            return lists.data;
        } catch (e) {
            console.log(e);
        }
    };

    // * get all cards from a list
    const getCards = async list => {
        const URL = `
        ${LISTS_URL}/${list.id}/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}
        `;
        try {
            const cards = await axios.get(URL);
            return cards.data;
        } catch (e) {
            console.log(e);
        }
    };

    // * find a list by name
    const findList = (lists, name) => {
        for (let i = 0; i < lists.length; i += 1) {
            if (lists[i].name === name) {
                return lists[i];
            }
        }
    };

    const addCardToList = async (card, list) => {
        const URL = `${CARDS_URL}?idList=${list.id}&name=${card.name}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;
        try {
            axios.post(URL);
        } catch (e) {
            console.log(e);
        }
    };

    // * add all cards that were not put into the 'Done' list to today's scheduled board
    const populateToDo = async (board, pendingLists) => {
        const lists = await getLists(board);
        const toDo = findList(lists, 'To Do');
        pendingLists.forEach(async list => {
            const cards = await getCards(list);
            cards.forEach(async card => {
                await addCardToList(card, toDo);
            });
        });
    };

    // * takes in a date, and returns a name in the format 'TTD M-DD-YYYY'
    // * note that 'TTD' has nothing to do with the date, but is a signifier that the board was auto-generated
    const makeBoardName = date => `TTD ${date.month() + 1}-${date.date()}-${date.year()}`;

    // * takes in pending items from yestrday's board, and creates a new board with the pending items in 'To Do'
    const createBoard = async pendingLists => {
        const today = moment();
        const boardName = makeBoardName(today);
        const URL = `
            ${BOARDS_URL}/?name=${boardName}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}
        `;
        // * create the board with a POST request
        await axios
            .post(URL)
            .then(async function(res) {
                const board = res.data;
                // *  create the 'Queued' List, as the board comes with Todo/Doing/Done by default
                await createList(board.id, 'Queued').catch(e => console.log(e));
                await populateToDo(board, pendingLists).catch(e => console.log(e));
            })
            .catch(e => console.log(e));
    };

    // * returns the name of the board that was created automatically yesterday
    const getYesterday = () => {
        const yesterday = moment().subtract(1, 'days');
        return makeBoardName(yesterday);
    };

    // * returns the board that was created automatically yesterday
    const getBoardYesterday = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                },
            };
            const data = { memberID: TRELLO_MEMBER };
            const boardsResponse = await axios.post(
                'https://youthful-elion-cdcea9.netlify.app/.netlify/functions/getMemberBoards',
                data,
                config
            );
            // .then(res => console.log('\x1b[42m', res, '\x1b[0m'))
            // .catch(e => console.log(console.log('\x1b[42m', e, '\x1b[0m')));
            const memberBoards = boardsResponse.data;
            console.log('\x1b[42m', memberBoards, '\x1b[0m');
            for (let i = 0; i < memberBoards.length; i += 1) {
                if (memberBoards[i].name === getYesterday()) {
                    console.log(
                        '\x1b[41m',
                        `board with shortUrl ${memberBoards[i].shortUrl} and name ${memberBoards[i].name} will be deleted`,
                        '\x1b[0m'
                    );
                    return memberBoards[i];
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    // * sends a response back to the client when the makeDailyBoards function is called
    const send = () => {
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            },
            body: JSON.stringify('A job has been scheduled to run at 02:30 a.m. every morning'),
        });
    };

    // * separates the 'Done' list from other lists on the board
    const splitLists = lists => {
        let doneList;
        const pendingLists = [];
        lists.forEach(list => {
            if (list.name === 'Done') {
                doneList = list;
            } else {
                pendingLists.push(list);
            }
        });
        return { doneList, pendingLists };
    };

    const deleteBoard = async board => {
        const URL = `${BOARDS_URL}/${board.id}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;
        try {
            await axios.delete(URL);
        } catch (e) {
            console.log(e);
        }
    };

    // * main logic for makeDailyBoards is housed in this function
    const makeBoards = async () => {
        console.log('\x1b[42m', `makeBoards has been called!`, '\x1b[0m');
        // * run the job at 02:30 a.m. every day
        // cron.schedule('30 2 * * *', async function() {
        /**
            @param x1b[42m: gives the console log a red background
            @param x1b[0m: sets the background color back to default after the log completes
            */
        console.log('\x1b[42m', `RUNNING JOB AT 02:30 a.m. every day`, '\x1b[0m');

        const boardYesterday = await getBoardYesterday().catch(e => console.log(e));
        // * get the lists from yesterday's board
        const listsYesterday = await getLists(boardYesterday).catch(e => console.log(e));
        // * separate the 'Done' list from the other lists
        const { doneList, pendingLists } = splitLists(listsYesterday);
        const doneCards = await getCards(doneList);
        await createBoard(pendingLists);
        await deleteBoard(boardYesterday);

        send();
        // });
    };

    // * kick off the function when the client sends a request to makeDailyBoards
    makeBoards();
};

// TODO : cards that were moved to 'Done' in yesterday's board will be moved to 'Done' in the master board, unless they are marked as 'repeatable', in which case they will go back to the list they came from on the Master Board

// TODO : cards that were left in 'To Do', 'Queued', or 'Doing' will also be moved back to their original list in the master board, but with some sort of indication (❌?) that they were not completed

// TODO : check if there were any cards scheduled for today
// TODO : if so, add those cards to this board's 'TO DO' list

// TODO : get the board into an object
// TODO : save a property on the board like 'cron' and set it to true

// TODO : check if the card came from a scheduled action
// TODO : if so, add it back to the original list
// TODO : if not, that means it was added after the board was created
// TODO :   in which case, these cards will go into a 'Recycled' list on the master board
