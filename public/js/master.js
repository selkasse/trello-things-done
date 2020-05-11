// import {test} from './client.js';
// import {configParams} from './client.js';
const t = TrelloPowerUp.iframe();

window.master.addEventListener('submit', function (event) {
    // Stop the browser trying to submit the form itself.
    event.preventDefault();
    // Set the master board
    return t.set('member', 'shared', 'masterBoard', window.masterBoard.value)
        .then(function () {
            t.closePopup();
        });
});

// get the member (user) ID
async function getMemberId() {

    let response = await fetch('https://api.trello.com/1/members/me?key=41ae5bff41af5eac3f32ad7a4daab49e&token=5e71d684035b882896f8ecfc32de15dee8c64b0e73b8c965609c3c7473f47661');
    let memberResponse = await response.json();
    return memberResponse.id;

}

// get the boards that belong to the user
async function getMemberBoards() {
    const memberId = await getMemberId();

    let boardsResponse = await fetch(`https://api.trello.com/1/members/${memberId}/boards?key=41ae5bff41af5eac3f32ad7a4daab49e&token=5e71d684035b882896f8ecfc32de15dee8c64b0e73b8c965609c3c7473f47661`);
    let boardsJSON = await boardsResponse.json();
    let boards = [];
    for (board in boardsJSON) {
        const obj = {
            id: boardsJSON[board].id,
            name: boardsJSON[board].name
        };
        boards.push(obj);
    }
    return boards;
}

async function checkIfEnabled(id) {
    let response = await fetch(`https://api.trello.com/1/boards/${id}/boardPlugins?key=41ae5bff41af5eac3f32ad7a4daab49e&token=5e71d684035b882896f8ecfc32de15dee8c64b0e73b8c965609c3c7473f47661`)
    let powerupsJSON = await response.json();
    for (powerup in powerupsJSON) {
        // TODO: put the powerup ID in a separate file
        if (powerupsJSON[powerup].idPlugin === '5eb0ba3ec071f670fcd8b0dd') return true;
    }
    return false;
}


// add the boards to the dropdown when master.html renders
t.render(async function () {
    // console.log(window.localStorage.getItem('config'));
    const config = window.localStorage.getItem('config');
    console.log(config);
    t.sizeTo('#master').done();
    // const masterBoard = await t.get('member', 'shared', 'masterBoard');
    // const boards = await getMemberBoards();
    // const select = document.getElementById("masterBoard");
    // for (board in boards) {
    //     // only create an option if the Trello GTD powerup is enabled on the board
    //     const powerupEnabled = await checkIfEnabled(boards[board].id);

    //     if (powerupEnabled) {
    //         const option = document.createElement("option");
    //         option.value = boards[board].id;
    //         option.text = boards[board].name;
    //         if (masterBoard === boards[board].id) {
    //             option.selected = true;
    //             option.text += ' ✔️'
    //         }
    //         select.add(option);
    //     }
    // }

})