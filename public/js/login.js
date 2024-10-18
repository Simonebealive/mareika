import { showAlert } from "./utils.js";

const loader = document.querySelector(".loader");
const submitBtn = document.querySelector(".submit-btn");
const logoutBtn = document.querySelector("#logout-btn");

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const stayOnLogin = urlParams.get("stay") === "true";
  if (!stayOnLogin) {
    fetch("/verify-token", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.error("Error verifying token:", error);
      });
  }
});

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  if (!email || !password) {
    showAlert("Please fill out all fields");
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    console.log("Login successful, checking cookies", document.cookie);
    console.log(data.message);
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get("redirect") || "/";
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("Error during login:", error);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      console.log("Logged out successfully");
      window.location.reload();
    } else {
      console.error("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
});
