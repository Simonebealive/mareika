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
        console.log(response);
    }))
}

submitBtn.addEventListener('click', () => {
    if (name.value.length < 2) {
        showAlert("Name can't be less than 2 characters!")
    } else if (!email.value.length) {
        showAlert("Enter a email address")
    } else if (password.value.length < 8) {
        showAlert("Password has to be at least 8 characters long!")
    } else if (!number.value.length) {
        showAlert("Enter a phone number")
    } else if (!Number(number.value) || number.value.length < 10) {
        showAlert("Number invalid!")
    } else if (!tac.checked) {
        showAlert("Agree to the the terms and conditions")
    } else {
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
    }
});

