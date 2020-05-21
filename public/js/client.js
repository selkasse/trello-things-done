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
    console.log(data);
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
            console.log(res);
            shortUrl = res;
        });
    return shortUrl;
};

// eslint-disable-next-line no-undef
TrelloPowerUp.initialize({
    'board-buttons': async function(t) {
        let memberBoards;
        let enabledBoards;
        const currentMember = t.getContext().member;
        const currentBoard = t.getContext().board;
        const setShortUrlFromContext = async function() {
            try {
                const shortUrlContext = await t.get('member', 'shared', 'currentShortUrl', 'not set');
                // if (shortUrlContext === 'not set') {
                await getShortUrl(currentBoard).then(async function(url) {
                    await t.set('member', 'shared', 'currentShortUrl', url);
                });
                // }
            } catch (e) {
                console.log(e);
            }
        };

        const setConfigFromContext = async function() {
            try {
                const configResponse = await t.get('organization', 'shared', 'config', 'not set');
                const configContext = JSON.stringify(configResponse);
                // return configContext;
                if (configContext === 'not set') {
                    await getBoards(currentMember).then(function(boards) {
                        memberBoards = boards;
                    });
                    await getEnabledBoards(memberBoards).then(function(boards) {
                        enabledBoards = boards;
                    });
                    await t.set('organization', 'shared', 'config', enabledBoards).catch(e => console.log(e));
                }
            } catch (e) {
                console.log(e);
            }
        };
        setShortUrlFromContext();
        setConfigFromContext();

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
            const splitMaster = masterBoard.split(',');
            const masterShortUrl = splitMaster[0];
            const currentShortUrl = await t.get('member', 'shared', 'currentShortUrl');

            console.log(t.getContext().board);
            console.log(masterBoard);
            console.log(masterShortUrl);
            console.log(currentShortUrl);

            const isMaster = currentShortUrl === masterShortUrl;
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
        return t.get('member', 'shared', 'masterBoard').then(async function(masterBoard) {
            const splitMaster = masterBoard.split(',');
            const masterShortUrl = splitMaster[0];
            const currentShortUrl = await t.get('member', 'shared', 'currentShortUrl');
            const isMaster = currentShortUrl === masterShortUrl;

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
        return t.get('member', 'shared', 'masterBoard').then(async function(masterBoard) {
            const splitMaster = masterBoard.split(',');
            const masterShortUrl = splitMaster[0];
            const currentShortUrl = await t.get('member', 'shared', 'currentShortUrl');
            const isMaster = currentShortUrl === masterShortUrl;

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
