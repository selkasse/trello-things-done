const Promise = TrelloPowerUp.Promise;

const CHECK_MARK_ICON = 'https://img.icons8.com/material/24/000000/check-all.png';
const MASTER_ICON_DARK = 'https://img.icons8.com/material/24/000000/master.png';
const MASTER_ICON_LIGHT = 'https://img.icons8.com/material-outlined/24/000000/master.png';


const fetchID = async () => {
    const ID = await (await fetch('/.netlify/functions/getMemberID')).json();
    return ID;
}

fetchID().then(id => {
    console.log(id);
    const h1 = document.getElementById('member');
    h1.innerHTML += ` ${id}`
})

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


TrelloPowerUp.initialize({
    'board-buttons': function (t, options) {
        console.log(t.getContext().member);
        return [{
            icon: {
                dark: MASTER_ICON_DARK,
                light: MASTER_ICON_LIGHT
            },
            text: 'Master Board',
            callback: onBoardBtnClick,
            condition: 'edit'
        }]
    },
    // only show card buttons if master board
    'card-buttons': function (t, options) {
        return t.get('member', 'shared', 'masterBoard')
            .then(function (masterBoard) {
                const currentBoard = t.getContext().board;
                const isMaster = currentBoard === masterBoard;
                return [{
                    icon: isMaster ? CHECK_MARK_ICON : null,
                    text: isMaster ? 'GTD' : null,
                    callback: onCardBtnClick
                }];
            })
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