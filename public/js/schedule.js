const saveToFauna = function(data) {
    return fetch('/.netlify/functions/saveScheduledCard', {
        body: JSON.stringify(data),
        method: 'POST',
    }).then(response => response.json());
};

// eslint-disable-next-line no-undef
const t = TrelloPowerUp.iframe();
window.schedule.addEventListener('submit', function(event) {
    // * Stop the browser trying to submit the form itself.
    event.preventDefault();
    // console.log(t.getContext().board);
    // console.log(t.getContext().card);
    const date = window.scheduledCard.value;
    // console.log(date);
    const data = {
        boardID: t.getContext().board,
        cardID: t.getContext().card,
        date,
    };
    // console.log(data);
    saveToFauna(data);
    // * Set the scheduled date for the card
    return t.set('card', 'shared', 'schedule', window.scheduledCard.value).then(function() {
        t.closePopup();
    });
});

// * When schedule.html is rendered, display the current value of the scheduled date
t.render(function() {
    return (
        t
            .get('card', 'shared', 'schedule')
            .then(function(scheduledDate) {
                window.scheduledCard.value = scheduledDate;
            })
            // * sizeTo documentation:
            // * https://developer.atlassian.com/cloud/trello/power-ups/ui-functions/t-sizeto/
            .then(function() {
                // * Resize the schedule.html popup
                // * The popup will resize based on the size of <form id="schedule">
                t.sizeTo('#schedule').done();
            })
    );
});
