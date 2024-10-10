/* eslint-disable no-unused-vars */
const createSmallCards = (data) => {
  console.log("data image", data.image);
  console.log("data name", data.name);
  console.log("data des", data.des);
  console.log("data price", data.price);
  return `
          <div class="sm-product">
            <img src="${data.images[0]}" class="sm-product-img" alt="" />
            <div class="sm-text">
              <p class="sm-product-name">${data.productName}</p>
              <p class="sm-des">${data.productDes}</p>
            </div>
            <p class="sm-price">${data.actualPrice} CHF</p>
            <button class="sm-delete-btn">
              <img src="img/close.png" alt="" />
            </button>
          </div>
    `;
};

let totalBill = 0;
const setProducts = (name) => {
  const element = document.querySelector(`.${name}`);
  console.log(`Setting products for: ${name}`);

  let data;
  try {
    const rawData = localStorage.getItem(name);
    console.log(`Raw data from localStorage: ${rawData}`);
    data = JSON.parse(rawData);
    if (!Array.isArray(data)) {
      data = [data];
    }
    console.log(`Data after parsing: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error(`Error parsing JSON from localStorage: ${error}`);
    data = null;
  }

  if (data == null || data.length == 0) {
    console.log(`No data found for ${name}, showing empty cart image`);
    element.innerHTML = `<img src="img/empty-cart.png" class="empty-img" alt="" />`;
  } else {
    console.log(`Found ${data.length} items for ${name}`);
    for (let i = 0; i < data.length; i++) {
      console.log(`Creating small card for item`, data[i]);
      element.innerHTML += createSmallCards(data[i]);
      if (name == "cart") {
        totalBill += Number(data[i].actualPrice);
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

  if (!Array.isArray(product)) {
    product = product ? [product] : [];
  }

  deleteBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      product = product.filter((item, index) => index != i);
      localStorage.setItem(name, JSON.stringify(product));
      location.reload();
    });
  });
};

setProducts("cart");
