// TODO: fetch existing categories before rendering the page
(async () => {
  let tag1 = "landscape";
  let tag2 = "portrait";
  let tag3 = "abstract";
  let tagProducts1 = await getProductsByTag(tag1);
  console.log(tagProducts1)
  let tagProducts2 = await getProductsByTag(tag2);
  let tagProducts3 = await getProductsByTag(tag3);
  if (tagProducts1.length == 0 || tagProducts1 == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(tagProducts1, `${tag1}-products`, tag1);
  }
  if (tagProducts2.length == 0 || tagProducts2 == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(tagProducts2, `#${tag2}-products`, tag2);
  }
  if (tagProducts3.length == 0 || tagProducts3 == undefined) {
    throw new Error("No products found");
  } else {
    createProductSlider(tagProducts3, `#${tag3}-products`, tag3);
  }
})();
