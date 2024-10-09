(async () => {
  let tag = "landscape";
  let tagProducts = await getProductsByTag(tag);
  if (Array.isArray(tagProducts) && tagProducts.length > 0) {
    renderProducts(tagProducts);
  } else {
    document.querySelector(
      ".product-container"
    ).innerHTML = `<p>No products available for tag: ${tag}.</p>`;
  }
})();


function renderProducts(products) {
  const productContainer = document.querySelector(".product-container");
  productContainer.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.addEventListener("click", () => {
      location.href = `/products/${product.id}`;
    });
    productContainer.appendChild(productCard);

    const productImage = document.createElement("div");
    productImage.classList.add("product-image");
    const img = document.createElement("img");
    img.src = product.images[0] || "img/no-image.png";
    img.alt = product.productName;
    productImage.appendChild(img);
    productCard.appendChild(productImage);

    const productInfo = document.createElement("div");
    productInfo.classList.add("product-info");
    const productName = document.createElement("h2");
    productName.classList.add("product-brand");
    productName.textContent = product.productName;
    productInfo.appendChild(productName);
    const productDesc = document.createElement("p");
    productDesc.classList.add("product-short-desc");
    productDesc.textContent = product.productDes;
    productInfo.appendChild(productDesc);
    const productPrice = document.createElement("p");
    productPrice.classList.add("price");
    productPrice.textContent = `Price: CHF ${product.actualPrice || "N/A"}`;
    productInfo.appendChild(productPrice);
    productCard.appendChild(productInfo);
  });
}
