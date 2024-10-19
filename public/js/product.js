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
    cartBtn.style.cursor = "default";
  }
  cartBtn.addEventListener("click", async () => {
    if (!cartBtn.disabled) {
      try {
        const response = await addReservation(data);

        if (response.status === 401) {
          // Unauthorized: User is not logged in
          window.location.href =
            "/login?redirect=" + encodeURIComponent(window.location.pathname);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to create reservation");
        }

        const result = await response.json();

        if (result.message === "Reservation created successfully") {
          cartBtn.innerHTML = "Added to cart";
          cartBtn.disabled = true;
          console.log("Reservation created successfully");
        } else {
          console.warn("Failed to create reservation:", result.message);
          cartBtn.innerHTML = "Try again";
        }
      } catch (error) {
        console.error("Error creating reservation:", error);
        cartBtn.innerHTML = "Error occurred";
      }
    }
  });
};

const addReservation = async (productData) => {
  try {
    const response = await fetch("/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productData.id,
      }),
      credentials: "include", // This ensures cookies are sent with the request
    });
    return response;
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
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
