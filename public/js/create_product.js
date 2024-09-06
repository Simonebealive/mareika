const createProduct = (data) => {
  let productContainer = document.querySelector(".product-container");
  productContainer.innerHTML += `  
    <div class="product-card">
        <div class="product-image">
            ${data.draft ? `<span class="tag">Draft</span>` : ""}
            <img src=${data.images[0]} class="product-thumb" alt="" />
            <button class="card-action-btn edit-btn">
                <img src="img/edit.png" alt="" />
            </button>
            <button class="card-action-btn open-btn" onclick="location.href = '/${
              data.id
            }'">
                <img src="img/open.png" alt="" />
            </button>
            <button class="card-action-btn delete-popup-btn"
            onclick="openDeletePopup('${data.id}')">
                <img src="img/delete.png" alt="" />
            </button>
        </div>
        <div class="product-info">
            <h2 class="product-brand">${data.productName}</h2>
            <p class="product-short-desc">${data.productDes}</p>
            <span class="price">${data.actualPrice}</span>
        </div>
    </div>
    `;
};

const openDeletePopup = (id) => {
  let deleteAlert = document.querySelector(".delete-alert");
  deleteAlert.style.display = "flex";
  let closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    deleteAlert.style.display = "none";
  });
  let deleteBtn = document.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    deleteProduct(id);
  });
};

const deleteProduct = (id) => {
  fetch("/delete_product", {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ id: id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data == "success") {
        location.reload();
      } else {
        showAlert("Try again, somehting went wrong!");
      }
    });
};
