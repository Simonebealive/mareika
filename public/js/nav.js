const createNav = () => {
    let nav = document.querySelector('.navbar');
    nav.innerHTML = `
        <div class="nav">
        <img src="img/fp.jpg" class="brand-logo" alt="">
        <div class="nav-items">
            <div class="search">
                <input type="text" class="search-box" placeholder="Search">
                <button class="search-btn">search</button>
                <a href="#">
                    <i class="fas fa-search"></i>
                </a>
                <a href="#">
                    <i class="fas fa-shopping-cart"></i>
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