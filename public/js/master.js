const t = TrelloPowerUp.iframe();

window.master.addEventListener('submit', function (event) {
    // * Stop the browser trying to submit the form itself.
    event.preventDefault();
    // * Set the master board
    return t.set('member', 'shared', 'masterBoard', window.masterBoard.value)
        .then(function () {
            t.closePopup();
        });
});

const config = JSON.parse(window.localStorage.getItem('config'));
const boards = config.enabledBoards;

// add the boards to the dropdown when master.html renders
t.render(async function () {
    console.log(boards);
    t.sizeTo('#master').done();
    const masterBoard = await t.get('member', 'shared', 'masterBoard');
    console.log(masterBoard);
    const select = document.getElementById("masterBoard");
    for (let i = 0; i < boards.length; i++) {
        console.log(boards[i]);

        const option = document.createElement("option");
        option.value = boards[i].id;
        option.text = boards[i].name;
        if (masterBoard === boards[i].id) {
            option.selected = true;
            option.text += ' ✔️'
        }
        select.add(option);
    }

})