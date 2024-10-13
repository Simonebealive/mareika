export function isProductAvailable(data) {
  if (data.sold) {
    return false;
  } else if (data.stock <= 0) {
    return false;
  } else {
    return true;
  }
}

export async function getProductsByTag(tag) {
  const response = await fetch("/get-products", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ tag: tag }),
  });
  if (!response.ok) {
    throw new Error("Error fetching products");
  }
  const data = await response.json();
  return data;
}

export async function sendData(path, data) {
  return await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error sending data");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error sending data", error);
      return { message: "Error sending data" };
    });
}

export function isSignUpValid({ name, email, password, number, tac }) {
  if (name.length < 3) {
    return { valid: false, alert: "name must be at least three letters long" };
  } else if (!email.length) {
    return { valid: false, alert: "Enter an email address" };
  } else if (password.length < 8) {
    return {
      valid: false,
      alert: "Password has to be at least 8 characters long!",
    };
  } else if (!number.length) {
    return { valid: false, alert: "Enter a phone number" };
  } else if (!Number(number) || number.length < 10) {
    return { valid: false, alert: "Number invalid!" };
  } else if (!tac) {
    return { valid: false, alert: "Agree to the terms and conditions" };
  }
  return { valid: true };
}

export const isFormValid = (requestBody) => {
  let blackList = ["discountPercentage", "sellPrice", "tac", "email", "draft"];
  for (let key in requestBody) {
    if (blackList.includes(key)) {
      continue;
    } else if (
      requestBody[key] === null ||
      requestBody[key] === undefined ||
      !requestBody[key].length
    ) {
      return { alert: `Missing value for ${key}` };
    }
  }
  return true;
};

export const showAlert = (msg, type) => {
  let alertBox = document.querySelector(".alert-box");
  let alertMsg = document.querySelector(".alert-msg");
  let alertImg = document.querySelector(".alert-img");

  alertMsg.innerHTML = msg;
  if (type === "success") {
    alertImg.src = "img/success.png";
    alertMsg.style.color = "green";
  } else {
    alertImg.src = " img/error.png";
    alertMsg.style.color = "red";
  }
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
};
