const isFormValid = (requestBody) => {
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

module.exports = { isFormValid };
