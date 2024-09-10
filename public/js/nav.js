const createNav = () => {
    let nav = document.querySelector('.navbar');
    nav.innerHTML = `
        <div class="nav">
        <img src="../img/fp.jpg" class="brand-logo" alt="">
        <div class="nav-items">
            <div class="search">
                <input type="text" class="search-box" placeholder="Search">
                <button class="search-btn">search</button>
                <a>
                    <img src="../img/user.png" id="user-img" alt="">
                    <div class="login-logout-popup hide">
                        <p class="account-info">Log in as name</p>
                        <button class="btn" id="user-btn">Log out</button>
                    </div>
                </a>
                <a href="/cart">
                    <img src="../img/cart.png" alt="">
                </a>
            </div>
        </div>
    </div>
    <ul class="links-container">
        <li class="link-item"><a href="#" class="link">Home</a></li>
        <li class="link-item"><a href="#" class="link">Landscape</a></li>
        <li class="link-item"><a href="#" class="link">Portrait</a></li>
        <li class="link-item"><a href="#" class="link">Abstract</a></li>
        <li class="link-item"><a href="#" class="link">About Me</a></li>
    </ul>
    `;
}

createNav();

// nav pop up
const userImageButton = document.querySelector('#user-img');
const userPopup = document.querySelector('.login-logout-popup');
const popupText = document.querySelector('.account-info');
const actionBtn = document.querySelector('#user-btn');

userImageButton.addEventListener('click', () => {
    userPopup.classList.toggle('hide');
})

let user = JSON.parse(sessionStorage.user || null);
if (user != null) {
    // user logged in
    popupText.innerHTML = `logged in as ${user.name}`
    actionBtn.innerHTML = `log out`
    actionBtn.addEventListener('click', () => {
        sessionStorage.clear();
        location.reload();
    })
} else {
    // user logged out
    popupText.innerHTML = `log in to place order`
    actionBtn.innerHTML = `log in`
    actionBtn.addEventListener('click', () => {
        location.href = '/login'
    })
}