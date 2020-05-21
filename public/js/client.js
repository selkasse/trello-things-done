// import moment from '../../node_modules/moment/src/moment.js';

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

const getShortUrl = async function(boardID) {
    const data = { boardID };
    let shortUrl;
    await fetch('/.netlify/functions/getShortUrl', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    })
        .then(res => res.json())
        .then(res => {
            shortUrl = res;
        });
    return shortUrl;

    // const board = boards.find(foundBoard => foundBoard.id === id);
    // return board.shortUrl;
};

// eslint-disable-next-line no-undef
TrelloPowerUp.initialize({
    'board-buttons': async function(t) {
        // * initialize variables to be used for configParams
        let memberBoards;
        let enabledBoards;
        let config;
        let shortUrl;
        const currentMember = t.getContext().member;
        const currentBoard = t.getContext.board;

        try {
            const shortUrlResponse = await t.get('member', 'shared', 'currentShortUrl', 'not set');
            shortUrl = JSON.stringify(shortUrlResponse);
        } catch (e) {
            console.log(e);
        }

        console.log(shortUrl);

        if (shortUrl === 'not set') {
            await getShortUrl(currentBoard).then(async function(url) {
                console.log(url);
                await t.set('member', 'shared', 'currentShortUrl', url);
            });
        }

        try {
            const configResponse = await t.get('organization', 'shared', 'config', 'not set');
            config = JSON.stringify(configResponse);
        } catch (e) {
            console.log(e);
        }
        if (config === 'not set') {
            await getBoards(currentMember).then(function(boards) {
                memberBoards = boards;
            });

            await getEnabledBoards(memberBoards).then(function(boards) {
                enabledBoards = boards;
            });

            // * populate configParams when the board loads
            // const configParams = {
            //     currentMember,
            //     memberBoards,
            //     enabledBoards,
            // };

            await t.set('organization', 'shared', 'config', enabledBoards).catch(e => console.log(e));
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
        return t.get('member', 'shared', 'masterBoard').then(async function(masterBoard) {
            // const { memberBoards } = JSON.parse(window.localStorage.getItem('config'));
            // console.log(memberBoards);
            const splitMaster = masterBoard.split(',');
            const masterShortUrl = splitMaster[0];
            const masterID = splitMaster[1];
            const currentShortUrl = await t.get('organization', 'shared', 'currentShortUrl');
            // console.log(enabledBoards);
            // console.log(t.getContext());
            const currentBoard = t.getContext().board;
            console.log(currentShortUrl);
            // console.log(currentBoard);
            const isMaster = currentShortUrl === masterShortUrl;
            console.log(isMaster);
            return [
                {
                    icon: isMaster ? CHECK_MARK_ICON : null,
                    text: isMaster ? 'GTD' : null,
                    callback: onCardBtnClick,
                },
            ];
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
