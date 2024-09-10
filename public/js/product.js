const productImages = document.querySelectorAll(".product-images img");
const productImageSlide = document.querySelector("image-slider");

let activeImageSlide = 0;
productImages.forEach((item, i) => {
  item.addEventListener("click", function () {
    productImages[activeImageSlide].classList.remove("active");
    item.classList.add("active");
    productImageSlide.style.backgroundImage = `url('$(item.src)')`;
    activeImageSlide = i;
  });
});

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
  }
};

let productId = decodeURI(location.pathname.split("/").pop());
let userEmail = null;
let productDataId = null;

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
      createProductId(productDataId);
    } else {
      console.error("Error fatching product data");
    }
  })();
}
