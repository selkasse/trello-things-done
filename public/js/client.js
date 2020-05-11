const Promise = TrelloPowerUp.Promise;

const CHECK_MARK_ICON = 'https://img.icons8.com/material/24/000000/check-all.png';
const MASTER_ICON_DARK = 'https://img.icons8.com/material/96/000000/master.png';
const MASTER_ICON_LIGHT = 'https://img.icons8.com/material-outlined/96/000000/master.png';


const onCardBtnClick = function (t, options) {
    return t.popup({
        title: 'Add to future board',
        url: '/public/schedule.html'
    });
}

const onBoardBtnClick = function (t, options) {
    return t.popup({
        title: 'Change Master Board',
        url: '/public/master.html'
    })
}


// const getID = async () => {
//     const ID = await (await fetch('http://localhost:9000/getMemberID')).json();
//     return ID;
// }

// getID().then((id) => {
//     const h2 = document.getElementById('member');
//     h2.innerHTML += ` ${id}`;
// })
const getBoards = async (id) => {
    const data = { memberID: id };
    let boards;
    await fetch('/.netlify/functions/getMemberBoards', {
        method: "POST",
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => {
            boards = res;
        });
    return boards;
}

const getEnabledBoards = async (boards) => {
    console.log(boards);
    const data = { boards }
    let enabledBoards;
    await fetch('/.netlify/functions/getEnabledBoards', {
        method: "POST",
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => {
            // console.log(res);
            enabledBoards = res;
        });
    // configParams.enabledBoards = enabledBoards;
    return enabledBoards;
}

const getShortUrl = function(id, boards){
    console.log(boards);
    const board = boards.find(board => board.id === id);
    console.log(board);
    return board.shortUrl;
}

// holds the values for:
// * currentMember
// * isMaster
// * memberBoards
// * enabledBoards
// let isMaster;


TrelloPowerUp.initialize({

    'board-buttons': async function (t, options) {

        // * initialize variables to be used for configParams
        const currentMember = t.getContext().member;
        console.log(t.getContext());
        let memberBoards;
        let enabledBoards;
        // return t.get('member', 'shared', 'masterBoard')
        // .then(async function (masterBoard) {
            
            // console.log(currentMember);
            // console.log(`currentBoard: ${currentBoard}`);
            // console.log(`masterBoard: ${masterBoard}`);
            
            await getBoards(currentMember)
            .then(function (boards) {
                memberBoards = boards;
            })
            
            const currentBoard = getShortUrl(t.getContext().board, memberBoards);
            console.log(currentBoard);
            // isMaster = currentBoard === masterBoard;

                await getEnabledBoards(memberBoards)
                    .then(function (boards) {
                        console.log(boards);
                        enabledBoards = boards;
                    })

                // * populate configParams when the board loads
                configParams = {
                    currentMember,
                    memberBoards,
                    enabledBoards
                };

                window.localStorage.setItem('config', JSON.stringify(configParams));

                return [{
                    icon: {
                        dark: MASTER_ICON_DARK,
                        light: MASTER_ICON_LIGHT
                    },
                    text: 'Master Board',
                    callback: onBoardBtnClick,
                    condition: 'edit'
                }]
            // });
    },
    // only show card buttons if master board
    'card-buttons': function (t, options) {

        // const { isMaster } = configParams;
        return t.get('member', 'shared', 'masterBoard')
        .then(function (masterBoard){
            // const config = JSON.parse(window.localStorage.getItem('config'));
            const { memberBoards } = JSON.parse(window.localStorage.getItem('config'));
            const currentBoard = getShortUrl(t.getContext().board, memberBoards);
            console.log(currentBoard);
            console.log(masterBoard);
            const isMaster = currentBoard === masterBoard;
            return [{
                icon: isMaster ? CHECK_MARK_ICON : null,
                text: isMaster ? 'GTD' : null,
                callback: onCardBtnClick
            }];
        });

    },
    'card-badges': function (t, options) {
        return t.get('member', 'shared', 'masterBoard')
            .then(function (masterBoard) {
                const currentBoard = t.getContext().board;
                const isMaster = currentBoard === masterBoard;
                return t.get('card', 'shared', 'schedule')
                    .then(function (schedule) {
                        if (isMaster) {
                            return [{
                                icon: schedule ? CHECK_MARK_ICON : null,
                                text: schedule ? schedule : null
                            }];
                        }
                    });
            })
    },
    // only show card detail badges if master board
    'card-detail-badges': function (t, options) {
        return t.get('member', 'shared', 'masterBoard')
            .then(function (masterBoard) {
                const currentBoard = t.getContext().board;
                const isMaster = currentBoard === masterBoard;
                if (isMaster) {

                    return t.get('card', 'shared', 'schedule')
                        .then(function (schedule) {
                            return [{
                                title: 'Schedule',
                                color: schedule ? 'green' : 'blue',
                                text: schedule ? `Scheduled for ${schedule}` : 'Schedule for a future board',
                                callback: onCardBtnClick
                            }]
                        })
                }
            })
    }
});