import { sendData } from "./utils.js";

const createSmallCards = (data) => {
  if (!data) {
    return `
    <div class="sm-product">
      <img src="img/empty-cart.png" class="sm-product-img" alt="" />
    </div>
    `;
  } else {
    const imageUrl =
      Array.isArray(data.images) && data.images.length > 0
        ? data.images[0]
        : "img/no-image.png";
    return `
          <div class="sm-product">
            <img src="${imageUrl}" class="sm-product-img" alt="" />
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
  }
};

let totalBill = 0;
const setProducts = (name) => {
  const element = document.querySelector(`.${name}`);
  let data;
  try {
    const rawData = localStorage.getItem(name);
    data = JSON.parse(rawData);
    if (!Array.isArray(data)) {
      data = [data];
    }
  } catch (error) {
    console.error(`Error parsing JSON from localStorage: ${error}`);
    data = null;
  }
  if (data == null || data.length == 0 || data.includes(null)) {
    console.log(`No data found for ${name}, showing empty cart image`);
    element.innerHTML = `<img src="img/empty-cart.png" class="empty-img" alt="" />`;
  } else {
    for (let i = 0; i < data.length; i++) {
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

const setDbReservedFalse = (product) => {
  if (Array.isArray(product)) {
    product.forEach((item) => {
      if (item && item.id) {
        sendData("/update_product", { id: item.id, reserved: false });
      } else {
        console.error("Invalid product object:", item);
      }
    });
  } else {
    console.error("Product is not an array:", product);
  }
};

setProducts("cart");
