import { getProductsByTag } from "./utils.js";
// TODO: fetch existing categories before rendering the page
(async () => {
  let tag1 = "landscape";
  let tag2 = "portrait";
  let tag3 = "abstract";
  try {
    let tagProducts1 = await getProductsByTag(tag1);
    if (tagProducts1 && tagProducts1.length > 0) {
      createProductSlider(tagProducts1, `${tag1}-products`, tag1);
    } else {
      console.warn("No products found");
    }
  } catch (err) {
    console.error("Error fetching products", err);
  }
  try {
    let tagProducts2 = await getProductsByTag(tag2);
    if (tagProducts2 && tagProducts2.length > 0) {
      createProductSlider(tagProducts2, `${tag2}-products`, tag2);
    } else {
      console.warn("No products found");
    }
  } catch (err) {
    console.error("Error fetching product", err);
  }
  try {
    let tagProducts3 = await getProductsByTag(tag3);
    if (tagProducts3 && tagProducts3.length > 0) {
      createProductSlider(tagProducts3, `${tag3}-products`, tag3);
    } else {
      console.warn("No products found");
    }
  } catch (err) {
    console.error("Error fetching products", err);
  }
})();
