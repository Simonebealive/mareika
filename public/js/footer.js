const createFooter = () => {
    let footer = document.querySelector('footer');
    footer.innerHTML = `
        <div class="footer-content">
            <img src="../img/fp.jpg" class="logo" alt="">
            <div class="footer-ul-container">
                <ul class="info">
                    <li class="info-title">Contact</li>
                    <li class="info-link">Tel: 1234 567 789</li>
                    <li class="info-link">Email: myMail@foo.com</li>
                    <a href="#">
                        <i class="fab fa-instagram"></i>
                    </a>
                </ul>
            </div>
        </div>
        <p class="footer-credit">&copy; 2024 Mareika. All rights reserved.</p>
    `;
}

createFooter();