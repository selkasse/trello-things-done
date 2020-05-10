// import axios from '/axios';

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
    let enabledBoards;
    await fetch('/.netlify/functions/getEnabledBoards', {
        method: "POST",
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: boards
    })
    .then(res => res.json())
    .then(res => {
        console.log(res);
        enabledBoards = res;
    });
    return enabledBoards;
}

// holds the values for:
// * currentMember
// * isMaster
// * memberBoards
// * enabledBoards
let configParams;


TrelloPowerUp.initialize({

    'board-buttons': function (t, options) {

        // * initialize variables to be used for configParams
        const currentMember = t.getContext().member;
        const currentBoard = t.getContext().board;
        let memberBoards;
        let enabledBoards;
        return t.get('member', 'shared', 'masterBoard')
        .then(async function (masterBoard){

            const isMaster = currentBoard === masterBoard;
            
            await getBoards(currentMember)
            .then(function(boards){
                memberBoards = boards;
            })

            
            await getEnabledBoards(Object.assign({},memberBoards))
            .then(function(boards){
                enabledBoards = boards;
            })
            
            // * populate configParams when the board loads
            configParams = {
                currentMember,
                isMaster,
                memberBoards,
                enabledBoards
            };

            console.log(configParams);

            return [{
                icon: {
                    dark: MASTER_ICON_DARK,
                    light: MASTER_ICON_LIGHT
                },
                text: 'Master Board',
                callback: onBoardBtnClick,
                condition: 'edit'
            }]
        });
    },
    // only show card buttons if master board
    'card-buttons': function (t, options) {
        
        const {isMaster} = configParams;
        return [{
            icon: isMaster ? CHECK_MARK_ICON : null,
            text: isMaster ? 'GTD' : null,
            callback: onCardBtnClick
        }];
            
    },
    'card-badges': function (t, options) {
        return t.get('member', 'shared', 'masterBoard')
            .then(function(masterBoard){
                const currentBoard = t.getContext().board;
                const isMaster = currentBoard === masterBoard;
                    return t.get('card', 'shared', 'schedule')
                        .then(function (schedule) {
                            if (isMaster){
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