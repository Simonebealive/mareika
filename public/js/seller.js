let loader = document.querySelector(".loader");
let user = JSON.parse(sessionStorage.user || null);
const becomeSellerElement = document.querySelector(".become-seller");
const productListingElement = document.querySelector(".product-listing");
const applyForm = document.querySelector(".apply-form");
const showApplyFormBtn = document.querySelector("#apply-btn");

// let productData = [];
const setupProducts = () => {
  let productData = [];
  fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email: user.email }),
  })
    .then((res) => res.json())
    .then((data) => {
      loader.style.display = null;
      productListingElement.classList.remove("hide");
      if (data == "no products") {
        let emptySVG = document.querySelector(".no-product-image");
        emptySVG.classList.remove("hide");
      } else {
        productData = data;
        data.forEach((product) => {
          createProduct(product);
        });
      }
    });
};

window.onload = () => {
  if (user) {
    if (compareToken(user.authToken, user.email)) {
      if (!user.seller) {
        becomeSellerElement.classList.remove("hide");
      } else {
        loader.style.display = "block";
        setupProducts();
      }
    } else {
      location.replace("/login");
    }
  } else {
    location.replace("/login");
  }
};

showApplyFormBtn.addEventListener("click", () => {
  becomeSellerElement.classList.add("hide");
  applyForm.classList.remove("hide");
});

// form submission
const applyFormBtn = document.querySelector("#apply-form-btn");
const businessName = document.querySelector("#business-name");
const businessAdress = document.querySelector("#business-add");
const about = document.querySelector("#about");
const number = document.querySelector("#number");
const tac = document.querySelector("#terms-and-cond");
const legitInfo = document.querySelector("#legitInfo");

applyFormBtn.addEventListener("click", () => {
  if (
    !businessName.value.length ||
    !businessAdress.value.length ||
    !about.value.length ||
    !number.value.length
  ) {
    showAlert("All fields must be filled in!");
  } else if (!tac.checked || !legitInfo.checked) {
    showAlert("All boxes must be checked!");
  } else {
    // making server request
    loader.style.display = "block";
    sendData("/seller", {
      name: businessName.value,
      address: businessAdress.value,
      about: about.value,
      number: number.value,
      tac: tac.checked,
      legitInfo: legitInfo.checked,
      email: JSON.parse(sessionStorage.user).email,
    });
  }
});
