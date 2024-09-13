// TODO: fetch existing categories before rendering the page
(async () => {
  let tag1 = "nature";
  let tag2 = "animals";
  let products = await getProductsByTag(tag1);
  if (products.length == 0 || products == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(products, `${tag1}-products`, tag1);
  }
  products = await getProductsByTag("animals");
  if (products.length == 0 || products == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(products, `#${tag2}-products`, tag2);
  }
})();
