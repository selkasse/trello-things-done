// eslint-disable-next-line no-undef
const t = TrelloPowerUp.iframe();

window.master.addEventListener('submit', async function(event) {
    // * Stop the browser trying to submit the form itself.
    event.preventDefault();
    // * Set the master board
    // * Note that we are storing both the ID and shortUrl in the masterBoard property
    // * This is because the shortUrl is actually the unique identifier for a board, not the board ID
    const splitValue = window.masterBoard.value.split(',');
    // console.log(splitValue);
    // await t.set('member', 'shared', 'currentShortUrl', splitValue[0]);
    return t.set('member', 'shared', 'masterBoard', window.masterBoard.value).then(function() {
        console.log(window.masterBoard.value);
        t.closePopup();
    });
});

// const config = JSON.parse(window.localStorage.getItem('config'));

// * add the boards to the dropdown when master.html renders
t.render(async function() {
    const masterBoard = await t.get('member', 'shared', 'masterBoard');
    let boards;

    try {
        const configResponse = await t.get('organization', 'shared', 'config', 'not set');
        boards = configResponse;
    } catch (e) {
        console.log(e);
    }
    const select = document.getElementById('masterBoard');
    boards.forEach(board => {
        const option = document.createElement('option');
        option.value = `${board.shortUrl},${board.id}`;
        option.text = board.name;
        const splitMaster = masterBoard.split(',');
        const masterShortUrl = splitMaster[0];
        if (masterShortUrl === board.shortUrl) {
            option.selected = true;
            option.text += ' ✔️';
        }
        select.add(option);
    });
    t.sizeTo('#master').done();
});
