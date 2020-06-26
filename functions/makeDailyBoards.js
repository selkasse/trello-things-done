import wait from 'waait';

const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const faunadb = require('faunadb');

exports.handler = function(event, context, callback) {
    const q = faunadb.query;
    const client = new faunadb.Client({
        secret: process.env.TTD_FAUNA_SECRET,
    });
    const { BOARDS_URL, LISTS_URL, CARDS_URL, TRELLO_KEY, TRELLO_TOKEN, TRELLO_MEMBER } = process.env;

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

    const getCardById = async id => {
        const URL = `${CARDS_URL}/${id}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;
        try {
            const card = await axios.get(URL);
            return card.data;
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
            axios.post(URL).catch(e => console.log(e));
        } catch (e) {
            console.log(e);
        }
    };

    const queryScheduledCards = async date => {
        const cards = [];

        await client
            .query(q.Map(q.Paginate(q.Match(q.Index('scheduled_date'), date)), q.Lambda('card', q.Get(q.Var('card')))))
            .then(ret => {
                const retData = ret.data;
                retData.forEach(el => cards.push(el));
            })
            .catch(e => console.log(e));

        return cards;
    };

    // * populate the scheduled card data
    const processCardsFromDb = async cards => {
        // * use map with Promise.all to return the array asynchronously
        const promises = cards.map(async card => {
            const cardData = await getCardById(card.data.cardID);
            return cardData;
        });
        const results = await Promise.all(promises);
        return results;
    };
    const moveLists = async (pendingLists, newBoard) => {
        const lists = await getLists(newBoard);
        const toDo = findList(lists, 'To Do');

        // console.log(`pendingLists: ${JSON.stringify(pendingLists)}`);

        let moveToDoListURL;
        let moveQueuedListURL;
        let moveDoingListURL;
        // TODO : check if there is a card in the list before moving
        pendingLists.forEach(async list => {
            if (!moveToDoListURL) {
                moveToDoListURL = `${LISTS_URL}/${list.id}/moveAllCards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&idBoard=${newBoard.id}&idList=${toDo.id}`;
            } else if (!moveQueuedListURL) {
                moveQueuedListURL = `${LISTS_URL}/${list.id}/moveAllCards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&idBoard=${newBoard.id}&idList=${toDo.id}`;
            } else {
                moveDoingListURL = `${LISTS_URL}/${list.id}/moveAllCards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&idBoard=${newBoard.id}&idList=${toDo.id}`;
            }
        });

        console.log(`
            moveToDoListURL: ${moveToDoListURL}********* 
            moveQueuedListURL: ${moveQueuedListURL}*********
            moveDoingListURL: ${moveDoingListURL}*********
        `);
        const moveToDoRequest = axios.post(moveToDoListURL);
        await wait(10000);
        const moveQueuedRequest = axios.post(moveQueuedListURL);
        await wait(10000);
        const moveDoingRequest = axios.post(moveDoingListURL);

        axios
            .all([moveToDoRequest, moveQueuedRequest, moveDoingRequest])
            .then(
                axios.spread((...responses) => {
                    const toDoResponse = responses[0];

                    const queuedResponse = responses[1];

                    const doingResponse = responses[2];
                    // * use/access the results
                })
            )
            .catch(errors => {
                // * react on errors.
                console.log(errors);
            });
    };
    // * add all cards that were not put into the 'Done' list to today's scheduled board
    const populateToDo = async (board, pendingLists) => {
        const lists = await getLists(board);
        const toDo = findList(lists, 'To Do');
        const date = moment();
        const formattedDate = date.format('YYYY-MM-DD');

        // * get scheduled cards for today
        const cardsFromDB = await queryScheduledCards(formattedDate);
        const scheduledCards = await processCardsFromDb(cardsFromDB);
        scheduledCards.forEach(async card => {
            await addCardToList(card, toDo);
        });

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
    const createBoard = async () => {
        const today = moment();
        const boardName = makeBoardName(today);
        const URL = `
            ${BOARDS_URL}/?name=${boardName}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}
        `;
        // * create the board with a POST request
        let board;
        await axios
            .post(URL)
            .then(async function(res) {
                board = res.data;
                // *  create the 'Queued' List, as the board comes with Todo/Doing/Done by default
                await createList(board.id, 'Queued').catch(e => console.log(e));
            })
            .catch(e => console.log(e));
        return board;
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
            const boardsResponse = await axios
                .post('https://youthful-elion-cdcea9.netlify.app/.netlify/functions/getMemberBoards', data, config)
                .catch(e => console.log(e));

            const memberBoards = boardsResponse.data;

            for (let i = 0; i < memberBoards.length; i += 1) {
                if (memberBoards[i].name === getYesterday()) {
                    // * return the board if the name is TTD <yesterday's date>
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

    const deleteScheduledCardsFromDB = async date =>
        client.query(q.Delete(q.Select('ref', q.Get(q.Match(q.Index('scheduled_date'), date)))));

    const closeBoard = async board => {
        const URL = `${BOARDS_URL}/${board.id}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&closed=true`;

        await axios.put(URL).catch(e => console.log(e));
    };

    // * main logic for makeDailyBoards is housed in this function
    const makeBoards = async () => {
        // * run the job at 02:30 a.m. every day (from GitHub actions cron job)
        /**
        @param x1b[42m: gives the console log a green background
        @param x1b[0m: sets the background color back to default after the log completes
        */
        console.log('\x1b[42m', `RUNNING JOB AT 02:30 a.m. every day`, '\x1b[0m');

        const boardYesterday = await getBoardYesterday().catch(e => console.log(e));
        if (boardYesterday) {
            // * get the lists from yesterday's board
            const listsYesterday = await getLists(boardYesterday).catch(e => console.log(e));
            console.log(`listsYesterday: ${JSON.stringify(listsYesterday)}`);
            // * separate the 'Done' list from the other lists
            const { doneList, pendingLists } = splitLists(listsYesterday);
            const newBoard = await createBoard(pendingLists);
            await wait(20000);
            await moveLists(pendingLists, newBoard);
            await wait(20000);
            await closeBoard(boardYesterday);
        }
        // TODO: delete cards that were scheduled for yesterday from the SCHEDULED_CARDS collection
        const yesterday = moment().subtract(1, 'days');
        const formattedYesterday = yesterday.format('YYYY-MM-DD');

        const cardsYesterday = await queryScheduledCards(formattedYesterday);
        if (cardsYesterday.length > 0) {
            console.log('there were cards scheduled for yesterday');
            cardsYesterday.forEach(async () => {
                await deleteScheduledCardsFromDB(formattedYesterday);
            });
        } else {
            console.log('no cards scheduled for yesterday');
        }

        send();
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
