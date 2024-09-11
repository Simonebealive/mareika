const createProductId = (data) => {
  let productDetails = document.querySelector(".product-details");
  productDetails.innerHTML = `
        <div class="product-image-details">
        <img src=${data.images[0] || "../img/fp.jpg"} alt="">
        </div>
        <div class="details">
            <h2 class="product-brand">${data.productName}</h2>
            <p class="product-short-des">${data.productDes}</p>
            <span class="product-price">${data.actualPrice} CHF</span>
            ${
              data.discountPercentage
                ? `<span class="product-actual-price">${data.discountPercentage}</span>`
                : ""
            }
            <button class="btn cart-btn">add to cart</button>
            <button class="btn">add to wishlist</button>
        </div>
    `;
  let productDetailDes = document.querySelector(".detail-des");
  productDetailDes.innerHTML += `
        <h2 class="heading">description</h2>
        <p class="des">${data.detailDes}</p>
    `;
};
