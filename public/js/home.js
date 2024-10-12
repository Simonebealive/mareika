const setUpSlidingEffect = () => {
  const productContainers = [
    ...document.querySelectorAll(".product-container"),
  ];
  const nxtBtn = [...document.querySelectorAll(".nxt-btn")];
  const preBtn = [...document.querySelectorAll(".pre-btn")];

  productContainers.forEach((item, i) => {
    let containerDimensions = item.getBoundingClientRect();
    let containerWidth = containerDimensions.width;
    nxtBtn[i].addEventListener("click", () => {
      item.scrollLeft += containerWidth;
    });
    preBtn[i].addEventListener("click", () => {
      item.scrollLeft -= containerWidth;
    });
  });
};

const createProductCards = (data, parent, route) => {
  let start = '<div class="product-container">';
  let middle = "";
  let end = "</div>";

  for (let i = 0; i < data.length; i++) {
    if (!data[i].id) {
      throw new Error("Product ID not found");
    }
    middle += `
    <div class="product-card">
      <div class="product-image">
        <img src=${data[i].images[0]} class="product-thumb" onclick="location.href = '/products/${data[i].id}'" alt="" />
      </div>
      <div class="product-info">
        <h2 class="product-brand">${data[i].productName}</h2>
        <p class="product-short-desc">${data[i].productDes}</p>
        <span class="price">${data[i].productName} CHF</span>
      </div>
    </div>
  `;
  }
  if (route == "search") {
    let cardContainer = document.querySelector(parent);
    cardContainer.innerHTML = start + middle + end;
  } else {
    return start + middle + end;
  }
};

const createProductSlider = (data, parent, title) => {
  if (data.length === 0) {
    console.warn("No similar products found");
    return;
  }
  let slideContainer = document.querySelector(`${parent}`);
  if (!slideContainer) {
    slideContainer = document.createElement("section");
    slideContainer.id = `${parent}`;
    // slideContainer.classList.add("product");
    const footer = document.querySelector("footer");
    document.body.insertBefore(slideContainer, footer);
  }
  slideContainer.innerHTML = `
    <section class="product">
      <h2 class="product-category">${title}</h2>
      <button class="pre-btn"><i class="fas fa-chevron-left"></i></button>
      <button class="nxt-btn"><i class="fas fa-chevron-right"></i></button>
      ${createProductCards(data)}
    </section>
    `;
  setUpSlidingEffect();
};


