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

export function processData(data, loader) {
  if (loader) {
    loader.style.display = null;
  }
  if (data.alert) {
    showAlert(data.alert);
  } else if (data.name) {
    // create authToken
    data.authToken = generateToken(data.email);
    sessionStorage.user = JSON.stringify(data);
    location.replace("/");
  } else if (data.seller) {
    // seller page
    let user = JSON.parse(sessionStorage.user);
    user.seller = true;
    sessionStorage.user = JSON.stringify(user);
    location.reload();
  } else if (data.product) {
    location.href = "/seller";
  }
}

let char = `123abcde.fmnopqlABCDE@FJKLMNOPQRSTUVWXYZ456789stuvwxyz0!#$%&ijkrgh'*+-/=?^_${"`"}{|}~`;

export const generateToken = (key) => {
  let token = "";
  for (let i = 0; i < key.length; i++) {
    let index = char.indexOf(key[i]) || char.length / 2;
    let randomIndex = Math.floor(Math.random() * index);
    token += char[randomIndex] + char[index - randomIndex];
  }
  return token;
};

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
