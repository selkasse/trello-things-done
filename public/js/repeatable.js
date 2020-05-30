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

    const error = document.getElementById('errorLabel');

    if (window.repeatSchedule.value === 'selectDays') {
        const mondays = document.getElementById('mondays').checked;
        const tuesdays = document.getElementById('tuesdays').checked;
        const wednesdays = document.getElementById('wednesdays').checked;
        const thursdays = document.getElementById('thursdays').checked;
        const fridays = document.getElementById('fridays').checked;
        const saturdays = document.getElementById('saturdays').checked;
        const sundays = document.getElementById('sundays').checked;

        const days = { mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays };
        const daysArray = Object.values(days);
        const oneBoxChecked = daysArray.find(checked => checked === true);
        if (oneBoxChecked) {
            error.classList.remove('error');
            error.classList.add('hidden');
            console.log('at least one day was selected');
        } else {
            error.classList.remove('hidden');
            error.classList.add('error');
            console.log('no days were selected');
        }
    }
});

t.render(function() {
    // const option = document.createElement('option');
    t.sizeTo('#container').done();
});
