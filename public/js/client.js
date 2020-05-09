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

