// eslint-disable-next-line no-undef
const t = TrelloPowerUp.iframe();

window.master.addEventListener('submit', function(event) {
    // * Stop the browser trying to submit the form itself.
    event.preventDefault();
    // * Set the master board
    return t.set('member', 'shared', 'masterBoard', window.masterBoard.value).then(function() {
        console.log(window.masterBoard.value);
        t.closePopup();
    });
});

const config = JSON.parse(window.localStorage.getItem('config'));
const boards = config.enabledBoards;

// * add the boards to the dropdown when master.html renders
t.render(async function() {
    const masterBoard = await t.get('member', 'shared', 'masterBoard');
    const select = document.getElementById('masterBoard');
    for (let i = 0; i < boards.length; i += 1) {
        console.log(boards[i]);

        const option = document.createElement('option');
        option.value = boards[i].shortUrl;
        option.text = boards[i].name;
        if (masterBoard === boards[i].shortUrl) {
            option.selected = true;
            option.text += ' ✔️';
        }
        select.add(option);
    }
    t.sizeTo('#master').done();
});
