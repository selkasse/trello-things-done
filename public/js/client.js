// eslint-disable-next-line no-undef
const { Promise } = TrelloPowerUp;

const CHECK_MARK_ICON = 'https://img.icons8.com/material/24/000000/check-all.png';
const MASTER_ICON_DARK = 'https://img.icons8.com/material/96/000000/master.png';
const MASTER_ICON_LIGHT = 'https://img.icons8.com/material-outlined/96/000000/master.png';

const onCardBtnClick = function(t) {
    return t.popup({
        title: 'Add to future board',
        url: '/public/schedule.html',
    });
};

const onBoardBtnClick = function(t) {
    return t.popup({
        title: 'Change Master Board',
        url: '/public/master.html',
    });
};

// ! DO NOT DELETE
// !!!!!!!!!!!!!!!
// const getID = async () => {
//     const ID = await (await fetch('http://localhost:9000/getMemberID')).json();
//     return ID;
// }

// getID().then((id) => {
//     const h2 = document.getElementById('member');
//     h2.innerHTML += ` ${id}`;
// })
// !!!!!!!!!!!!!!!
// ! DO NOT DELETE
const getBoards = async id => {
    console.log('inside getBoards');
    const data = { memberID: id };
    let boards;
    await fetch('/.netlify/functions/getMemberBoards', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    })
        .then(res => res.json())
        .then(res => {
            boards = res;
        });
    return boards;
};

const getEnabledBoards = async boards => {
    console.log('inside getEnabledBoards');

    // console.log(boards);
    const data = { boards };
    let enabledBoards;
    await fetch('/.netlify/functions/getEnabledBoards', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    })
        .then(res => res.json())
        .then(res => {
            enabledBoards = res;
        });
    return enabledBoards;
};

const initDailyBoards = async id => {
    console.log('init daily boards in client.js');
    const data = { memberID: id };
    await fetch('/.netlify/functions/makeDailyBoards', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    }).catch(e => console.log(e));
};

const getShortUrl = function(id, boards) {
    const board = boards.find(foundBoard => foundBoard.id === id);
    return board.shortUrl;
};

let memberBoards;
let enabledBoards;
let config;
let cron;
// eslint-disable-next-line no-undef
TrelloPowerUp.initialize({
    'board-buttons': async function(t) {
        // * initialize variables to be used for configParams
        const currentMember = t.getContext().member;

        try {
            cron = await t.get('organization', 'shared', 'cron', false);
            // cron = JSON.stringify(cronResponse);
        } catch (e) {
            console.log(e);
        }

        console.log(cron);
        if (!cron) {
            console.log('inside cron block in board-buttons');
            await initDailyBoards(currentMember);
            await t.set('organization', 'shared', 'cron', true).catch(e => console.log(e));
        }

        try {
            const configResponse = await t.get('organization', 'shared', 'config', 'not set');
            config = JSON.stringify(configResponse);
        } catch (e) {
            console.log(e);
        }
        // console.log(config);
        if (config === 'not set') {
            await getBoards(currentMember).then(function(boards) {
                memberBoards = boards;
            });

            // TODO: in master.js, only add to the dropdown if cron is false
            await getEnabledBoards(memberBoards).then(function(boards) {
                // console.log(boards);
                enabledBoards = boards;
            });

            // * populate configParams when the board loads
            const configParams = {
                currentMember,
                memberBoards,
                enabledBoards,
            };

            await t.set('organization', 'shared', 'config', enabledBoards).catch(e => console.log(e));
            // window.localStorage.setItem('config', JSON.stringify(configParams));
        }
        return [
            {
                icon: {
                    dark: MASTER_ICON_DARK,
                    light: MASTER_ICON_LIGHT,
                },
                text: 'Master Board',
                callback: onBoardBtnClick,
                condition: 'edit',
            },
        ];
    },
    // * only show card buttons if master board
    'card-buttons': function(t) {
        return t.get('member', 'shared', 'masterBoard').then(function(masterBoard) {
            // const { memberBoards } = JSON.parse(window.localStorage.getItem('config'));
            console.log(memberBoards);
            const splitMaster = masterBoard.split(',');
            const { shortUrl, id } = splitMaster;
            console.log(shortUrl);
            console.log(id);
            // const currentBoard = getShortUrl(t.getContext().board, memberBoards);
            // console.log(masterBoard);
            // console.log(currentBoard);
            // const isMaster = currentBoard === masterBoard;
            // return [
            //     {
            //         icon: isMaster ? CHECK_MARK_ICON : null,
            //         text: isMaster ? 'GTD' : null,
            //         callback: onCardBtnClick,
            //     },
            // ];
        });
    },
    'card-badges': function(t) {
        return t.get('member', 'shared', 'masterBoard').then(function(masterBoard) {
            const { memberBoards } = JSON.parse(window.localStorage.getItem('config'));
            const currentBoard = getShortUrl(t.getContext().board, memberBoards);
            const isMaster = currentBoard === masterBoard;
            return t.get('card', 'shared', 'schedule').then(function(schedule) {
                if (isMaster) {
                    return [
                        {
                            icon: schedule ? CHECK_MARK_ICON : null,
                            text: schedule || null,
                        },
                    ];
                }
            });
        });
    },
    // * only show card detail badges if master board
    'card-detail-badges': function(t) {
        return t.get('member', 'shared', 'masterBoard').then(function(masterBoard) {
            const { memberBoards } = JSON.parse(window.localStorage.getItem('config'));
            const currentBoard = getShortUrl(t.getContext().board, memberBoards);
            const isMaster = currentBoard === masterBoard;
            if (isMaster) {
                return t.get('card', 'shared', 'schedule').then(function(schedule) {
                    return [
                        {
                            title: 'Schedule',
                            color: schedule ? 'green' : 'blue',
                            text: schedule ? `Scheduled for ${schedule}` : 'Schedule for a future board',
                            callback: onCardBtnClick,
                        },
                    ];
                });
            }
        });
    },
});
