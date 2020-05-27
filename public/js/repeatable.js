// eslint-disable-next-line no-undef
const t = TrelloPowerUp.iframe();

// TODO: add event listener on submit
// TODO: if daily, add to collection SCHEDULED_CARDS, but add 'daily' instead of the actual 'date' value
// TODO: if 'x times per week', render a new input for the user where they can pick the days (up to 6)
// TODO: if 'x times per month', render a multiselect calendar input where the user can pick up to 10

window.repeatable.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log(window.repeatSchedule.value);
    // if (window.repeatSchedule.value === 'perWeek') {

    // }
});

t.render(function() {
    // const option = document.createElement('option');
    t.sizeTo('#weekly').done();
});
