const createSmallCards = (data) => {
  return `
          <div class="sm-product">
            <img src="${data.image}" class="sm-product-img" alt="" />
            <div class="sm-text">
              <p class="sm-product-name">${data.name}</p>
              <p class="sm-des">${data.des}</p>
            </div>
            <p class="sm-price">${data.price} CHF</p>
          </div>
    `;
};

window.onload = async function () {
  let user = JSON.parse(sessionStorage.getItem("user")) || null;

  if (!user) {
    location.replace("/login");
  } else if (!compareToken(user.authToken, user.email)) {
    location.replace("/login");
  }
};

const orderId = window.location.pathname.split("/").pop();

const getOrderData = async () => {
  const response = await fetch(`/order/${orderId}`, {
    method: "post",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
  const data = await response.json();
  return data;
};

let orderData;

(async () => {
  try {
    orderData = await getOrderData();
    const element = document.querySelector(".cart");
    for(let i = 0; i < orderData.order.length; i++){
      element.innerHTML += createSmallCards(orderData.order[i]);
    }
  } catch (err) {
    console.error("Error fetching order data", err);
  }
})();
