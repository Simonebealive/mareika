// redirect to home page if user logged in
window.onload = () => {
    if (sessionStorage.user) {
        user = JSON.parse(sessionStorage.user)
        if (compareToken(user.authToken, user.email)) {
            location.replace('/');
        }
    }
}

const loader = document.querySelector('.loader')

// select inputs
const submitBtn = document.querySelector('.submit-btn');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const number = document.querySelector('#number');
const tac = document.querySelector('#terms-and-cond');
const notification = document.querySelector('#notification');

const showAlert = (msg) => {
    let alertBox = document.querySelector('.alert-box')
    let alertMsg = document.querySelector('.alert-msg')
    alertMsg.innerHTML = msg;
    alertBox.classList.add('show')
    setTimeout(() => {
        alertBox.classList.remove('show')
    }, 3000);
}

const sendData = (path, data) => {
    fetch(path, {
        method: 'post',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    }).then((res) => res.json()).then((response => {
        processData(response);
    }))
}

const processData = (data) => {
    console.log('data:', data)
    loader.style.display = null;
    if (data.alert) {
        showAlert(data.alert);
    } else if (data.name) {
        data.authToken = generateToken(data.email);
        sessionStorage.user = JSON.stringify(data);
        location.replace('/')
    }
}

submitBtn.addEventListener('click', () => {
    loader.style.display = 'block';
    sendData('/signup', {
        name: name.value,
        email: email.value,
        password: password.value,
        number: number.value,
        tac: tac.checked,
        notification: notification.checked,
        seller: false
    })
});

