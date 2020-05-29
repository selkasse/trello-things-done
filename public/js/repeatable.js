// eslint-disable-next-line no-undef
const t = TrelloPowerUp.iframe();

// TODO: add event listener on submit
// TODO: if daily, add to collection SCHEDULED_CARDS, but add 'daily' instead of the actual 'date' value
// TODO: if 'x times per week', render a new input for the user where they can pick the days (up to 6)
// TODO: if 'x times per month', render a multiselect calendar input where the user can pick up to 10

window.repeatable.addEventListener('click', function(event) {
    const weeklyForm = document.getElementById('weekly');
    const dailyDescription = document.getElementById('dailyDescription');
    const generalDescription = document.getElementById('generalDescription');
    const button = document.getElementById('btn');
    const mondays = document.getElementById('mondays');

    // console.log(window.repeatSchedule.value);
    if (window.repeatSchedule.value === 'selectDays') {
        button.innerHTML = 'Set these days';
        weeklyForm.classList.remove('weeklyForm');
        // weeklyForm.classList.add('weeklyFormActive');

        dailyDescription.classList.add('dailyDescription');
        generalDescription.classList.add('generalDescription');

        t.sizeTo('#container').done();
    }
    if (window.repeatSchedule.value === 'daily') {
        button.innerHTML = 'Make Daily';
        console.log(mondays);
        weeklyForm.classList.add('weeklyForm');
        generalDescription.classList.add('generalDescription');

        dailyDescription.classList.remove('dailyDescription');
        t.sizeTo('#container').done();
    }
    if (window.repeatSchedule.value === 'general') {
        button.innerHTML = 'Make General';

        weeklyForm.classList.add('weeklyForm');
        dailyDescription.classList.add('dailyDescription');
        generalDescription.classList.remove('generalDescription');
        t.sizeTo('#container').done();
    }
});

window.repeatable.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log(window.repeatSchedule.value);
});

t.render(function() {
    // const option = document.createElement('option');
    t.sizeTo('#container').done();
});
