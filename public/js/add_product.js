let user = JSON.parse(sessionStorage.user || null);
let loader = document.querySelector(".loader");

// check if user is logged in
window.onload = () => {
  if (!user) {
    location.replace("/login");
  } else if (!compareToken(user.authToken, user.email)) {
    location.replace("/login");
  }
};

// price inputs
const actualPrice = document.querySelector("#actual-price");
const discountPercentage = document.querySelector("#discount-percentage");
let sellPrice = document.querySelector("#sell-price");

discountPercentage.addEventListener("input", () => {
  if (!discountPercentage.value) {
    sellPrice.value = "";
    return;
  }
  if (discountPercentage.value > 99) {
    sellPrice.value = 0;
  } else {
    let discount = (actualPrice.value * discountPercentage.value) / 100;
    sellPrice.value = actualPrice.value - discount;
  }
});

sellPrice.addEventListener("input", () => {
  if (!sellPrice.value) {
    discountPercentage.value = "";
    return;
  }
  let actualPriceValue = parseFloat(actualPrice.value) || 0;
  let sellPriceValue = parseFloat(sellPrice.value) || 0;
  if (sellPriceValue > actualPriceValue) {
    discountPercentage.value = 0;
  } else {
    let discount = (sellPriceValue / actualPriceValue) * 100;
    discountPercentage.value = discount;
  }
});

actualPrice.addEventListener("input", () => {
  if (!actualPrice.value) {
    discountPercentage.value = "";
    return;
  }
  let actualPriceValue = parseFloat(actualPrice.value) || 0;
  let sellPriceValue = parseFloat(sellPrice.value);
  if (!sellPriceValue) {
    discountPercentage.value = "";
    return;
  }
  if (actualPriceValue < sellPriceValue) {
    discountPercentage.value = "";
  } else {
    let discount = (sellPriceValue / actualPriceValue) * 100;
    discountPercentage.value = discount;
  }
});

// handle upload image
let uploadImages = document.querySelectorAll(".fileupload");
let imagePaths = [];

uploadImages.forEach((fileupload, index) => {
  fileupload.addEventListener("change", () => {
    const file = fileupload.files[0];
    let imageUrl;
    if (file.type.includes("image")) {
      fetch("/s3url")
        .then((res) => res.json())
        .then((url) => {
          fetch(url, {
            method: "PUT",
            headers: new Headers({ "Content-Type": file.type }),
            body: file,
          })
            .then((res) => {
              imageUrl = url.split("?")[0];
              imagePaths[index] = imageUrl;
              let label = document.querySelector(`label[for=${fileupload.id}]`);
              label.style.backgroundImage = `url("${imageUrl}")`;
              let productImage = document.querySelector(".product-image");
              productImage.style.backgroundImage = `url("${imageUrl}")`;
            })
            .catch((err) => {
              console.error("Failed to upload image", err);
            });
        })
        .catch((err) => {
          console.error("Failed to get signed url", err);
        });
    } else {
      showAlert("Please upload an image");
    }
  });
});

// form submission
const addBtn = document.querySelector("#add-btn");
const saveDraftBtn = document.querySelector("#save-btn");
const productName = document.querySelector("#product-name");
const productDes = document.querySelector("#product-des");
const detailDes = document.querySelector("#des");
const stock = document.querySelector("#stock");
const categories = document.querySelector("#tags");
const tac = document.querySelector("#tac");
let sizes = [];

const storeSizes = () => {
  sizes = [];
  let sizesChecked = document.querySelectorAll(".size-checkbox");
  sizesChecked.forEach((size) => {
    if (size.checked) {
      sizes.push(size.value);
    }
  });
};

const validForm = () => {
  if (!productName.value.length) {
    showAlert("Enter product name");
  } else if (!productDes.value.length) {
    showAlert("Enter product description");
  } else if (!detailDes.value.length) {
    showAlert("Enter product details");
  } else if (!imagePaths.length) {
    showAlert("Upload atleast one image");
  } else if (!sizes.length) {
    showAlert("Select atleast one size");
  } else if (!actualPrice.value.length) {
    showAlert("Enter actual price");
  } else if (!stock.value.length) {
    showAlert("Enter stock quantity");
  } else if (!categories.value.length) {
    showAlert("Enter a category");
  } else if (!tac.checked) {
    showAlert("You must agree to our terms and conditions");
    return false;
  } else {
    return true;
  }
};

const productData = () => {
  return {
    productName: productName.value,
    productDes: productDes.value,
    detailDes: detailDes.value,
    sizes: sizes,
    stock: stock.value,
    actualPrice: actualPrice.value,
    discountPercentage: discountPercentage.value,
    sellPrice: sellPrice.value,
    categories: categories.value,
    tac: tac.checked,
    images: imagePaths,
    email: user.email,
  };
};

addBtn.addEventListener("click", () => {
  storeSizes();
  if (!validForm()) {
    return;
  } else {
    // making server request
    loader.style.display = "block";
    let data = productData();
    sendData("/add_product", data);
  }
});
