const fetchProductData = async (productId) => {
  if (!productId) {
    throw new Error("Provide valid productId");
  }
  try {
    const response = await fetch("/get-products", {
      method: "post",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: productId }),
    });
    if (!response.ok) {
      throw new Error("Error fatching product data");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching product data", err);
    location.replace("/404");
  }
};

const setProductData = (data) => {
  const title = document.querySelector("title");
  const images = document.querySelectorAll(".product-image-details img");
  const productName = document.querySelector(".product-brand");
  const shortDescription = document.querySelector(".product-short-des");
  const detailDescription = document.querySelector(".des");
  const price = document.querySelector(".product-price");
  images.forEach((img, i) => {
    if (data.images[0]) {
      img.src = data.images[i];
    } else {
      img.style.display = "none";
    }
  });
  title.innerHTML = data.productName;
  productName.innerHTML = data.productName;
  shortDescription.innerHTML = data.productDes;
  detailDescription.innerHTML = data.detailDes;
  price.innerHTML = `${data.actualPrice} CHF`;

  const cartBtn = document.querySelector(".cart-btn");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const isAvailable = isProductAvailable(data);
  if (!isAvailable) {
    cartBtn.innerHTML = "Out of stock";
    cartBtn.disabled = true;
  }
  cartBtn.addEventListener("click", () => {
    if (!cartBtn.disabled) {
      addToCart(data)
        .then((res) => {
          cartBtn.innerHTML = res;
          cartBtn.disabled = true;
          cart.push(data);
          localStorage.setItem("cart", JSON.stringify(cart));
        })
        .catch((err) => {
          console.error("Error adding to cart", err);
        });
    }
  });
};

const removeDuplicateProducts = (similarProducts, currProduct) => {
  return similarProducts.filter(
    (product) => product.images[0] != currProduct.images[0]
  );
};

let productId = null;
let productDataId = null;
let similarProducts = null;

if (location.pathname != "/products") {
  productId = decodeURI(location.pathname.split("/").pop());
}

if (!productId) {
  console.error("productId not found");
} else {
  (async () => {
    productDataId = await fetchProductData(productId);
    if (productDataId) {
      setProductData(productDataId);
      similarProducts = await getProductsByTag(productDataId.categories[0]);
      similarProducts = removeDuplicateProducts(similarProducts, productDataId);
      createProductSlider(
        similarProducts,
        ".container-for-card-slider",
        "similar products"
      );
    } else {
      console.error("Error fatching product data");
    }
  })();
}
