import { isProductAvailable, getProductsByTag, sendData } from "./utils.js";

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
  const isAvailable = isProductAvailable(data);
  if (!isAvailable) {
    cartBtn.innerHTML = "Out of stock";
    cartBtn.disabled = true;
  }
  cartBtn.addEventListener("click", () => {
    if (!cartBtn.disabled) {
      const guestId = getOrCreateGuestId();
      addToCart(data)
        .then((res) => {
          cartBtn.innerHTML = res;
          cartBtn.disabled = true;
          const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
          currentCart.push(data);
          localStorage.setItem("cart", JSON.stringify(currentCart));
        })
        .catch((err) => {
          console.error("Error adding to cart", err);
        });
    }
  });
};

const addToCart = (product) => {
  if (!product.id) {
    throw new Error("Product ID not found");
  }

  const isAvailable = isProductAvailable(product);
  if (!isAvailable) {
    console.warn("Product not available");
    return "Out of stock";
  }

  return sendData("/update_product", { id: product.id, reserved: true })
    .then((reserveResponse) => {
      if (reserveResponse.message === "Success") {
        console.log("Product reserved successfully");
        return "Added to cart";
      } else {
        console.warn("Failed to reserve product");
        return "Failed to reserve product";
      }
    })
    .catch((error) => {
      console.error("Error reserving product:", error);
      return "Error reserving product";
    });
};

const getOrCreateGuestId = () => {
  let guestId = localStorage.getItem("guestId");
  if (guestId) {
    return guestId;
  } else {
    const timeNow = Date.now();
    const randomNr = crypto.randomUUID();
    guestId = `${timeNow}-${randomNr}`;
    localStorage.setItem("guestId", guestId);
    return guestId;
  }
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

