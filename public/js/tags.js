// TODO: fetch existing categories before rendering the page
(async () => {
  let tag1 = "landscape";
  let tag2 = "portrait";
  let tag3 = "abstract";
  let tag1_products = await getProductsByTag(tag1);
  let tag2_products = await getProductsByTag(tag2);
  let tag3_products = await getProductsByTag(tag3);
  if (tag1_products.length == 0 || tag1_products == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(tag1_products, `${tag1}-products`, tag1);
  }
  if (tag2_products.length == 0 || tag2_products == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(tag2_products, `#${tag2}-products`, tag2);
  }
  if (tag3_products.length == 0 || tag3_products == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(tag3_products, `#${tag3}-products`, tag3);
  }
})();
