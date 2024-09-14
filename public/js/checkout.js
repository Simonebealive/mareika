window.onload = () => {
  if (!sessionStorage.user) {
    location.replace("/login");
  }
};

const placeOrderBtn = document.querySelector(".place-order-btn");
const getAddress = () => {
  const street = document.querySelector("#street").value;
  const city = document.querySelector("#city").value;
  const state = document.querySelector("#state").value;
  const zip = document.querySelector("#zip").value;
  const country = document.querySelector("#country").value;
  let address = {
    street,
    city,
    state,
    zip,
    country,
  };
  if (!Object.values(address).every((value) => value.length)) {
    return showAlert("Please fill all fields");
  } else {
    return address;
  }
};

placeOrderBtn.addEventListener("click", () => {
  let address = getAddress();
  if (!address) {
    throw new Error("Address is empty");
  }
  fetch("/order", {
    method: "post",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      order: JSON.parse(localStorage.cart),
      email: JSON.parse(sessionStorage.user).email,
      address: address,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.alert === "success") {
        // delete localStorage.cart;
        showAlert(data.alert, "success");
      } else {
        showAlert(data.alert);
      }
    });
});
