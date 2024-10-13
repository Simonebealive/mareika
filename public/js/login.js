import { sendData, showAlert } from "./utils.js";

// window.onload = () => {
//   if (sessionStorage.user) {
//     user = JSON.parse(sessionStorage.user);
//     if (compareToken(user.authToken, user.email)) {
//       location.replace("/");
//     }
//   }
// };

const loader = document.querySelector(".loader");

// select inputs
const submitBtn = document.querySelector(".submit-btn");

submitBtn.addEventListener("click", () => {
  const email = document.querySelector("#email") || null;
  const password = document.querySelector("#password") || null;

  if (!email || !password) {
    showAlert("Please fill out the form");
    return;
  }

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.value, password: password.value }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        window.location.href = "/";
      } else {
        showAlert(data.alert);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showAlert("An error occurred during login");
    });
});
