import { sendData } from "./utils.js";

let user = JSON.parse(sessionStorage.user || null);
let loader = document.querySelector(".loader");

window.onload = () => {
  if (!user) {
    location.replace("/login");
  } else if (!compareToken(user.authToken, user.email)) {
    location.replace("/login");
  }
};

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
            .then(() => {
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

const addBtn = document.querySelector("#add-btn");
const saveDraftBtn = document.querySelector("#save-btn");
const productName = document.querySelector("#product-name");
const productDes = document.querySelector("#product-des");
const detailDes = document.querySelector("#des");
const stock = document.querySelector("#stock");
const categories = document.querySelector("#tags");
const tac = document.querySelector("#tac");
const sizesChecked = document.querySelectorAll(".size-checkbox");

const getSizes = () => {
  let sizes = [];
  sizesChecked.forEach((size) => {
    if (size.checked) {
      sizes.push(size.value);
    }
  });
  return sizes;
};

const validForm = (sizes) => {
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

const getProductData = (sizes) => {
  let catArr = categories.value.split(",");
  catArr = catArr.map((cat) => cat.trim());
  return {
    productName: productName.value,
    productDes: productDes.value,
    detailDes: detailDes.value,
    sizes: sizes,
    stock: stock.value,
    actualPrice: actualPrice.value,
    discountPercentage: discountPercentage.value,
    sellPrice: sellPrice.value,
    categories: catArr,
    tac: tac.checked,
    images: imagePaths,
    email: user.email,
    sold: false,
    reserved: false,
  };
};

addBtn.addEventListener("click", async () => {
  let sizes = getSizes();
  if (!validForm(sizes)) {
    return;
  } else {
    loader.style.display = "block";
    let data = getProductData(sizes);
    if (productId) {
      data.id = productId;
    }
    try {
      const response = await sendData("/add_product", data);
      if (response.product) {
        location.href = "/seller";
      }
    } catch (err) {
      showAlert("An error occured while adding the product");
    } finally {
      loader.style.display = "none";
    }
  }
});

saveDraftBtn.addEventListener("click", async () => {
  let sizes = getSizes();
  if (!productName.value.length) {
    showAlert("Enter product name");
    return;
  } else if (!sizes.length) {
    showAlert("Select atleast one size");
    return;
  } else {
    let data = getProductData(sizes);
    data.draft = true;
    try {
      const response = await sendData("/add_product", data);
      if (response.product) {
        location.href = "/seller";
      }
    } catch (err) {
      showAlert("An error occured while saving the draft");
    } finally {
      loader.style.display = "none";
    }
  }
});

const setFormsData = (data) => {
  productName.value = data.productName;
  productDes.value = data.productDes;
  detailDes.value = data.detailDes;
  stock.value = data.stock;
  actualPrice.value = data.actualPrice;
  discountPercentage.value = data.discountPercentage;
  sellPrice.value = data.sellPrice;
  categories.value = data.categories;
  imagePaths = data.images;
  imagePaths.forEach((imagePath, idx) => {
    let label = document.querySelector(`label[for=${uploadImages[idx].id}]`);
    label.style.backgroundImage = `url("${imagePath}")`;
    let productImage = document.querySelector(".product-image");
    productImage.style.backgroundImage = `url("${imagePath}")`;
  });
  let sizeElements = document.querySelectorAll(".size-checkbox");
  let actualSizes = data.sizes;
  sizeElements.forEach((size) => {
    if (actualSizes.includes(size.id)) {
      size.setAttribute("checked", true);
    }
  });
};

// TODO exists at product.js
const fetchProductData = () => {
  fetch("/get-products", {
    method: "post",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email: user.email, id: productId }),
  })
    .then((res) => res.json())
    .then((data) => {
      setFormsData(data);
    })
    .catch((err) => {
      console.error("Failed to get product data", err);
    });
};

let productId = null;
if (location.pathname != "/add_product") {
  productId = decodeURI(location.pathname.split("/").pop());
  fetchProductData();
}
