const productContainer = document.getElementById('productContainer');

products.forEach(product => {
    // Create product card element
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');

    // Create product image container
    const productImage = document.createElement('div');
    productImage.classList.add('product-image');

    // Discount tag
    const discountTag = document.createElement('span');
    discountTag.classList.add('discount-tag');
    discountTag.textContent = product.discount;

    // Product image
    const img = document.createElement('img');
    img.classList.add('product-thumb');
    img.src = product.imageSrc;
    img.alt = product.brand;

    // Add discount tag and image to product image container
    productImage.appendChild(discountTag);
    productImage.appendChild(img);

    // Add button to product image container
    const cardBtn = document.createElement('button');
    cardBtn.classList.add('card-btn');
    cardBtn.textContent = 'add to wishlist';
    productImage.appendChild(cardBtn);

    // Create product info container
    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');

    // Product brand
    const productBrand = document.createElement('h2');
    productBrand.classList.add('product-brand');
    productBrand.textContent = product.brand;

    // Product short description
    const productShortDesc = document.createElement('p');
    productShortDesc.classList.add('product-short-desc');
    productShortDesc.textContent = product.description;

    // Price and actual price
    const price = document.createElement('span');
    price.classList.add('price');
    price.textContent = product.price;

    const actualPrice = document.createElement('span');
    actualPrice.classList.add('actual-price');
    actualPrice.textContent = product.actualPrice;

    // Append brand, description, and prices to product info
    productInfo.appendChild(productBrand);
    productInfo.appendChild(productShortDesc);
    productInfo.appendChild(price);
    productInfo.appendChild(actualPrice);

    // Append image container and info container to product card
    productCard.appendChild(productImage);
    productCard.appendChild(productInfo);

    // Append product card to the container
    productContainer.appendChild(productCard);
});
