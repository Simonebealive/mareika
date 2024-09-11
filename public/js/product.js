const fetchProductData = async (productId, userEmail) => {
  if (!productId) {
    throw new Error("Provide valid productId");
  } else if (!userEmail) {
    throw new Error("Provide valid userEmail");
  }
  try {
    const response = await fetch("/get-products", {
      method: "post",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ email: userEmail, id: productId }),
    });
    if (!response.ok) {
      throw new Error("Error fatching product data", err);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fatching product data", err);
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
    if (data.images[i]) {
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
};

let productId = null;
let userEmail = null;
let productDataId = null;

if (location.pathname != "/products") {
  productId = decodeURI(location.pathname.split("/").pop());
}

try {
  userEmail = JSON.parse(sessionStorage.user).email;
} catch (err) {
  console.error("Error parsing user session data", err);
}

if (!productId) {
  console.error("productId not found");
} else if (!userEmail) {
  console.error("User not found");
} else {
  (async () => {
    productDataId = await fetchProductData(productId, userEmail);
    if (productDataId) {
      setProductData(productDataId);
    } else {
      console.error("Error fatching product data");
    }
  })();
}
