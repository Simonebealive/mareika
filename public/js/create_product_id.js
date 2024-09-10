const createProductId = (data) => {
  let productDetails = document.querySelector(".product-details");
  productDetails.innerHTML = `
        <div class="product-image-details">
        <img src=${data.images[0] || "../img/fp.jpg"} alt="">
        </div>
        <div class="details">
            <h2 class="product-brand">name</h2>
            <p class="product-short-des">a short desc</p>
            <span class="product-price">20 CHF</span>
            <span class="product-actual-price">40 CHF</span>
            <button class="btn cart-btn">add to cart</button>
            <button class="btn">add to wishlist</button>
        </div>

    `;
};
