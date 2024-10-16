const createNav = () => {
  let nav = document.querySelector(".navbar");
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
        <li class="link-item"><a href="/" class="link">Home</a></li>
        <li class="link-item"><a href="/landscape" class="link">Landscape</a></li>
        <li class="link-item"><a href="/portrait" class="link">Portrait</a></li>
        <li class="link-item"><a href="/abstract" class="link">Abstract</a></li>
        <li class="link-item"><a href="/about_me" class="link">About Me</a></li>
    </ul>
    `;
};

createNav();

const userImageButton = document.querySelector("#user-img");
const userPopup = document.querySelector(".login-logout-popup");
const popupText = document.querySelector(".account-info");
const actionBtn = document.querySelector("#user-btn");

userImageButton.addEventListener("click", () => {
  userPopup.classList.toggle("hide");
});

function isLoggedIn() {
  console.log("All cookies:", document.cookie);
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  const result = 'token' in cookies;
  console.log("Is token present:", result);
  return result;
}

if (isLoggedIn()) {
  popupText.innerHTML = `logged in`;
  actionBtn.innerHTML = `log out`;
  actionBtn.addEventListener("click", () => {
    fetch("/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      location.reload();
    });
  });
} else {
  popupText.innerHTML = `log in to place order`;
  actionBtn.innerHTML = `log in`;
  actionBtn.addEventListener("click", () => {
    location.href = "/login";
  });
}

const searchBtn = document.querySelector(".search-btn");
const searchBox = document.querySelector(".search-box");
searchBtn.addEventListener("click", () => {
  if (searchBox.value.length) {
    location.href = `/search/${searchBox.value}`;
  }
});
