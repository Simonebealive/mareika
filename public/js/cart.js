import { sendData } from "./utils.js";

const createSmallCards = (data) => {
  if (!data) {
    return `
    <div class="sm-product">
      <img src="img/empty-cart.png" class="sm-product-img" alt="" />
    </div>
    `;
  } else {
    const imageUrl =
      Array.isArray(data.images) && data.images.length > 0
        ? data.images[0]
        : "img/no-image.png";
    return `
          <div class="sm-product">
            <img src="${imageUrl}" class="sm-product-img" alt="" />
            <div class="sm-text">
              <p class="sm-product-name">${data.productName}</p>
              <p class="sm-des">${data.productDes}</p>
            </div>
            <p class="sm-price">${data.actualPrice} CHF</p>
            <button class="sm-delete-btn" data-reservation-id="${data.reservationId}">
              <img src="img/close.png" alt="" />
            </button>
          </div>
    `;
  }
};

let totalBill = 0;

const fetchReservations = async () => {
  try {
    const response = await fetch("/reservations", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(window.location.pathname);
      }
      throw new Error("HTTP error, status: " + response.status);
    }

    const reservationData = await response.json();

    const reservationIds = reservationData.map(
      (reservation) => reservation.productId
    );
    return reservationIds;
  } catch (error) {
    console.error("Error fetching reservations or products:", error);
    return { reservationData: [], productsData: [] };
  }
};

const fetchProducts = async (reservationIds) => {
  let result = [];
  for (const reservationId of reservationIds) {
    const response = await fetch("/get-products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: reservationId }),
      credentials: "include",
    });
    if (response.ok) {
      const product = await response.json();
      result.push(product);
    }
  }
  return result;
};

const setProducts = () => {
  const element = document.querySelector(".cart");
  async function setupCart() {
    try {
      const reservations = await fetchReservations();
      const products = await fetchProducts(reservations);
      console.log("setProducts, fetchProducts", products);
      if (products.length === 0) {
        console.log(`No reservations found, showing empty cart image`);
        element.innerHTML = `<img src="img/empty-cart.png" class="empty-img" alt="" />`;
      } else {
        element.innerHTML = "";
        totalBill = 0;
        for (const product of products) {
          const reservation = reservations.find(
            (r) => r.productId === product.id
          );
          if (product) {
            element.innerHTML += createSmallCards({
              ...product,
            });
            totalBill += Number(product.actualPrice);
          } else {
            console.warn(
              `Product not found for reservation: ${reservation.productId}`
            );
          }
        }
        const checkoutBill = document.querySelector(".checkout-bill");
        checkoutBill.innerHTML = `${totalBill.toFixed(2)} CHF`;
      }
    } catch (error) {
      console.error("Error setting up cart:", error);
      element.innerHTML = `<p>An error occurred while loading your cart. Please try again later.</p>`;
    }
  }

  setupCart();
  setUpEvents();
};

const setUpEvents = () => {
  const deleteBtns = document.querySelectorAll(".sm-delete-btn");

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reservationId = btn.dataset.reservationId;
      fetch(`/reservations/${reservationId}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete reservation");
          }
          location.reload();
        })
        .catch((error) => {
          console.error("Error deleting reservation:", error);
        });
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setProducts();
});
