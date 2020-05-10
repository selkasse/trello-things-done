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
const getUserConfig = async (configParams) => {
    // this statement will go away, since we get the memberID from configParams.member
    const isMaster = configParams.currentBoard === configParams.masterBoard;
    // TODO : START
    // const boards = make POST request to .netlify/functions/getMemberBoards, passing in configParams.currentMember
    /*
    for (board in boards){
        check if board has TTD enabled
        set board.enabled to TRUE or FALSE
    }
    */
   // TODO : END
   const ID = await (await fetch('/.netlify/functions/getMemberID')).json();
   return ID;
    // TODO : send a POST request to checkIfMaster with ${boardsConfig} as the body
    // TODO : send a POST request to getMemberBoards netlify function, with ${id} in the body
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
    console.log(id);
    const data = {memberID: id};
    // TODO : make this a POST with fetch
    await fetch('/.netlify/functions/getMemberBoards', {
        method: "POST",
        body: JSON.stringify(data)
    }).then(response => {
        console.log(response.json());
    })
    // const boards = await (await fetch('http://localhost:9000/getMemberBoards')).json();
    // return boards;
    return 'mock response from getBoards';
}

let configParams;
let isMaster;
let enabledBoards;

TrelloPowerUp.initialize({

    'board-buttons': function (t, options) {
        const currentMember = t.getContext().member;
        const currentBoard = t.getContext().board;
        return t.get('member', 'shared', 'masterBoard')
        .then(async function (masterBoard){
            const isMaster = currentBoard === masterBoard;
            configParams = {
                currentMember,
                isMaster
            };


            await getBoards(currentMember)
                .then(function(boards){
                    console.log(boards);
                })
           
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
    'card-buttons': async function (t, options) {
        
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