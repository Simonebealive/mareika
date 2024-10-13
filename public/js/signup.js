import { isSignUpValid, showAlert } from "./utils.js";

// window.onload = () => {
//   if (sessionStorage.user) {
//     user = JSON.parse(sessionStorage.user);
//     if (compareToken(user.authToken, user.email)) {
//       location.replace("/");
//     }
//   }
// };

const submitBtn = document.querySelector(".submit-btn");
submitBtn.addEventListener("click", () => {
  const loader = document.querySelector(".loader");
  const name = document.querySelector("#name") || null;
  const email = document.querySelector("#email") || null;
  const password = document.querySelector("#password");
  const number = document.querySelector("#number") || null;
  const tac = document.querySelector("#terms-and-cond") || null;
  const notification = document.querySelector("#notification") || null;
  const validForm = isSignUpValid({
    name,
    email,
    password,
    number,
    tac,
  });
  if (!validForm) {
    showAlert("Please fill out the form correctly");
    return;
  }
  const body = {
    name: name.value,
    email: email.value,
    password: password.value,
    number: number.value,
    tac: tac.checked,
    notification: notification.checked,
  };
  fetch("/signup", {
    method: "POST",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message === "success") {
        window.location.href = "/login";
      } else {
        showAlert(data.alert);
      }
    });
});

