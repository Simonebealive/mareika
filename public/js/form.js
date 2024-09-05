import { sendData } from "./token.js";

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
const name = document.querySelector('#name') || null;
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const number = document.querySelector('#number') || null;
const tac = document.querySelector('#terms-and-cond') || null;
const notification = document.querySelector('#notification') || null;

submitBtn.addEventListener('click', () => {
    if (name != null) {
        loader.style.display = 'block';
        sendData('/signup', {
            name: name.value,
            email: email.value,
            password: password.value,
            number: number.value,
            tac: tac.checked,
            notification: notification.checked,
            seller: false
        }, loader)
    } else { // login page
        if (!email.value.length || !password.value.length) {
            showAlert('please fill out the form')
        } else {
            loader.style.display = 'block';
            sendData('/login', {
                email: email.value,
                password: password.value,
            }, loader)
        }
    }
});

