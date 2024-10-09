(async () => {
    let tag = "landscape";
    let tag_products = await getProductsByTag(tag);
    console.log(tag_products);
    tag_products.forEach(product => {
        console.log(product);
    })
})()