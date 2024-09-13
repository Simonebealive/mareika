/* eslint-disable no-unused-vars */
const createSmallCards = (data) => {
  return `
          <div class="sm-product">
            <img src="${data.image}" class="sm-product-img" alt="" />
            <div class="sm-text">
              <p class="sm-product-name">${data.name}</p>
              <p class="sm-des">${data.des}</p>
            </div>
            <p class="sm-price">${data.price} CHF</p>
            <button class="sm-delete-btn">
              <img src="img/close.png" alt="" />
            </button>
          </div>
    `;
};

let totalBill = 0;
const setProducts = (name) => {
  const element = document.querySelector(`.${name}`);
  let data = JSON.parse(localStorage.getItem(name));
  if (data == null || data.length == 0) {
    element.innerHTML = `<img src="img/empty-cart.png" class="empty-img" alt="" />`;
  } else {
    for (let i = 0; i < data.length; i++) {
      element.innerHTML += createSmallCards(data[i]);
      if (name == "cart") {
        totalBill += Number(data[i].price);
      }
    }
    let checkoutBill = document.querySelector(".checkout-bill");
    checkoutBill.innerHTML = `${totalBill} CHF`;
  }
  setUpEvents(name);
};

const setUpEvents = (name) => {
  const deleteBtns = document.querySelectorAll(".sm-delete-btn");
  let product = JSON.parse(localStorage.getItem(name));
  deleteBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      product = product.filter((item, index) => index != i);
      localStorage.setItem(name, JSON.stringify(product));
      location.reload();
    });
  });
};

setProducts("cart");
